import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { MyPartnerRequest, ParkOption, PartnerBusinessInput } from '@/types/partner.types';

import { apiClient } from './api-client';

const REQUESTS = '/partner/requests';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const getMyPartnerRequest = (accessToken?: string): Promise<MyPartnerRequest | null> =>
    apiClient.get<MyPartnerRequest | null>(`${REQUESTS}/mine`, { headers: cookieHeader(accessToken) });

export const sendPartnerRequest = (input: PartnerBusinessInput): Promise<MyPartnerRequest> =>
    apiClient.post<MyPartnerRequest>(REQUESTS, input);

export const sendPartnerRequestAgain = (input: PartnerBusinessInput): Promise<MyPartnerRequest> =>
    apiClient.put<MyPartnerRequest>(`${REQUESTS}/mine`, input);

export const uploadPartnerLogo = (logo: File): Promise<MyPartnerRequest> => {
    const body = new FormData();
    body.append('logo', logo);
    return apiClient.put<MyPartnerRequest>(`${REQUESTS}/mine/logo`, body);
};

export const removePartnerLogo = (): Promise<MyPartnerRequest> =>
    apiClient.delete<MyPartnerRequest>(`${REQUESTS}/mine/logo`);

export const partnerLogoUrl = (logoVersion: string): string =>
    apiClient.fileUrl(`${REQUESTS}/mine/logo`, { v: logoVersion });

export const listActiveParks = (): Promise<readonly ParkOption[]> => apiClient.get<readonly ParkOption[]>('/park/active');
