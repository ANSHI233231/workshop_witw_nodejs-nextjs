export type NotificationOwner = {
    readonly ownerType: number;
    readonly ownerId: number;
} | null;

export const NotificationKind = {
    ACCOUNT_CREATED: 101,
    PASSWORD_CHANGED: 102,
    JOB_FAILED: 501,
    TEST: 601,
    SHARED_SAFARI_JOINED: 801,
    SHARED_SAFARI_COMMENTED: 802,
} as const;

export const NOTIFICATION_KIND_TABS = ['account', 'jobs', 'shared-safari'] as const;

export type NotificationKindTab = (typeof NOTIFICATION_KIND_TABS)[number];

export type NotificationTab = 'all' | 'unread' | NotificationKindTab;

export type NotificationTabOption = { readonly key: NotificationTab; readonly label: string };

export type NotificationLinks = Readonly<Partial<Record<number, string>>>;

export const BELL_REFRESH_MS = 60_000;

export const NOTIFICATIONS_CHANGED = 'notifications-changed';

export const announceNotificationsChanged = (): void => {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
};

export type NotificationItem = {
    readonly id: number;
    readonly notificationKind: number;
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

export type NotificationCounts = Readonly<Partial<Record<NotificationKindTab, number>>> & {
    readonly all: number;
    readonly unread: number;
};
