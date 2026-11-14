import { DEFAULT_LOCALE, type PublishedLanguage } from './locale';

export type TranslationValues = Readonly<Record<string, Readonly<Record<string, string>>>>;

export const translationFieldOf = (code: string, column: string): string => `translations.${code}.${column}`;

export const translatedLanguagesOf = (languages: readonly PublishedLanguage[]): PublishedLanguage[] =>
    languages.filter((language) => language.code !== DEFAULT_LOCALE);

export const withTranslation = (
    values: TranslationValues,
    code: string,
    column: string,
    text: string,
): TranslationValues => ({ ...values, [code]: { ...values[code], [column]: text } });

export const trimmedTranslations = (
    values: TranslationValues,
    languages: readonly PublishedLanguage[],
    columns: readonly string[],
): TranslationValues =>
    Object.fromEntries(
        languages.map((language) => [
            language.code,
            Object.fromEntries(columns.map((column) => [column, (values[language.code]?.[column] ?? '').trim()])),
        ]),
    );
