import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { ConsoleSafari, HostOption, SafariFilters } from '@/types/shared-safari.types';

import { SafariFilterBar } from './safari-filter-bar';
import { SafariRows } from './safari-rows';
import { SHARED_SAFARIS_PATH, safariListParams } from './shared-safari-url';

export async function SafariList({
    filters,
    hosts,
    result,
}: {
    readonly filters: SafariFilters;
    readonly hosts: readonly HostOption[];
    readonly result: Paginated<ConsoleSafari>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Shared Safari')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Shared Safaris')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Shared Safaris')}</h1>
                </div>
            </div>
            <div className="table-card">
                <SafariFilterBar filters={filters} hosts={hosts} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <SafariRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={SHARED_SAFARIS_PATH}
                    params={safariListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
