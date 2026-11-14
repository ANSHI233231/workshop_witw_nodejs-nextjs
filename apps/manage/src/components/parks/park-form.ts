import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import {
    PARK_IMAGE_EXTENSION,
    PARK_LIMITS,
    PARK_REGIONS,
    type ParkInput,
    type ParkRegionCode,
} from '@/types/park.types';

export type ParkField = 'name' | 'region' | 'shortDescription' | 'latitude' | 'longitude' | 'image';

export type ParkFieldErrors = Partial<Readonly<Record<ParkField, string>>>;

export type ParkFormValues = {
    readonly name: string;
    readonly region: string;
    readonly shortDescription: string;
    readonly latitude: string;
    readonly longitude: string;
};

const PARK_FIELDS: readonly ParkField[] = ['name', 'region', 'shortDescription', 'latitude', 'longitude', 'image'];

const DECIMAL = /^-?\d+(\.\d+)?$/;

const regionOf = (value: string): ParkRegionCode | null =>
    PARK_REGIONS.find((region) => String(region) === value) ?? null;

const isCoordinate = (text: string, limit: number): boolean => DECIMAL.test(text) && Math.abs(Number(text)) <= limit;

export const checkParkImage = (file: File, t: Translate): string | null => {
    if (!PARK_IMAGE_EXTENSION.test(file.name)) return t('Use a JPG, JPEG or PNG image.');
    if (file.size > PARK_LIMITS.IMAGE_MAX_BYTES) return t('Use an image up to 250 KB.');
    return null;
};

export const checkParkForm = (
    t: Translate,
    values: ParkFormValues,
): { readonly input: ParkInput; readonly errors: ParkFieldErrors } => {
    const errors: Partial<Record<ParkField, string>> = {};
    const name = values.name.trim();
    const region = regionOf(values.region);
    const description = values.shortDescription.trim();
    const latitude = values.latitude.trim();
    const longitude = values.longitude.trim();
    if (!name) errors.name = t('Enter the park name.');
    else if (name.length > PARK_LIMITS.NAME_MAX)
        errors.name = t('Park name can be at most {max} characters.', { max: PARK_LIMITS.NAME_MAX });
    if (region === null) errors.region = t('Select a region.');
    if (description.length > PARK_LIMITS.DESCRIPTION_MAX) errors.shortDescription = t('Use up to 1,000 characters.');
    if (latitude && !isCoordinate(latitude, PARK_LIMITS.LATITUDE_MAX))
        errors.latitude = t('Enter a latitude from -90 to 90.');
    if (longitude && !isCoordinate(longitude, PARK_LIMITS.LONGITUDE_MAX))
        errors.longitude = t('Enter a longitude from -180 to 180.');
    if (!latitude !== !longitude && !errors.latitude && !errors.longitude)
        errors[latitude ? 'longitude' : 'latitude'] = t('Enter both latitude and longitude, or leave both empty.');
    return {
        input: {
            name,
            region,
            shortDescription: description || null,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
        },
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
