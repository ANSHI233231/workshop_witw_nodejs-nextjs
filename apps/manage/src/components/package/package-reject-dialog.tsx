'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { rejectPackageVersion } from '@/services/package.service';
import { PACKAGE_LIMITS } from '@/types/package.types';

export function PackageRejectDialog({
    packageId,
    versionId,
    versionNumber,
    onDone,
    onClose,
}: {
    readonly packageId: number;
    readonly versionId: number;
    readonly versionNumber: number;
    readonly onDone: (message: string) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const trimmed = reason.trim();
        const problem = !trimmed
            ? t('Enter the reason.')
            : trimmed.length > PACKAGE_LIMITS.REASON_MAX
              ? t('Use up to {max} characters.', { max: PACKAGE_LIMITS.REASON_MAX })
              : null;
        setReasonError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            await rejectPackageVersion(packageId, versionId, trimmed);
            onDone(t('Version {n} rejected. The partner sees the reason.', { n: versionNumber }));
        } catch (error) {
            const field = error instanceof ApiError ? error.fieldError('reason') : undefined;
            if (field) setReasonError(t(field));
            else
                setFormError(
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <form
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pk-reject-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pk-reject-t">
                        {t('Reject version {n}', { n: versionNumber })}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {formError && (
                        <div className="banner banner-danger" role="alert">
                            {formError}
                        </div>
                    )}
                    <div className={reasonError ? 'field is-invalid' : 'field'}>
                        <label className="label" htmlFor="rj-reason">
                            {t('Reason')}
                            <span className="req" aria-hidden="true">
                                *
                            </span>
                        </label>
                        <textarea
                            id="rj-reason"
                            className="textarea"
                            rows={4}
                            maxLength={PACKAGE_LIMITS.REASON_MAX}
                            value={reason}
                            aria-invalid={reasonError ? true : undefined}
                            onChange={(event) => {
                                setReason(event.target.value);
                                setReasonError(null);
                            }}
                        />
                        <span className="helper">
                            {t('Up to {max} characters. The partner sees this.', { max: PACKAGE_LIMITS.REASON_MAX })}
                        </span>
                        {reasonError && (
                            <span className="error" role="alert">
                                {reasonError}
                            </span>
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={saving}>
                        {t('Reject')}
                    </button>
                </div>
            </form>
        </div>
    );
}
