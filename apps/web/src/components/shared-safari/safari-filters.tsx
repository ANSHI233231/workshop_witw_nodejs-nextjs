'use client';

import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { MONTH_NAMES, rupees } from '@/lib/shared-safari-format';
import {
    type ParkOption,
    SAFARI_LIMITS,
    type SafariFilters,
    STAY_OPTIONS,
    THEME_OPTIONS,
} from '@/types/shared-safari.types';

export const NO_FILTERS: SafariFilters = {
    parkId: '',
    month: '',
    priceFrom: SAFARI_LIMITS.BUDGET_MIN,
    priceTo: SAFARI_LIMITS.BUDGET_MAX,
    safarisFrom: SAFARI_LIMITS.SAFARIS_MIN,
    safarisTo: SAFARI_LIMITS.SAFARIS_MAX,
    themes: [],
    stays: [],
};

const monthValue = (index: number): string => String(index + 1).padStart(2, '0');

const priceToText = (value: number): string =>
    value >= SAFARI_LIMITS.BUDGET_MAX ? `${rupees(SAFARI_LIMITS.BUDGET_MAX)}+` : rupees(value);

const safarisText = (from: number, to: number, t: Translate): string => {
    if (to >= SAFARI_LIMITS.SAFARIS_MAX) return t('{n}+ safaris', { n: from });
    if (from === to) return from === 1 ? t('{n} safari', { n: from }) : t('{n} safaris', { n: from });
    return t('{from}–{to} safaris', { from, to });
};

export type FilterChip = { readonly key: string; readonly label: string; readonly cleared: SafariFilters };

export const chipsOf = (
    filters: SafariFilters,
    parks: readonly ParkOption[],
    t: Translate,
): readonly FilterChip[] => {
    const chips: FilterChip[] = [];
    if (filters.parkId) {
        const park = parks.find((item) => String(item.id) === filters.parkId);
        chips.push({ key: 'park', label: park?.name ?? '', cleared: { ...filters, parkId: '' } });
    }
    if (filters.month) {
        chips.push({
            key: 'month',
            label: t(MONTH_NAMES[Number(filters.month) - 1] ?? ''),
            cleared: { ...filters, month: '' },
        });
    }
    if (filters.priceFrom > SAFARI_LIMITS.BUDGET_MIN || filters.priceTo < SAFARI_LIMITS.BUDGET_MAX) {
        chips.push({
            key: 'price',
            label: `${rupees(filters.priceFrom)} – ${priceToText(filters.priceTo)}`,
            cleared: { ...filters, priceFrom: SAFARI_LIMITS.BUDGET_MIN, priceTo: SAFARI_LIMITS.BUDGET_MAX },
        });
    }
    if (filters.safarisFrom > SAFARI_LIMITS.SAFARIS_MIN || filters.safarisTo < SAFARI_LIMITS.SAFARIS_MAX) {
        chips.push({
            key: 'safaris',
            label: safarisText(filters.safarisFrom, filters.safarisTo, t),
            cleared: { ...filters, safarisFrom: SAFARI_LIMITS.SAFARIS_MIN, safarisTo: SAFARI_LIMITS.SAFARIS_MAX },
        });
    }
    for (const option of THEME_OPTIONS) {
        if (filters.themes.includes(option.value)) {
            chips.push({
                key: `theme-${option.value}`,
                label: t(option.label),
                cleared: { ...filters, themes: filters.themes.filter((value) => value !== option.value) },
            });
        }
    }
    for (const option of STAY_OPTIONS) {
        if (filters.stays.includes(option.value)) {
            chips.push({
                key: `stay-${option.value}`,
                label: t(option.label),
                cleared: { ...filters, stays: filters.stays.filter((value) => value !== option.value) },
            });
        }
    }
    return chips;
};

