'use client';

import { useEffect, useState } from 'react';

import { WitwSiteFrame } from '@/components/website/witw-site-frame';
import { getCurrentUser } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';

import { FrameBoundary } from './frame-boundary';
import { LoadingPage } from './loading-page';
import { StatusPage } from './status-page';

type FrameData = { readonly user: AuthUser };

const loadFrame = async (): Promise<FrameData | null> => {
    const user = await getCurrentUser();
    return user ? { user } : null;
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
            <WitwSiteFrame user={frame.user}>
                <main className="wb-main">
                    <StatusPage kind="error" framed detail={detail} />
                </main>
            </WitwSiteFrame>
        </FrameBoundary>
    );
}
