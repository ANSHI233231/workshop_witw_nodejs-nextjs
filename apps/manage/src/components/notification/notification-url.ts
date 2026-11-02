import { listUrl } from '@/lib/list-url';
import { type DeliveryFilters, TemplateTab, type TemplateFilters } from '@/types/notification.types';

export const TEMPLATES_PATH = '/notifications/templates';
export const DELIVERY_LOG_PATH = '/notifications/delivery-log';

export const templatesUrl = (filters: TemplateFilters): string =>
    listUrl(TEMPLATES_PATH, {
        tab: filters.tab === TemplateTab.EMAIL ? undefined : filters.tab,
        search: filters.search,
        status: filters.status,
    });

export const deliveryParams = (filters: DeliveryFilters) => ({
    search: filters.search,
    channel: filters.channel,
    template: filters.template,
    status: filters.status,
});

export const deliveryUrl = (filters: DeliveryFilters): string =>
    listUrl(DELIVERY_LOG_PATH, { ...deliveryParams(filters), page: filters.page });
