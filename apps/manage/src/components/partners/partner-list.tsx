import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import { PARTNER_STATUSES, type ParkOption, type Partner, type PartnerFilters } from '@/types/partner.types';

import { PartnerFilterBar } from './partner-filter-bar';
import { PartnerRows } from './partner-rows';
import { PARTNERS_PATH, partnerListParams } from './partner-url';

export async function PartnerList({
    filters,
    result,
    parks,
}: {
    readonly filters: PartnerFilters;
    readonly result: Paginated<Partner>;
    readonly parks: readonly ParkOption[];
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partners')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Partners')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Partners')}</h1>
                </div>
            </div>
            <div className="table-card">
                <PartnerFilterBar path={PARTNERS_PATH} filters={filters} statuses={PARTNER_STATUSES} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <PartnerRows rows={result.items} parks={parks} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={PARTNERS_PATH}
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
