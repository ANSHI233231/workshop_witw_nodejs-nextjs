'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    PARK_LIMITS,
    PARK_REGION_LABEL,
    PARK_REGIONS,
    type ParkFilters,
    ParkStatus,
} from '@/types/park.types';

import { FiltersIcon } from './park-icons';
import { PARKS_PATH, parkUrl } from './park-url';

const STATUS_OPTIONS = [
    { value: ParkStatus.ACTIVE, label: 'Active' },
    { value: ParkStatus.INACTIVE, label: 'Inactive' },
] as const;

type SelectFilters = Pick<ParkFilters, 'region' | 'status'>;

type SelectProps = {
    readonly filters: SelectFilters;
    readonly className: string;
    readonly onChange: (next: SelectFilters) => void;
};

function RegionSelect({ filters, className, onChange }: SelectProps) {
    const t = useT();
    return (
        <select
            className={className}
            aria-label={t('Region')}
            value={filters.region ?? ''}
            onChange={(event) =>
                onChange({ ...filters, region: PARK_REGIONS.find((code) => String(code) === event.target.value) })
            }
        >
            <option value="">{t('Region: All')}</option>
            {PARK_REGIONS.map((code) => (
                <option key={code} value={code}>
                    {t(PARK_REGION_LABEL[code])}
                </option>
            ))}
        </select>
    );
}

function StatusSelect({ filters, className, onChange }: SelectProps) {
    const t = useT();
    return (
        <select
            className={className}
            aria-label={t('Status')}
            value={filters.status ?? ''}
            onChange={(event) =>
                onChange({
                    ...filters,
                    status: STATUS_OPTIONS.find((option) => String(option.value) === event.target.value)?.value,
                })
            }
        >
            <option value="">{t('Status: All')}</option>
            {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {t(option.label)}
                </option>
            ))}
        </select>
    );
}

export function ParkFilterBar({ filters }: { readonly filters: ParkFilters }) {
    const t = useT();
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(parkUrl({ ...filters, search, page: 1 })),
    );
    const filtered =
        text.trim() !== '' || filters.search !== '' || filters.region !== undefined || filters.status !== undefined;
    const choose = (next: SelectFilters) => router.push(parkUrl({ ...next, search: text.trim(), page: 1 }));

    return (
        <div className="filter-bar">
            <div className="ssc-tools">
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Park name')}
                        aria-label={t('Search by park name')}
                        maxLength={PARK_LIMITS.SEARCH}
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
            <RegionSelect filters={filters} className="select fw-sm ssc-only-desktop" onChange={choose} />
            <StatusSelect filters={filters} className="select fw-sm ssc-only-desktop" onChange={choose} />
            {filtered && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        router.push(PARKS_PATH);
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
                                    <span className="label">{t('Region')}</span>
                                    <RegionSelect filters={filters} className="select " onChange={choose} />
                                </div>
                                <div className="field">
                                    <span className="label">{t('Status')}</span>
                                    <StatusSelect filters={filters} className="select " onChange={choose} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
