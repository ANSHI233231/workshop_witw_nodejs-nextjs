import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { QuoteRequest, QuoteRequestFilters } from '@/types/quote-request.types';

import { QuoteRequestFilterBar } from './quote-request-filter-bar';
import { QuoteRequestRows } from './quote-request-rows';
import { QUOTE_REQUESTS_PATH, quoteRequestListParams } from './quote-request-url';

export async function QuoteRequestList({
    filters,
    result,
}: {
    readonly filters: QuoteRequestFilters;
    readonly result: Paginated<QuoteRequest>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partners')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Quote Requests')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Quote Requests')}</h1>
                </div>
            </div>
            <div className="table-card">
                <QuoteRequestFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <QuoteRequestRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={QUOTE_REQUESTS_PATH}
                    params={quoteRequestListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
