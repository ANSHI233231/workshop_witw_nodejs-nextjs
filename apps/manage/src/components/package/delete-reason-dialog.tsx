'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { addDeleteReason, updateDeleteReason } from '@/services/package.service';
import { type DeleteReason, DeleteReasonStatus, PACKAGE_LIMITS } from '@/types/package.types';

export function DeleteReasonDialog({
    reason,
    onDone,
    onClose,
}: {
    readonly reason: DeleteReason | null;
    readonly onDone: (message: string) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [name, setName] = useState(reason?.name ?? '');
    const [active, setActive] = useState(reason ? reason.status === DeleteReasonStatus.ACTIVE : true);
    const [nameError, setNameError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const trimmed = name.trim();
        const problem = !trimmed
            ? t('Enter the reason.')
            : trimmed.length > PACKAGE_LIMITS.DELETE_REASON_NAME_MAX
              ? t('Use up to {max} characters.', { max: PACKAGE_LIMITS.DELETE_REASON_NAME_MAX })
              : null;
        setNameError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            if (reason) {
                await updateDeleteReason(
                    reason.id,
                    trimmed,
                    active ? DeleteReasonStatus.ACTIVE : DeleteReasonStatus.INACTIVE,
                );
                onDone(t('Reason updated.'));
            } else {
                await addDeleteReason(trimmed);
                onDone(t('Reason added.'));
            }
        } catch (error) {
            const field = error instanceof ApiError ? error.fieldError('name') : undefined;
            if (field) setNameError(t(field));
            else if (error instanceof ApiError && error.code === 'PACKAGE_DELETE_REASON_EXISTS')
                setNameError(t(error.message));
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
                aria-labelledby="rs-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="rs-t">
                        {reason ? t('Edit reason') : t('Add reason')}
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
                        <div className={nameError ? 'field is-invalid' : 'field'}>
                            <label className="label" htmlFor="rs-name">
                                {t('Reason')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <input
                                id="rs-name"
                                className="input"
                                maxLength={PACKAGE_LIMITS.DELETE_REASON_NAME_MAX}
                                value={name}
                                aria-invalid={nameError ? true : undefined}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError(null);
                                }}
                            />
                            {nameError && (
                                <span className="error" role="alert">
                                    {nameError}
                                </span>
                            )}
                        </div>
                        {reason && (
                            <div className="field">
                                <span className="label" id="rf-st-l">
                                    {t('Status')}
                                </span>
                                <div className="ssc-sw">
                                    <button
                                        type="button"
                                        className={active ? 'mt-switch is-on' : 'mt-switch'}
                                        role="switch"
                                        aria-checked={active}
                                        aria-labelledby="rf-st-l"
                                        onClick={() => setActive(!active)}
                                    >
                                        <span className="mt-knob"></span>
                                    </button>
                                    <span>{active ? t('Active') : t('Inactive')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {reason ? t('Save') : t('Add reason')}
                    </button>
                </div>
            </form>
        </div>
    );
}
