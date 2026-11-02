import type { AppTranslationDto, LanguageDto, TranslatedTexts } from '../dto/language.dto';
import {
    type AppTranslationLanguage,
    type AppTranslationRow,
    LANGUAGE_SITES,
    type LanguageRecord,
    type LanguageSite,
    type LanguageSiteRow,
    SITE_CODE_OF,
} from '../types/language.types';

const sitesWhere = (sites: readonly LanguageSiteRow[], keep: (site: LanguageSiteRow) => boolean): LanguageSite[] =>
    LANGUAGE_SITES.filter((site) => sites.some((row) => Number(row.site) === SITE_CODE_OF[site] && keep(row)));

export const toLanguage = ({ row, sites }: LanguageRecord): LanguageDto => ({
    code: row.code,
    name: row.name,
    nativeName: row.native_name,
    shortName: row.short_name,
    shownIn: sitesWhere(sites, () => true),
    defaultFor: sitesWhere(sites, (site) => Number(site.is_default) === 1),
    status: row.status,
});

export const appTranslationTextOf = (row: AppTranslationRow, language: AppTranslationLanguage): string => {
    const text: unknown = row[language.column];
    return typeof text === 'string' ? text : '';
};

export const appTranslationTextsOf = (
    row: AppTranslationRow,
    languages: readonly AppTranslationLanguage[],
): TranslatedTexts =>
    Object.fromEntries(languages.map((language) => [language.code, appTranslationTextOf(row, language)]));

export const toAppTranslation = (
    row: AppTranslationRow,
    languages: readonly AppTranslationLanguage[],
): AppTranslationDto => ({
    id: row.id,
    enText: row.en_text,
    texts: appTranslationTextsOf(row, languages),
    status: row.status,
    updatedAt: row.updated_at.toISOString(),
});
