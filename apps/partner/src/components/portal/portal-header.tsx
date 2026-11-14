'use client';

import { NotificationFeedBell } from '@/components/notification-feed/notification-feed-bell';
import { WitwLogo } from '@/components/ui/witw-logo';
import { useT } from '@/hooks/i18n/use-t';

import { ChevronDownIcon, MenuIcon } from './portal-icons';
import type { PortalIdentity } from './portal-identity';
import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from './portal-notifications';

export function PortalHeader({
    identity,
    withNotifications,
    userMenuOpen,
    navOpen,
    onToggleNav,
    onToggleUserMenu,
}: {
    readonly identity: PortalIdentity;
    readonly withNotifications: boolean;
    readonly userMenuOpen: boolean;
    readonly navOpen: boolean;
    readonly onToggleNav: () => void;
    readonly onToggleUserMenu: () => void;
}) {
    const t = useT();
    return (
        <header className="app-header">
            <div className="brand">
                <button
                    type="button"
                    className="btn-icon nav-toggle"
                    aria-label={t('Menu')}
                    data-tooltip={t('Menu')}
                    aria-expanded={navOpen}
                    onClick={onToggleNav}
                >
                    <MenuIcon />
                </button>
                <span className="wordmark-mark">
                    <WitwLogo />
                </span>
                <span className="wordmark">{t('Partner Portal')}</span>
                <span className="role-chip">{t('Partner')}</span>
            </div>
            <div className="header-actions">
                {withNotifications && (
                    <NotificationFeedBell
                        owner={null}
                        feedPath={PORTAL_NOTIFICATIONS_PATH}
                        links={PORTAL_NOTIFICATION_LINKS}
                    />
                )}
                <button
                    type="button"
                    className={`user-menu${userMenuOpen ? ' is-open' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                    onClick={onToggleUserMenu}
                >
                    <span className="avatar">{identity.initials}</span>
                    {identity.name}
                    <ChevronDownIcon />
                </button>
            </div>
        </header>
    );
}
