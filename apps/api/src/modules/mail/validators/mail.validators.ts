import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { MAIL_LIMITS, MailLogStatus, MailTemplateStatus } from '../types/mail.types';

const LOG_STATUSES: readonly number[] = Object.values(MailLogStatus);

const TEMPLATE_STATUSES: readonly number[] = Object.values(MailTemplateStatus);

export const listMailLogsSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(MAIL_LIMITS.SEARCH, `Search can be at most ${MAIL_LIMITS.SEARCH} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        status: z.coerce
            .number()
            .int()
            .refine((value) => LOG_STATUSES.includes(value), 'Choose a valid status.')
            .optional(),
        template: z
            .string()
            .trim()
            .max(64)
            .optional()
            .transform((value) => (value ? value : undefined)),
    }),
});

export type ListMailLogsQuery = z.infer<typeof listMailLogsSchema>['query'];

export const mailLogIdSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ invalid_type_error: 'This mail was not found.' })
            .int('This mail was not found.')
            .positive('This mail was not found.'),
    }),
});

export type MailLogIdParams = z.infer<typeof mailLogIdSchema>['params'];

export const listMailTemplatesSchema = z.object({
    query: z.object({
        search: z
            .string()
            .trim()
            .max(MAIL_LIMITS.SEARCH, `Search can be at most ${MAIL_LIMITS.SEARCH} characters.`)
            .optional()
            .transform((value) => (value ? value : undefined)),
        status: z.coerce
            .number()
            .int()
            .refine((value) => TEMPLATE_STATUSES.includes(value), 'Choose a valid status.')
            .optional(),
    }),
});

export type ListMailTemplatesQuery = z.infer<typeof listMailTemplatesSchema>['query'];

export const mailTemplateIdSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ invalid_type_error: 'This email template was not found.' })
            .int('This email template was not found.')
            .positive('This email template was not found.'),
    }),
});

export type MailTemplateIdParams = z.infer<typeof mailTemplateIdSchema>['params'];
