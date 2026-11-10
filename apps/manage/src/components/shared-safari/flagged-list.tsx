import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { FlaggedComment, FlaggedFilters } from '@/types/shared-safari.types';

import { FlaggedFilterBar } from './flagged-filter-bar';
import { FlaggedRows } from './flagged-rows';
import { FLAGGED_COMMENTS_PATH, flaggedListParams } from './shared-safari-url';

export async function FlaggedList({
    filters,
    result,
}: {
    readonly filters: FlaggedFilters;
    readonly result: Paginated<FlaggedComment>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Shared Safari')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Flagged Comments')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Flagged Comments')}</h1>
                </div>
            </div>
            <div className="table-card">
                <FlaggedFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <FlaggedRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={FLAGGED_COMMENTS_PATH}
                    params={flaggedListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
