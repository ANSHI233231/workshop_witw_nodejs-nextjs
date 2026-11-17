export type LanguageTestDataRow = { readonly id: number; readonly label: string };

export type LanguageTestDataTable = { readonly table: string; readonly rows: readonly LanguageTestDataRow[] };

export type LanguageTestDataMarker = { readonly textPrefix: string };

export type LanguageTestData = {
    readonly languageCodes: readonly string[];
    readonly appTranslationIds: readonly number[];
    readonly textColumns: readonly string[];
    readonly tables: readonly LanguageTestDataTable[];
};
