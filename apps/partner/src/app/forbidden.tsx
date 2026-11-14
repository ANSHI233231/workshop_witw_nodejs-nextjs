import { PortalShell } from '@/components/portal/portal-shell';
import { StatusPage } from '@/components/layout/status-page';
import { portalSession } from '@/lib/portal-session';

export default async function Forbidden() {
    const session = await portalSession();
    if (!session) return <StatusPage kind="forbidden" />;
    return (
        <PortalShell user={session.user} request={session.request} state={session.state}>
            <StatusPage kind="forbidden" framed />
        </PortalShell>
    );
}
