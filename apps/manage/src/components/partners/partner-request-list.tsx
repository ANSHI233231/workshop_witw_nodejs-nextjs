import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import { type Partner, type PartnerFilters, REQUEST_STATUSES } from '@/types/partner.types';

import { PartnerFilterBar } from './partner-filter-bar';
import { PartnerRequestRows } from './partner-request-rows';
import { PARTNER_REQUESTS_PATH, partnerListParams } from './partner-url';

export async function PartnerRequestList({
    filters,
    result,
}: {
    readonly filters: PartnerFilters;
    readonly result: Paginated<Partner>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partners')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Partner Requests')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Partner Requests')}</h1>
                </div>
            </div>
            <div className="table-card">
                <PartnerFilterBar path={PARTNER_REQUESTS_PATH} filters={filters} statuses={REQUEST_STATUSES} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <PartnerRequestRows rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={PARTNER_REQUESTS_PATH}
                    params={partnerListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
