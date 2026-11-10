'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useIsPhone } from '@/hooks/ui/use-is-phone';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import { listActiveParks, listSafaris } from '@/services/shared-safari.service';
import {
    type ParkOption,
    type SafariCard as SafariCardValue,
    type SafariFilters,
    SORT_OPTIONS,
    type SortValue,
} from '@/types/shared-safari.types';

import { BackToTop } from './back-to-top';
import { OrganiseDialog, type OrganiseResult } from './organise-dialog';
import { SafariCard, safariPath } from './safari-card';
import { chipsOf, NO_FILTERS, SafariFilterFields } from './safari-filters';
import { rememberFlash } from './safari-flash';
import { BinocularsStateIcon, CloseIcon, SearchIcon, SlidersIcon } from './safari-icons';
import { SiteToast } from './site-toast';

const log = logger.category('shared-safari');

const FILTER_DELAY_MS = 250;

const LOAD_MORE_MARGIN_PX = 700;

const SKELETONS = [1, 2, 3, 4, 5, 6];

const MORE_SKELETONS = [1, 2, 3];

function SkeletonCard() {
    return (
        <div className="wb-card" aria-hidden="true">
            <div className="wb-img"></div>
            <div className="wb-strip">&nbsp;</div>
            <div className="wb-body">
                <div className="skeleton" style={{ width: '70%', height: 16 }}></div>
                <div className="skeleton" style={{ width: '50%' }}></div>
                <div className="skeleton" style={{ width: '60%' }}></div>
                <div className="skeleton" style={{ width: '40%' }}></div>
            </div>
        </div>
    );
}

type ListState = {
    readonly items: readonly SafariCardValue[];
    readonly total: number;
    readonly activeTotal: number;
    readonly page: number;
};

