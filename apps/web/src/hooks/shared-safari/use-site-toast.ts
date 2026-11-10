'use client';

import { useCallback, useState } from 'react';

export type SiteToast = { readonly id: number; readonly message: string; readonly isError: boolean };

export function useSiteToast() {
    const [toast, setToast] = useState<SiteToast | null>(null);
    const show = useCallback((message: string, isError = false) => {
        setToast((current) => ({ id: (current?.id ?? 0) + 1, message, isError }));
    }, []);
    const showError = useCallback((message: string) => show(message, true), [show]);
    const hide = useCallback(() => setToast(null), []);
    return { toast, show, showError, hide };
}
