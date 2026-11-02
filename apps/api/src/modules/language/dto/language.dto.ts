import type { AppTranslationStatusCode, LanguageSite, LanguageStatusCode } from '../types/language.types';

export type LanguageDto = {
    readonly code: string;
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
    readonly shownIn: readonly LanguageSite[];
    readonly defaultFor: readonly LanguageSite[];
    readonly status: LanguageStatusCode;
};

export type LanguageInput = {
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
    readonly shownIn: readonly LanguageSite[];
    readonly defaultFor: readonly LanguageSite[];
};

export type NewLanguage = LanguageInput & { readonly code: string };

export type LanguageFilters = {
    readonly search: string | undefined;
    readonly status: LanguageStatusCode | undefined;
};

export type LanguagePage = {
    readonly items: readonly LanguageDto[];
    readonly total: number;
};

export type TranslatedTexts = Readonly<Record<string, string>>;

export type AppTranslationDto = {
    readonly id: number;
    readonly enText: string;
    readonly texts: TranslatedTexts;
    readonly status: AppTranslationStatusCode;
    readonly updatedAt: string;
};

export type AppTranslationInput = {
    readonly enText: string;
    readonly texts: TranslatedTexts;
};

export type AppTranslationFilters = {
    readonly search: string | undefined;
    readonly status: AppTranslationStatusCode | undefined;
    readonly missing: string | undefined;
};

export type AppTranslationPage = {
    readonly items: readonly AppTranslationDto[];
    readonly total: number;
};

export type LastPublishDto = {
    readonly publishedAt: string | null;
};

export type AppTranslationExportRow = {
    readonly enText: string;
    readonly texts: TranslatedTexts;
};

export type AppTranslationLanguageDto = {
    readonly code: string;
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
};

export type AppTranslationUploadRefusal = {
    readonly row: number;
    readonly message: string;
};

export type AppTranslationUploadResult = {
    readonly added: number;
    readonly updated: number;
    readonly unchanged: number;
    readonly refused: readonly AppTranslationUploadRefusal[];
};

export type PublishResult = {
    readonly publishedAt: string;
    readonly entries: number;
    readonly files: readonly string[];
};

export type ActiveLanguageDto = {
    readonly code: string;
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
};

export type ColumnTranslations = Readonly<Record<string, string>>;

export type DataTranslationValues = Readonly<Record<string, ColumnTranslations>>;

export type DataTranslationTarget = {
    readonly table: string;
    readonly idKey?: string;
    readonly columns: readonly string[];
};

export type DataTranslationEdit = {
    readonly translations: DataTranslationValues;
    readonly languages: readonly ActiveLanguageDto[];
};

export type DataTranslationChange = { readonly from: string | null; readonly to: string | null };

export type DataTranslationChanges = Readonly<Record<string, DataTranslationChange>>;

export type TranslatableColumns = Readonly<Record<string, number>>;

export type DataTranslationImport = {
    readonly table: string;
    readonly entityId: number;
    readonly column: string;
    readonly languageCode: string;
    readonly text: string;
};

export type ColumnCopy = {
    readonly table: string;
    readonly sourceColumn: string;
    readonly column: string;
    readonly languageCode: string;
};

export type ColumnCopyResult = {
    readonly table: string;
    readonly sourceColumn: string;
    readonly rows: number;
    readonly skipped: boolean;
};
