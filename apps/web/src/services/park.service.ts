import type { ParkFilters, ParkList, ParkPageData } from '@/types/park.types';

import { apiClient } from './api-client';

const BASE = '/park';

export const listParks = async (
    filters: ParkFilters,
    page: number,
    signal?: AbortSignal,
): Promise<ParkList> => {
    const result = await apiClient.paginated<ParkList['items'][number]>(`${BASE}/parks`, {
        query: {
            page,
            sort: filters.sort,
            search: filters.search.trim() || undefined,
            region: filters.region || undefined,
        },
        signal,
    });
    return { items: result.items, total: result.meta.total, page: result.meta.page };
};

export const getParkPage = (slug: string): Promise<ParkPageData> =>
    apiClient.get<ParkPageData>(`${BASE}/parks/${encodeURIComponent(slug)}`);

export const parkImageUrl = (slug: string, featureImage: string): string =>
    apiClient.fileUrl(`${BASE}/parks/${encodeURIComponent(slug)}/feature-image`, { v: featureImage });
