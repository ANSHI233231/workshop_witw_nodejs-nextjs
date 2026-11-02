import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { ConsoleShell } from '@/components/console/console-shell';
import { consoleSession } from '@/lib/console-session';

export default async function ConsoleLayout({ children }: { readonly children: ReactNode }) {
    const session = await consoleSession();
    if (!session) redirect('/login');
    return (
        <ConsoleShell user={session.user} access={session.access}>
            {children}
        </ConsoleShell>
    );
}
