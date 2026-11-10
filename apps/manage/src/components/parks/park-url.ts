import { listUrl } from '@/lib/list-url';
import type { ParkFilters } from '@/types/park.types';

export const PARKS_PATH = '/parks';

export const parkPath = (id: number): string => `${PARKS_PATH}/${id}`;

export const sharedSafariPath = (id: number): string => `/shared-safaris/${id}`;

export const parkListParams = (filters: Omit<ParkFilters, 'page'>) => ({
    search: filters.search,
    region: filters.region,
    status: filters.status,
});

export const parkUrl = (filters: ParkFilters): string =>
    listUrl(PARKS_PATH, { ...parkListParams(filters), page: filters.page });
