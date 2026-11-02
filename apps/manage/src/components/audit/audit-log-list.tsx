import type { ReactNode } from 'react';

import { longDate, rangeLabel, todayInIndia } from '@/components/ui/date-range';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { AuditLogFilters, AuditLogListItem, AuditOptions, AuditSummary } from '@/types/audit.types';

import { AuditLogExport } from './audit-log-export';
import { AuditLogFilterBar } from './audit-log-filter-bar';
import { AuditLogTable } from './audit-log-table';
import { AUDIT_LOG_PATH, auditLogParams } from './audit-log-url';

function KpiIcon({ children }: { readonly children: ReactNode }) {
    return (
        <span className="kpi-ic">
            <svg
                className="icon "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {children}
            </svg>
        </span>
    );
}

function Kpi({
    label,
    value,
    meta,
    icon,
}: {
    readonly label: string;
    readonly value: number;
    readonly meta: string;
    readonly icon: ReactNode;
}) {
    return (
        <div className="card kpi">
            <div className="kpi-top">
                <span className="kpi-label">{label}</span>
                <KpiIcon>{icon}</KpiIcon>
            </div>
            <div className="kpi-value">{formatCount(value)}</div>
            <div className="kpi-meta">{meta}</div>
        </div>
    );
}

export async function AuditLogList({
    filters,
    result,
    summary,
    options,
}: {
    readonly filters: AuditLogFilters;
    readonly result: Paginated<AuditLogListItem>;
    readonly summary: AuditSummary;
    readonly options: AuditOptions;
}) {
    const { t } = await serverTranslator();
    const firstSerial = (filters.page - 1) * result.meta.limit + 1;
    const today = todayInIndia();
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Logs')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Audit Log')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Audit Log')}</h1>
                    <div className="actions">
                        <AuditLogExport filters={filters} />
                    </div>
                </div>
            </div>
            <div className="kpi-row">
                <Kpi
                    label={t('Total Events')}
                    value={summary.total}
                    meta={rangeLabel({ from: filters.from, to: filters.to }, today, t)}
                    icon={
                        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                    }
                />
                <Kpi
                    label={t('Failed')}
                    value={summary.failed}
                    meta={t('Failed sign-ins and actions')}
                    icon={
                        <>
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m15 9-6 6"></path>
                            <path d="m9 9 6 6"></path>
                        </>
                    }
                />
                <Kpi
                    label={t('Sign-in Activity')}
                    value={summary.signIn}
                    meta={t('Across all apps')}
                    icon={
                        <>
                            <path d="m10 17 5-5-5-5"></path>
                            <path d="M15 12H3"></path>
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        </>
                    }
                />
                <Kpi
                    label={t('Today')}
                    value={summary.today}
                    meta={longDate(today)}
                    icon={
                        <>
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </>
                    }
                />
            </div>
            <div className="table-card">
                <AuditLogFilterBar filters={filters} options={options} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items:')} <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <AuditLogTable events={result.items} firstSerial={firstSerial} />
                <TablePager
                    path={AUDIT_LOG_PATH}
                    params={auditLogParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
