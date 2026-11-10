import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { Park, ParkFilters } from '@/types/park.types';

import { ParkAddButton } from './park-add-button';
import { ParkFilterBar } from './park-filter-bar';
import { ParkRows } from './park-rows';
import { PARKS_PATH, parkListParams } from './park-url';

export async function ParkList({
    filters,
    result,
}: {
    readonly filters: ParkFilters;
    readonly result: Paginated<Park>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Shared Safari')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Parks')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Parks')}</h1>
                    <div className="actions">
                        <ParkAddButton />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <ParkFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <ParkRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={PARKS_PATH}
                    params={parkListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
