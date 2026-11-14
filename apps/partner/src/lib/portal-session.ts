import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { getSignedInUser } from '@/services/auth.service';
import { getMyPartnerRequest } from '@/services/partner.service';
import { partnerStateOf, type PortalSession } from '@/types/portal.types';

export const LOGIN_PATH = '/login';

export const PARTNER_REQUEST_PATH = '/partner-request';

export const readAccessToken = async (): Promise<string | undefined> =>
    (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

export const portalSession = cache(async (): Promise<PortalSession | null> => {
    const accessToken = await readAccessToken();
    const user = await getSignedInUser(accessToken);
    if (!user) return null;
    const request = await getMyPartnerRequest(accessToken);
    return { user, request, state: partnerStateOf(request) };
});

export const requireSignedIn = async (): Promise<PortalSession> => {
    const session = await portalSession();
    if (!session) redirect(LOGIN_PATH);
    return session;
};

export const requireActivePartner = async (): Promise<PortalSession> => {
    const session = await requireSignedIn();
    if (session.state !== 'active') redirect(PARTNER_REQUEST_PATH);
    return session;
};
