import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    PortalQuoteRequest,
    PortalQuoteRequestList,
    PortalQuoteSummary,
    QuoteMarkCode,
} from '@/types/quote-request.types';

import { apiClient } from './api-client';

const PORTAL = '/quote-request/portal';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listPortalQuoteRequests = (accessToken?: string): Promise<PortalQuoteRequestList> =>
    apiClient.get<PortalQuoteRequestList>(`${PORTAL}/requests`, { headers: cookieHeader(accessToken) });

export const getPortalQuoteSummary = (accessToken?: string): Promise<PortalQuoteSummary> =>
    apiClient.get<PortalQuoteSummary>(`${PORTAL}/summary`, { headers: cookieHeader(accessToken) });

export const markQuoteRequest = (id: number, mark: QuoteMarkCode): Promise<PortalQuoteRequest> =>
    apiClient.put<PortalQuoteRequest>(`${PORTAL}/requests/${id}/mark`, { mark });
