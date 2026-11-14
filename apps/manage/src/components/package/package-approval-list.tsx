'use client';

import { useRouter } from 'next/navigation';

import { ListFilterBar } from '@/components/package/list-filter-bar';
import { PackageApprovalRows } from '@/components/package/package-approval-rows';
import { approvalListUrl, PACKAGE_APPROVALS_PATH } from '@/components/package/package-url';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import type { Paginated } from '@/types/api.types';
import { type ApprovalFilters, type ApprovalItem, PACKAGE_LIMITS } from '@/types/package.types';

export function PackageApprovalList({
    filters,
    result,
}: {
    readonly filters: ApprovalFilters;
    readonly result: Paginated<ApprovalItem>;
}) {
    const t = useT();
    const router = useRouter();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Packages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Package Approvals')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Package Approvals')}</h1>
                </div>
            </div>
            <div className="table-card">
                <ListFilterBar
                    placeholder={t('Package or partner')}
                    search={filters.search}
                    maxLength={PACKAGE_LIMITS.SEARCH}
                    selects={[]}
                    filtered={filters.search !== ''}
                    onSearch={(search) => router.replace(approvalListUrl({ search, page: 1 }))}
                    onClear={() => router.push(PACKAGE_APPROVALS_PATH)}
                />
                <div className="table-top">
                    <span className="table-total">
                        {t('Waiting for approval:')} <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <PackageApprovalRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={PACKAGE_APPROVALS_PATH}
                    params={{ search: filters.search }}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
