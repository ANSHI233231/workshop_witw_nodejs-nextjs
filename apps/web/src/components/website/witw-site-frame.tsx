'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { ChangePasswordDialog } from '@/components/console/change-password-dialog';
import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from '@/components/console/portal-notifications';
import { NotificationFeedBell } from '@/components/notification-feed/notification-feed-bell';
import { ChatProvider, useChat } from '@/components/chat/chat-provider';
import { MyPhotoProvider, useMyPhoto } from '@/components/profile/my-photo-provider';
import { Toast } from '@/components/ui/toast';
import { WishlistProvider, type WishlistViewer } from '@/components/wishlist/wishlist-provider';
import { useT } from '@/hooks/i18n/use-t';
import { useSessionWatch } from '@/hooks/session/use-session-watch';
import { config } from '@/lib/config';
import { signOut } from '@/services/auth.service';
import { partnerLogoUrl, type SitePartner } from '@/services/partner.service';
import { userPhotoUrl } from '@/services/profile.service';
import type { AuthUser } from '@/types/auth.types';

import {
    BinocularsIcon,
    ExternalLinkIcon,
    HeartIcon,
    InstagramIcon,
    LockIcon,
    LogOutIcon,
    MailIcon,
    MessageSquareIcon,
    PackageBoxIcon,
    UserCircleIcon,
    UserIcon,
} from './site-icons';

export const SITE_PATHS = {
    home: '/',
    signIn: '/login',
    mySharedSafaris: '/my-shared-safaris',
    becomePartner: '/become-a-partner',
    plans: '/parks',
    packages: '/packages',
    myQuoteRequests: '/my-quote-requests',
    myProfile: '/my-profile',
    wishlist: '/wishlist',
    messages: '/messages',
} as const;

const partnerPortalPath = (path: string): string => `${config.partnerPortalUrl ?? ''}${path}`;

const NavSection = { PLAN: 'plan', PACKAGES: 'packages', SHARED: 'shared', NONE: 'none' } as const;

type NavSectionKey = (typeof NavSection)[keyof typeof NavSection];

const PACKAGE_SECTION_PATHS: readonly string[] = [
    SITE_PATHS.packages,
    SITE_PATHS.becomePartner,
    SITE_PATHS.myQuoteRequests,
];

const startsWithPath = (pathname: string, path: string): boolean => pathname === path || pathname.startsWith(`${path}/`);

const sectionOf = (pathname: string): NavSectionKey => {
    if (AUTH_PATHS.includes(pathname)) return NavSection.NONE;
    if (startsWithPath(pathname, SITE_PATHS.plans)) return NavSection.PLAN;
    if (PACKAGE_SECTION_PATHS.some((path) => startsWithPath(pathname, path))) return NavSection.PACKAGES;
    return NavSection.SHARED;
};

const AUTH_PATHS: readonly string[] = ['/login', '/sign-up', '/forgot-password'];

const NAV = [
    { label: 'Plan Safari', icon: '/witw/nav-plan-safari.png', href: SITE_PATHS.plans, section: NavSection.PLAN },
    {
        label: 'Safari Packages',
        icon: '/witw/nav-safari-packages.png',
        href: SITE_PATHS.packages,
        section: NavSection.PACKAGES,
    },
    { label: 'Shared Safari', icon: '/witw/nav-shared-safari.png', href: SITE_PATHS.home, section: NavSection.SHARED },
] as const;

function WatchSession({ userId }: { readonly userId: number }) {
    useSessionWatch(userId);
    return null;
}

