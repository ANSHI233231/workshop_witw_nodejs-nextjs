'use client';

import { useEffect, useState } from 'react';

import { ConsoleShell } from '@/components/console/console-shell';
import { consoleAccessOf } from '@/lib/console-access';
import { getConsoleRoles, getCurrentUser } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';
import type { ConsoleAccess, ConsoleRoleItem } from '@/types/console.types';

import { FrameBoundary } from './frame-boundary';
import { LoadingPage } from './loading-page';
import { StatusPage } from './status-page';

type FrameData = {
    readonly user: AuthUser;
    readonly access: ConsoleAccess;
    readonly roles: readonly ConsoleRoleItem[];
};

const loadFrame = async (): Promise<FrameData | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    const roles = await getConsoleRoles(undefined);
    const access = consoleAccessOf(roles);
    return access ? { user, access, roles } : null;
};

export function FramedErrorPage({ detail }: { readonly detail: string | undefined }) {
    const [frame, setFrame] = useState<FrameData | null | undefined>(undefined);

    useEffect(() => {
        let active = true;
        loadFrame().then(
            (data) => active && setFrame(data),
            () => active && setFrame(null),
        );
        return () => {
            active = false;
        };
    }, []);

    const standalone = <StatusPage kind="error" detail={detail} />;
    if (frame === undefined) return <LoadingPage />;
    if (frame === null) return standalone;
    return (
        <FrameBoundary fallback={standalone}>
            <ConsoleShell user={frame.user} access={frame.access} roles={frame.roles}>
                <StatusPage kind="error" framed detail={detail} />
            </ConsoleShell>
        </FrameBoundary>
    );
}
