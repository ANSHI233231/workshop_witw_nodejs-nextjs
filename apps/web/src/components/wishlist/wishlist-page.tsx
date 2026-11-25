'use client';

import { useCallback, useEffect, useState } from 'react';

import { PackageCard } from '@/components/package/package-card';
import { SafariCard } from '@/components/shared-safari/safari-card';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { usePagedList } from '@/hooks/list/use-paged-list';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import { listWishlistPackages, listWishlistSafaris } from '@/services/wishlist.service';
import { SafariStatus } from '@/types/shared-safari.types';

import { WISHLIST_CHANGED } from './wishlist-provider';

const log = logger.category('wishlist');

type Tab = 'packages' | 'safaris';

const todayText = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

function HeartStateIcon() {
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
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
    );
}

function EmptyState({ text }: { readonly text: string }) {
    return (
        <div className="card">
            <div className="state">
                <HeartStateIcon />
                <p className="state-title">{text}</p>
            </div>
        </div>
    );
}

export function WishlistPage() {
    const t = useT();
    const { toast, show, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<Tab>('packages');

    const failed = useCallback(
        (error: unknown) => {
            log.error('The wishlist could not be loaded.', { error });
            showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        },
        [showError, t],
    );

    const packages = usePagedList(listWishlistPackages, tab === 'packages', failed);
    const safaris = usePagedList(listWishlistSafaris, tab === 'safaris', failed);
    const refreshPackages = packages.refresh;

    useEffect(() => {
        const follow = () => void refreshPackages();
        window.addEventListener(WISHLIST_CHANGED, follow);
        return () => window.removeEventListener(WISHLIST_CHANGED, follow);
    }, [refreshPackages]);

    const list = tab === 'packages' ? packages : safaris;
    const today = todayText();

    return (
        <div className="page">
            <div className="ss-stack-lg">
                <div className="nt-tabs pk2-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'packages'}
                        className={cn('nt-tab', tab === 'packages' && 'is-on')}
                        onClick={() => setTab('packages')}
                    >
                        {t('Packages')}
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
                {tab === 'packages' && packages.items.length > 0 && (
                    <div className="pk-grid">
                        {packages.items.map((card) => (
                            <PackageCard key={card.id} card={card} />
                        ))}
                    </div>
                )}
                {tab === 'packages' && packages.loaded && packages.items.length === 0 && (
                    <EmptyState text={t('No Packages available')} />
                )}
                {tab === 'safaris' && safaris.items.length > 0 && (
                    <div className="wb-grid">
                        {safaris.items.map((card) => (
                            <SafariCard
                                key={card.id}
                                card={card}
                                viewOnly={
                                    (card.status !== SafariStatus.ACTIVE && card.status !== SafariStatus.SEAT_FULL) ||
                                    card.endDate < today
                                }
                                onChanged={(next) => safaris.update({ ...card, ...next })}
                                onMessage={show}
                                onError={showError}
                            />
                        ))}
                    </div>
                )}
                {tab === 'safaris' && safaris.loaded && safaris.items.length === 0 && (
                    <EmptyState text={t('No Shared Safaris available')} />
                )}
                {list.hasMore && (
                    <div className="wl-more">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={list.loadingMore}
                            onClick={() => void list.loadMore()}
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
