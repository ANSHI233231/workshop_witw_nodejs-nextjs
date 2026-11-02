'use client';

import { NotificationFeedBell } from '@/components/notification-feed/notification-feed-bell';
import { useLanguages } from '@/hooks/i18n/use-languages';
import { useT } from '@/hooks/i18n/use-t';
import type { Locale } from '@/lib/i18n/locale';
import type { AuthUser } from '@/types/auth.types';

import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from './portal-notifications';

export type ConsoleLanguage = Locale;

const initialsOf = (name: string): string =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');

export function ConsoleHeader({
    user,
    roleLabel,
    language,
    userMenuOpen,
    navOpen,
    onToggleNav,
    onLanguageChange,
    onToggleUserMenu,
    withNav = true,
}: {
    readonly user: AuthUser;
    readonly roleLabel: string;
    readonly language: ConsoleLanguage;
    readonly userMenuOpen: boolean;
    readonly navOpen: boolean;
    readonly onToggleNav: () => void;
    readonly onLanguageChange: (language: ConsoleLanguage) => void;
    readonly onToggleUserMenu: () => void;
    readonly withNav?: boolean;
}) {
    const t = useT();
    const { languages } = useLanguages();
    return (
        <header className="app-header">
            {' '}
            <div className="brand">
                {withNav && (
                    <button
                        type="button"
                        className="btn-icon nav-toggle"
                        aria-label={t('Menu')}
                        data-tooltip={t('Menu')}
                        aria-expanded={navOpen}
                        onClick={onToggleNav}
                    >
                        <svg
                            className="icon "
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 5h16"></path> <path d="M4 12h16"></path> <path d="M4 19h16"></path>
                        </svg>
                    </button>
                )}
                <span className="wordmark-mark">
                    <svg
                        className="icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>{' '}
                        <path d="m9 12 2 2 4-4"></path>
                    </svg>
                </span>
                <span className="wordmark">{t('Portal')}</span>
                {roleLabel && <span className="role-chip">{roleLabel}</span>}
            </div>{' '}
            <div className="header-actions">
                {' '}
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
                </div>{' '}
                <NotificationFeedBell owner={null} feedPath={PORTAL_NOTIFICATIONS_PATH} links={PORTAL_NOTIFICATION_LINKS} />{' '}
                <button
                    type="button"
                    className={`user-menu${userMenuOpen ? ' is-open' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                    onClick={onToggleUserMenu}
                >
                    <span className="avatar">
                        {initialsOf(user.name)}
                    </span>
                    {user.name}
                    <svg
                        className="icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>{' '}
            </div>{' '}
        </header>
    );
}
