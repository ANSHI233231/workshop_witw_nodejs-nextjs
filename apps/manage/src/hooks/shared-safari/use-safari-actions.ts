'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { makeSharedSafariActive, setSharedSafariPinned } from '@/services/shared-safari.service';
import type { ConsoleSafari } from '@/types/shared-safari.types';

export type SafariNotice = { readonly message: string; readonly isError: boolean };

export function useSafariActions() {
    const t = useT();
    const router = useRouter();
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<SafariNotice | null>(null);

    const failed = (error: unknown) =>
        setNotice({
            message:
                error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                    ? t(error.message)
                    : t('This could not be done. Please try again.'),
            isError: true,
        });

    const run = async (safari: ConsoleSafari, action: () => Promise<void>, message: string) => {
        if (busy !== null) return;
        setBusy(safari.id);
        try {
            await action();
            setNotice({ message, isError: false });
            router.refresh();
        } catch (error) {
            failed(error);
        } finally {
            setBusy(null);
        }
    };

    const togglePin = (safari: ConsoleSafari) =>
        run(
            safari,
            () => setSharedSafariPinned(safari.id, !safari.isPinned),
            safari.isPinned
                ? t('Shared safari "{title}" unpinned.', { title: safari.title })
                : t('Shared safari "{title}" pinned.', { title: safari.title }),
        );

    const makeActive = (safari: ConsoleSafari) =>
        run(
            safari,
            () => makeSharedSafariActive(safari.id),
            t('Shared safari "{title}" made active.', { title: safari.title }),
        );

    return {
        busy,
        togglePin,
        makeActive,
        notice,
        notify: (message: string) => setNotice({ message, isError: false }),
        fail: failed,
        clearNotice: () => setNotice(null),
    };
}
