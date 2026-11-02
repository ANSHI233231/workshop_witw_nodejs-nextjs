import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { Language, LanguageFilters } from '@/types/language.types';

import { LanguageAddButton } from './language-add-button';
import { LanguageFilterBar } from './language-filter-bar';
import { LanguageTable } from './language-table';
import { LANGUAGE_MASTER_PATH, languageListParams } from './language-url';

export async function LanguageList({
    filters,
    result,
}: {
    readonly filters: LanguageFilters;
    readonly result: Paginated<Language>;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Languages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Language Master')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Language Master')}</h1>
                    <div className="actions">
                        <LanguageAddButton />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <LanguageFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <LanguageTable rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={LANGUAGE_MASTER_PATH}
                    params={languageListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
