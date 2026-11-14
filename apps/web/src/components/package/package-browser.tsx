'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BackToTop } from '@/components/shared-safari/back-to-top';
import { CloseIcon, SearchIcon, SlidersIcon } from '@/components/shared-safari/safari-icons';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useLoadMoreOnScroll } from '@/hooks/list/use-load-more-on-scroll';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useIsPhone } from '@/hooks/ui/use-is-phone';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import { listPackages } from '@/services/package.service';
import { listActiveParks } from '@/services/shared-safari.service';
import {
    PACKAGE_SORT_OPTIONS,
    type PackageCard as PackageCardValue,
    type PackageFilters,
    type PackageSort,
} from '@/types/package.types';
import type { ParkOption } from '@/types/shared-safari.types';

import { PackageCard } from './package-card';
import { chipsOf, NO_PACKAGE_FILTERS, PackageFilterFields } from './package-filters';
import { PackageStateIcon } from './package-icons';

const log = logger.category('packages');

const FILTER_DELAY_MS = 250;

const SKELETONS = [1, 2, 3, 4, 5, 6];

const MORE_SKELETONS = [1, 2, 3];

type ListState = {
    readonly items: readonly PackageCardValue[];
    readonly total: number;
    readonly page: number;
};

function SkeletonCard() {
    return (
        <div className="pk-card" aria-hidden="true">
            <div className="pk-img"></div>
            <div className="pk-body">
                <div className="skeleton" style={{ width: '70%', height: 16 }}></div>
                <div className="skeleton" style={{ width: '50%' }}></div>
                <div className="skeleton" style={{ width: '60%' }}></div>
                <div className="skeleton" style={{ width: '40%' }}></div>
            </div>
        </div>
    );
}

export function PackageBrowser({
    parkId = null,
    onTotal,
}: {
    readonly parkId?: number | null;
    readonly onTotal?: (total: number) => void;
}) {
    const t = useT();
    const isPhone = useIsPhone();
    const { toast, showError, hide } = useSiteToast();
    const fixedPark = parkId !== null;
    const [parks, setParks] = useState<readonly ParkOption[]>([]);
    const [filters, setFilters] = useState<PackageFilters>(NO_PACKAGE_FILTERS);
    const [sort, setSort] = useState<PackageSort>('popular');
    const [list, setList] = useState<ListState | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const loadingMoreRef = useRef(false);
    const listGenerationRef = useRef(0);

    const effective = useMemo<PackageFilters>(
        () => (fixedPark ? { ...filters, parkId: String(parkId) } : filters),
        [filters, fixedPark, parkId],
    );

    useEffect(() => {
        if (fixedPark) return;
        listActiveParks()
            .then(setParks)
            .catch((error: unknown) => log.error('Active parks could not be loaded.', { error }));
    }, [fixedPark]);

    useEffect(() => {
        listGenerationRef.current += 1;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            listPackages(effective, sort, 1, controller.signal)
                .then((page) => {
                    setList({ items: page.items, total: page.total, page: 1 });
                    onTotal?.(page.total);
                })
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    log.error('Packages could not be loaded.', { error });
                    showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
                });
        }, FILTER_DELAY_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [effective, sort, onTotal, showError, t]);

    const loadMore = useCallback(async () => {
        if (!list || loadingMoreRef.current || list.items.length >= list.total) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        const generation = listGenerationRef.current;
        try {
            const next = await listPackages(effective, sort, list.page + 1);
            if (generation !== listGenerationRef.current) return;
            setList((current) =>
                current
                    ? {
                          items: [
                              ...current.items,
                              ...next.items.filter((item) => !current.items.some((shown) => shown.id === item.id)),
                          ],
                          total: next.total,
                          page: current.page + 1,
                      }
                    : current,
            );
        } catch (error) {
            log.error('More packages could not be loaded.', { error });
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [list, effective, sort]);

    useLoadMoreOnScroll(() => void loadMore());

    const chips = useMemo(() => chipsOf(filters, parks, t, !fixedPark), [filters, parks, t, fixedPark]);

    const clearChosen = () => setFilters({ ...NO_PACKAGE_FILTERS, search: filters.search, parkId: filters.parkId });
    const clearEverything = () => setFilters(NO_PACKAGE_FILTERS);

    const anyActive = chips.length > 0 || filters.search.trim() !== '';
    const loading = list === null;
    const noneAtAll = list !== null && list.total === 0 && !anyActive;
    const noMatch = list !== null && list.total === 0 && anyActive;
    const showCards = list !== null && list.items.length > 0;
    const hasMore = list !== null && list.items.length < list.total && !loadingMore;

    const sortSelect = (
        <select
            className="select"
            aria-label={t('Sort by')}
            value={sort}
            onChange={(event) => setSort(event.target.value as PackageSort)}
        >
            {PACKAGE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {t(option.label)}
                </option>
            ))}
        </select>
    );

    const searchBox = (
        <div className="input-group">
            <SearchIcon />
            <input
                className="input"
                placeholder={t('Search by package name')}
                aria-label={t('Search by package name')}
                maxLength={100}
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
        </div>
    );

    return (
        <div className="wb1">
            {!isPhone && (
                <aside className="wb-side">
                    <div className="wb-filters" aria-label={t('Filters')}>
                        <h2>{t('Select Filters')}</h2>
                        <PackageFilterFields
                            idPrefix="f"
                            filters={filters}
                            parks={fixedPark ? null : parks}
                            onChange={setFilters}
                        />
                    </div>
                </aside>
            )}
            <section className="wb1-main" aria-label={t('Packages')}>
                {isPhone ? (
                    <>
                        {!fixedPark && <div className="wb-tools-r">{searchBox}</div>}
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
                        <div className="wb-tools-r">
                            {!fixedPark && searchBox}
                            {sortSelect}
                        </div>
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
                        <button type="button" className="btn btn-text" onClick={clearChosen}>
                            {t('Clear all')}
                        </button>
                    </div>
                )}
                {loading && (
                    <div className="pk-grid">
                        {SKELETONS.map((key) => (
                            <SkeletonCard key={key} />
                        ))}
                    </div>
                )}
                {showCards && (
                    <>
                        <div className="pk-grid">
                            {list.items.map((card) => (
                                <PackageCard key={card.id} card={card} />
                            ))}
                            {loadingMore && MORE_SKELETONS.map((key) => <SkeletonCard key={key} />)}
                        </div>
                        {hasMore && (
                            <p className="pk-more">
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
                            <p className="state-title">{t('No packages match your filters.')}</p>
                            <button type="button" className="btn btn-secondary" onClick={clearEverything}>
                                {t('Clear filters')}
                            </button>
                        </div>
                    </div>
                )}
                {noneAtAll && (
                    <div className="card">
                        <div className="state">
                            <PackageStateIcon className="icon state-icon" />
                            <p className="state-title">{t('No packages here yet.')}</p>
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
                                <PackageFilterFields
                                    idPrefix="mf"
                                    filters={filters}
                                    parks={fixedPark ? null : parks}
                                    onChange={setFilters}
                                />
                            </div>
                        </div>
                        <div className="modal-foot">
                            <button type="button" className="btn btn-text" onClick={clearChosen}>
                                {t('Clear all')}
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => setFiltersOpen(false)}>
                                {t('Show packages')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <SiteToast toast={toast} onClose={hide} />
            <BackToTop />
        </div>
    );
}
