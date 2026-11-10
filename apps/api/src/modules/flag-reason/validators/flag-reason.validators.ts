import { z } from 'zod';

import { FLAG_REASON_LIMITS, FlagReasonStatus, type FlagReasonStatusCode } from '../types/flag-reason.types';

const FLAG_REASON_STATUSES: readonly number[] = Object.values(FlagReasonStatus);

const isStatus = (value: number): value is FlagReasonStatusCode => FLAG_REASON_STATUSES.includes(value);

const status = z
    .number({ required_error: 'Choose a valid status.', invalid_type_error: 'Choose a valid status.' })
    .int('Choose a valid status.')
    .refine(isStatus, 'Choose a valid status.');

const reasonName = z
    .string({ required_error: 'Enter the reason.', invalid_type_error: 'Enter the reason.' })
    .trim()
    .superRefine((value, context) => {
        const problem =
            value.length === 0
                ? 'Enter the reason.'
                : value.length > FLAG_REASON_LIMITS.NAME_MAX
                  ? `Use up to ${FLAG_REASON_LIMITS.NAME_MAX} characters.`
                  : undefined;
        if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    });

const idParams = z.object({
    id: z.coerce
        .number({ invalid_type_error: 'This reason was not found.' })
        .int('This reason was not found.')
        .positive('This reason was not found.'),
});

export const listFlagReasonSchema = z.object({
    query: z.object({
        search: z
            .string()
            .trim()
            .max(FLAG_REASON_LIMITS.SEARCH, `Search can be at most ${FLAG_REASON_LIMITS.SEARCH} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        status: z.coerce
            .number()
            .int()
            .refine(isStatus, 'Choose a valid status.')
            .optional(),
    }),
});

export type ListFlagReasonQuery = z.infer<typeof listFlagReasonSchema>['query'];

export const createFlagReasonSchema = z.object({ body: z.object({ name: reasonName }).strict() });

export type CreateFlagReasonBody = z.infer<typeof createFlagReasonSchema>['body'];

export const updateFlagReasonSchema = z.object({
    params: idParams,
    body: z.object({ name: reasonName, status }).strict(),
});

export type UpdateFlagReasonBody = z.infer<typeof updateFlagReasonSchema>['body'];

export type FlagReasonParams = z.infer<typeof updateFlagReasonSchema>['params'];

export const flagReasonStatusSchema = z.object({
    params: idParams,
    body: z.object({ status }).strict(),
});

export type FlagReasonStatusBody = z.infer<typeof flagReasonStatusSchema>['body'];
