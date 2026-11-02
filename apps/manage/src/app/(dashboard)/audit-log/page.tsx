import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { OUTCOME_OPTIONS } from '@/components/audit/audit-labels';
import { AuditLogList } from '@/components/audit/audit-log-list';
import { auditLogUrl } from '@/components/audit/audit-log-url';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, idParam, type PageSearchParams, pageParam, searchParam, singleParam } from '@/lib/search-params';
import { getAuditOptions, getAuditSummary, listAuditLogs } from '@/services/audit.service';
import { AUDIT_LOG_LIMITS, type AuditLogFilters } from '@/types/audit.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Audit Log') });

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dayParam = (value: string | string[] | undefined): string | undefined => {
    const day = singleParam(value);
    return DAY_PATTERN.test(day) && !Number.isNaN(Date.parse(day)) ? day : undefined;
};

const toFilters = (params: PageSearchParams): AuditLogFilters => {
    const from = dayParam(params['from']);
    const to = dayParam(params['to']);
    return {
        search: searchParam(params['search'], AUDIT_LOG_LIMITS.SEARCH),
        module: idParam(params['module']),
        action: idParam(params['action']),
        outcome: codeParam(params['outcome'], OUTCOME_OPTIONS),
        clientApp: idParam(params['app']),
        from,
        to: from && to && to < from ? undefined : to,
        page: pageParam(params['page']),
    };
};

export default async function AuditLogPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const filters = toFilters(await searchParams);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, summary, options] = await Promise.all([
        listAuditLogs(filters, accessToken),
        getAuditSummary(filters, accessToken),
        getAuditOptions(accessToken),
    ]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(auditLogUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <AuditLogList filters={filters} result={result} summary={summary} options={options} />;
}
