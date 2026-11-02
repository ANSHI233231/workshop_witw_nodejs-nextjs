export const DeliveryChannel = { EMAIL: 1, IN_APP: 2 } as const;

export type DeliveryChannelCode = (typeof DeliveryChannel)[keyof typeof DeliveryChannel];

export const DeliveryStatus = { DELIVERED: 1, FAILED: 2, CAPTURED: 3, SENT: 4, READ: 5 } as const;

export type DeliveryStatusCode = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const NotificationTemplateStatus = { ACTIVE: 1, INACTIVE: 2, DRAFT: 3 } as const;

export type NotificationTemplateStatusCode =
    (typeof NotificationTemplateStatus)[keyof typeof NotificationTemplateStatus];

export const NOTIFICATION_LIMITS = { SEARCH: 100, TEMPLATE_KEY: 64 } as const;

export const TemplateTab = { EMAIL: 'email', IN_APP: 'in-app' } as const;

export type TemplateTabKey = (typeof TemplateTab)[keyof typeof TemplateTab];

export type NotificationTemplateItem = {
    readonly id: number;
    readonly notificationKind: number;
    readonly clientApp: number | null;
    readonly code: string;
    readonly name: string;
    readonly titleTemplate: string;
    readonly sentWhen: string | null;
    readonly opens: string | null;
    readonly status: NotificationTemplateStatusCode;
    readonly updatedAt: string;
};

export type TemplateFilters = {
    readonly tab: TemplateTabKey;
    readonly search: string;
    readonly status: NotificationTemplateStatusCode | undefined;
};

export type DeliveryItem = {
    readonly channel: DeliveryChannelCode;
    readonly id: number;
    readonly recipient: string;
    readonly title: string;
    readonly templateName: string | null;
    readonly sentAt: string;
    readonly status: DeliveryStatusCode;
};

export type DeliveryFilters = {
    readonly search: string;
    readonly channel: DeliveryChannelCode | undefined;
    readonly template: string | undefined;
    readonly status: DeliveryStatusCode | undefined;
    readonly page: number;
};

export type InAppDelivery = {
    readonly id: number;
    readonly recipient: string;
    readonly templateName: string | null;
    readonly sentAt: string;
    readonly status: DeliveryStatusCode;
    readonly title: string;
    readonly excerpt: string | null;
    readonly actorName: string | null;
    readonly notificationKind: number;
    readonly opens: string | null;
    readonly clientApp: number;
    readonly readAt: string | null;
    readonly titleTemplate: string | null;
};
