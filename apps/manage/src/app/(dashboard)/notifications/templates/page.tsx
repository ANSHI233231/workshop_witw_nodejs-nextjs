import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { templatesUrl } from '@/components/notification/notification-url';
import { type TemplateRow, TemplateTable } from '@/components/notification/template-table';
import { TemplateFilterBar } from '@/components/notification/template-filter-bar';
import { BellIcon, BreadcrumbChevronIcon, MailIcon } from '@/components/ui/icons';
import { requireConsoleArea } from '@/lib/console-session';
import { formatCount } from '@/lib/format';
import { codeParam, type PageSearchParams, searchParam } from '@/lib/search-params';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { listMailTemplates } from '@/services/mail.service';
import { listNotificationTemplates } from '@/services/notification.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { MailTemplateItem } from '@/types/mail.types';
import {
    NOTIFICATION_LIMITS,
    type NotificationTemplateItem,
    NotificationTemplateStatus,
    TemplateTab,
    type TemplateFilters,
} from '@/types/notification.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Notification Templates'),
});

const STATUSES = Object.values(NotificationTemplateStatus);

const TEMPLATE_APP_NAMES: Readonly<Record<number, string>> = { 1: 'Console', 2: 'Portal' };

const emailRow = (template: MailTemplateItem): TemplateRow => ({
    key: `email-${template.id}`,
    id: template.id,
    isEmail: true,
    name: template.name,
    code: template.code,
    subject: template.subject,
    sentWhen: template.sentWhen,
    status: template.status,
    updatedAt: template.updatedAt,
    opens: null,
    app: null,
});

const inAppRow = (template: NotificationTemplateItem): TemplateRow => ({
    key: `in-app-${template.id}`,
    id: template.id,
    isEmail: false,
    name: template.name,
    code: template.code,
    subject: template.titleTemplate,
    sentWhen: template.sentWhen,
    status: template.status,
    updatedAt: template.updatedAt,
    opens: template.opens,
    app: template.clientApp === null ? null : (TEMPLATE_APP_NAMES[template.clientApp] ?? null),
});

export default async function NotificationTemplatesPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const { t } = await serverTranslator();
    const params = await searchParams;
    const filters: TemplateFilters = {
        tab: params['tab'] === TemplateTab.IN_APP ? TemplateTab.IN_APP : TemplateTab.EMAIL,
        search: searchParam(params['search'], NOTIFICATION_LIMITS.SEARCH),
        status: codeParam(params['status'], STATUSES),
    };
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [allEmail, allInApp, shown] = await Promise.all([
        listMailTemplates(accessToken),
        listNotificationTemplates(accessToken),
        filters.tab === TemplateTab.EMAIL
            ? listMailTemplates(accessToken, filters).then((rows) => rows.map(emailRow))
            : listNotificationTemplates(accessToken, filters).then((rows) => rows.map(inAppRow)),
    ]);
    const tabs = [
        { key: TemplateTab.EMAIL, label: 'Email', Icon: MailIcon, count: allEmail.length },
        { key: TemplateTab.IN_APP, label: 'In-app', Icon: BellIcon, count: allInApp.length },
    ];
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Notification')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Notification Templates')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Notification Templates')}</h1>
                </div>
            </div>
            <div className="table-card">
                <div className="na-tabs" role="tablist">
                    {tabs.map(({ key, label, Icon, count }) => (
                        <Link
                            key={key}
                            href={templatesUrl({ tab: key, search: '', status: undefined })}
                            className={`na-tab${filters.tab === key ? ' is-on' : ''}`}
                            role="tab"
                            aria-selected={filters.tab === key}
                        >
                            <Icon />
                            {t(label)}
                            <span>{count}</span>
                        </Link>
                    ))}
                </div>
                <TemplateFilterBar key={filters.tab} filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(shown.length)}</b>
                    </span>
                </div>
                <TemplateTable rows={shown} />
                <div className="page-pager">
                    <span>
                        {shown.length > 0
                            ? t('Showing {from}–{to} of {total}', { from: 1, to: shown.length, total: shown.length })
                            : t('Showing 0 of 0')}
                    </span>
                </div>
            </div>
        </div>
    );
}
