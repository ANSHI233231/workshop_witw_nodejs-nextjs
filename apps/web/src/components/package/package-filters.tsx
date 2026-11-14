'use client';

import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { rupees } from '@/lib/shared-safari-format';
import {
    type CodeOption,
    FEATURE_OPTIONS,
    INCLUSION_OPTIONS,
    labelOf,
    PACKAGE_LIMITS,
    type PackageFilters,
    STAY_OPTIONS,
} from '@/types/package.types';
import type { ParkOption } from '@/types/shared-safari.types';

export const NO_PACKAGE_FILTERS: PackageFilters = {
    search: '',
    parkId: '',
    priceFrom: PACKAGE_LIMITS.PRICE_MIN,
    priceTo: PACKAGE_LIMITS.PRICE_MAX,
    nightsFrom: PACKAGE_LIMITS.NIGHTS_MIN,
    nightsTo: PACKAGE_LIMITS.NIGHTS_MAX,
    safarisFrom: PACKAGE_LIMITS.SAFARIS_MIN,
    safarisTo: PACKAGE_LIMITS.SAFARIS_MAX,
    stays: [],
    features: [],
    inclusions: [],
};

const priceToText = (value: number): string =>
    value >= PACKAGE_LIMITS.PRICE_MAX ? `${rupees(PACKAGE_LIMITS.PRICE_MAX)}+` : rupees(value);

const openEnd = (value: number, max: number): string => (value >= max ? `${max}+` : String(value));

export type PackageChip = { readonly key: string; readonly label: string; readonly cleared: PackageFilters };

type ListKey = 'stays' | 'features' | 'inclusions';

const LIST_OPTIONS: Readonly<Record<ListKey, readonly CodeOption[]>> = {
    stays: STAY_OPTIONS,
    features: FEATURE_OPTIONS,
    inclusions: INCLUSION_OPTIONS,
};

const LIST_KEYS: readonly ListKey[] = ['stays', 'features', 'inclusions'];

export const chipsOf = (
    filters: PackageFilters,
    parks: readonly ParkOption[],
    t: Translate,
    withPark: boolean,
): readonly PackageChip[] => {
    const chips: PackageChip[] = [];
    if (withPark && filters.parkId) {
        const park = parks.find((item) => String(item.id) === filters.parkId);
        chips.push({ key: 'park', label: park?.name ?? '', cleared: { ...filters, parkId: '' } });
    }
    if (filters.priceFrom > PACKAGE_LIMITS.PRICE_MIN || filters.priceTo < PACKAGE_LIMITS.PRICE_MAX) {
        chips.push({
            key: 'price',
            label: t('{from} – {to} per person', { from: rupees(filters.priceFrom), to: priceToText(filters.priceTo) }),
            cleared: { ...filters, priceFrom: PACKAGE_LIMITS.PRICE_MIN, priceTo: PACKAGE_LIMITS.PRICE_MAX },
        });
    }
    if (filters.nightsFrom > PACKAGE_LIMITS.NIGHTS_MIN || filters.nightsTo < PACKAGE_LIMITS.NIGHTS_MAX) {
        chips.push({
            key: 'nights',
            label: t('{from} – {to} nights', {
                from: filters.nightsFrom,
                to: openEnd(filters.nightsTo, PACKAGE_LIMITS.NIGHTS_MAX),
            }),
            cleared: { ...filters, nightsFrom: PACKAGE_LIMITS.NIGHTS_MIN, nightsTo: PACKAGE_LIMITS.NIGHTS_MAX },
        });
    }
    if (filters.safarisFrom > PACKAGE_LIMITS.SAFARIS_MIN || filters.safarisTo < PACKAGE_LIMITS.SAFARIS_MAX) {
        chips.push({
            key: 'safaris',
            label: t('{from} – {to} safaris', {
                from: filters.safarisFrom,
                to: openEnd(filters.safarisTo, PACKAGE_LIMITS.SAFARIS_MAX),
            }),
            cleared: { ...filters, safarisFrom: PACKAGE_LIMITS.SAFARIS_MIN, safarisTo: PACKAGE_LIMITS.SAFARIS_MAX },
        });
    }
    for (const listKey of LIST_KEYS) {
        for (const code of filters[listKey]) {
            chips.push({
                key: `${listKey}-${code}`,
                label: t(labelOf(LIST_OPTIONS[listKey], code)),
                cleared: { ...filters, [listKey]: filters[listKey].filter((item) => item !== code) },
            });
        }
    }
    return chips;
};

