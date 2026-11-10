import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import { PARK_LIMITS, PARK_REGIONS, type ParkInput, type ParkRegionCode } from '@/types/park.types';

export type ParkField = 'name' | 'region' | 'avgSafariPriceMin' | 'avgSafariPriceMax';

export type ParkFieldErrors = Partial<Readonly<Record<ParkField, string>>>;

export type ParkFormValues = {
    readonly name: string;
    readonly region: string;
    readonly min: string;
    readonly max: string;
};

const PARK_FIELDS: readonly ParkField[] = ['name', 'region', 'avgSafariPriceMin', 'avgSafariPriceMax'];

const WHOLE_RUPEES = /^\d+$/;

const regionOf = (value: string): ParkRegionCode | null =>
    PARK_REGIONS.find((region) => String(region) === value) ?? null;

const priceOf = (text: string): number | null | undefined => {
    const trimmed = text.trim();
    if (trimmed === '') return null;
    if (!WHOLE_RUPEES.test(trimmed)) return undefined;
    const amount = Number(trimmed);
    return amount <= PARK_LIMITS.PRICE_MAX ? amount : undefined;
};

export const checkParkForm = (
    t: Translate,
    values: ParkFormValues,
): { readonly input: ParkInput; readonly errors: ParkFieldErrors } => {
    const errors: Partial<Record<ParkField, string>> = {};
    const name = values.name.trim();
    const region = regionOf(values.region);
    const min = priceOf(values.min);
    const max = priceOf(values.max);
    if (!name) errors.name = t('Enter the park name.');
    else if (name.length > PARK_LIMITS.NAME_MAX)
        errors.name = t('Park name can be at most {max} characters.', { max: PARK_LIMITS.NAME_MAX });
    if (region === null) errors.region = t('Select a region.');
    if (min === undefined) errors.avgSafariPriceMin = t('Enter whole rupees, up to ₹10,00,000.');
    if (max === undefined) errors.avgSafariPriceMax = t('Enter whole rupees, up to ₹10,00,000.');
    if (min !== undefined && max !== undefined) {
        if (min !== null && max !== null && max < min)
            errors.avgSafariPriceMax = t('Max. price must be at least the min. price.');
        if ((min === null) !== (max === null))
            errors[min === null ? 'avgSafariPriceMin' : 'avgSafariPriceMax'] = t(
                'Enter both prices, or leave both empty.',
            );
    }
    return {
        input: { name, region, avgSafariPriceMin: min ?? null, avgSafariPriceMax: max ?? null },
        errors,
    };
};

export const parkSaveErrorsOf = (
    error: unknown,
    t: Translate,
): { readonly fields: ParkFieldErrors; readonly form: string | null } => {
    if (!(error instanceof ApiError) || error.code === ApiError.NETWORK_ERROR) {
        return { fields: {}, form: t('It could not be saved. Please try again.') };
    }
    if (error.code === 'PARK_NAME_TAKEN') return { fields: { name: t(error.message) }, form: null };
    const fields = Object.fromEntries(
        PARK_FIELDS.flatMap((field) => {
            const message = error.fieldError(field);
            return message ? [[field, t(message)]] : [];
        }),
    );
    return Object.keys(fields).length > 0 ? { fields, form: null } : { fields: {}, form: t(error.message) };
};
