import type { ClientAppCode } from '../../../core/context';
import type {
    NotificationKindCode,
    NotificationKindTab,
    NotificationOwnerTypeCode,
    NotificationTabKey,
} from '../types/notification.types';

export type NotificationOwner = {
    readonly ownerType: NotificationOwnerTypeCode | null;
    readonly ownerId: number | null;
};

export type NotificationPlace = NotificationOwner & { readonly clientApp: ClientAppCode };

export type NewNotification = NotificationPlace & {
    readonly userId: number;
    readonly notificationKind: NotificationKindCode;
    readonly entityType: number;
    readonly entityId: number;
    readonly title: string;
    readonly excerpt: string | null;
    readonly actorId: number | null;
};

export type NotificationFilters = {
    readonly place: NotificationPlace;
    readonly tab: NotificationTabKey;
};

export type NotificationDto = {
    readonly id: number;
    readonly notificationKind: NotificationKindCode;
    readonly entityType: number;
    readonly entityId: number;
    readonly title: string;
    readonly excerpt: string | null;
    readonly isRead: boolean;
    readonly createdAt: string;
    readonly actorName: string | null;
    readonly actorIsYou: boolean;
    readonly titleTemplate: string | null;
};

export type NotificationCountsDto = Readonly<Partial<Record<NotificationKindTab, number>>> & {
    readonly all: number;
    readonly unread: number;
};

export type NotificationPage = {
    readonly items: readonly NotificationDto[];
    readonly total: number;
};