const toggled = (list: readonly number[], code: number): readonly number[] =>
    list.includes(code) ? list.filter((item) => item !== code) : [...list, code];

function RangeField({
    label,
    low,
    high,
    min,
    max,
    step,
    lowText,
    highText,
    onChange,
}: {
    readonly label: string;
    readonly low: number;
    readonly high: number;
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly lowText: string;
    readonly highText: string;
    readonly onChange: (low: number, high: number) => void;
}) {
    return (
        <div className="field">
            <span className="label">{label}</span>
            <div className="wb-range">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    aria-label={`${label}, lowest`}
                    value={low}
                    onChange={(event) => onChange(Math.min(Number(event.target.value), high - (step > 1 ? step : 0)), high)}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    aria-label={`${label}, highest`}
                    value={high}
                    onChange={(event) => onChange(low, Math.max(Number(event.target.value), low + (step > 1 ? step : 0)))}
                />
            </div>
            <div className="wb-range-v">
                <span>{lowText}</span>
                <span>{highText}</span>
            </div>
        </div>
    );
}

function CheckList({
    label,
    options,
    chosen,
    onToggle,
}: {
    readonly label: string;
    readonly options: readonly CodeOption[];
    readonly chosen: readonly number[];
    readonly onToggle: (code: number) => void;
}) {
    const t = useT();
    return (
        <div className="field">
            <span className="label">{label}</span>
            <div className="ss-checks">
                {options.map((option) => (
                    <label key={option.code} className="check">
                        <input
                            type="checkbox"
                            checked={chosen.includes(option.code)}
                            onChange={() => onToggle(option.code)}
                        />
                        {t(option.label)}
                    </label>
                ))}
            </div>
        </div>
    );
}

export function PackageFilterFields({
    idPrefix,
    filters,
    parks,
    onChange,
}: {
    readonly idPrefix: string;
    readonly filters: PackageFilters;
    readonly parks: readonly ParkOption[] | null;
    readonly onChange: (filters: PackageFilters) => void;
}) {
    const t = useT();
    return (
        <>
            {parks && (
                <div className="field">
                    <label className="label" htmlFor={`${idPrefix}-park`}>
                        {t('Park')}
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
            )}
            <RangeField
                label={t('Cost (Per Person)')}
                low={filters.priceFrom}
                high={filters.priceTo}
                min={PACKAGE_LIMITS.PRICE_MIN}
                max={PACKAGE_LIMITS.PRICE_MAX}
                step={PACKAGE_LIMITS.PRICE_STEP}
                lowText={rupees(filters.priceFrom)}
                highText={priceToText(filters.priceTo)}
                onChange={(priceFrom, priceTo) => onChange({ ...filters, priceFrom, priceTo })}
            />
            <RangeField
                label={t('Tour Duration (Nights)')}
                low={filters.nightsFrom}
                high={filters.nightsTo}
                min={PACKAGE_LIMITS.NIGHTS_MIN}
                max={PACKAGE_LIMITS.NIGHTS_MAX}
                step={1}
                lowText={String(filters.nightsFrom)}
                highText={openEnd(filters.nightsTo, PACKAGE_LIMITS.NIGHTS_MAX)}
                onChange={(nightsFrom, nightsTo) => onChange({ ...filters, nightsFrom, nightsTo })}
            />
            <RangeField
                label={t('Total Safaris')}
                low={filters.safarisFrom}
                high={filters.safarisTo}
                min={PACKAGE_LIMITS.SAFARIS_MIN}
                max={PACKAGE_LIMITS.SAFARIS_MAX}
                step={1}
                lowText={String(filters.safarisFrom)}
                highText={openEnd(filters.safarisTo, PACKAGE_LIMITS.SAFARIS_MAX)}
                onChange={(safarisFrom, safarisTo) => onChange({ ...filters, safarisFrom, safarisTo })}
            />
            <CheckList
                label={t('Stay Category')}
                options={STAY_OPTIONS}
                chosen={filters.stays}
                onToggle={(code) => onChange({ ...filters, stays: toggled(filters.stays, code) })}
            />
            <CheckList
                label={t('Features')}
                options={FEATURE_OPTIONS}
                chosen={filters.features}
                onToggle={(code) => onChange({ ...filters, features: toggled(filters.features, code) })}
            />
            <CheckList
                label={t('Included')}
                options={INCLUSION_OPTIONS}
                chosen={filters.inclusions}
                onToggle={(code) => onChange({ ...filters, inclusions: toggled(filters.inclusions, code) })}
            />
        </>
    );
}
