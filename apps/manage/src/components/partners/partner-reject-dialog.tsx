'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import { rejectPartnerRequest } from '@/services/partner.service';
import { PARTNER_LIMITS, type Partner } from '@/types/partner.types';

const reasonProblemOf = (t: Translate, reason: string): string | null => {
    if (!reason) return t('Enter the reason.');
    if (reason.length > PARTNER_LIMITS.REJECT_REASON_MAX)
        return t('Use up to {max} characters.', { max: PARTNER_LIMITS.REJECT_REASON_MAX });
    return null;
};

export function PartnerRejectDialog({
    partner,
    onRejected,
    onClose,
}: {
    readonly partner: Partner;
    readonly onRejected: (partner: Partner) => void;
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
        const problem = reasonProblemOf(t, trimmed);
        setReasonError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            onRejected(await rejectPartnerRequest(partner.id, trimmed));
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
                aria-labelledby="pr-reject-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pr-reject-t">
                        {t('Reject partner request')}
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
                                maxLength={PARTNER_LIMITS.REJECT_REASON_MAX}
                                value={reason}
                                aria-invalid={reasonError ? true : undefined}
                                onChange={(event) => {
                                    setReason(event.target.value);
                                    setReasonError(null);
                                }}
                            />
                            <span className="helper">
                                {t('Up to {max} characters. The partner sees this.', {
                                    max: PARTNER_LIMITS.REJECT_REASON_MAX,
                                })}
                            </span>
                            {reasonError && (
                                <span className="error" role="alert">
                                    {reasonError}
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
                        {t('Reject')}
                    </button>
                </div>
            </form>
        </div>
    );
}
