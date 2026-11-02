import { cookies } from 'next/headers';

import { ConsoleShell } from '@/components/console/console-shell';
import { StatusPage } from '@/components/layout/status-page';
import { getSignedInUser } from '@/services/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export default async function Forbidden() {
    const user = await getSignedInUser((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (!user) return <StatusPage kind="forbidden" />;
    return (
        <ConsoleShell user={user} access={null}>
            <StatusPage kind="forbidden" framed />
        </ConsoleShell>
    );
}
