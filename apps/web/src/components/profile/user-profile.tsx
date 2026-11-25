'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { SafariCard } from '@/components/shared-safari/safari-card';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { useT } from '@/hooks/i18n/use-t';
import { usePagedList } from '@/hooks/list/use-paged-list';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { logger } from '@/lib/logger';
import { isWebLink } from '@/lib/profile-rules';
import { ApiError } from '@/services/api-error';
import { listUserSafaris, userCoverPhotoUrl, userPhotoUrl } from '@/services/profile.service';
import type { UserProfileAnswer } from '@/types/profile.types';

type UserView = Extract<UserProfileAnswer, { readonly kind: 'user' }>;

const log = logger.category('profile');

type Tab = 'profile' | 'safaris';

const SOCIAL_LINKS = [
    { key: 'facebookUrl', label: 'Facebook' },
    { key: 'xUrl', label: 'X' },
    { key: 'instagramUrl', label: 'Instagram' },
    { key: 'youtubeUrl', label: 'YouTube' },
] as const;

const NONE = '–';

function LinkIcon() {
    return (
        <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    );
}

function StateIcon() {
    return (
        <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="5"></circle>
            <path d="M20 21a8 8 0 0 0-16 0"></path>
        </svg>
    );
}

const todayText = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function UserProfileView({ view }: { readonly view: UserView }) {
    const t = useT();
    const { toast, show, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<Tab>('profile');
    const signedIn = view.profile !== null;
    const userId = view.user.id;

    const failed = useCallback(
        (error: unknown) => {
            log.error('The safaris could not be loaded.', { error });
            showError(error instanceof ApiError ? t(error.message) : t('This could not be done. Please try again.'));
        },
        [showError, t],
    );

    const loadSafaris = useCallback((page: number) => listUserSafaris(userId, page), [userId]);
    const safaris = usePagedList(loadSafaris, signedIn && tab === 'safaris', failed);
    const today = todayText();

    const picture = view.user.photoVersion ? userPhotoUrl(userId, view.user.photoVersion) : null;
    const cover = view.user.coverPhotoVersion ? userCoverPhotoUrl(userId, view.user.coverPhotoVersion) : null;
    const links = view.profile ? SOCIAL_LINKS.filter((link) => view.profile?.[link.key]) : [];

    return (
        <div className="page">
            <div className="ss-stack-lg">
                <section className="card up-head">
                    <div className="up-cover" style={cover ? { backgroundImage: `url("${cover}")` } : undefined}>
                        {!cover && (
                            <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                <circle cx="9" cy="9" r="2"></circle>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                            </svg>
                        )}
                    </div>
                    <div className="up-bar">
                        <span className="up-pic" style={picture ? { backgroundImage: `url("${picture}")` } : undefined}>
                            {!picture && <StateIcon />}
                        </span>
                        <h2 className="up-name">{view.user.name}</h2>
                        {view.isOwn && (
                            <Link className="btn btn-secondary" href={SITE_PATHS.myProfile}>
                                {t('Edit Profile')}
                            </Link>
                        )}
                        {view.canMessage && (
                            <Link className="btn btn-primary" href={`${SITE_PATHS.messages}?with=${userId}`}>
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
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                {t('Message')}
                            </Link>
                        )}
                    </div>
                </section>
                <div className="nt-tabs pk2-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'profile'}
                        className={cn('nt-tab', tab === 'profile' && 'is-on')}
                        onClick={() => setTab('profile')}
                    >
                        {t('Profile')}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'safaris'}
                        className={cn('nt-tab', tab === 'safaris' && 'is-on')}
                        onClick={() => setTab('safaris')}
                    >
                        {t('Shared Safaris')}
                    </button>
                </div>
                {!signedIn && (
                    <div className="card">
                        <div className="state">
                            <StateIcon />
                            <p className="state-title">{t('Please sign in to view the full profile.')}</p>
                            <Link
                                className="btn btn-primary"
                                href={`${SITE_PATHS.signIn}?next=${encodeURIComponent(`/users/${userId}`)}`}
                            >
                                {t('Sign in')}
                            </Link>
                        </div>
                    </div>
                )}
                {view.profile && tab === 'profile' && (
                    <section className="card up-sec">
                        <h3>{t('Bio')}</h3>
                        <p>{view.profile.bio || NONE}</p>
                        <h3>{t('About')}</h3>
                        <p>{view.profile.about || NONE}</p>
                        <h3>{t('Social links')}</h3>
                        {links.length > 0 ? (
                            <div className="up-links">
                                {links.map((link) => {
                                    const text = view.profile?.[link.key] ?? '';
                                    return isWebLink(text) ? (
                                        <a key={link.key} href={text} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon />
                                            <span>{t(link.label)}</span>
                                        </a>
                                    ) : (
                                        <span key={link.key} className="up-link-text">
                                            <LinkIcon />
                                            <span>
                                                {t(link.label)}: {text}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="ss-cap">{NONE}</p>
                        )}
                    </section>
                )}
                {signedIn && tab === 'safaris' && safaris.items.length > 0 && (
                    <div className="wb-grid">
                        {safaris.items.map((card) => (
                            <SafariCard
                                key={card.id}
                                card={card}
                                viewOnly={card.endDate < today}
                                onChanged={(next) => safaris.update({ ...card, ...next })}
                                onMessage={show}
                                onError={showError}
                            />
                        ))}
                    </div>
                )}
                {signedIn && tab === 'safaris' && safaris.loaded && safaris.items.length === 0 && (
                    <div className="card">
                        <div className="state">
                            <StateIcon />
                            <p className="state-title">{t('No Shared Safaris available')}</p>
                        </div>
                    </div>
                )}
                {safaris.hasMore && tab === 'safaris' && (
                    <div className="wl-more">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={safaris.loadingMore}
                            onClick={() => void safaris.loadMore()}
                        >
                            {t('Load More')}
                        </button>
                    </div>
                )}
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </div>
    );
}
