'use client';

import { useCallback, useState } from 'react';

import { PackageCard } from '@/components/package/package-card';
import { ParkCard } from '@/components/park/park-card';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { usePagedList } from '@/hooks/list/use-paged-list';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { logger } from '@/lib/logger';
import { partnerLogoUrl } from '@/services/partner.service';
import { ApiError } from '@/services/api-error';
import { listPartnerPackages, listPartnerParks } from '@/services/profile.service';
import type { PartnerProfile } from '@/types/profile.types';

const log = logger.category('profile');

type Tab = 'packages' | 'parks';

function EmptyState({ text }: { readonly text: string }) {
    return (
        <div className="card">
            <div className="state">
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
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                    <path d="M12 22V12"></path>
                    <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
                    <path d="m7.5 4.27 9 5.15"></path>
                </svg>
                <p className="state-title">{text}</p>
            </div>
        </div>
    );
}

export function PartnerProfileView({ partner }: { readonly partner: PartnerProfile }) {
    const t = useT();
    const { toast, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<Tab>('packages');

    const failed = useCallback(
        (error: unknown) => {
            log.error('The partner profile could not be loaded.', { error });
            showError(error instanceof ApiError ? t(error.message) : t('This could not be done. Please try again.'));
        },
        [showError, t],
    );

    const loadPackages = useCallback((page: number) => listPartnerPackages(partner.id, page), [partner.id]);
    const loadParks = useCallback((page: number) => listPartnerParks(partner.id, page), [partner.id]);
    const packages = usePagedList(loadPackages, tab === 'packages', failed);
    const parks = usePagedList(loadParks, tab === 'parks', failed);
    const list = tab === 'packages' ? packages : parks;

    const initials =
        partner.businessName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() ?? '')
            .join('') || '?';

    return (
        <div className="page">
            <div className="ss-stack-lg">
                <section className="card pf-head">
                    <span className="pf-logo">
                        {partner.logoVersion ? (
                            <img
                                src={partnerLogoUrl(partner.id, partner.logoVersion)}
                                alt={t('Logo of {name}', { name: partner.businessName })}
                            />
                        ) : (
                            initials
                        )}
                    </span>
                    <div className="pf-info">
                        <h2 className="pf-name">{partner.businessName}</h2>
                        <p className="pf-about">{partner.about}</p>
                    </div>
                    <div className="pf-tiles">
                        <button
                            type="button"
                            className={cn('pf-tile', tab === 'packages' && 'is-on')}
                            onClick={() => setTab('packages')}
                        >
                            <b>{partner.packageCount}</b>
                            <span>{t('Packages')}</span>
                        </button>
                        <button
                            type="button"
                            className={cn('pf-tile', tab === 'parks' && 'is-on')}
                            onClick={() => setTab('parks')}
                        >
                            <b>{partner.parkCount}</b>
                            <span>{t('Parks')}</span>
                        </button>
                    </div>
                </section>
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
                        aria-selected={tab === 'parks'}
                        className={cn('nt-tab', tab === 'parks' && 'is-on')}
                        onClick={() => setTab('parks')}
                    >
                        {t('Parks')}
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
                    <EmptyState text={t('No packages available')} />
                )}
                {tab === 'parks' && parks.items.length > 0 && (
                    <div className="pk-grid">
                        {parks.items.map((park) => (
                            <ParkCard key={park.id} park={park} />
                        ))}
                    </div>
                )}
                {tab === 'parks' && parks.loaded && parks.items.length === 0 && (
                    <EmptyState text={t('No parks available')} />
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
