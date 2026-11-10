import type {
    FlagReason,
    HostStatus,
    MyTab,
    ParkOption,
    SafariCard,
    SafariEdit,
    SafariFilters,
    SafariInput,
    SafariPage,
    SafariView,
    SortValue,
} from '@/types/shared-safari.types';
import { SAFARI_LIMITS } from '@/types/shared-safari.types';

import { apiClient } from './api-client';

const BASE = '/shared-safari';

const listQuery = (filters: SafariFilters, sort: SortValue, page: number) => ({
    page,
    sort,
    parkId: filters.parkId || undefined,
    month: filters.month || undefined,
    priceMin: filters.priceFrom > SAFARI_LIMITS.BUDGET_MIN ? filters.priceFrom : undefined,
    priceMax: filters.priceTo < SAFARI_LIMITS.BUDGET_MAX ? filters.priceTo : undefined,
    safarisMin: filters.safarisFrom > SAFARI_LIMITS.SAFARIS_MIN ? filters.safarisFrom : undefined,
    safarisMax: filters.safarisTo < SAFARI_LIMITS.SAFARIS_MAX ? filters.safarisTo : undefined,
    themes: filters.themes.length > 0 ? filters.themes.join(',') : undefined,
    stays: filters.stays.length > 0 ? filters.stays.join(',') : undefined,
});

export const listSafaris = (
    filters: SafariFilters,
    sort: SortValue,
    page: number,
    signal?: AbortSignal,
): Promise<SafariPage> => apiClient.get<SafariPage>(`${BASE}/safaris`, { query: listQuery(filters, sort, page), signal });

export const getSafari = (ref: string): Promise<SafariView> =>
    apiClient.get<SafariView>(`${BASE}/safaris/${encodeURIComponent(ref)}`);

export const getSafariForEdit = (id: number): Promise<SafariEdit> => apiClient.get<SafariEdit>(`${BASE}/safaris/${id}/edit`);

export const createSafari = (input: SafariInput): Promise<{ readonly id: number; readonly slug: string }> =>
    apiClient.post<{ readonly id: number; readonly slug: string }>(`${BASE}/safaris`, input);

export const updateSafari = (id: number, input: SafariInput): Promise<{ readonly id: number; readonly slug: string }> =>
    apiClient.put<{ readonly id: number; readonly slug: string }>(`${BASE}/safaris/${id}`, input);

export const uploadSafariCover = (id: number, image: File): Promise<{ readonly coverVersion: string }> => {
    const body = new FormData();
    body.append('image', image);
    return apiClient.put<{ readonly coverVersion: string }>(`${BASE}/safaris/${id}/cover-image`, body);
};

export const safariCoverUrl = (id: number, coverVersion: string): string =>
    apiClient.fileUrl(`${BASE}/safaris/${id}/cover-image`, { v: coverVersion });

export const setSafariStatus = (id: number, status: HostStatus): Promise<void> =>
    apiClient.patch<void>(`${BASE}/safaris/${id}/status`, { status });

export const deleteSafari = (id: number): Promise<void> => apiClient.delete<void>(`${BASE}/safaris/${id}`);

export const joinSafari = (id: number): Promise<void> => apiClient.post<void>(`${BASE}/safaris/${id}/join`, {});

export const leaveSafari = (id: number): Promise<void> => apiClient.post<void>(`${BASE}/safaris/${id}/leave`, {});

export const listMySafaris = (tab: MyTab): Promise<readonly SafariCard[]> =>
    apiClient.get<readonly SafariCard[]>(`${BASE}/mine`, { query: { tab } });

export const postComment = (safariId: number, text: string, parentId: number | null): Promise<{ readonly id: number }> =>
    apiClient.post<{ readonly id: number }>(`${BASE}/safaris/${safariId}/comments`, { text, parentId });

export const editComment = (id: number, text: string): Promise<void> =>
    apiClient.patch<void>(`${BASE}/comments/${id}`, { text });

export const deleteComment = (id: number): Promise<void> => apiClient.delete<void>(`${BASE}/comments/${id}`);

export const flagComment = (id: number, reasonId: number, details: string): Promise<void> =>
    apiClient.post<void>(`${BASE}/comments/${id}/flags`, { reasonId, details });

export const listActiveParks = (): Promise<readonly ParkOption[]> => apiClient.get<readonly ParkOption[]>('/park/active');

export const listActiveFlagReasons = (): Promise<readonly FlagReason[]> =>
    apiClient.get<readonly FlagReason[]>('/flag-reason/active');
