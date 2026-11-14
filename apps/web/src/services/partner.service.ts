import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { AuthUser, SignUpInput } from '@/types/auth.types';
import { type MyPartnerRequest, type PartnerBusinessInput, PartnerStatus } from '@/types/partner.types';

import { apiClient } from './api-client';

const BASE = '/partner/requests';

export type SitePartner = {
    readonly id: number;
    readonly businessName: string;
    readonly logoVersion: string | null;
};

export const partnerLogoUrl = (partnerId: number, logoVersion: string): string =>
    apiClient.fileUrl(`/partner/partners/${partnerId}/logo`, { v: logoVersion });

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const getMyPartnerRequest = (accessToken: string | undefined): Promise<MyPartnerRequest | null> =>
    apiClient.get<MyPartnerRequest | null>(`${BASE}/mine`, { headers: cookieHeader(accessToken) });

export const sendPartnerRequest = (input: PartnerBusinessInput): Promise<MyPartnerRequest> =>
    apiClient.post<MyPartnerRequest>(BASE, input);

export const sendPartnerRequestWithAccount = (
    input: SignUpInput & PartnerBusinessInput,
): Promise<{ readonly user: AuthUser; readonly request: MyPartnerRequest }> =>
    apiClient.post<{ readonly user: AuthUser; readonly request: MyPartnerRequest }>(`${BASE}/with-account`, input);

export const uploadPartnerLogo = (logo: File): Promise<MyPartnerRequest> => {
    const body = new FormData();
    body.append('logo', logo);
    return apiClient.put<MyPartnerRequest>(`${BASE}/mine/logo`, body);
};

export const getSitePartner = async (
    accessToken: string | undefined,
): Promise<SitePartner | null> => {
    try {
        const request = await getMyPartnerRequest(accessToken);
        const isPartner = request?.status === PartnerStatus.ACTIVE || request?.status === PartnerStatus.INACTIVE;
        return request && isPartner ? { id: request.id, businessName: request.businessName, logoVersion: request.logoVersion }
            : null;
    } catch {
        return null;
    }
};
