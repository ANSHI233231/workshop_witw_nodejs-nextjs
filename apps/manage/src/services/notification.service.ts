import type { Paginated } from '@/types/api.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    DeliveryFilters,
    DeliveryItem,
    InAppDelivery,
    NotificationTemplateItem,
    NotificationTemplateStatusCode,
} from '@/types/notification.types';

import { apiClient } from './api-client';

export const DELIVERIES_PER_PAGE = 20;

const cookieOf = (accessToken: string | undefined): Record<string, string> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listNotificationTemplates = (
    accessToken: string | undefined,
    filters?: { readonly search: string; readonly status: NotificationTemplateStatusCode | undefined },
): Promise<NotificationTemplateItem[]> =>
    apiClient.get<NotificationTemplateItem[]>('/notification/templates', {
        query: { search: filters?.search || undefined, status: filters?.status },
        headers: cookieOf(accessToken),
    });

export const listDeliveries = (
    filters: DeliveryFilters,
    accessToken: string | undefined,
): Promise<Paginated<DeliveryItem>> =>
    apiClient.paginated<DeliveryItem>('/notification/delivery-log', {
        query: {
            search: filters.search || undefined,
            channel: filters.channel,
            template: filters.template,
            status: filters.status,
            page: filters.page,
            limit: DELIVERIES_PER_PAGE,
        },
        headers: cookieOf(accessToken),
    });

export const getInAppDelivery = (id: number): Promise<InAppDelivery> =>
    apiClient.get<InAppDelivery>(`/notification/delivery-log/in-app/${id}`);
