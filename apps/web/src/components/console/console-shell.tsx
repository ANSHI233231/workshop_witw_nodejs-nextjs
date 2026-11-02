'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { useLanguages } from '@/hooks/i18n/use-languages';
import { useT } from '@/hooks/i18n/use-t';
import { useSessionWatch } from '@/hooks/session/use-session-watch';
import { usePopupPageLock } from '@/hooks/ui/use-popup-page-lock';
import { consoleRoleLabel } from '@/lib/console-access';
import { saveLocale } from '@/lib/i18n/locale-cookie';
import { signOut } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';
import type { ConsoleAccess } from '@/types/console.types';

import { Toast } from '@/components/ui/toast';

import { ChangePasswordDialog } from './change-password-dialog';
import { ConsoleAccessProvider } from './console-access-context';
import { ConsoleFooter } from './console-footer';
import { ConsoleHeader, type ConsoleLanguage } from './console-header';
import { consoleMenuFor } from './console-menu';
import { PortalNav } from './portal-nav';
import { CutCellText } from './cut-cell-text';
import { UserMenu } from './user-menu';

export function ConsoleShell({
    user,
    access,
    children,
}: {
    readonly user: AuthUser;
    readonly access: ConsoleAccess | null;
    readonly children: ReactNode;
}) {
    const t = useT();
    const roleLabel = consoleRoleLabel();
    const router = useRouter();
    useSessionWatch(user.id);
    usePopupPageLock();
    const { locale } = useLanguages();
    const [language, setLanguage] = useState<ConsoleLanguage>(locale);

    const changeLanguage = (next: ConsoleLanguage) => {
        if (next === language) return;
        setLanguage(next);
        saveLocale(next);
        router.refresh();
    };
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

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

    const openChangePassword = () => {
        setChangePasswordOpen(true);
        setUserMenuOpen(false);
    };

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
                <UserMenu
                    user={user}
                    roleLabel={roleLabel}
                    onChangePassword={openChangePassword}
                    onSignOut={() => void signOutAndLeave()}
                />
            )}
            {changePasswordOpen && (
                <ChangePasswordDialog
                    user={user}
                    roleLabel={roleLabel}
                    onClose={() => setChangePasswordOpen(false)}
                    onChanged={() => {
                        setChangePasswordOpen(false);
                        setNotice(t('Password updated.'));
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
            <CutCellText />
            <div className={access ? 'app top' : 'app e4-app'}>
                <ConsoleHeader
                    user={user}
                    roleLabel={roleLabel}
                    withNav={false}
                    language={language}
                    userMenuOpen={userMenuOpen}
                    onLanguageChange={changeLanguage}
                    onToggleUserMenu={() => setUserMenuOpen((open) => !open)}
                    navOpen={navOpen}
                    onToggleNav={() => {
                        setNavOpen((open) => !open);
                        setUserMenuOpen(false);
                    }}
                />
                {access && <PortalNav menu={consoleMenuFor(access)} />}
                <main className="app-content">
                    <ConsoleAccessProvider value={access}>{children}</ConsoleAccessProvider>
                </main>
                <ConsoleFooter />
            </div>
        </>
    );
}
