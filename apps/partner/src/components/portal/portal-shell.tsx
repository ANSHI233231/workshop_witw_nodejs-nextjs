'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { useSessionWatch } from '@/hooks/session/use-session-watch';
import { usePopupPageLock } from '@/hooks/ui/use-popup-page-lock';
import { signOut } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';
import type { MyPartnerRequest } from '@/types/partner.types';
import type { PartnerState } from '@/types/portal.types';

import { PortalFooter } from './portal-footer';
import { PortalHeader } from './portal-header';
import { portalIdentityOf } from './portal-identity';
import { portalMenuFor } from './portal-menu';
import { PortalSidebar } from './portal-sidebar';
import { PortalUserMenu } from './portal-user-menu';

export function PortalShell({
    user,
    request,
    state,
    children,
}: {
    readonly user: AuthUser;
    readonly request: MyPartnerRequest | null;
    readonly state: PartnerState;
    readonly children: ReactNode;
}) {
    const router = useRouter();
    useSessionWatch(user.id);
    usePopupPageLock();
    const identity = portalIdentityOf(user, request, state);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const closeOnLink = (event: MouseEvent) => {
            if (!(event.target instanceof Element) || !event.target.closest('a[href]')) return;
            setUserMenuOpen(false);
            setNavOpen(false);
        };
        document.addEventListener('click', closeOnLink);
        return () => document.removeEventListener('click', closeOnLink);
    }, []);

    useEffect(() => {
        if (!navOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setNavOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [navOpen]);

    const signOutAndLeave = async () => {
        setUserMenuOpen(false);
        try {
            await signOut();
        } finally {
            router.replace('/login');
            router.refresh();
        }
    };

    return (
        <>
            {userMenuOpen && <PortalUserMenu identity={identity} onSignOut={() => void signOutAndLeave()} />}
            <div className="app sl">
                <PortalHeader
                    identity={identity}
                    withNotifications={state === 'active'}
                    userMenuOpen={userMenuOpen}
                    navOpen={navOpen}
                    onToggleNav={() => {
                        setNavOpen((open) => !open);
                        setUserMenuOpen(false);
                    }}
                    onToggleUserMenu={() => setUserMenuOpen((open) => !open)}
                />
                {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)}></div>}
                <PortalSidebar menu={portalMenuFor(state)} open={navOpen} />
                <main className="app-content">{children}</main>
                <PortalFooter />
            </div>
        </>
    );
}
