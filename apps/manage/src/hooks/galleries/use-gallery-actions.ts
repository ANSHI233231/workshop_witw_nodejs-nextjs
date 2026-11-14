'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { approveGallery } from '@/services/gallery.service';
import type { GalleryItem } from '@/types/gallery.types';

export type GalleryNotice = { readonly message: string; readonly isError: boolean };

const STALE_CODES: ReadonlySet<string> = new Set(['GALLERY_NOT_WAITING', 'GALLERY_NOT_FOUND']);

export function useGalleryActions() {
    const t = useT();
    const router = useRouter();
    const [refreshing, startRefresh] = useTransition();
    const refresh = () => startRefresh(() => router.refresh());
    const [viewing, setViewing] = useState<GalleryItem | null>(null);
    const [reasoning, setReasoning] = useState<{ item: GalleryItem; mode: 'reject' | 'delete' } | null>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<GalleryNotice | null>(null);

    const approve = async (item: GalleryItem) => {
        if (busy !== null) return;
        setBusy(item.id);
        try {
            const saved = await approveGallery(item.id);
            setNotice({ message: t('{name} is approved.', { name: saved.title }), isError: false });
            refresh();
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            setNotice({
                message: known ? t(error.message) : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (known && STALE_CODES.has(error.code)) refresh();
        } finally {
            setBusy(null);
        }
    };

    return {
        viewing,
        reasoning,
        busy,
        refreshing,
        notice,
        view: setViewing,
        closeView: () => setViewing(null),
        startReason: (item: GalleryItem, mode: 'reject' | 'delete') => setReasoning({ item, mode }),
        closeReason: () => setReasoning(null),
        approve,
        reasonDone: (message: string) => {
            setReasoning(null);
            setNotice({ message, isError: false });
            refresh();
        },
        clearNotice: () => setNotice(null),
    };
}
