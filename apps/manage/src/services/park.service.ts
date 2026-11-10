import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    Park,
    ParkDetail,
    ParkFilters,
    ParkInput,
    ParkStatusCode,
    ParkUpdate,
} from '@/types/park.types';

import { apiClient } from './api-client';

export const PARK_PAGE_SIZE = 20;

const PARK_PATH = '/park';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listParks = (filters: ParkFilters, accessToken: string | undefined): Promise<Paginated<Park>> =>
    apiClient.paginated<Park>(PARK_PATH, {
        query: {
            search: filters.search || undefined,
            region: filters.region,
            status: filters.status,
            page: filters.page,
            limit: PARK_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const getPark = (id: number, accessToken: string | undefined): Promise<ParkDetail> =>
    apiClient.get<ParkDetail>(`${PARK_PATH}/${id}`, { headers: cookieHeader(accessToken) });

export const createPark = (input: ParkInput): Promise<Park> => apiClient.post<Park>(PARK_PATH, input);

export const updatePark = (id: number, input: ParkUpdate): Promise<Park> =>
    apiClient.put<Park>(`${PARK_PATH}/${id}`, input);

export const setParkStatus = (id: number, status: ParkStatusCode): Promise<Park> =>
    apiClient.patch<Park>(`${PARK_PATH}/${id}/status`, { status });
