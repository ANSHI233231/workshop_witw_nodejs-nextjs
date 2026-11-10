import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { wordCount } from '../mappers/shared-safari.mapper';
import {
    AdminDeleteReason,
    HOST_STATUSES,
    MyTab,
    SHARED_SAFARI_LIMITS,
    SharedSafariStatus,
    SharedSafariTheme,
    SortKey,
    StayCategory,
} from '../types/shared-safari.types';

const LIMITS = SHARED_SAFARI_LIMITS;

const THEMES: readonly number[] = Object.values(SharedSafariTheme);

const STAYS: readonly number[] = Object.values(StayCategory);

const DELETE_REASONS: readonly number[] = Object.values(AdminDeleteReason);

const CONSOLE_STATUSES: readonly number[] = Object.values(SharedSafariStatus);

const SORTS: readonly string[] = Object.values(SortKey);

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const PRICE_EMPTY = 'Enter the price per person, from and to.';

const PRICE_RANGE = 'Enter whole rupees, up to ₹10,00,000.';

const idOf = (message: string) => z.coerce.number({ invalid_type_error: message }).int(message).positive(message);

const idParams = z.object({ id: idOf('This safari was not found.') });

const commentParams = z.object({ id: idOf('This comment was not found.') });

const isWhole = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);

const numberFrom = (value: unknown): unknown => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? Number(value) : value;
};

const optionalNumber = z.preprocess(numberFrom, z.unknown());

const issue = (context: z.RefinementCtx, path: string, message: string): void => {
    context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
};

const textUnder = (emptyMessage: string, words: number, overMessage: string) =>
    z
        .string({ required_error: emptyMessage, invalid_type_error: emptyMessage })
        .trim()
        .superRefine((value, context) => {
            if (value.length === 0) context.addIssue({ code: z.ZodIssueCode.custom, message: emptyMessage });
            else if (wordCount(value) >= words) context.addIssue({ code: z.ZodIssueCode.custom, message: overMessage });
        });

export const safariBodySchema = z
    .object({
        title: z.string().trim().optional().default(''),
        masterParkId: optionalNumber,
        startDate: z.string().trim().optional().default(''),
        endDate: z.string().trim().optional().default(''),
        safariCount: optionalNumber,
        theme: optionalNumber,
        totalSeats: optionalNumber,
        sharedSeats: optionalNumber,
        pricePerPersonMin: optionalNumber,
        pricePerPersonMax: optionalNumber,
        stayCategory: optionalNumber,
        safariPlan: textUnder('Enter a safari plan.', LIMITS.PLAN_WORDS_BELOW, 'Please provide content within 1000 words.'),
    })
    .strict()
    .superRefine((body, context) => {
        if (body.title.length === 0) issue(context, 'title', 'Enter a title.');
        else if (body.title.length > LIMITS.TITLE_MAX) issue(context, 'title', 'Use up to 255 characters.');
        if (!isWhole(body.masterParkId) || body.masterParkId <= 0) issue(context, 'masterParkId', 'Select a park.');
        if (!DATE.test(body.startDate)) issue(context, 'startDate', 'Enter a start date.');
        if (!DATE.test(body.endDate)) issue(context, 'endDate', 'Enter an end date.');
        else if (DATE.test(body.startDate) && body.endDate <= body.startDate) {
            issue(context, 'endDate', 'End date must be after the start date.');
        }
        if (body.safariCount === undefined) issue(context, 'safariCount', 'Enter the number of safaris.');
        else if (!isWhole(body.safariCount) || body.safariCount < LIMITS.SAFARIS_MIN || body.safariCount > LIMITS.SAFARIS_MAX) {
            issue(context, 'safariCount', 'Enter a number from 1 to 10.');
        }
        if (!isWhole(body.theme) || !THEMES.includes(body.theme)) issue(context, 'theme', 'Select a theme.');
        const total = body.totalSeats;
        if (total === undefined) issue(context, 'totalSeats', 'Enter the total seats.');
        else if (!isWhole(total) || total < LIMITS.SEATS_MIN || total > LIMITS.SEATS_MAX) {
            issue(context, 'totalSeats', 'Enter a number up to 6.');
        }
        const shared = body.sharedSeats;
        if (shared === undefined) issue(context, 'sharedSeats', 'Enter the seats to share.');
        else if (!isWhole(shared) || shared < LIMITS.SHARED_MIN) issue(context, 'sharedSeats', 'Enter at least 1 seat.');
        else if (isWhole(total) && shared >= total) {
            issue(context, 'sharedSeats', 'Seats to share must be fewer than the total seats.');
        }
        const from = body.pricePerPersonMin;
        const to = body.pricePerPersonMax;
        if (from === undefined || to === undefined) issue(context, 'price', PRICE_EMPTY);
        else if (!isWhole(from) || !isWhole(to) || from < 0 || to < 0 || from > LIMITS.PRICE_MAX || to > LIMITS.PRICE_MAX) {
            issue(context, 'price', PRICE_RANGE);
        } else if (to < from) issue(context, 'price', 'The “to” price can’t be less than the “from” price.');
        if (body.stayCategory !== undefined && (!isWhole(body.stayCategory) || !STAYS.includes(body.stayCategory))) {
            issue(context, 'stayCategory', 'Select a Stay Category.');
        }
    })
    .transform((body) => ({
        title: body.title,
        masterParkId: body.masterParkId as number,
        startDate: body.startDate,
        endDate: body.endDate,
        safariCount: body.safariCount as number,
        theme: body.theme as number,
        totalSeats: body.totalSeats as number,
        sharedSeats: body.sharedSeats as number,
        pricePerPersonMin: body.pricePerPersonMin as number,
        pricePerPersonMax: body.pricePerPersonMax as number,
        stayCategory: (body.stayCategory as number | undefined) ?? null,
        safariPlan: body.safariPlan,
    }));

