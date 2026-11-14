'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { PackageBrowser } from '@/components/package/package-browser';
import { ExternalIcon } from '@/components/package/package-icons';
import { BackToTop } from '@/components/shared-safari/back-to-top';
import { SafariCard } from '@/components/shared-safari/safari-card';
import { NO_FILTERS } from '@/components/shared-safari/safari-filters';
import { BinocularsStateIcon, MapPinIcon } from '@/components/shared-safari/safari-icons';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useLoadMoreOnScroll } from '@/hooks/list/use-load-more-on-scroll';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { logger } from '@/lib/logger';
import { listSafaris } from '@/services/shared-safari.service';
import type { ParkPageData } from '@/types/park.types';
import type { SafariCard as SafariCardValue } from '@/types/shared-safari.types';

import { ParkMap } from './park-map';
import { PARK_TABS, type ParkTab } from './park-tabs';

const log = logger.category('parks');

const TAB_LABEL: Readonly<Record<ParkTab, string>> = {
    overview: 'Overview',
    packages: 'Packages',
    safaris: 'Shared Safaris',
};

const WEB_ADDRESS = /^https?:/;

type SafariState = { readonly items: readonly SafariCardValue[]; readonly total: number; readonly page: number };

const addressText = (address: string): string => address.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function ParkView({ park, initialTab }: { readonly park: ParkPageData; readonly initialTab: ParkTab }) {
    const t = useT();
    const { toast, show, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<ParkTab>(initialTab);
    const [packageTotal, setPackageTotal] = useState(park.packageCount);
    const [safaris, setSafaris] = useState<SafariState | null>(null);
    const loadingMoreRef = useRef(false);
    const hasLocation = park.latitude !== null && park.longitude !== null;
    const website = park.officialWebsite && WEB_ADDRESS.test(park.officialWebsite) ? park.officialWebsite : null;

    useEffect(() => {
        let current = true;
        listSafaris({ ...NO_FILTERS, parkId: String(park.id) }, 'newest', 1)
            .then((page) => {
                if (current) setSafaris({ items: page.items, total: page.total, page: 1 });
            })
            .catch((error: unknown) => log.error('The park safaris could not be loaded.', { error }));
        return () => {
            current = false;
        };
    }, [park.id]);

    const loadMore = useCallback(async () => {
        if (tab !== 'safaris' || !safaris || loadingMoreRef.current || safaris.items.length >= safaris.total) return;
        loadingMoreRef.current = true;
        try {
            const next = await listSafaris({ ...NO_FILTERS, parkId: String(park.id) }, 'newest', safaris.page + 1);
            setSafaris((previous) =>
                previous
                    ? {
                          items: [
                              ...previous.items,
                              ...next.items.filter((item) => !previous.items.some((shown) => shown.id === item.id)),
                          ],
                          total: next.total,
                          page: previous.page + 1,
                      }
                    : previous,
            );
        } catch (error) {
            log.error('More park safaris could not be loaded.', { error });
        } finally {
            loadingMoreRef.current = false;
        }
    }, [tab, safaris, park.id]);

    useLoadMoreOnScroll(() => void loadMore());

    const choose = (key: ParkTab) => {
        setTab(key);
        const url = new URL(window.location.href);
        if (key === 'overview') url.searchParams.delete('tab');
        else url.searchParams.set('tab', key);
        window.history.replaceState(null, '', url);
    };

    const replaceCard = (card: SafariCardValue) =>
        setSafaris((previous) =>
            previous
                ? { ...previous, items: previous.items.map((item) => (item.id === card.id ? card : item)) }
                : previous,
        );

    const counts: Readonly<Record<ParkTab, number | null>> = {
        overview: null,
        packages: packageTotal,
        safaris: safaris?.total ?? null,
    };

    return (
        <div className="ss-stack-lg">
            <div className="nt-tabs pk2-tabs" role="tablist">
                {PARK_TABS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        className={cn('nt-tab', tab === key && 'is-on')}
                        onClick={() => choose(key)}
                    >
                        {t(TAB_LABEL[key])}
                        <span>{counts[key]}</span>
                    </button>
                ))}
            </div>
            {tab === 'overview' && (
                <div className="pk2-sec">
                    <div className="pk2-sec-h">{t('About {name}', { name: park.name })}</div>
                    <div className="pk2-sec-b">
                        <p className="pk2-text">{park.shortDescription || t('No description yet.')}</p>
                        {hasLocation ? (
                            <ParkMap name={park.name} latitude={park.latitude ?? 0} longitude={park.longitude ?? 0} />
                        ) : (
                            <p className="ss-cap">{t("The park's location isn't set yet.")}</p>
                        )}
                        <div className="pk6-facts">
                            <div className="pk6-fact">
                                <span className="pk6-fi">
                                    <MapPinIcon />
                                </span>
                                <div>
                                    <div className="pk6-fl">{t('Location')}</div>
                                    <div className="pk6-fv">
                                        {hasLocation
                                            ? `${(park.latitude ?? 0).toFixed(4)}, ${(park.longitude ?? 0).toFixed(4)}`
                                            : t('Not set')}
                                    </div>
                                </div>
                            </div>
                            {website && (
                                <div className="pk6-fact">
                                    <span className="pk6-fi">
                                        <ExternalIcon />
                                    </span>
                                    <div>
                                        <div className="pk6-fl">{t('Official website')}</div>
                                        <a className="pk6-a pk6-url" href={website} target="_blank" rel="noopener">
                                            {addressText(website)}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {tab === 'packages' && <PackageBrowser parkId={park.id} onTotal={setPackageTotal} />}
            {tab === 'safaris' && (
                <>
                    {safaris && safaris.items.length > 0 && (
                        <div className="wb-grid">
                            {safaris.items.map((card) => (
                                <SafariCard
                                    key={card.id}
                                    card={card}
                                    onChanged={replaceCard}
                                    onMessage={show}
                                    onError={showError}
                                />
                            ))}
                        </div>
                    )}
                    {safaris && safaris.items.length === 0 && (
                        <div className="card">
                            <div className="state">
                                <BinocularsStateIcon className="icon state-icon" />
                                <p className="state-title">{t('No shared safaris in this park.')}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
            <SiteToast toast={toast} onClose={hide} />
            <BackToTop />
        </div>
    );
}
