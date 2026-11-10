import { cookies } from 'next/headers';

import { StatusPage } from '@/components/layout/status-page';
import { WitwSiteFrame } from '@/components/website/witw-site-frame';
import { getSignedInUser } from '@/services/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export default async function Forbidden() {
    const user = await getSignedInUser((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (!user) return <StatusPage kind="forbidden" />;
    return (
        <WitwSiteFrame user={user}>
            <main className="wb-main">
                <StatusPage kind="forbidden" framed />
            </main>
        </WitwSiteFrame>
    );
}
