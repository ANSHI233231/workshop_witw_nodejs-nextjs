import type { MyQuoteRequest, MyQuoteRequests, QuoteRequestInput } from '@/types/quote-request.types';

import { apiClient } from './api-client';

const BASE = '/quote-request';

export const sendQuoteRequest = (input: QuoteRequestInput): Promise<MyQuoteRequest> =>
    apiClient.post<MyQuoteRequest>(`${BASE}/requests`, input);

export const listMyQuoteRequests = (): Promise<MyQuoteRequests> =>
    apiClient.get<MyQuoteRequests>(`${BASE}/requests/mine`);
