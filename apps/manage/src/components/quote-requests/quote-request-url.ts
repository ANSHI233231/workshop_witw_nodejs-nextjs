import { listUrl } from '@/lib/list-url';
import type { QuoteRequestFilters } from '@/types/quote-request.types';

export const QUOTE_REQUESTS_PATH = '/quote-requests';

export const quoteRequestListParams = (filters: Omit<QuoteRequestFilters, 'page'>) => ({
    search: filters.search,
    status: filters.status,
});

export const quoteRequestListUrl = (filters: QuoteRequestFilters): string =>
    listUrl(QUOTE_REQUESTS_PATH, { ...quoteRequestListParams(filters), page: filters.page });
