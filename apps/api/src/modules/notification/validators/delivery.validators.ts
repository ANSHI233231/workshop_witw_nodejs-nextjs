import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { DELIVERY_LIMITS, DeliveryChannel, DeliveryStatus } from '../types/delivery.types';
import { NotificationTemplateStatus } from '../types/notification-template.types';

const CHANNELS: readonly number[] = Object.values(DeliveryChannel);
const STATUSES: readonly number[] = Object.values(DeliveryStatus);
const TEMPLATE_STATUSES: readonly number[] = Object.values(NotificationTemplateStatus);

const codeFrom = (allowed: readonly number[], message: string) =>
    z.coerce
        .number()
        .int()
        .refine((value) => allowed.includes(value), message)
        .optional();

const searchText = z
    .string()
    .trim()
    .max(DELIVERY_LIMITS.SEARCH, `Search can be at most ${DELIVERY_LIMITS.SEARCH} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined));

export const listDeliverySchema = z.object({
    query: paginationQuerySchema.extend({
        search: searchText,
        channel: codeFrom(CHANNELS, 'Choose a valid channel.'),
        status: codeFrom(STATUSES, 'Choose a valid status.'),
        template: z
            .string()
            .trim()
            .max(DELIVERY_LIMITS.TEMPLATE_KEY, 'Choose a valid template.')
            .optional()
            .transform((value) => (value ? value : undefined)),
    }),
});

export type ListDeliveryQuery = z.infer<typeof listDeliverySchema>['query'];

const NOT_FOUND = 'This notification was not found.';

export const inAppDeliveryIdSchema = z.object({
    params: z.object({ id: z.coerce.number({ invalid_type_error: NOT_FOUND }).int(NOT_FOUND).positive(NOT_FOUND) }),
});

export type InAppDeliveryParams = z.infer<typeof inAppDeliveryIdSchema>['params'];

export const listNotificationTemplatesSchema = z.object({
    query: z.object({ search: searchText, status: codeFrom(TEMPLATE_STATUSES, 'Choose a valid status.') }),
});

export type ListNotificationTemplatesQuery = z.infer<typeof listNotificationTemplatesSchema>['query'];