const toggled = (list: readonly number[], value: number): readonly number[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export function SafariFilterFields({
    idPrefix,
    filters,
    parks,
    onChange,
}: {
    readonly idPrefix: string;
    readonly filters: SafariFilters;
    readonly parks: readonly ParkOption[];
    readonly onChange: (filters: SafariFilters) => void;
}) {
    const t = useT();
    const step = SAFARI_LIMITS.BUDGET_STEP;
    return (
        <>
            <div className="field">
                <label className="label" htmlFor={`${idPrefix}-park`}>
                    {t('Safari Park')}
                </label>
                <select
                    id={`${idPrefix}-park`}
                    className="select"
                    value={filters.parkId}
                    onChange={(event) => onChange({ ...filters, parkId: event.target.value })}
                >
                    <option value="">{t('Any / All')}</option>
                    {parks.map((park) => (
                        <option key={park.id} value={String(park.id)}>
                            {park.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="field">
                <label className="label" htmlFor={`${idPrefix}-month`}>
                    {t('Month')}
                </label>
                <select
                    id={`${idPrefix}-month`}
                    className="select"
                    value={filters.month}
                    onChange={(event) => onChange({ ...filters, month: event.target.value })}
                >
                    <option value="">{t('Any / All')}</option>
                    {MONTH_NAMES.map((name, index) => (
                        <option key={name} value={monthValue(index)}>
                            {t(name)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="field">
                <span className="label">{t('Budget Price Per Person')}</span>
                <div className="wb-range">
                    <input
                        type="range"
                        min={SAFARI_LIMITS.BUDGET_MIN}
                        max={SAFARI_LIMITS.BUDGET_MAX}
                        step={step}
                        aria-label={t('Lowest price per person')}
                        value={filters.priceFrom}
                        onChange={(event) =>
                            onChange({ ...filters, priceFrom: Math.min(Number(event.target.value), filters.priceTo - step) })
                        }
                    />
                    <input
                        type="range"
                        min={SAFARI_LIMITS.BUDGET_MIN}
                        max={SAFARI_LIMITS.BUDGET_MAX}
                        step={step}
                        aria-label={t('Highest price per person')}
                        value={filters.priceTo}
                        onChange={(event) =>
                            onChange({ ...filters, priceTo: Math.max(Number(event.target.value), filters.priceFrom + step) })
                        }
                    />
                </div>
                <div className="wb-range-v">
                    <span>{rupees(filters.priceFrom)}</span>
                    <span>{priceToText(filters.priceTo)}</span>
                </div>
            </div>
            <div className="field">
                <span className="label">{t('Total Safaris')}</span>
                <div className="wb-range">
                    <input
                        type="range"
                        min={SAFARI_LIMITS.SAFARIS_MIN}
                        max={SAFARI_LIMITS.SAFARIS_MAX}
                        step={1}
                        aria-label={t('Fewest safaris')}
                        value={filters.safarisFrom}
                        onChange={(event) =>
                            onChange({ ...filters, safarisFrom: Math.min(Number(event.target.value), filters.safarisTo) })
                        }
                    />
                    <input
                        type="range"
                        min={SAFARI_LIMITS.SAFARIS_MIN}
                        max={SAFARI_LIMITS.SAFARIS_MAX}
                        step={1}
                        aria-label={t('Most safaris')}
                        value={filters.safarisTo}
                        onChange={(event) =>
                            onChange({ ...filters, safarisTo: Math.max(Number(event.target.value), filters.safarisFrom) })
                        }
                    />
                </div>
                <div className="wb-range-v">
                    <span>{filters.safarisFrom}</span>
                    <span>
                        {filters.safarisTo >= SAFARI_LIMITS.SAFARIS_MAX
                            ? `${SAFARI_LIMITS.SAFARIS_MAX}+`
                            : filters.safarisTo}
                    </span>
                </div>
            </div>
            <div className="field">
                <span className="label">{t('Theme')}</span>
                <div className="ss-checks">
                    {THEME_OPTIONS.map((option) => (
                        <label key={option.value} className="check">
                            <input
                                type="checkbox"
                                checked={filters.themes.includes(option.value)}
                                onChange={() => onChange({ ...filters, themes: toggled(filters.themes, option.value) })}
                            />
                            {t(option.label)}
                        </label>
                    ))}
                </div>
            </div>
            <div className="field">
                <span className="label">{t('Stay Category')}</span>
                <div className="ss-checks">
                    {STAY_OPTIONS.map((option) => (
                        <label key={option.value} className="check">
                            <input
                                type="checkbox"
                                checked={filters.stays.includes(option.value)}
                                onChange={() => onChange({ ...filters, stays: toggled(filters.stays, option.value) })}
                            />
                            {t(option.label)}
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
}
