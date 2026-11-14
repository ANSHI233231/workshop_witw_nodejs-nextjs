'use client';

import { useEffect, useRef } from 'react';

import { useT } from '@/hooks/i18n/use-t';

const TOAST_SHOWN_MS = 5000;

function useAutoClose(message: string, onClose: () => void): void {
    const close = useRef(onClose);
    useEffect(() => {
        close.current = onClose;
    });
    useEffect(() => {
        const timer = setTimeout(() => close.current(), TOAST_SHOWN_MS);
        return () => clearTimeout(timer);
    }, [message]);
}

export function Toast({
    message,
    isError = false,
    onClose,
}: {
    readonly message: string;
    readonly isError?: boolean;
    readonly onClose: () => void;
}) {
    useAutoClose(message, onClose);
    const t = useT();
    return (
        <div className="toast-stack">
            <div className={isError ? 'toast is-error' : 'toast'} role="status">
                <svg
                    className="icon "
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10"></circle> <path d="m16 9-5.5 5.5L8 12"></path>
                </svg>
                <span>{message}</span>
                <button
                    type="button"
                    className="btn-icon us-tx"
                    aria-label={t('Close')}
                    data-tooltip={t('Close')}
                    onClick={onClose}
                >
                    <svg
                        className="icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M18 6 6 18"></path> <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}
