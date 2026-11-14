'use client';

import { useEffect, useState } from 'react';

import { PortalShell } from '@/components/portal/portal-shell';
import { getCurrentUser } from '@/services/auth.service';
import { getMyPartnerRequest } from '@/services/partner.service';
import type { AuthUser } from '@/types/auth.types';
import type { MyPartnerRequest } from '@/types/partner.types';
import { partnerStateOf } from '@/types/portal.types';

import { FrameBoundary } from './frame-boundary';
import { LoadingPage } from './loading-page';
import { StatusPage } from './status-page';

type FrameData = { readonly user: AuthUser; readonly request: MyPartnerRequest | null };

const loadFrame = async (): Promise<FrameData | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    return { user, request: await getMyPartnerRequest() };
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
            <PortalShell user={frame.user} request={frame.request} state={partnerStateOf(frame.request)}>
                <StatusPage kind="error" framed detail={detail} />
            </PortalShell>
        </FrameBoundary>
    );
}
