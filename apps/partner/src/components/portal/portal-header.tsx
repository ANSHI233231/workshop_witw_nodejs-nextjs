'use client';

import { NotificationFeedBell } from '@/components/notification-feed/notification-feed-bell';
import { WitwLogo } from '@/components/ui/witw-logo';
import { useLanguages } from '@/hooks/i18n/use-languages';
import { useT } from '@/hooks/i18n/use-t';
import type { Locale } from '@/lib/i18n/locale';

import { ChevronDownIcon, MenuIcon } from './portal-icons';
import { DEFAULT_LOGO, type PortalIdentity } from './portal-identity';
import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from './portal-notifications';

export function PortalHeader({
    identity,
    withNotifications,
    language,
    userMenuOpen,
    navOpen,
    onToggleNav,
    onLanguageChange,
    onToggleUserMenu,
}: {
    readonly identity: PortalIdentity;
    readonly withNotifications: boolean;
    readonly language: Locale;
    readonly userMenuOpen: boolean;
    readonly navOpen: boolean;
    readonly onToggleNav: () => void;
    readonly onLanguageChange: (language: Locale) => void;
    readonly onToggleUserMenu: () => void;
}) {
    const t = useT();
    const { languages } = useLanguages();
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
                <div className="lang" role="group" aria-label={t('Language')}>
                    {languages.map((option) => (
                        <button
                            key={option.code}
                            type="button"
                            className={`lang-btn${language === option.code ? ' is-on' : ''}`}
                            aria-pressed={language === option.code}
                            aria-label={option.nativeName}
                            onClick={() => onLanguageChange(option.code)}
                            lang={option.code}
                        >
                            {option.shortName}
                        </button>
                    ))}
                </div>
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
                    <span className="avatar">
                        {identity.logoUrl ? (
                            <img
                                className={`avatar-photo${identity.logoUrl === DEFAULT_LOGO ? ' avatar-photo-default' : ''}`}
                                src={identity.logoUrl}
                                alt=""
                            />
                        ) : (
                            identity.initials
                        )}
                    </span>
                    {identity.name}
                    <ChevronDownIcon />
                </button>
            </div>
        </header>
    );
}
