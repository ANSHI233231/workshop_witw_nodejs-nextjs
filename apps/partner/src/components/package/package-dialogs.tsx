'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

function ConfirmDialog({
    title,
    text,
    confirm,
    danger,
    busy,
    onConfirm,
    onClose,
}: {
    readonly title: string;
    readonly text: string;
    readonly confirm: string;
    readonly danger: boolean;
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
                aria-labelledby="pk-dlg-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pk-dlg-t">
                        {title}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ss-muted" style={{ margin: 0 }}>
                        {text}
                    </p>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button
                        type="button"
                        className={danger ? 'btn btn-danger' : 'btn btn-primary'}
                        disabled={busy}
                        onClick={onConfirm}
                    >
                        {confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function PackageSendDialog({
    busy,
    onConfirm,
    onClose,
}: {
    readonly busy: boolean;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    return (
        <ConfirmDialog
            title={t('Send for approval?')}
            text={t("The Super Admin checks this version. You can't change it while it waits.")}
            confirm={t('Send')}
            danger={false}
            busy={busy}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
}

export function PackageDeleteDialog({
    neverLive,
    busy,
    onConfirm,
    onClose,
}: {
    readonly neverLive: boolean;
    readonly busy: boolean;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    return (
        <ConfirmDialog
            title={neverLive ? t('Delete this package?') : t('Delete the draft?')}
            text={
                neverLive
                    ? t('This draft will be discarded. The package was never live, so it leaves your list too.')
                    : t('This draft will be discarded. The live version stays on the website.')
            }
            confirm={t('Delete')}
            danger
            busy={busy}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
}
