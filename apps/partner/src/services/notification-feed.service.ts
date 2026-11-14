import type { Paginated } from '@/types/api.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    NotificationCounts,
    NotificationItem,
    NotificationOwner,
    NotificationTab,
} from '@/types/notification-feed.types';

import { apiClient } from './api-client';

export const NOTIFICATIONS_PER_PAGE = 50;

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

const ownerQuery = (owner: NotificationOwner) => (owner ? { ownerType: owner.ownerType, ownerId: owner.ownerId } : {});

export const listNotifications = (
    owner: NotificationOwner,
    tab: NotificationTab,
    page: number,
    accessToken?: string,
    limit: number = NOTIFICATIONS_PER_PAGE,
): Promise<Paginated<NotificationItem>> =>
    apiClient.paginated<NotificationItem>('/notification', {
        query: { ...ownerQuery(owner), tab, page, limit },
        headers: cookieHeader(accessToken),
    });

export const getNotificationCounts = (owner: NotificationOwner, accessToken?: string): Promise<NotificationCounts> =>
    apiClient.get<NotificationCounts>('/notification/counts', {
        query: ownerQuery(owner),
        headers: cookieHeader(accessToken),
    });

export const getUnreadCount = async (owner: NotificationOwner): Promise<number> =>
    (await apiClient.get<{ readonly unread: number }>('/notification/unread-count', { query: ownerQuery(owner) }))
        .unread;

export const markNotificationRead = (id: number): Promise<void> =>
    apiClient.patch<void>(`/notification/${id}/read`, {});

export const markNotificationUnread = (id: number): Promise<void> =>
    apiClient.patch<void>(`/notification/${id}/unread`, {});

export const markAllNotificationsRead = (owner: NotificationOwner): Promise<{ readonly marked: number }> =>
    apiClient.post<{ readonly marked: number }>('/notification/read-all', {}, { query: ownerQuery(owner) });