function AccountMenu({
    user,
    partner,
    onChangePassword,
}: {
    readonly user: AuthUser;
    readonly partner: SitePartner | null;
    readonly onChangePassword: () => void;
}) {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const my = useMyPhoto();
    const { unreadCount } = useChat();

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
                aria-label={t('Account: {name}', { name: partner?.businessName ?? user.name })}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((shown) => !shown)}
            >
                <span className="wb-me">
                    {partner?.logoVersion ? (
                        <img className="avatar-photo" src={partnerLogoUrl(partner.id, partner.logoVersion)} alt="" />
                    ) : partner ? (
                        <img className="avatar-photo avatar-photo-default" src="/witw/logo.png" alt={t('No logo yet')} />
                    ) : my.photoVersion ? (
                        <img className="avatar-photo" src={userPhotoUrl(user.id, my.photoVersion)} alt="" />
                    ) : (
                        user.name.trim().charAt(0).toUpperCase()
                    )}
                </span>
            </button>
            {open && (
                <div className="wb-pop">
                    <div className="dd" role="menu">
                        <div className="dd-who">
                            <div className="list-title">{partner?.businessName ?? user.name}</div>
                            <div className="list-meta">{user.email ?? user.username ?? ''}</div>
                        </div>
                        <Link className="mega-link" href={SITE_PATHS.myProfile} onClick={() => setOpen(false)}>
                            <UserIcon />
                            {t('My Profile')}
                        </Link>
                        {partner ? (
                            <a
                                className="mega-link"
                                href={partnerPortalPath('/packages')}
                                onClick={() => setOpen(false)}
                            >
                                <PackageBoxIcon />
                                {t('My Packages')}
                            </a>
                        ) : (
                            <>
                                <Link className="mega-link" href={SITE_PATHS.mySharedSafaris} onClick={() => setOpen(false)}>
                                    <BinocularsIcon />
                                    {t('My Shared Safaris')}
                                </Link>
                                <Link className="mega-link" href={SITE_PATHS.myQuoteRequests} onClick={() => setOpen(false)}>
                                    <MailIcon />
                                    {t('My Quote Requests')}
                                </Link>
                                <Link className="mega-link" href={SITE_PATHS.wishlist} onClick={() => setOpen(false)}>
                                    <HeartIcon />
                                    {t('Wishlist')}
                                </Link>
                                <Link className="mega-link" href={SITE_PATHS.messages} onClick={() => setOpen(false)}>
                                    <MessageSquareIcon />
                                    {t('Messages')}
                                    {unreadCount > 0 && (
                                        <span className="dd-cnt" aria-label={t('{n} unread', { n: unreadCount })}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
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
                        {partner && (
                            <a className="mega-link" href={config.partnerPortalUrl} onClick={() => setOpen(false)}>
                                <ExternalLinkIcon />
                                {t('Partner portal')}
                            </a>
                        )}
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
                    <Link href={SITE_PATHS.plans}>{t('Parks')}</Link>
                    <Link href={SITE_PATHS.becomePartner}>{t('Become a Partner')}</Link>
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

const BANNER_SHADE = 'linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45))';

export function SiteBanner({
    title,
    text,
    image,
}: {
    readonly title: string;
    readonly text?: string;
    readonly image?: string;
}) {
    return (
        <section className="wb-hero" style={image ? { backgroundImage: `${BANNER_SHADE}, url("${image}")` } : undefined}>
            <h1>{title}</h1>
            {text && <p>{text}</p>}
        </section>
    );
}

export function WitwSiteFrame({
    user,
    partner,
    children,
}: {
    readonly user: AuthUser | null;
    readonly partner: SitePartner | null;
    readonly children: ReactNode;
}) {
    const t = useT();
    const router = useRouter();
    const pathname = usePathname();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const section = sectionOf(pathname);
    const onAuthPage = section === NavSection.NONE;
    const viewer: WishlistViewer = !user ? 'guest' : partner ? 'partner' : 'user';

    return (
        <MyPhotoProvider userId={user?.id ?? null}>
            <WishlistProvider viewer={viewer}>
                <ChatProvider enabled={viewer === 'user'}>
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
                                    onAuthPage && item.section !== NavSection.SHARED ? (
                                        <a key={item.label} className="is-off">
                                            <img src={item.icon} alt="" />
                                            {t(item.label)}
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.label}
                                            className={item.section === section ? 'is-on' : undefined}
                                            aria-current={item.section === section ? 'page' : undefined}
                                            href={item.href}
                                        >
                                            <img src={item.icon} alt="" />
                                            {t(item.label)}
                                        </Link>
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
                                        <AccountMenu user={user} partner={partner} onChangePassword={() => setChangePasswordOpen(true)} />
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
                </ChatProvider>
            </WishlistProvider>
        </MyPhotoProvider>
    );
}
