'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

export function GalleryDeleteDialog({
    hasApprovedSet,
    busy,
    onConfirm,
    onClose,
}: {
    readonly hasApprovedSet: boolean;
    readonly busy: boolean;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gal-del-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="gal-del-t">
                        {hasApprovedSet ? t('Delete the draft?') : t('Delete this gallery?')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ss-muted" style={{ margin: 0 }}>
                        {hasApprovedSet
                            ? t('This draft will be discarded. The approved photos stay as they are.')
                            : t(
                                  'This draft will be discarded. The gallery was never approved, so it leaves your list too.',
                              )}
                    </p>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="button" className="btn btn-danger" disabled={busy} onClick={onConfirm}>
                        {t('Delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}
