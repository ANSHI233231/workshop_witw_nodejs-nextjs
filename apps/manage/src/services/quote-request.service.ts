import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type { QuoteRequest, QuoteRequestFilters, QuoteRequestStatusCode } from '@/types/quote-request.types';

import { apiClient } from './api-client';

export const QUOTE_REQUEST_PAGE_SIZE = 20;

const ADMIN = '/quote-request/admin/requests';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listQuoteRequests = (
    filters: QuoteRequestFilters,
    accessToken: string | undefined,
): Promise<Paginated<QuoteRequest>> =>
    apiClient.paginated<QuoteRequest>(ADMIN, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            page: filters.page,
            limit: QUOTE_REQUEST_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const setQuoteRequestStatus = (id: number, status: QuoteRequestStatusCode): Promise<QuoteRequest> =>
    apiClient.patch<QuoteRequest>(`${ADMIN}/${id}/status`, { status });

export const notifyQuoteRequestPartner = (id: number, message: string): Promise<void> =>
    apiClient.post<void>(`${ADMIN}/${id}/notify`, { message });
