'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

export function DeleteCommentDialog({
    isReply,
    text,
    busy,
    onConfirm,
    onClose,
}: {
    readonly isReply: boolean;
    readonly text: string;
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
                aria-labelledby="dc-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="dc-t">
                        {isReply ? t('Delete this reply?') : t('Delete this comment and its replies?')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ssc-quote">{text}</p>
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
