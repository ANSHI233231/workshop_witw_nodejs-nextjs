'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BackToTop } from '@/components/shared-safari/back-to-top';
import { SearchIcon } from '@/components/shared-safari/safari-icons';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useLoadMoreOnScroll } from '@/hooks/list/use-load-more-on-scroll';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import { listParks } from '@/services/park.service';
import {
    PARK_LIMITS,
    PARK_REGION_LABEL,
    PARK_REGIONS,
    PARK_SORT_OPTIONS,
    type ParkCard as ParkCardValue,
    type ParkFilters,
    type ParkSort,
} from '@/types/park.types';

import { ParkCard } from './park-card';

const log = logger.category('parks');

const FILTER_DELAY_MS = 250;

const SKELETONS = [1, 2, 3, 4, 5, 6];

const MORE_SKELETONS = [1, 2, 3];

const NO_PARK_FILTERS: ParkFilters = { search: '', region: '', sort: 'az' };

type ListState = { readonly items: readonly ParkCardValue[]; readonly total: number; readonly page: number };

function SkeletonCard() {
    return (
        <div className="pk-card pk5-card" aria-hidden="true">
            <div className="pk-img"></div>
            <div className="pk-body">
                <div className="skeleton" style={{ width: '70%', height: 16 }}></div>
                <div className="skeleton" style={{ width: '40%' }}></div>
                <div className="skeleton" style={{ width: '60%' }}></div>
            </div>
        </div>
    );
}

export function ParkList() {
    const t = useT();
    const { toast, showError, hide } = useSiteToast();
    const [filters, setFilters] = useState<ParkFilters>(NO_PARK_FILTERS);
    const [list, setList] = useState<ListState | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadingMoreRef = useRef(false);
    const listGenerationRef = useRef(0);

    useEffect(() => {
        listGenerationRef.current += 1;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            listParks(filters, 1, controller.signal)
                .then(setList)
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    log.error('Parks could not be loaded.', { error });
                    showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
                });
        }, FILTER_DELAY_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [filters, showError, t]);

    const loadMore = useCallback(async () => {
        if (!list || loadingMoreRef.current || list.items.length >= list.total) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        const generation = listGenerationRef.current;
        try {
            const next = await listParks(filters, list.page + 1);
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
            log.error('More parks could not be loaded.', { error });
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [list, filters]);

    useLoadMoreOnScroll(() => void loadMore());

    const loading = list === null;
    const none = list !== null && list.items.length === 0;
    const hasMore = list !== null && list.items.length < list.total && !loadingMore;

    return (
        <div className="wb1-main">
            <div className="wb-tools">
                <div className="wb-tools-r">
                    <div className="input-group">
                        <SearchIcon />
                        <input
                            className="input"
                            placeholder={t('Search by park name')}
                            aria-label={t('Search by park name')}
                            maxLength={PARK_LIMITS.SEARCH}
                            value={filters.search}
                            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                        />
                    </div>
                    <select
                        className="select"
                        aria-label={t('Region')}
                        value={filters.region}
                        onChange={(event) => setFilters({ ...filters, region: event.target.value })}
                    >
                        <option value="">{t('Region: All')}</option>
                        {PARK_REGIONS.map((code) => (
                            <option key={code} value={code}>
                                {t(PARK_REGION_LABEL[code])}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select"
                        aria-label={t('Sort by')}
                        value={filters.sort}
                        onChange={(event) => setFilters({ ...filters, sort: event.target.value as ParkSort })}
                    >
                        {PARK_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {loading && (
                <div className="pk-grid">
                    {SKELETONS.map((key) => (
                        <SkeletonCard key={key} />
                    ))}
                </div>
            )}
            {list !== null && list.items.length > 0 && (
                <>
                    <div className="pk-grid">
                        {list.items.map((park) => (
                            <ParkCard key={park.id} park={park} />
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
            {none && (
                <div className="card">
                    <div className="state">
                        <SearchIcon className="icon state-icon" />
                        <p className="state-title">{t('No parks match your search.')}</p>
                        <button type="button" className="btn btn-secondary" onClick={() => setFilters(NO_PARK_FILTERS)}>
                            {t('Clear filters')}
                        </button>
                    </div>
                </div>
            )}
            <SiteToast toast={toast} onClose={hide} />
            <BackToTop />
        </div>
    );
}
