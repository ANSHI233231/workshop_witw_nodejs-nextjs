import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { NotificationOwnerType, NotificationTab, type NotificationTabKey } from '../types/notification.types';

const TABS: readonly string[] = Object.values(NotificationTab);

const OWNER_TYPES: readonly number[] = Object.values(NotificationOwnerType);

const WHERE = 'Choose where the notifications are.';

const ownerQuery = {
    ownerType: z.coerce
        .number({ invalid_type_error: WHERE })
        .int(WHERE)
        .refine((value) => OWNER_TYPES.includes(value), WHERE)
        .optional(),
    ownerId: z.coerce.number({ invalid_type_error: WHERE }).int(WHERE).positive(WHERE).optional(),
};

const bothOrNeither = (query: { readonly ownerType?: number; readonly ownerId?: number }): boolean =>
    (query.ownerType === undefined) === (query.ownerId === undefined);

const OWNER_PAIR = { message: WHERE, path: ['ownerId'] };

const NOT_FOUND = 'This notification was not found.';

export const listNotificationSchema = z.object({
    query: paginationQuerySchema
        .extend({
            ...ownerQuery,
            tab: z
                .string()
                .optional()
                .refine((value) => value === undefined || TABS.includes(value), 'Choose a valid tab.')
                .transform((value) => (value ?? NotificationTab.ALL) as NotificationTabKey),
        })
        .refine(bothOrNeither, OWNER_PAIR),
});

export type ListNotificationQuery = z.infer<typeof listNotificationSchema>['query'];

export const notificationOwnerSchema = z.object({ query: z.object(ownerQuery).refine(bothOrNeither, OWNER_PAIR) });

export type NotificationOwnerQuery = z.infer<typeof notificationOwnerSchema>['query'];

export const notificationIdSchema = z.object({
    params: z.object({ id: z.coerce.number({ invalid_type_error: NOT_FOUND }).int(NOT_FOUND).positive(NOT_FOUND) }),
});

export type NotificationParams = z.infer<typeof notificationIdSchema>['params'];
