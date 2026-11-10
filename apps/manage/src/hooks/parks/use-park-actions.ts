'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { setParkStatus } from '@/services/park.service';
import { type Park, ParkStatus } from '@/types/park.types';

export type ParkNotice = { readonly message: string; readonly isError: boolean };

export function useParkActions() {
    const t = useT();
    const router = useRouter();
    const [editing, setEditing] = useState<Park | null>(null);
    const [switching, setSwitching] = useState<number | null>(null);
    const [notice, setNotice] = useState<ParkNotice | null>(null);

    const toggleStatus = async (park: Park) => {
        if (switching !== null) return;
        const next = park.status === ParkStatus.ACTIVE ? ParkStatus.INACTIVE : ParkStatus.ACTIVE;
        setSwitching(park.id);
        try {
            const saved = await setParkStatus(park.id, next);
            setNotice({
                message:
                    saved.status === ParkStatus.ACTIVE
                        ? t('Park "{name}" is now active.', { name: saved.name })
                        : t('Park "{name}" is now inactive.', { name: saved.name }),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('It could not be changed. Please try again.'),
                isError: true,
            });
        } finally {
            setSwitching(null);
        }
    };

    const saved = (park: Park) => {
        setEditing(null);
        setNotice({ message: t('Park "{name}" updated.', { name: park.name }), isError: false });
        router.refresh();
    };

    return {
        editing,
        startEdit: setEditing,
        stopEdit: () => setEditing(null),
        saved,
        switching,
        toggleStatus,
        notice,
        clearNotice: () => setNotice(null),
    };
}
