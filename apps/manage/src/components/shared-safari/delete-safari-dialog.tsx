'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { ApiError } from '@/services/api-error';
import { deleteSharedSafari } from '@/services/shared-safari.service';
import {
    ADMIN_DELETE_REASON_LABEL,
    ADMIN_DELETE_REASONS,
    type AdminDeleteReasonCode,
    SHARED_SAFARI_LIMITS,
} from '@/types/shared-safari.types';

type DeleteField = 'reason' | 'details';

type DeleteErrors = Partial<Record<DeleteField, string>>;

const fieldClass = (message: string | undefined): string => (message ? 'field is-invalid' : 'field');

function FieldError({ message }: { readonly message: string | undefined }) {
    return message ? (
        <span className="error" role="alert">
            {message}
        </span>
    ) : null;
}

export function DeleteSafariDialog({
    safariId,
    onDeleted,
    onClose,
}: {
    readonly safariId: number;
    readonly onDeleted: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<DeleteErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const check = (): { errors: DeleteErrors; reason: AdminDeleteReasonCode | undefined } => {
        const found: DeleteErrors = {};
        const code = ADMIN_DELETE_REASONS.find((value) => String(value) === reason);
        const text = details.trim();
        if (code === undefined) found.reason = t('Select a reason.');
        if (text === '') found.details = t('Enter the details.');
        else if (text.length > SHARED_SAFARI_LIMITS.DELETE_DETAILS_MAX) found.details = t('Use up to 1000 characters.');
        return { errors: found, reason: code };
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const checked = check();
        setErrors(checked.errors);
        setFormError(null);
        if (Object.keys(checked.errors).length > 0 || checked.reason === undefined) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            await deleteSharedSafari(safariId, { reason: checked.reason, details: details.trim() });
            onDeleted();
        } catch (error) {
            if (!(error instanceof ApiError) || error.code === ApiError.NETWORK_ERROR) {
                setFormError(t('This could not be done. Please try again.'));
            } else {
                const reasonError = error.fieldError('reason');
                const detailsError = error.fieldError('details');
                if (reasonError || detailsError) {
                    setErrors({
                        reason: reasonError ? t(reasonError) : undefined,
                        details: detailsError ? t(detailsError) : undefined,
                    });
                } else setFormError(t(error.message));
            }
            revealFirstError();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <form
                ref={formRef}
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dl-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="dl-t">
                        {t('Delete this safari')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        {formError && (
                            <div className="banner banner-danger" role="alert">
                                {formError}
                            </div>
                        )}
                        <div className={fieldClass(errors.reason)}>
                            <label className="label" htmlFor="dl-reason">
                                {t('Reason')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <select
                                id="dl-reason"
                                className="select"
                                value={reason}
                                aria-invalid={errors.reason ? true : undefined}
                                onChange={(event) => {
                                    setReason(event.target.value);
                                    setErrors((current) => ({ ...current, reason: undefined }));
                                }}
                            >
                                <option value="">{t('Select a reason')}</option>
                                {ADMIN_DELETE_REASONS.map((code) => (
                                    <option key={code} value={code}>
                                        {t(ADMIN_DELETE_REASON_LABEL[code] ?? '')}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.reason} />
                        </div>
                        <div className={fieldClass(errors.details)}>
                            <label className="label" htmlFor="dl-details">
                                {t('Details')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <textarea
                                id="dl-details"
                                className="textarea"
                                rows={3}
                                value={details}
                                aria-invalid={errors.details ? true : undefined}
                                onChange={(event) => {
                                    setDetails(event.target.value);
                                    setErrors((current) => ({ ...current, details: undefined }));
                                }}
                            />
                            <FieldError message={errors.details} />
                        </div>
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={saving}>
                        {t('Delete')}
                    </button>
                </div>
            </form>
        </div>
    );
}
