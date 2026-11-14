import { z } from 'zod';

import { ValidationException } from '../../../core/exceptions';
import { paginationQuerySchema } from '../../../core/validation';
import {
    FEATURE_IMAGE_FIELD,
    PARK_LIMITS,
    ParkRegion,
    type ParkRegionCode,
    ParkStatus,
    type ParkStatusCode,
    ParkWebsiteSort,
    type ParkWebsiteSortKey,
} from '../types/park.types';

export const PARK_MESSAGES = {
    NAME_EMPTY: 'Enter the park name.',
    NAME_TOO_LONG: `Park name can be at most ${PARK_LIMITS.NAME_MAX} characters.`,
    NAME_TAKEN: 'A park with this name already exists.',
    REGION: 'Select a region.',
    DESCRIPTION_TOO_LONG: 'Use up to 1,000 characters.',
    LATITUDE: 'Enter a latitude from -90 to 90.',
    LONGITUDE: 'Enter a longitude from -180 to 180.',
    COORDINATE_PAIR: 'Enter both latitude and longitude, or leave both empty.',
    IMAGE_TYPE: 'Use a JPG, JPEG or PNG image.',
    IMAGE_SIZE: 'Use an image up to 250 KB.',
    IMAGE_NOT_FOUND: 'This park has no feature image.',
    STATUS: 'Choose a valid status.',
    NOT_FOUND: 'This park was not found.',
    FIELD_MISSING: 'Send this field; use null to leave it empty.',
} as const;

const REGIONS: readonly number[] = Object.values(ParkRegion);

const STATUSES: readonly number[] = Object.values(ParkStatus);

const DECIMAL_NUMBER = /^-?\d+(\.\d+)?$/;

const SORTS: readonly string[] = Object.values(ParkWebsiteSort);

const isRegion = (value: number): value is ParkRegionCode => REGIONS.includes(value);

const isStatus = (value: number): value is ParkStatusCode => STATUSES.includes(value);

const idParam = z.object({
    id: z.coerce
        .number({ invalid_type_error: PARK_MESSAGES.NOT_FOUND })
        .int(PARK_MESSAGES.NOT_FOUND)
        .positive(PARK_MESSAGES.NOT_FOUND),
});

const name = z
    .string({ required_error: PARK_MESSAGES.NAME_EMPTY, invalid_type_error: PARK_MESSAGES.NAME_EMPTY })
    .trim()
    .superRefine((value, context) => {
        const problem =
            value.length === 0
                ? PARK_MESSAGES.NAME_EMPTY
                : value.length > PARK_LIMITS.NAME_MAX
                  ? PARK_MESSAGES.NAME_TOO_LONG
                  : undefined;
        if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    });

const region = z
    .number({ required_error: PARK_MESSAGES.REGION, invalid_type_error: PARK_MESSAGES.REGION })
    .refine(isRegion, PARK_MESSAGES.REGION);

const shortDescription = z
    .string({ required_error: PARK_MESSAGES.FIELD_MISSING, invalid_type_error: PARK_MESSAGES.DESCRIPTION_TOO_LONG })
    .trim()
    .max(PARK_LIMITS.DESCRIPTION_MAX, PARK_MESSAGES.DESCRIPTION_TOO_LONG)
    .nullable()
    .transform((value) => (value ? value : null));

const coordinateOf = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const text = value.trim();
    if (text === '') return null;
    return DECIMAL_NUMBER.test(text) ? Number(text) : Number.NaN;
};

const coordinate = (limit: number, message: string) =>
    z.preprocess(
        coordinateOf,
        z
            .number({ required_error: PARK_MESSAGES.FIELD_MISSING, invalid_type_error: message })
            .min(-limit, message)
            .max(limit, message)
            .nullable(),
    );

const status = z
    .number({ required_error: PARK_MESSAGES.STATUS, invalid_type_error: PARK_MESSAGES.STATUS })
    .refine(isStatus, PARK_MESSAGES.STATUS);

type Coordinates = { readonly latitude: number | null; readonly longitude: number | null };

const checkCoordinates = (coordinates: Coordinates, context: z.RefinementCtx): void => {
    const { latitude, longitude } = coordinates;
    if ((latitude === null) !== (longitude === null)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: PARK_MESSAGES.COORDINATE_PAIR,
            path: [latitude === null ? 'latitude' : 'longitude'],
        });
    }
};

const parkFields = {
    name,
    region,
    shortDescription,
    latitude: coordinate(PARK_LIMITS.LATITUDE_MAX, PARK_MESSAGES.LATITUDE),
    longitude: coordinate(PARK_LIMITS.LONGITUDE_MAX, PARK_MESSAGES.LONGITUDE),
};

const searchText = z
    .string()
    .trim()
    .max(PARK_LIMITS.SEARCH, `Search can be at most ${PARK_LIMITS.SEARCH} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined));

export const listParkSchema = z.object({
    query: paginationQuerySchema.extend({
        search: searchText,
        region: z.coerce.number().int().refine(isRegion, PARK_MESSAGES.REGION).optional(),
        status: z.coerce.number().int().refine(isStatus, PARK_MESSAGES.STATUS).optional(),
    }),
});

export type ListParkQuery = z.infer<typeof listParkSchema>['query'];

export const parkIdSchema = z.object({ params: idParam });

export type ParkParams = z.infer<typeof idParam>;

export const createParkSchema = z.object({
    body: z.object(parkFields).strict().superRefine(checkCoordinates),
});

export const updateParkSchema = z.object({
    params: idParam,
    body: z
        .object({ ...parkFields, status })
        .strict()
        .superRefine(checkCoordinates),
});

export const parkStatusSchema = z.object({
    params: idParam,
    body: z.object({ status }).strict(),
});

export const featureImageSchema = z.object({ params: idParam });

export const websiteParkListSchema = z.object({
    query: z.object({
        search: searchText,
        region: z.coerce.number().int().refine(isRegion, PARK_MESSAGES.REGION).optional(),
        sort: z
            .string()
            .optional()
            .transform((value): ParkWebsiteSortKey =>
                value && SORTS.includes(value) ? (value as ParkWebsiteSortKey) : ParkWebsiteSort.A_TO_Z,
            ),
        page: z.coerce.number().int().positive().optional().default(1),
    }),
});

export type WebsiteParkListQuery = z.infer<typeof websiteParkListSchema>['query'];

const slugParam = z.object({ slug: z.string().trim().min(1).max(PARK_LIMITS.SLUG_MAX) });

export const parkSlugSchema = z.object({ params: slugParam });

export type ParkSlugParams = z.infer<typeof slugParam>;

export const featureImageTypeError = (): ValidationException =>
    new ValidationException(
        PARK_MESSAGES.IMAGE_TYPE,
        [{ field: FEATURE_IMAGE_FIELD, message: PARK_MESSAGES.IMAGE_TYPE }],
        'PARK_IMAGE_TYPE',
    );
