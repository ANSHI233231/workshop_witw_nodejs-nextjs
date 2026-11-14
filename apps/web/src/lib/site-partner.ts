import { cookies } from 'next/headers';
import { cache } from 'react';

import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { getSitePartner, type SitePartner } from '@/services/partner.service';

export const currentSitePartner = cache(async (): Promise<SitePartner | null> => {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    return accessToken ? getSitePartner(accessToken) : null;
});
