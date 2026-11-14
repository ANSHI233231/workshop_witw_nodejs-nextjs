'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { setQuoteRequestStatus } from '@/services/quote-request.service';
import { type QuoteRequest, QuoteRequestStatus } from '@/types/quote-request.types';

export type QuoteRequestNotice = { readonly message: string; readonly isError: boolean };

export function useQuoteRequestActions() {
    const t = useT();
    const router = useRouter();
    const [refreshing, startRefresh] = useTransition();
    const refresh = () => startRefresh(() => router.refresh());
    const [viewing, setViewing] = useState<QuoteRequest | null>(null);
    const [notifying, setNotifying] = useState<QuoteRequest | null>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<QuoteRequestNotice | null>(null);

    const changeStatus = async (request: QuoteRequest) => {
        if (busy !== null) return;
        const activating = request.status === QuoteRequestStatus.INACTIVE;
        setBusy(request.id);
        try {
            await setQuoteRequestStatus(
                request.id,
                activating ? QuoteRequestStatus.ACTIVE : QuoteRequestStatus.INACTIVE,
            );
            setNotice({
                message: activating ? t('Request is active again.') : t('Request is now hidden from the partner and the user.'),
                isError: false,
            });
            refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (error instanceof ApiError && error.code === 'QUOTE_REQUEST_STATUS_UNCHANGED') refresh();
        } finally {
            setBusy(null);
        }
    };

    const notified = (request: QuoteRequest) => {
        setNotifying(null);
        setNotice({
            message: t('Notification sent to {name}.', { name: request.partner.businessName }),
            isError: false,
        });
    };

    return {
        viewing,
        notifying,
        busy,
        refreshing,
        notice,
        view: setViewing,
        closeView: () => setViewing(null),
        notify: setNotifying,
        closeNotify: () => setNotifying(null),
        changeStatus,
        notified,
        clearNotice: () => setNotice(null),
    };
}
