import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    INDIA_TIME_ZONE,
    QUOTE_LIMITS,
    QUOTE_MARKS,
    QUOTE_REQUEST_STATUSES,
    type QuoteMarkCode,
    type QuoteRequestStatusCode,
} from '../types/quote-request.types';

export const QUOTE_MESSAGES = {
    TRAVELLERS_EMPTY: 'Enter the number of travellers.',
    TRAVELLERS_RANGE: `Enter a number from ${QUOTE_LIMITS.TRAVELLERS_MIN} to ${QUOTE_LIMITS.TRAVELLERS_MAX}.`,
    START_EMPTY: 'Choose a start date.',
    START_PAST: 'Choose today or a later date.',
    NOTES_EMPTY: 'Enter your notes.',
    NOTES_TOO_LONG: 'Use up to 1,000 characters.',
    MESSAGE_EMPTY: 'Enter the message.',
    MESSAGE_TOO_LONG: `Use up to ${QUOTE_LIMITS.MESSAGE_MAX} characters.`,
    PACKAGE_EMPTY: 'Choose a package.',
    PACKAGE_NOT_AVAILABLE: 'This package is not on the website now.',
    PARTNER_CANNOT_SEND:
        "Partners can't send quote requests. Your own packages and quote requests are in the Partner portal.",
    NOT_ACTIVE_PARTNER: 'Only an active partner can see quote requests.',
    NOT_FOUND: 'This quote request was not found.',
    NOT_ACTIVE: 'This quote request is not active.',
    STATUS_UNCHANGED: 'This quote request already has that status.',
    MARK: 'Choose Hot or Cold.',
    STATUS: 'Choose a valid status.',
    SEARCH_TOO_LONG: `Search can be at most ${QUOTE_LIMITS.SEARCH} characters.`,
    ACCOUNT_NOT_FOUND: 'Your account was not found.',
} as const;

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

export const todayInIndia = (now: Date = new Date()): string => INDIA_DATE.format(now);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isCalendarDate = (value: string): boolean => {
    if (!ISO_DATE.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const WHOLE_NUMBER = /^\d+$/;

const travellerCount = z.unknown().transform((value, context): number => {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    if (value === undefined || value === null || text === '') {
        context.addIssue({ code: z.ZodIssueCode.custom, message: QUOTE_MESSAGES.TRAVELLERS_EMPTY });
        return z.NEVER;
    }
    const count = Number(text);
    if (!WHOLE_NUMBER.test(text) || count < QUOTE_LIMITS.TRAVELLERS_MIN || count > QUOTE_LIMITS.TRAVELLERS_MAX) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: QUOTE_MESSAGES.TRAVELLERS_RANGE });
        return z.NEVER;
    }
    return count;
});

const startDate = z.unknown().transform((value, context): string => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!isCalendarDate(text)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: QUOTE_MESSAGES.START_EMPTY });
        return z.NEVER;
    }
    if (text < todayInIndia()) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: QUOTE_MESSAGES.START_PAST });
        return z.NEVER;
    }
    return text;
});

const requiredText = (empty: string, max: number, tooLong: string) =>
    z.unknown().transform((value, context): string => {
        const text = typeof value === 'string' ? value.trim() : '';
        const problem = text.length === 0 ? empty : text.length > max ? tooLong : undefined;
        if (problem) {
            context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
            return z.NEVER;
        }
        return text;
    });

const positiveId = (message: string) =>
    z.coerce.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const idParams = z.object({ id: positiveId(QUOTE_MESSAGES.NOT_FOUND) });

export type QuoteRequestParams = z.infer<typeof idParams>;

export const sendQuoteSchema = z.object({
    body: z
        .object({
            packageId: z
                .number({ required_error: QUOTE_MESSAGES.PACKAGE_EMPTY, invalid_type_error: QUOTE_MESSAGES.PACKAGE_EMPTY })
                .int(QUOTE_MESSAGES.PACKAGE_EMPTY)
                .positive(QUOTE_MESSAGES.PACKAGE_EMPTY),
            travellerCount,
            startDate,
            notes: requiredText(QUOTE_MESSAGES.NOTES_EMPTY, QUOTE_LIMITS.NOTES_MAX, QUOTE_MESSAGES.NOTES_TOO_LONG),
        })
        .strict(),
});

export type SendQuoteBody = z.infer<typeof sendQuoteSchema>['body'];

export const quoteIdSchema = z.object({ params: idParams });

export const markSchema = z.object({
    params: idParams,
    body: z
        .object({
            mark: z
                .number({ required_error: QUOTE_MESSAGES.MARK, invalid_type_error: QUOTE_MESSAGES.MARK })
                .refine((value): value is QuoteMarkCode => (QUOTE_MARKS as readonly number[]).includes(value), QUOTE_MESSAGES.MARK),
        })
        .strict(),
});

export type MarkBody = { readonly mark: QuoteMarkCode };

const statusCode = (message: string) =>
    z.coerce
        .number({ invalid_type_error: message })
        .int(message)
        .refine(
            (value): value is QuoteRequestStatusCode => (QUOTE_REQUEST_STATUSES as readonly number[]).includes(value),
            message,
        );

export const statusSchema = z.object({
    params: idParams,
    body: z.object({ status: statusCode(QUOTE_MESSAGES.STATUS) }).strict(),
});

export type StatusBody = { readonly status: QuoteRequestStatusCode };

export const notifySchema = z.object({
    params: idParams,
    body: z
        .object({
            message: requiredText(QUOTE_MESSAGES.MESSAGE_EMPTY, QUOTE_LIMITS.MESSAGE_MAX, QUOTE_MESSAGES.MESSAGE_TOO_LONG),
        })
        .strict(),
});

export const consoleListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(QUOTE_LIMITS.SEARCH, QUOTE_MESSAGES.SEARCH_TOO_LONG)
            .optional()
            .transform((value) => (value ? value : undefined)),
        status: z
            .union([z.literal(''), statusCode(QUOTE_MESSAGES.STATUS)])
            .optional()
            .transform((value) => (value === '' ? undefined : value)),
    }),
});

export type ConsoleListQuery = z.infer<typeof consoleListSchema>['query'];
