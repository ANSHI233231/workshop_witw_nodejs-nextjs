'use client';

import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { markQuoteRequest } from '@/services/quote-request.service';
import type { PortalQuoteRequest, QuoteMarkCode } from '@/types/quote-request.types';
import { QuoteMark } from '@/types/quote-request.types';

export type QuoteNotice = { readonly message: string; readonly isError: boolean };

export function useQuoteMarks() {
    const t = useT();
    const [marks, setMarks] = useState<Readonly<Record<number, QuoteMarkCode>>>({});
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<QuoteNotice | null>(null);

    const markOf = (item: PortalQuoteRequest): QuoteMarkCode | null => marks[item.id] ?? item.mark;

    const mark = async (item: PortalQuoteRequest, next: QuoteMarkCode) => {
        if (busy !== null) return;
        setBusy(item.id);
        try {
            const saved = await markQuoteRequest(item.id, next);
            setMarks((current) => ({ ...current, [item.id]: saved.mark ?? next }));
            setNotice({
                message: next === QuoteMark.HOT ? t('Marked Hot.') : t('Marked Cold.'),
                isError: false,
            });
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                isError: true,
            });
        } finally {
            setBusy(null);
        }
    };

    return {
        busy,
        notice,
        markOf,
        mark: (item: PortalQuoteRequest, next: QuoteMarkCode) => void mark(item, next),
        clearNotice: () => setNotice(null),
    };
}
