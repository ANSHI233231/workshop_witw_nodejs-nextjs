import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { PARK_LIMITS, ParkRegion, type ParkRegionCode, ParkStatus, type ParkStatusCode } from '../types/park.types';

export const PARK_MESSAGES = {
    NAME_EMPTY: 'Enter the park name.',
    NAME_TOO_LONG: `Park name can be at most ${PARK_LIMITS.NAME_MAX} characters.`,
    NAME_TAKEN: 'A park with this name already exists.',
    REGION: 'Select a region.',
    PRICE: 'Enter whole rupees, up to ₹10,00,000.',
    PRICE_ORDER: 'Max. price must be at least the min. price.',
    PRICE_PAIR: 'Enter both prices, or leave both empty.',
    STATUS: 'Choose a valid status.',
    NOT_FOUND: 'This park was not found.',
} as const;

const REGIONS: readonly number[] = Object.values(ParkRegion);

const STATUSES: readonly number[] = Object.values(ParkStatus);

const WHOLE_RUPEES = /^\d+$/;

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

const wholeRupeesOf = (value: unknown): number | undefined => {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    if (!WHOLE_RUPEES.test(text)) return undefined;
    const amount = Number(text);
    return amount <= PARK_LIMITS.PRICE_MAX ? amount : undefined;
};

const price = z.unknown().transform((value, context): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const amount = wholeRupeesOf(value);
    if (amount === undefined) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: PARK_MESSAGES.PRICE });
        return z.NEVER;
    }
    return amount;
});

const status = z
    .number({ required_error: PARK_MESSAGES.STATUS, invalid_type_error: PARK_MESSAGES.STATUS })
    .refine(isStatus, PARK_MESSAGES.STATUS);

type Prices = { readonly avgSafariPriceMin: number | null; readonly avgSafariPriceMax: number | null };

const checkPrices = (prices: Prices, context: z.RefinementCtx): void => {
    const { avgSafariPriceMin: min, avgSafariPriceMax: max } = prices;
    if (min !== null && max !== null && max < min) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: PARK_MESSAGES.PRICE_ORDER, path: ['avgSafariPriceMax'] });
    }
    if ((min === null) !== (max === null)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: PARK_MESSAGES.PRICE_PAIR,
            path: [min === null ? 'avgSafariPriceMin' : 'avgSafariPriceMax'],
        });
    }
};

const parkFields = { name, region, avgSafariPriceMin: price, avgSafariPriceMax: price };

export const listParkSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(PARK_LIMITS.SEARCH, `Search can be at most ${PARK_LIMITS.SEARCH} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        region: z.coerce.number().int().refine(isRegion, PARK_MESSAGES.REGION).optional(),
        status: z.coerce.number().int().refine(isStatus, PARK_MESSAGES.STATUS).optional(),
    }),
});

export type ListParkQuery = z.infer<typeof listParkSchema>['query'];

export const parkIdSchema = z.object({ params: idParam });

export type ParkParams = z.infer<typeof idParam>;

export const createParkSchema = z.object({
    body: z.object(parkFields).strict().superRefine(checkPrices),
});

export const updateParkSchema = z.object({
    params: idParam,
    body: z
        .object({ ...parkFields, status })
        .strict()
        .superRefine(checkPrices),
});

export const parkStatusSchema = z.object({
    params: idParam,
    body: z.object({ status }).strict(),
});
