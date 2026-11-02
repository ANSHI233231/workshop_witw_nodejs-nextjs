import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppLogFilterBar } from '@/components/app-log/app-log-filter-bar';
import {
    appLogParams,
    appLogUrl,
    ERROR_LOGS_PATH,
    LEVEL_OPTIONS,
    SOURCE_OPTIONS,
} from '@/components/app-log/app-log-labels';
import { AppLogTable } from '@/components/app-log/app-log-table';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { requireConsoleArea } from '@/lib/console-session';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam, singleParam } from '@/lib/search-params';
import { listAppLogs } from '@/services/app-log.service';
import { APP_LOG_LIMITS, type AppLogFilters } from '@/types/app-log.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Error Logs') });

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dayParam = (value: string | string[] | undefined): string | undefined => {
    const day = singleParam(value);
    return DAY_PATTERN.test(day) && !Number.isNaN(Date.parse(day)) ? day : undefined;
};

const toFilters = (params: PageSearchParams): AppLogFilters => {
    const from = dayParam(params['from']);
    const to = dayParam(params['to']);
    return {
        search: searchParam(params['search'], APP_LOG_LIMITS.SEARCH),
        app: codeParam(params['app'], SOURCE_OPTIONS),
        level: codeParam(params['level'], LEVEL_OPTIONS),
        from,
        to: from && to && to < from ? undefined : to,
        page: pageParam(params['page']),
    };
};

export default async function ErrorLogsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const { t } = await serverTranslator();
    const filters = toFilters(await searchParams);
    const result = await listAppLogs(filters, (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(appLogUrl({ ...filters, page: result.meta.totalPages }));
    }
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Logs')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Error Logs')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Error Logs')}</h1>
                </div>
            </div>
            <div className="table-card">
                <AppLogFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items:')} <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <AppLogTable rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={ERROR_LOGS_PATH}
                    params={appLogParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
