import { cookies } from 'next/headers';

import { StatusPage } from '@/components/layout/status-page';
import { WitwSiteFrame } from '@/components/website/witw-site-frame';
import { getSignedInUser } from '@/services/auth.service';
import { getSitePartner } from '@/services/partner.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export default async function Forbidden() {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const user = await getSignedInUser(accessToken);
    if (!user) return <StatusPage kind="forbidden" />;
    const partner = await getSitePartner(accessToken);
    return (
        <WitwSiteFrame user={user} partner={partner}>
            <main className="wb-main">
                <StatusPage kind="forbidden" framed />
            </main>
        </WitwSiteFrame>
    );
}
