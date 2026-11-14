import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { WitwSiteFrame } from '@/components/website/witw-site-frame';
import { consoleSession } from '@/lib/console-session';
import { currentSitePartner } from '@/lib/site-partner';

export default async function PortalLayout({ children }: { readonly children: ReactNode }) {
    const session = await consoleSession();
    if (!session) redirect('/login');
    const partner = await currentSitePartner();
    return (
        <WitwSiteFrame user={session.user} partner={partner}>
            <main className="wb-main">{children}</main>
        </WitwSiteFrame>
    );
}
