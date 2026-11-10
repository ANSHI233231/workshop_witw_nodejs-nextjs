import { ClientApp, type ClientAppCode } from '../../../core/context';
import type { RowDataPacket } from '../../../database/connection';

export const NotificationKind = {
    ACCOUNT_CREATED: 101,
    PASSWORD_CHANGED: 102,
    JOB_FAILED: 501,
    TEST: 601,
    SHARED_SAFARI_JOINED: 801,
    SHARED_SAFARI_COMMENTED: 802,
} as const;

export type NotificationKindCode = (typeof NotificationKind)[keyof typeof NotificationKind];

export const NotificationOwnerType: Readonly<Record<string, number>> = {};

export type NotificationOwnerTypeCode = number;

export const NotificationStatus = { ACTIVE: 1, DELETED: -1 } as const;

export const NotificationTab = {
    ALL: 'all',
    UNREAD: 'unread',
    ACCOUNT: 'account',
    JOBS: 'jobs',
    SHARED_SAFARI: 'shared-safari',
} as const;

export type NotificationTabKey = (typeof NotificationTab)[keyof typeof NotificationTab];

export type NotificationKindTab = Exclude<NotificationTabKey, 'all' | 'unread'>;

export const KIND_TABS_OF_APP: Readonly<Partial<Record<ClientAppCode, readonly NotificationKindTab[]>>> = {
    [ClientApp.MANAGE]: [NotificationTab.ACCOUNT, NotificationTab.JOBS],
    [ClientApp.WEB]: [NotificationTab.SHARED_SAFARI, NotificationTab.ACCOUNT],
};

export const KINDS_OF_TAB: Readonly<Record<NotificationKindTab, readonly NotificationKindCode[]>> = {
    [NotificationTab.ACCOUNT]: [NotificationKind.ACCOUNT_CREATED, NotificationKind.PASSWORD_CHANGED],
    [NotificationTab.JOBS]: [NotificationKind.JOB_FAILED],
    [NotificationTab.SHARED_SAFARI]: [NotificationKind.SHARED_SAFARI_JOINED, NotificationKind.SHARED_SAFARI_COMMENTED],
};

export const NOTIFICATION_LIMITS = { TITLE_MAX: 255, EXCERPT_MAX: 500, INSERT_BATCH: 500 } as const;

export interface NotificationRow extends RowDataPacket {
    id: number;
    notificationKind: NotificationKindCode;
    entityType: number;
    entityId: number;
    title: string;
    excerpt: string | null;
    readAt: string | null;
    createdAt: string;
    actorId: number | null;
    actorName: string | null;
}

export interface NotificationKindCountRow extends RowDataPacket {
    notificationKind: number;
    total: number;
    unread: number;
}

export interface NotificationTotalRow extends RowDataPacket {
    total: number;
}
