import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DeliveryFilterBar } from '@/components/notification/delivery-filter-bar';
import { DeliveryTable } from '@/components/notification/delivery-table';
import { CHANNEL_OPTIONS, DELIVERY_STATUS_OPTIONS } from '@/components/notification/notification-labels';
import { DELIVERY_LOG_PATH, deliveryParams, deliveryUrl } from '@/components/notification/notification-url';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { requireConsoleArea } from '@/lib/console-session';
import { formatCount } from '@/lib/format';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { listMailTemplates } from '@/services/mail.service';
import { listDeliveries, listNotificationTemplates } from '@/services/notification.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { type DeliveryFilters, NOTIFICATION_LIMITS } from '@/types/notification.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Delivery Log'),
});

const toFilters = (params: PageSearchParams): DeliveryFilters => ({
    search: searchParam(params['search'], NOTIFICATION_LIMITS.SEARCH),
    channel: codeParam(params['channel'], CHANNEL_OPTIONS),
    template: searchParam(params['template'], NOTIFICATION_LIMITS.TEMPLATE_KEY) || undefined,
    status: codeParam(params['status'], DELIVERY_STATUS_OPTIONS),
    page: pageParam(params['page']),
});

export default async function DeliveryLogPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const { t } = await serverTranslator();
    const filters = toFilters(await searchParams);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, emailTemplates, inAppTemplates] = await Promise.all([
        listDeliveries(filters, accessToken),
        listMailTemplates(accessToken),
        listNotificationTemplates(accessToken),
    ]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(deliveryUrl({ ...filters, page: result.meta.totalPages }));
    }
    const templates = [...emailTemplates, ...inAppTemplates]
        .map((template) => ({ code: template.code, name: template.name }))
        .sort((first, second) => first.name.localeCompare(second.name));
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Notification')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Delivery Log')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Delivery Log')}</h1>
                </div>
            </div>
            <div className="table-card">
                <DeliveryFilterBar filters={filters} templates={templates} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <DeliveryTable rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={DELIVERY_LOG_PATH}
                    params={deliveryParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
