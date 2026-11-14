import type { ReactNode } from 'react';

import { PortalShell } from '@/components/portal/portal-shell';
import { requireSignedIn } from '@/lib/portal-session';

export default async function PortalLayout({ children }: { readonly children: ReactNode }) {
    const session = await requireSignedIn();
    return (
        <PortalShell user={session.user} request={session.request} state={session.state}>
            {children}
        </PortalShell>
    );
}
