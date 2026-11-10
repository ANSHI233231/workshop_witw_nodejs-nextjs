import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    FlagReason,
    FlagReasonFilters,
    FlagReasonInput,
    FlagReasonListItem,
    FlagReasonStatusCode,
} from '@/types/flag-reason.types';

import { apiClient } from './api-client';

const FLAG_REASON_PATH = '/flag-reason';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listFlagReasons = (
    filters: FlagReasonFilters,
    accessToken: string | undefined,
): Promise<FlagReasonListItem[]> =>
    apiClient.get<FlagReasonListItem[]>(FLAG_REASON_PATH, {
        query: { search: filters.search || undefined, status: filters.status },
        headers: cookieHeader(accessToken),
    });

export const createFlagReason = (name: string): Promise<FlagReason> =>
    apiClient.post<FlagReason>(FLAG_REASON_PATH, { name });

export const updateFlagReason = (id: number, input: FlagReasonInput): Promise<FlagReason> =>
    apiClient.put<FlagReason>(`${FLAG_REASON_PATH}/${id}`, input);

export const setFlagReasonStatus = (id: number, status: FlagReasonStatusCode): Promise<FlagReason> =>
    apiClient.patch<FlagReason>(`${FLAG_REASON_PATH}/${id}/status`, { status });
