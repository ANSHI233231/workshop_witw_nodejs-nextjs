import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { QuoteRequestList } from '@/components/quote-requests/quote-request-list';
import { quoteRequestListUrl } from '@/components/quote-requests/quote-request-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listQuoteRequests } from '@/services/quote-request.service';
import {
    QUOTE_REQUEST_LIMITS,
    QUOTE_REQUEST_STATUSES,
    type QuoteRequestFilters,
} from '@/types/quote-request.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Quote Requests'),
});

export default async function QuoteRequestsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: QuoteRequestFilters = {
        search: searchParam(query['search'], QUOTE_REQUEST_LIMITS.SEARCH),
        status: codeParam(query['status'], QUOTE_REQUEST_STATUSES),
        page: pageParam(query['page']),
    };
    const result = await listQuoteRequests(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(quoteRequestListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <QuoteRequestList filters={filters} result={result} />;
}
