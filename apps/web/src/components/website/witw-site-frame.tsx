'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { ChangePasswordDialog } from '@/components/console/change-password-dialog';
import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from '@/components/console/portal-notifications';
import { NotificationFeedBell } from '@/components/notification-feed/notification-feed-bell';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSessionWatch } from '@/hooks/session/use-session-watch';
import { signOut } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth.types';

import { BinocularsIcon, InstagramIcon, LockIcon, LogOutIcon, UserCircleIcon } from './site-icons';

export const SITE_PATHS = {
    home: '/',
    signIn: '/login',
    mySharedSafaris: '/my-shared-safaris',
} as const;

const AUTH_PATHS: readonly string[] = ['/login', '/sign-up', '/forgot-password'];

const NAV = [
    { label: 'Plan Safari', icon: '/witw/nav-plan-safari.png', href: null },
    { label: 'Safari Packages', icon: '/witw/nav-safari-packages.png', href: null },
    { label: 'Shared Safari', icon: '/witw/nav-shared-safari.png', href: SITE_PATHS.home },
] as const;

function WatchSession({ userId }: { readonly userId: number }) {
    useSessionWatch(userId);
    return null;
}

function AccountMenu({ user, onChangePassword }: { readonly user: AuthUser; readonly onChangePassword: () => void }) {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: MouseEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    const logOut = async () => {
        setOpen(false);
        try {
            await signOut();
        } finally {
            router.replace(SITE_PATHS.signIn);
            router.refresh();
        }
    };

    return (
        <div className="wb-wrap" ref={wrapRef}>
            <button
                type="button"
                className="wb-ic"
                aria-label={t('Account: {name}', { name: user.name })}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((shown) => !shown)}
            >
                <span className="wb-me">{user.name.trim().charAt(0).toUpperCase()}</span>
            </button>
            {open && (
                <div className="wb-pop">
                    <div className="dd" role="menu">
                        <div className="dd-who">
                            <div className="list-title">{user.name}</div>
                            <div className="list-meta">{user.email ?? user.username ?? ''}</div>
                        </div>
                        <Link className="mega-link" href={SITE_PATHS.mySharedSafaris} onClick={() => setOpen(false)}>
                            <BinocularsIcon />
                            {t('My Shared Safaris')}
                        </Link>
                        <button
                            type="button"
                            className="mega-link dd-btn"
                            onClick={() => {
                                setOpen(false);
                                onChangePassword();
                            }}
                        >
                            <LockIcon />
                            {t('Change Password')}
                        </button>
                        <div className="dd-sep"></div>
                        <button type="button" className="mega-link dd-btn" onClick={() => void logOut()}>
                            <LogOutIcon />
                            {t('Log Out')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SiteFooter() {
    const t = useT();
    return (
        <footer className="wb-foot">
            <img className="wb-grass" src="/witw/footer-grass.png" alt="" />
            <div className="wb-cols">
                <div>
                    <h2>{t('About Us')}</h2>
                    <p>
                        {t(
                            'We offer a seamless experience, connecting you with multiple safari tour operators and providing all the essential details you need to make informed decisions about your wildlife safari, all at no cost.',
                        )}
                    </p>
                    <p>
                        {t(
                            'Our shared safari feature connects you with fellow safari enthusiasts, enabling you to form a group and embark on a shared safari adventure together.',
                        )}
                    </p>
                </div>
                <div>
                    <h2>{t('Policy')}</h2>
                    <a className="is-off">{t('Privacy Policy')}</a>
                    <a className="is-off">{t('Terms & Conditions')}</a>
                    <a className="is-off">{t('Refund Policy')}</a>
                </div>
                <div>
                    <h2>{t('Useful Links')}</h2>
                    <a className="is-off">{t('About Us')}</a>
                    <a className="is-off">{t('Contact us')}</a>
                    <a className="is-off">{t('FAQs')}</a>
                </div>
                <div>
                    <h2>{t('Contact Info')}</h2>
                    <p className="wb-line">
                        <b>{t('Address:')}</b> {t('New Delhi, India')}
                    </p>
                    <p className="wb-line">
                        <b>{t('Email:')}</b> support@walkintothewild.in
                    </p>
                    <a className="wb-insta is-off">
                        <span>
                            <InstagramIcon />
                        </span>
                        walkintothewild.in
                    </a>
                </div>
            </div>
            <div className="wb-bottom">
                <img src="/witw/footer-logo.png" alt="Walk Into The Wild" />
                <span>{t('Developed by Mediarc Technologies Private Limited')}</span>
                <span>{t('Copyright © 2025 | All rights reserved')}</span>
            </div>
        </footer>
    );
}

export function SiteBanner({ title, text }: { readonly title: string; readonly text?: string }) {
    return (
        <section className="wb-hero">
            <h1>{title}</h1>
            {text && <p>{text}</p>}
        </section>
    );
}

export function WitwSiteFrame({ user, children }: { readonly user: AuthUser | null; readonly children: ReactNode }) {
    const t = useT();
    const router = useRouter();
    const pathname = usePathname();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const onAuthPage = AUTH_PATHS.includes(pathname);

    return (
        <div className="wb">
            {user && <WatchSession userId={user.id} />}
            {user && changePasswordOpen && (
                <ChangePasswordDialog
                    user={user}
                    roleLabel=""
                    onClose={() => setChangePasswordOpen(false)}
                    onChanged={() => {
                        setChangePasswordOpen(false);
                        setNotice(t('Password updated.'));
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
            <header className="wb-head">
                <Link className="wb-logo" href={SITE_PATHS.home} aria-label={t('Walk Into The Wild home')}>
                    <img src="/witw/logo.png" alt="Walk Into The Wild" />
                </Link>
                <nav className="wb-nav" aria-label={t('Website')}>
                    {NAV.map((item) =>
                        item.href ? (
                            <Link
                                key={item.label}
                                className={onAuthPage ? undefined : 'is-on'}
                                aria-current={onAuthPage ? undefined : 'page'}
                                href={item.href}
                            >
                                <img src={item.icon} alt="" />
                                {t(item.label)}
                            </Link>
                        ) : (
                            <a key={item.label} className="is-off">
                                <img src={item.icon} alt="" />
                                {t(item.label)}
                            </a>
                        ),
                    )}
                </nav>
                <div className="wb-right">
                    {user ? (
                        <>
                            <NotificationFeedBell
                                owner={null}
                                feedPath={PORTAL_NOTIFICATIONS_PATH}
                                links={PORTAL_NOTIFICATION_LINKS}
                                look="site"
                            />
                            <AccountMenu user={user} onChangePassword={() => setChangePasswordOpen(true)} />
                        </>
                    ) : (
                        <Link
                            className="wb-ic"
                            href={SITE_PATHS.signIn}
                            aria-label={t('Sign in')}
                            aria-current={pathname === SITE_PATHS.signIn ? 'page' : undefined}
                        >
                            <UserCircleIcon />
                        </Link>
                    )}
                </div>
            </header>
            {children}
            <SiteFooter />
        </div>
    );
}
