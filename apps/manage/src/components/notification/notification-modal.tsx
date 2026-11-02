'use client';

import { type ReactNode, useEffect } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

export function NotificationModal({
    title,
    label,
    onClose,
    children,
}: {
    readonly title: string;
    readonly label: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
}) {
    const t = useT();
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal em-modal"
                role="dialog"
                aria-modal="true"
                aria-label={t(label)}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Close')}
                        data-tooltip={t('Close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MetaItem({
    label,
    wide = false,
    children,
}: {
    readonly label: string;
    readonly wide?: boolean;
    readonly children: ReactNode;
}) {
    const t = useT();
    return (
        <div className={wide ? 'is-wide' : undefined}>
            <dt>{t(label)}</dt>
            <dd>{children}</dd>
        </div>
    );
}
