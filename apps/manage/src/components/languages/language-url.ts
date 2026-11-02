import { listUrl } from '@/lib/list-url';
import type { LanguageFilters, AppTranslationFilters } from '@/types/language.types';

export const LANGUAGE_MASTER_PATH = '/languages/master';

export const TRANSLATIONS_PATH = '/languages/translations';

export const languageListParams = (filters: LanguageFilters) => ({
    search: filters.search,
    status: filters.status,
});

export const languageUrl = (filters: LanguageFilters): string =>
    listUrl(LANGUAGE_MASTER_PATH, { ...languageListParams(filters), page: filters.page });

export const translationListParams = (filters: AppTranslationFilters) => ({
    search: filters.search,
    status: filters.status,
    missing: filters.missing,
});

export const translationUrl = (filters: AppTranslationFilters): string =>
    listUrl(TRANSLATIONS_PATH, { ...translationListParams(filters), page: filters.page });
