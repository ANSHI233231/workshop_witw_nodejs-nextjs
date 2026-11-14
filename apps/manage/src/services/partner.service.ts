import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    ParkOption,
    Partner,
    PartnerBusinessInput,
    PartnerFilters,
    PartnerStatusCode,
} from '@/types/partner.types';

import { apiClient } from './api-client';

export const PARTNER_PAGE_SIZE = 20;

const ADMIN = '/partner/admin';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

const listOf = (path: string, filters: PartnerFilters, accessToken: string | undefined): Promise<Paginated<Partner>> =>
    apiClient.paginated<Partner>(path, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            page: filters.page,
            limit: PARTNER_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const listPartnerRequests = (filters: PartnerFilters, accessToken: string | undefined) =>
    listOf(`${ADMIN}/requests`, filters, accessToken);

export const listPartners = (filters: PartnerFilters, accessToken: string | undefined) =>
    listOf(`${ADMIN}/partners`, filters, accessToken);

export const listActiveParks = (): Promise<readonly ParkOption[]> => apiClient.get<readonly ParkOption[]>('/park/active');

export const approvePartnerRequest = (id: number): Promise<Partner> =>
    apiClient.post<Partner>(`${ADMIN}/requests/${id}/approve`);

export const rejectPartnerRequest = (id: number, reason: string): Promise<Partner> =>
    apiClient.post<Partner>(`${ADMIN}/requests/${id}/reject`, { reason });

export const editPartner = (id: number, input: PartnerBusinessInput): Promise<Partner> =>
    apiClient.put<Partner>(`${ADMIN}/partners/${id}`, input);

export const uploadPartnerLogo = (id: number, logo: File): Promise<Partner> => {
    const body = new FormData();
    body.append('logo', logo);
    return apiClient.put<Partner>(`${ADMIN}/partners/${id}/logo`, body);
};

export const removePartnerLogo = (id: number): Promise<Partner> =>
    apiClient.delete<Partner>(`${ADMIN}/partners/${id}/logo`);

export const partnerLogoUrl = (id: number, logoVersion: string): string =>
    apiClient.fileUrl(`${ADMIN}/partners/${id}/logo`, { v: logoVersion });

export const setPartnerPhoneShown = (id: number, isPhoneShown: boolean): Promise<Partner> =>
    apiClient.patch<Partner>(`${ADMIN}/partners/${id}/phone-numbers`, { isPhoneShown });

export const setPartnerStatus = (id: number, status: PartnerStatusCode): Promise<Partner> =>
    apiClient.patch<Partner>(`${ADMIN}/partners/${id}/status`, { status });
