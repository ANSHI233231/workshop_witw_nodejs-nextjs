import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { FlagReasonFilters, FlagReasonListItem } from '@/types/flag-reason.types';

import { FlagReasonAddButton } from './flag-reason-add-button';
import { FlagReasonFilterBar } from './flag-reason-filter-bar';
import { FlagReasonRows } from './flag-reason-rows';

export async function FlagReasonList({
    filters,
    rows,
}: {
    readonly filters: FlagReasonFilters;
    readonly rows: readonly FlagReasonListItem[];
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Shared Safari')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Flag Reasons')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Flag Reasons')}</h1>
                    <div className="actions">
                        <FlagReasonAddButton />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <FlagReasonFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(rows.length)}</b>
                    </span>
                </div>
                <FlagReasonRows rows={rows} />
            </div>
        </div>
    );
}
