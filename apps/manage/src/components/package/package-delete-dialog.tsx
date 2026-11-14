'use client';

import { type FormEvent, useEffect, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { deleteConsolePackage, listActiveDeleteReasons } from '@/services/package.service';
import { type DeleteReason, PACKAGE_LIMITS, type PackageListItem } from '@/types/package.types';

export function PackageDeleteDialog({
    item,
    onDone,
    onClose,
}: {
    readonly item: PackageListItem;
    readonly onDone: (message: string) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [reasons, setReasons] = useState<readonly DeleteReason[]>([]);
    const [reasonId, setReasonId] = useState('');
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<{ reason?: string; details?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        listActiveDeleteReasons().then(
            (list) => {
                if (active) setReasons(list);
            },
            () => {
                if (active) setFormError(t('This could not be done. Please try again.'));
            },
        );
        return () => {
            active = false;
        };
    }, [t]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const trimmed = details.trim();
        const found: { reason?: string; details?: string } = {};
        if (!reasonId) found.reason = t('Choose a reason.');
        if (!trimmed) found.details = t('Enter the details.');
        else if (trimmed.length > PACKAGE_LIMITS.DELETE_DETAILS_MAX)
            found.details = t('Use up to {max} characters.', { max: '1,000' });
        setErrors(found);
        setFormError(null);
        if (found.reason || found.details) return;
        setSaving(true);
        try {
            await deleteConsolePackage(item.id, Number(reasonId), trimmed);
            onDone(t('Package deleted from the website.'));
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setErrors({
                    ...(error.fieldError('masterPackageDeleteReasonId')
                        ? { reason: t(error.fieldError('masterPackageDeleteReasonId') ?? '') }
                        : {}),
                    ...(error.fieldError('details') ? { details: t(error.fieldError('details') ?? '') } : {}),
                });
            } else
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
                aria-labelledby="pk-del-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pk-del-t">
                        {t('Delete package')}
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
                        <p className="ss-muted" style={{ margin: 0 }}>
                            {t('{name} is removed from the website. This is final.', { name: item.name })}
                        </p>
                        <div className={errors.reason ? 'field is-invalid' : 'field'}>
                            <label className="label" htmlFor="dl-reason">
                                {t('Reason')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <select
                                id="dl-reason"
                                className="select"
                                value={reasonId}
                                aria-invalid={errors.reason ? true : undefined}
                                onChange={(event) => {
                                    setReasonId(event.target.value);
                                    setErrors((current) => ({ ...current, reason: undefined }));
                                }}
                            >
                                <option value="">{t('Choose…')}</option>
                                {reasons.map((reason) => (
                                    <option key={reason.id} value={reason.id}>
                                        {reason.name}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && (
                                <span className="error" role="alert">
                                    {errors.reason}
                                </span>
                            )}
                        </div>
                        <div className={errors.details ? 'field is-invalid' : 'field'}>
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
                            {errors.details && (
                                <span className="error" role="alert">
                                    {errors.details}
                                </span>
                            )}
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
