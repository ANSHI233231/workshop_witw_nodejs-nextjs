import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { AUDIT_LIST_LIMITS, AuditOutcome } from '../types/audit.types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const OUTCOMES: readonly number[] = Object.values(AuditOutcome);

const optionalCode = (message: string) =>
    z.coerce.number({ invalid_type_error: message }).int(message).positive(message).optional();

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

const filterFields = {
    search: z
        .string()
        .trim()
        .max(AUDIT_LIST_LIMITS.SEARCH, `Search can be at most ${AUDIT_LIST_LIMITS.SEARCH} characters.`)
        .optional()
        .transform((value) => (value ? value : undefined)),
    module: optionalCode('Choose a valid module.'),
    action: optionalCode('Choose a valid action.'),
    outcome: z.coerce
        .number()
        .int()
        .refine((value) => OUTCOMES.includes(value), 'Choose a valid outcome.')
        .optional(),
    clientApp: optionalCode('Choose a valid app.'),
    from: optionalDay('Enter a valid From date.'),
    to: optionalDay('Enter a valid To date.'),
};

const fromNotAfterTo = (query: { from?: string; to?: string }, context: z.RefinementCtx): void => {
    if (query.from && query.to && query.from > query.to) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'To must be on or after From.' });
    }
};

export const listAuditLogsSchema = z.object({
    query: paginationQuerySchema.extend(filterFields).superRefine(fromNotAfterTo),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsSchema>['query'];

export const auditSummarySchema = z.object({
    query: z.object(filterFields).superRefine(fromNotAfterTo),
});

export type AuditSummaryQuery = z.infer<typeof auditSummarySchema>['query'];

export const auditLogIdSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ invalid_type_error: 'This audit event was not found.' })
            .int('This audit event was not found.')
            .positive('This audit event was not found.'),
    }),
});

export type AuditLogIdParams = z.infer<typeof auditLogIdSchema>['params'];