const listOf = (allowed: readonly number[]) =>
    z.preprocess(
        (value) =>
            (Array.isArray(value) ? value : typeof value === 'string' && value !== '' ? value.split(',') : [])
                .map(Number)
                .filter((item) => allowed.includes(item)),
        z.array(z.number()),
    );

const positiveOrNone = z.preprocess(numberFrom, z.number().int().min(0).optional());

export const publicListSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        parkId: z.preprocess(numberFrom, z.number().int().positive().optional()),
        month: z.preprocess(numberFrom, z.number().int().min(1).max(12).optional()),
        priceMin: positiveOrNone,
        priceMax: positiveOrNone,
        safarisMin: positiveOrNone,
        safarisMax: positiveOrNone,
        themes: listOf(THEMES),
        stays: listOf(STAYS),
        sort: z
            .string()
            .optional()
            .transform((value) => (value && SORTS.includes(value) ? value : SortKey.NEWEST)),
    }),
});

export const viewSchema = z.object({ params: z.object({ ref: z.string().trim().min(1).max(LIMITS.SLUG_MAX) }) });

export const idSchema = z.object({ params: idParams });

export const createSchema = z.object({ body: safariBodySchema });

export const updateSchema = z.object({ params: idParams, body: safariBodySchema });

export const statusSchema = z.object({
    params: idParams,
    body: z
        .object({
            status: z.number().int().refine((value) => HOST_STATUSES.includes(value), 'Choose a valid status.'),
        })
        .strict(),
});

export const mySchema = z.object({
    query: z.object({
        tab: z
            .string()
            .optional()
            .transform((value) => (value === MyTab.JOINED ? MyTab.JOINED : MyTab.ORGANISED)),
    }),
});

const commentText = textUnder('Enter a comment.', LIMITS.COMMENT_WORDS_BELOW, 'Please provide content within 200 words.');

export const postCommentSchema = z.object({
    params: idParams,
    body: z
        .object({
            text: commentText,
            parentId: z.number().int().positive().nullable().optional().default(null),
        })
        .strict(),
});

export const editCommentSchema = z.object({ params: commentParams, body: z.object({ text: commentText }).strict() });

export const commentSchema = z.object({ params: commentParams });

export const flagSchema = z.object({
    params: commentParams,
    body: z
        .object({
            reasonId: z.number({ required_error: 'Select a reason.', invalid_type_error: 'Select a reason.' }).int().positive(),
            details: z
                .string({ required_error: 'Enter the details.' })
                .trim()
                .min(1, 'Enter the details.')
                .max(LIMITS.FLAG_DETAILS_MAX, 'Use up to 500 characters.'),
        })
        .strict(),
});

export const consoleListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(LIMITS.SEARCH_MAX, `Search can be at most ${LIMITS.SEARCH_MAX} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        status: z.preprocess(numberFrom, z.number().int().optional()).refine(
            (value) => value === undefined || CONSOLE_STATUSES.includes(value),
            'Choose a valid status.',
        ),
        hostId: z.preprocess(numberFrom, z.number().int().positive().optional()),
    }),
});

export const flaggedListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(LIMITS.SEARCH_MAX, `Search can be at most ${LIMITS.SEARCH_MAX} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
    }),
});

export const adminDeleteSchema = z.object({
    params: idParams,
    body: z
        .object({
            reason: z
                .number({ required_error: 'Select a reason.', invalid_type_error: 'Select a reason.' })
                .int()
                .refine((value) => DELETE_REASONS.includes(value), 'Select a reason.'),
            details: z
                .string({ required_error: 'Enter the details.' })
                .trim()
                .min(1, 'Enter the details.')
                .max(LIMITS.DELETE_DETAILS_MAX, 'Use up to 1000 characters.'),
        })
        .strict(),
});

export const pinSchema = z.object({ params: idParams, body: z.object({ pinned: z.boolean() }).strict() });

export type PublicListQuery = z.infer<typeof publicListSchema>['query'];

export type ConsoleListQuery = z.infer<typeof consoleListSchema>['query'];

export type FlaggedListQuery = z.infer<typeof flaggedListSchema>['query'];
