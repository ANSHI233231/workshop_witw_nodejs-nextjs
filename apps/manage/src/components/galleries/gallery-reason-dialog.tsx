'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { deleteGallery, rejectGallery } from '@/services/gallery.service';
import { GALLERY_LIMITS, type GalleryItem } from '@/types/gallery.types';

export type ReasonMode = 'reject' | 'delete';

export function GalleryReasonDialog({
    item,
    mode,
    onDone,
    onClose,
}: {
    readonly item: GalleryItem;
    readonly mode: ReasonMode;
    readonly onDone: (message: string) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const rejecting = mode === 'reject';

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const trimmed = reason.trim();
        const problem = !trimmed
            ? t('Enter the reason.')
            : trimmed.length > GALLERY_LIMITS.REASON_MAX
              ? t('Use up to {max} characters.', { max: GALLERY_LIMITS.REASON_MAX })
              : null;
        setReasonError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            if (rejecting) await rejectGallery(item.id, trimmed);
            else await deleteGallery(item.id, trimmed);
            onDone(rejecting ? t('Gallery rejected. It is back in draft with your reason.') : t('Gallery deleted.'));
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
                aria-labelledby="gal-reason-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="gal-reason-t">
                        {rejecting ? t('Reject gallery') : t('Delete gallery')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {!rejecting && (
                        <p className="ss-muted" style={{ margin: '0 0 var(--space-md)' }}>
                            {t("{name} leaves the partner's Gallery menu. Packages keep the copy they saved.", {
                                name: item.approvedTitle ?? item.title,
                            })}
                        </p>
                    )}
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
                            maxLength={GALLERY_LIMITS.REASON_MAX}
                            value={reason}
                            aria-invalid={reasonError ? true : undefined}
                            onChange={(event) => {
                                setReason(event.target.value);
                                setReasonError(null);
                            }}
                        />
                        <span className="helper">
                            {rejecting
                                ? t('Up to {max} characters. The partner sees this.', { max: GALLERY_LIMITS.REASON_MAX })
                                : t('Up to {max} characters', { max: GALLERY_LIMITS.REASON_MAX })}
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
                        {rejecting ? t('Reject') : t('Delete')}
                    </button>
                </div>
            </form>
        </div>
    );
}
