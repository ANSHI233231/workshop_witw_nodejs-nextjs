import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { AppTranslation, AppTranslationFilters, AppTranslationLanguage } from '@/types/language.types';

import { TRANSLATIONS_PATH, translationListParams } from './language-url';
import { TranslationActions } from './translation-actions';
import { TranslationFilterBar } from './translation-filter-bar';
import { TranslationTable } from './translation-table';

export async function TranslationList({
    filters,
    result,
    languages,
    lastPublishedAt,
}: {
    readonly filters: AppTranslationFilters;
    readonly result: Paginated<AppTranslation>;
    readonly languages: readonly AppTranslationLanguage[];
    readonly lastPublishedAt: string | null;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Languages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('App Translations')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('App Translations')}</h1>
                    <div className="actions">
                        <TranslationActions languages={languages} lastPublishedAt={lastPublishedAt} />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <TranslationFilterBar filters={filters} languages={languages} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <TranslationTable
                    rows={result.items}
                    languages={languages}
                    firstSerial={(filters.page - 1) * result.meta.limit + 1}
                />
                <TablePager
                    path={TRANSLATIONS_PATH}
                    params={translationListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
