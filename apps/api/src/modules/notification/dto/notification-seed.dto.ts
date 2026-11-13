import type { NewNotification } from './notification.dto';

export type SeedNotification = NewNotification & { readonly createdAt: Date; readonly readAt: Date | null };

export type NotificationSeedRemoval = {
    readonly userIds: readonly number[];
    readonly entityType: number;
    readonly entityIds: readonly number[];
};
