import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    LANGUAGE_SITES,
    LANGUAGE_CODE_PATTERN,
    LANGUAGE_LIMITS,
    LanguageStatus,
    APP_TRANSLATION_LIMITS,
    AppTranslationStatus,
} from '../types/language.types';

const LANGUAGE_STATUSES: readonly number[] = Object.values(LanguageStatus);

const TRANSLATION_STATUSES: readonly number[] = Object.values(AppTranslationStatus);

const idOf = (message: string) => z.coerce.number({ invalid_type_error: message }).int(message).positive(message);

const search = (limit: number) =>
    z
        .string()
        .trim()
        .max(limit, `Search can be at most ${limit} characters.`)
        .optional()
        .transform((value) => (value ? value : undefined));

const statusIn = (statuses: readonly number[]) =>
    z
        .number()
        .int()
        .refine((value) => statuses.includes(value), 'Choose a valid status.');

const required = (emptyMessage: string, label: string, min: number, max: number) =>
    z
        .string({ required_error: emptyMessage })
        .trim()
        .superRefine((value, context) => {
            const problem =
                value.length === 0
                    ? emptyMessage
                    : value.length < min
                      ? `${label} must be at least ${min} characters.`
                      : value.length > max
                        ? `${label} can be at most ${max} characters.`
                        : undefined;
            if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        });

const languageCode = z
    .string({ required_error: 'Enter a code.' })
    .trim()
    .superRefine((value, context) => {
        const problem =
            value.length === 0
                ? 'Enter a code.'
                : LANGUAGE_CODE_PATTERN.test(value)
                  ? undefined
                  : 'Enter the two-letter code in small letters, e.g. hi.';
        if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    });

const languageSite = z.enum(LANGUAGE_SITES, { errorMap: () => ({ message: 'Choose a valid portal or website.' }) });

const languageFields = {
    name: required('Enter a name.', 'Name', LANGUAGE_LIMITS.NAME_MIN, LANGUAGE_LIMITS.NAME_MAX),
    nativeName: required('Enter the native name.', 'Native name', 1, LANGUAGE_LIMITS.NATIVE_NAME_MAX),
    shortName: required('Enter the short name.', 'Short name', 1, LANGUAGE_LIMITS.SHORT_NAME_MAX),
    shownIn: z
        .array(languageSite, { required_error: 'Choose where this language is shown.' })
        .transform((sites) => [...new Set(sites)]),
    defaultFor: z
        .array(languageSite)
        .default([])
        .transform((sites) => [...new Set(sites)]),
};

const codeParam = z.object({
    code: z.string().trim().regex(LANGUAGE_CODE_PATTERN, 'This language was not found.'),
});

const translationBody = z
    .object({
        enText: required('Enter the English text.', 'English text', 1, APP_TRANSLATION_LIMITS.TEXT_MAX),
        texts: z
            .record(
                z.string().regex(LANGUAGE_CODE_PATTERN, 'Choose a valid language.'),
                z
                    .string()
                    .trim()
                    .max(
                        APP_TRANSLATION_LIMITS.TEXT_MAX,
                        `A translation can be at most ${APP_TRANSLATION_LIMITS.TEXT_MAX} characters.`,
                    ),
            )
            .default({}),
    })
    .strict();

export const listLanguageSchema = z.object({
    query: paginationQuerySchema.extend({
        search: search(LANGUAGE_LIMITS.SEARCH),
        status: z.coerce
            .number()
            .int()
            .refine((value) => LANGUAGE_STATUSES.includes(value), 'Choose a valid status.')
            .optional(),
    }),
});

export type ListLanguageQuery = z.infer<typeof listLanguageSchema>['query'];

export const createLanguageSchema = z.object({ body: z.object({ code: languageCode, ...languageFields }).strict() });

export const updateLanguageSchema = z.object({
    params: codeParam,
    body: z.object(languageFields).strict(),
});

export const languageStatusSchema = z.object({
    params: codeParam,
    body: z.object({ status: statusIn(LANGUAGE_STATUSES) }).strict(),
});

export type LanguageParams = z.infer<typeof updateLanguageSchema>['params'];

export const listTranslationSchema = z.object({
    query: paginationQuerySchema.extend({
        search: search(APP_TRANSLATION_LIMITS.SEARCH),
        status: z.coerce
            .number()
            .int()
            .refine((value) => TRANSLATION_STATUSES.includes(value), 'Choose a valid status.')
            .optional(),
        missing: z.string().regex(LANGUAGE_CODE_PATTERN, 'Choose a valid language.').optional(),
    }),
});

export type ListTranslationQuery = z.infer<typeof listTranslationSchema>['query'];

export const createTranslationSchema = z.object({ body: translationBody });

export const updateTranslationSchema = z.object({
    params: z.object({ id: idOf('This translation was not found.') }),
    body: translationBody,
});

export const translationStatusSchema = z.object({
    params: z.object({ id: idOf('This translation was not found.') }),
    body: z.object({ status: statusIn(TRANSLATION_STATUSES) }).strict(),
});

export type TranslationParams = z.infer<typeof updateTranslationSchema>['params'];
