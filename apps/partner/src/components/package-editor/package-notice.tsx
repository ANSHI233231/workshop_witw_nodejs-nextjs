'use client';

import { useEffect, useState } from 'react';

import { Toast } from '@/components/ui/toast';

const NOTICE_EVENT = 'package-notice';

type Notice = { readonly message: string; readonly isError: boolean };

export const announcePackageNotice = (message: string, isError: boolean): void => {
    window.dispatchEvent(new CustomEvent<Notice>(NOTICE_EVENT, { detail: { message, isError } }));
};

export function PackageNotice() {
    const [notice, setNotice] = useState<Notice | null>(null);

    useEffect(() => {
        const show = (event: Event) => setNotice((event as CustomEvent<Notice>).detail);
        window.addEventListener(NOTICE_EVENT, show);
        return () => window.removeEventListener(NOTICE_EVENT, show);
    }, []);

    return notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />;
}
