'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { setPartnerPhoneShown, setPartnerStatus } from '@/services/partner.service';
import { type Partner, PartnerStatus } from '@/types/partner.types';

export type PartnerNotice = { readonly message: string; readonly isError: boolean };

export function usePartnerActions() {
    const t = useT();
    const router = useRouter();
    const [refreshing, startRefresh] = useTransition();
    const refresh = () => startRefresh(() => router.refresh());
    const [viewing, setViewing] = useState<Partner | null>(null);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [confirming, setConfirming] = useState<Partner | null>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<PartnerNotice | null>(null);

    const failed = (error: unknown) => {
        setNotice({
            message:
                error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                    ? t(error.message)
                    : t('This could not be done. Please try again.'),
            isError: true,
        });
        if (error instanceof ApiError && error.code === 'PARTNER_STATUS_UNCHANGED') refresh();
    };

    const togglePhone = async (partner: Partner) => {
        if (busy !== null) return;
        setBusy(partner.id);
        try {
            const saved = await setPartnerPhoneShown(partner.id, !partner.isPhoneShown);
            setNotice({
                message: saved.isPhoneShown
                    ? t('{name} now sees phone numbers in quote requests.', { name: saved.businessName })
                    : t('{name} no longer sees phone numbers.', { name: saved.businessName }),
                isError: false,
            });
            refresh();
        } catch (error) {
            failed(error);
        } finally {
            setBusy(null);
        }
    };

    const changeStatus = async (partner: Partner) => {
        if (busy !== null) return;
        const activating = partner.status === PartnerStatus.INACTIVE;
        setBusy(partner.id);
        try {
            const saved = await setPartnerStatus(
                partner.id,
                activating ? PartnerStatus.ACTIVE : PartnerStatus.INACTIVE,
            );
            setConfirming(null);
            setNotice({
                message: activating
                    ? t('{name} is active again.', { name: saved.businessName })
                    : t('{name} is deactivated.', { name: saved.businessName }),
                isError: false,
            });
            refresh();
        } catch (error) {
            setConfirming(null);
            failed(error);
        } finally {
            setBusy(null);
        }
    };

    const saved = () => {
        setEditing(null);
        setNotice({ message: t('Partner details saved.'), isError: false });
        refresh();
    };

    return {
        viewing,
        editing,
        confirming,
        busy,
        refreshing,
        notice,
        view: setViewing,
        closeView: () => setViewing(null),
        edit: setEditing,
        closeEdit: () => setEditing(null),
        confirm: setConfirming,
        closeConfirm: () => setConfirming(null),
        togglePhone,
        changeStatus,
        saved,
        clearNotice: () => setNotice(null),
    };
}