export function SafariList({ signedIn }: { readonly signedIn: boolean }) {
    const t = useT();
    const router = useRouter();
    const isPhone = useIsPhone();
    const { toast, show, showError, hide } = useSiteToast();
    const [parks, setParks] = useState<readonly ParkOption[]>([]);
    const [filters, setFilters] = useState<SafariFilters>(NO_FILTERS);
    const [sort, setSort] = useState<SortValue>('newest');
    const [list, setList] = useState<ListState | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [organiseOpen, setOrganiseOpen] = useState(false);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        listActiveParks()
            .then(setParks)
            .catch((error: unknown) => log.error('Active parks could not be loaded.', { error }));
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            listSafaris(filters, sort, 1, controller.signal)
                .then((page) => setList({ items: page.items, total: page.total, activeTotal: page.activeTotal, page: 1 }))
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    log.error('Shared safaris could not be loaded.', { error });
                    showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
                });
        }, FILTER_DELAY_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [filters, sort, showError, t]);

    const loadMore = useCallback(async () => {
        if (!list || loadingMoreRef.current || list.items.length >= list.total) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const next = await listSafaris(filters, sort, list.page + 1);
            setList((current) =>
                current
                    ? {
                          items: [
                              ...current.items,
                              ...next.items.filter((item) => !current.items.some((shown) => shown.id === item.id)),
                          ],
                          total: next.total,
                          activeTotal: next.activeTotal,
                          page: current.page + 1,
                      }
                    : current,
            );
        } catch (error) {
            log.error('More shared safaris could not be loaded.', { error });
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [list, filters, sort]);

    useEffect(() => {
        const check = () => {
            if (window.innerHeight + window.scrollY > document.documentElement.scrollHeight - LOAD_MORE_MARGIN_PX) {
                void loadMore();
            }
        };
        window.addEventListener('scroll', check, { passive: true });
        return () => window.removeEventListener('scroll', check);
    }, [loadMore]);

    const chips = useMemo(() => chipsOf(filters, parks, t), [filters, parks, t]);

    const replaceCard = (card: SafariCardValue) =>
        setList((current) =>
            current ? { ...current, items: current.items.map((item) => (item.id === card.id ? card : item)) } : current,
        );

    const organised = (result: OrganiseResult) => {
        setOrganiseOpen(false);
        rememberFlash(t('Your safari is live.'));
        router.push(safariPath(result.slug));
    };

    const loading = list === null;
    const noneAtAll = list !== null && list.activeTotal === 0;
    const noMatch = list !== null && !noneAtAll && list.total === 0;
    const showCards = list !== null && list.items.length > 0;
    const hasMore = list !== null && list.items.length < list.total && !loadingMore;

    const organiseButton = signedIn && (
        <button type="button" className="btn btn-primary wb-org" onClick={() => setOrganiseOpen(true)}>
            {t('+ Organize a Shared Safari')}
        </button>
    );

    const sortSelect = (
        <select
            className="select"
            aria-label={t('Sort by')}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortValue)}
        >
            {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {t(option.label)}
                </option>
            ))}
        </select>
    );

    const count = list ? (
        <p className="wb-count">
            {t('There are currently')} <b>{list.activeTotal}</b> {t('active shared safaris')}
        </p>
    ) : (
        <p className="wb-count">&nbsp;</p>
    );

    return (
        <div className="wb1">
            {isPhone ? (
                organiseButton
            ) : (
                <aside className="wb-side">
                    {organiseButton}
                    <div className="wb-filters" aria-label={t('Filters')}>
                        <h2>{t('Select Filters')}</h2>
                        <SafariFilterFields idPrefix="f" filters={filters} parks={parks} onChange={setFilters} />
                    </div>
                </aside>
            )}
            <section className="wb1-main" aria-label={t('Shared safaris')}>
                {isPhone ? (
                    <>
                        {count}
                        <div className="wb-tools-r">
                            <button type="button" className="btn btn-secondary" onClick={() => setFiltersOpen(true)}>
                                <SlidersIcon />
                                {t('Filters')}
                                {chips.length > 0 && (
                                    <span className="badge badge-info" style={{ marginLeft: 4 }}>
                                        {chips.length}
                                    </span>
                                )}
                            </button>
                            {sortSelect}
                        </div>
                    </>
                ) : (
                    <div className="wb-tools">
                        {count}
                        <div className="wb-tools-r">{sortSelect}</div>
                    </div>
                )}
                {chips.length > 0 && (
                    <div className="ss-row" aria-label={t('Chosen filters')}>
                        {chips.map((chip) => (
                            <span key={chip.key} className="ss-chip">
                                {chip.label}
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Remove {name}', { name: chip.label })}
                                    onClick={() => setFilters(chip.cleared)}
                                >
                                    <CloseIcon />
                                </button>
                            </span>
                        ))}
                        <button type="button" className="btn btn-text" onClick={() => setFilters(NO_FILTERS)}>
                            {t('Clear all')}
                        </button>
                    </div>
                )}
                {loading && (
                    <div className="wb-grid">
                        {SKELETONS.map((key) => (
                            <SkeletonCard key={key} />
                        ))}
                    </div>
                )}
                {showCards && (
                    <>
                        <div className="wb-grid">
                            {list.items.map((card) => (
                                <SafariCard
                                    key={card.id}
                                    card={card}
                                    onChanged={replaceCard}
                                    onMessage={show}
                                    onError={showError}
                                />
                            ))}
                            {loadingMore && MORE_SKELETONS.map((key) => <SkeletonCard key={key} />)}
                        </div>
                        {hasMore && (
                            <p className="ss1-more">
                                {t('Showing {shown} of {total} · more load as you scroll', {
                                    shown: list.items.length,
                                    total: list.total,
                                })}
                            </p>
                        )}
                    </>
                )}
                {noMatch && (
                    <div className="card">
                        <div className="state">
                            <SearchIcon className="icon state-icon" />
                            <p className="state-title">{t('No shared safaris match your filters.')}</p>
                            <button type="button" className="btn btn-secondary" onClick={() => setFilters(NO_FILTERS)}>
                                {t('Clear filters')}
                            </button>
                        </div>
                    </div>
                )}
                {noneAtAll && (
                    <div className="card">
                        <div className="state">
                            <BinocularsStateIcon className="icon state-icon" />
                            <p className="state-title">{t('No shared safaris yet.')}</p>
                            {signedIn && (
                                <button type="button" className="btn btn-primary" onClick={() => setOrganiseOpen(true)}>
                                    {t('+ Organize a Shared Safari')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
            {isPhone && filtersOpen && (
                <div className="overlay" onClick={() => setFiltersOpen(false)}>
                    <div
                        className="modal "
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="flt-t"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-head">
                            <h2 className="modal-title" id="flt-t">
                                {t('Select Filters')}
                            </h2>
                            <button
                                type="button"
                                className="btn-icon"
                                aria-label={t('Close')}
                                onClick={() => setFiltersOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="ss-stack-lg wb-filters" style={{ padding: 0 }}>
                                <SafariFilterFields idPrefix="mf" filters={filters} parks={parks} onChange={setFilters} />
                            </div>
                        </div>
                        <div className="modal-foot">
                            <button type="button" className="btn btn-text" onClick={() => setFilters(NO_FILTERS)}>
                                {t('Clear all')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {organiseOpen && (
                <OrganiseDialog
                    safariId={null}
                    onClose={() => setOrganiseOpen(false)}
                    onSaved={organised}
                    onError={showError}
                />
            )}
            <SiteToast toast={toast} onClose={hide} />
            <BackToTop />
        </div>
    );
}
