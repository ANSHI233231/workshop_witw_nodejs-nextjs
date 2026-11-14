'use client';

import { useRouter } from 'next/navigation';

import { ListFilterBar } from '@/components/package/list-filter-bar';
import { PackageRows } from '@/components/package/package-rows';
import { packageListUrl, PACKAGES_PATH } from '@/components/package/package-url';
import { WEBSITE_STATUS_BADGE } from '@/components/package-editor/package-labels';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import type { Paginated } from '@/types/api.types';
import {
    CONSOLE_WEBSITE_STATUSES,
    PACKAGE_LIMITS,
    type PackageListFilters,
    type PackageListItem,
} from '@/types/package.types';

export function PackageList({
    filters,
    result,
    partners,
}: {
    readonly filters: PackageListFilters;
    readonly result: Paginated<PackageListItem>;
    readonly partners: readonly { readonly id: number; readonly businessName: string }[];
}) {
    const t = useT();
    const router = useRouter();
    const go = (patch: Partial<PackageListFilters>) => router.push(packageListUrl({ ...filters, ...patch, page: 1 }));
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Packages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Packages')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Packages')}</h1>
                </div>
            </div>
            <div className="table-card">
                <ListFilterBar
                    placeholder={t('Package name')}
                    search={filters.search}
                    maxLength={PACKAGE_LIMITS.SEARCH}
                    selects={[
                        {
                            label: t('Partner'),
                            allLabel: t('Partner: All'),
                            value: filters.partnerId === undefined ? '' : String(filters.partnerId),
                            options: partners.map((partner) => ({
                                value: String(partner.id),
                                label: partner.businessName,
                            })),
                            onChange: (value, search) =>
                                router.push(
                                    packageListUrl({
                                        ...filters,
                                        search,
                                        partnerId: value ? Number(value) : undefined,
                                        page: 1,
                                    }),
                                ),
                        },
                        {
                            label: t('Website status'),
                            allLabel: t('Website status: All'),
                            value: filters.websiteStatus === undefined ? '' : String(filters.websiteStatus),
                            options: CONSOLE_WEBSITE_STATUSES.map((code) => ({
                                value: String(code),
                                label: t(WEBSITE_STATUS_BADGE[code].label),
                            })),
                            onChange: (value, search) =>
                                router.push(
                                    packageListUrl({
                                        ...filters,
                                        search,
                                        websiteStatus: CONSOLE_WEBSITE_STATUSES.find((code) => String(code) === value),
                                        page: 1,
                                    }),
                                ),
                        },
                    ]}
                    filtered={
                        filters.search !== '' || filters.partnerId !== undefined || filters.websiteStatus !== undefined
                    }
                    onSearch={(search) => go({ search })}
                    onClear={() => router.push(PACKAGES_PATH)}
                />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items:')} <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <PackageRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={PACKAGES_PATH}
                    params={{
                        search: filters.search,
                        websiteStatus: filters.websiteStatus,
                        partnerId: filters.partnerId,
                    }}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
