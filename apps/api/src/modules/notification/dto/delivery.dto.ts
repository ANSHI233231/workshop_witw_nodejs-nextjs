import type { DeliveryChannelCode, DeliveryStatusCode } from '../types/delivery.types';
import type { NotificationTemplateStatusCode } from '../types/notification-template.types';
import type { NotificationKindCode } from '../types/notification.types';

export type DeliveryFilters = {
    readonly search: string | undefined;
    readonly channel: DeliveryChannelCode | undefined;
    readonly templateKey: string | undefined;
    readonly status: DeliveryStatusCode | undefined;
};

export type DeliveryItemDto = {
    readonly channel: DeliveryChannelCode;
    readonly id: number;
    readonly recipient: string;
    readonly title: string;
    readonly templateName: string | null;
    readonly sentAt: string;
    readonly status: DeliveryStatusCode;
};

export type DeliveryPage = {
    readonly items: readonly DeliveryItemDto[];
    readonly total: number;
};

export type NotificationTemplateFilters = {
    readonly search: string | undefined;
    readonly status: NotificationTemplateStatusCode | undefined;
};

export type NotificationTemplateDto = {
    readonly id: number;
    readonly notificationKind: NotificationKindCode;
    readonly clientApp: number | null;
    readonly code: string;
    readonly name: string;
    readonly titleTemplate: string;
    readonly sentWhen: string | null;
    readonly opens: string | null;
    readonly status: NotificationTemplateStatusCode;
    readonly updatedAt: string;
};

export type InAppDeliveryDto = {
    readonly id: number;
    readonly recipient: string;
    readonly clientApp: number;
    readonly templateName: string | null;
    readonly sentAt: string;
    readonly status: DeliveryStatusCode;
    readonly title: string;
    readonly excerpt: string | null;
    readonly actorName: string | null;
    readonly notificationKind: NotificationKindCode;
    readonly opens: string | null;
    readonly readAt: string | null;
    readonly titleTemplate: string | null;
};
