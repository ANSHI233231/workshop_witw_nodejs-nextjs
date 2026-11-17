'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { useLanguages } from '@/hooks/i18n/use-languages';
import { useSessionWatch } from '@/hooks/session/use-session-watch';
import { usePopupPageLock } from '@/hooks/ui/use-popup-page-lock';
import { saveLocale } from '@/lib/i18n/locale-cookie';
import type { Locale } from '@/lib/i18n/locale';
import { signOut } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';
import type { MyPartnerRequest } from '@/types/partner.types';
import type { PartnerState } from '@/types/portal.types';

import { Toast } from '@/components/ui/toast';

import { ChangePasswordDialog } from './change-password-dialog';
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
    const { locale } = useLanguages();
    const [language, setLanguage] = useState<Locale>(locale);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const t = useT();

    const changeLanguage = (next: Locale) => {
        if (next === language) return;
        setLanguage(next);
        saveLocale(next);
        router.refresh();
    };

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
            {userMenuOpen && (
                <PortalUserMenu
                    identity={identity}
                    onChangePassword={() => {
                        setChangePasswordOpen(true);
                        setUserMenuOpen(false);
                    }}
                    onSignOut={() => void signOutAndLeave()}
                />
            )}
            {changePasswordOpen && (
                <ChangePasswordDialog
                    user={user}
                    roleLabel={identity.roleLine(t)}
                    onClose={() => setChangePasswordOpen(false)}
                    onChanged={() => {
                        setChangePasswordOpen(false);
                        setNotice(t('Password updated.'));
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
            <div className="app sl">
                <PortalHeader
                    identity={identity}
                    withNotifications={state === 'active'}
                    language={language}
                    onLanguageChange={changeLanguage}
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
