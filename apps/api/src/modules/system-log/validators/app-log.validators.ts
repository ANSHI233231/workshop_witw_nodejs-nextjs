import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    APP_LOG_LIMITS,
    AppLogLevel,
    AppLogSource,
    INGEST_SOURCES,
    type IngestSourceKey,
} from '../types/app-log.types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES: readonly number[] = Object.values(AppLogSource);
const LEVELS: readonly number[] = Object.values(AppLogLevel);
const INGEST_KEYS = Object.keys(INGEST_SOURCES) as [IngestSourceKey, ...IngestSourceKey[]];

const codeFrom = (allowed: readonly number[], message: string) =>
    z.coerce
        .number()
        .int()
        .refine((value) => allowed.includes(value), message)
        .optional();

const optionalDay = (message: string) =>
    z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : undefined))
        .refine(
            (value) => value === undefined || (DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value))),
            message,
        );

export const listAppLogSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(APP_LOG_LIMITS.SEARCH, `Search can be at most ${APP_LOG_LIMITS.SEARCH} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        app: codeFrom(SOURCES, 'Choose a valid app.'),
        level: codeFrom(LEVELS, 'Choose a valid level.'),
        from: optionalDay('Enter a valid From date.'),
        to: optionalDay('Enter a valid To date.'),
    }),
});

export type ListAppLogQuery = z.infer<typeof listAppLogSchema>['query'];

export const appLogIdSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ invalid_type_error: 'This log entry was not found.' })
            .int('This log entry was not found.')
            .positive('This log entry was not found.'),
    }),
});

export type AppLogIdParams = z.infer<typeof appLogIdSchema>['params'];

const text = (max: number) => z.string().max(max);
const optionalText = (max: number) => z.string().max(max).optional();

const ingestEntry = z
    .object({
        level: z.literal('error'),
        category: text(APP_LOG_LIMITS.CATEGORY).min(1),
        message: text(APP_LOG_LIMITS.MESSAGE).min(1),
        loggedAt: z.string().datetime({ offset: true }),
        errorName: optionalText(APP_LOG_LIMITS.ERROR_NAME),
        errorMessage: optionalText(APP_LOG_LIMITS.ERROR_MESSAGE),
        errorStack: optionalText(APP_LOG_LIMITS.STACK),
        context: z.record(z.unknown()).optional(),
        requestId: optionalText(APP_LOG_LIMITS.REQUEST_ID),
        ipAddress: optionalText(APP_LOG_LIMITS.IP),
        userId: z.number().int().positive().optional(),
        httpMethod: optionalText(APP_LOG_LIMITS.METHOD),
        requestUrl: optionalText(APP_LOG_LIMITS.URL),
        userAgent: optionalText(APP_LOG_LIMITS.USER_AGENT),
    })
    .strict();

export const ingestAppLogSchema = z.object({
    body: z
        .object({
            app: z.enum(INGEST_KEYS),
            entries: z.array(ingestEntry).min(1).max(APP_LOG_LIMITS.INGEST_BATCH),
        })
        .strict(),
});

export type IngestAppLogBody = z.infer<typeof ingestAppLogSchema>['body'];
