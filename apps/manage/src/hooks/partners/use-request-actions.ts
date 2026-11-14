'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { approvePartnerRequest } from '@/services/partner.service';
import type { Partner } from '@/types/partner.types';

export type PartnerNotice = { readonly message: string; readonly isError: boolean };

export function useRequestActions() {
    const t = useT();
    const router = useRouter();
    const [refreshing, startRefresh] = useTransition();
    const refresh = () => startRefresh(() => router.refresh());
    const [viewing, setViewing] = useState<Partner | null>(null);
    const [rejecting, setRejecting] = useState<Partner | null>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<PartnerNotice | null>(null);

    const approve = async (partner: Partner) => {
        if (busy !== null) return;
        setBusy(partner.id);
        try {
            const saved = await approvePartnerRequest(partner.id);
            setViewing(null);
            setNotice({ message: t('{name} is now a partner.', { name: saved.businessName }), isError: false });
            refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (error instanceof ApiError && error.code === 'PARTNER_REQUEST_NOT_PENDING') refresh();
        } finally {
            setBusy(null);
        }
    };

    const rejected = (partner: Partner) => {
        setRejecting(null);
        setViewing(null);
        setNotice({ message: t('Request rejected. {name} sees the reason.', { name: partner.ownerName }), isError: false });
        refresh();
    };

    return {
        viewing,
        rejecting,
        busy,
        refreshing,
        notice,
        view: setViewing,
        closeView: () => setViewing(null),
        startReject: (partner: Partner) => {
            setViewing(null);
            setRejecting(partner);
        },
        closeReject: () => setRejecting(null),
        approve,
        rejected,
        clearNotice: () => setNotice(null),
    };
}
