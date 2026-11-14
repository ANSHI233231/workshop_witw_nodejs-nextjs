'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { announceGalleryNotice } from '@/components/gallery/gallery-notice';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { deleteGalleryDraft, sendGallery } from '@/services/gallery.service';

const STALE_CODES: ReadonlySet<string> = new Set([
    'GALLERY_NOT_DRAFT',
    'GALLERY_NOT_WAITING',
    'GALLERY_NOT_APPROVED',
    'GALLERY_NOT_FOUND',
]);

export function useGalleryActions() {
    const t = useT();
    const router = useRouter();
    const [busy, setBusy] = useState<number | null>(null);

    const run = async (id: number, work: () => Promise<string>) => {
        if (busy !== null) return;
        setBusy(id);
        try {
            announceGalleryNotice(await work(), false);
            router.refresh();
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            announceGalleryNotice(known ? t(error.message) : t('This could not be done. Please try again.'), true);
            if (known && STALE_CODES.has(error.code)) router.refresh();
        } finally {
            setBusy(null);
        }
    };

    return {
        busy,
        send: (id: number) =>
            run(id, async () => {
                await sendGallery(id);
                return t('Gallery sent for approval.');
            }),
        discard: (id: number) =>
            run(id, async () => {
                const outcome = await deleteGalleryDraft(id);
                return outcome.restoredApproved
                    ? t('Draft discarded. The approved photos are back.')
                    : t('Draft discarded.');
            }),
    };
}
