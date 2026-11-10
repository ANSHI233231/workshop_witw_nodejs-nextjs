'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    type HostOption,
    SAFARI_STATUS_FILTERS,
    type SafariFilters,
    SHARED_SAFARI_LIMITS,
} from '@/types/shared-safari.types';

import { HostFilter } from './host-filter';
import { FiltersIcon } from './shared-safari-icons';
import { SHARED_SAFARIS_PATH, safariListUrl } from './shared-safari-url';

type SelectFilters = Pick<SafariFilters, 'status' | 'hostId'>;

function StatusSelect({
    filters,
    className,
    onChange,
}: {
    readonly filters: SelectFilters;
    readonly className: string;
    readonly onChange: (next: SelectFilters) => void;
}) {
    const t = useT();
    return (
        <select
            className={className}
            aria-label={t('Status')}
            value={filters.status ?? ''}
            onChange={(event) =>
                onChange({
                    ...filters,
                    status: SAFARI_STATUS_FILTERS.find((option) => String(option.value) === event.target.value)?.value,
                })
            }
        >
            <option value="">{t('Status: All')}</option>
            {SAFARI_STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                    {t(option.label)}
                </option>
            ))}
        </select>
    );
}

export function SafariFilterBar({
    filters,
    hosts,
}: {
    readonly filters: SafariFilters;
    readonly hosts: readonly HostOption[];
}) {
    const t = useT();
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(safariListUrl({ ...filters, search, page: 1 })),
    );
    const filtered =
        text.trim() !== '' || filters.search !== '' || filters.status !== undefined || filters.hostId !== undefined;
    const choose = (next: SelectFilters) => router.push(safariListUrl({ ...next, search: text.trim(), page: 1 }));

    return (
        <div className="filter-bar">
            <div className="ssc-tools">
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Title or park')}
                        aria-label={t('Search by title or park')}
                        maxLength={SHARED_SAFARI_LIMITS.SEARCH}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                    />
                </div>
                <div className="ssc-only-mobile">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowFilters(true)}>
                        <FiltersIcon />
                        {t('Filters')}
                    </button>
                </div>
            </div>
            <StatusSelect filters={filters} className="select fw-sm ssc-only-desktop" onChange={choose} />
            <div className="ssc-only-desktop">
                <HostFilter
                    hosts={hosts}
                    hostId={filters.hostId}
                    onChange={(hostId) => choose({ ...filters, hostId })}
                />
            </div>
            {filtered && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        router.push(SHARED_SAFARIS_PATH);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
            {showFilters && (
                <div className="overlay" onClick={() => setShowFilters(false)}>
                    <div
                        className="modal "
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="flt-t"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-head">
                            <h2 className="modal-title" id="flt-t">
                                {t('Filters')}
                            </h2>
                            <button
                                type="button"
                                className="btn-icon"
                                aria-label={t('Close')}
                                onClick={() => setShowFilters(false)}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="ss-stack-lg">
                                <div className="field">
                                    <span className="label">{t('Status')}</span>
                                    <StatusSelect filters={filters} className="select " onChange={choose} />
                                </div>
                                <div className="field">
                                    <span className="label">{t('Host')}</span>
                                    <HostFilter
                                        hosts={hosts}
                                        hostId={filters.hostId}
                                        onChange={(hostId) => choose({ ...filters, hostId })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
