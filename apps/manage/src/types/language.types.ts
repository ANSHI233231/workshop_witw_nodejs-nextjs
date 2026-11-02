export const LanguageStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type LanguageStatusCode = (typeof LanguageStatus)[keyof typeof LanguageStatus];

export const AppTranslationStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type AppTranslationStatusCode = (typeof AppTranslationStatus)[keyof typeof AppTranslationStatus];

export const LANGUAGE_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 100,
    NATIVE_NAME_MAX: 100,
    SHORT_NAME_MAX: 10,
    SEARCH: 100,
} as const;

export const BASE_LANGUAGE_CODE = 'en';

export const LANGUAGE_CODE_PATTERN = /^[a-z]{2}$/;

export const APP_TRANSLATION_LIMITS = { TEXT_MAX: 500, SEARCH: 100 } as const;

export const APP_TRANSLATION_UPLOAD_LIMITS = { MAX_BYTES: 2 * 1024 * 1024 } as const;

export const APP_TRANSLATION_CSV_HEADERS = { ENGLISH: 'English Text', LANGUAGE_SUFFIX: ' Text' } as const;

export const LANGUAGE_SITES = ['manage', 'web', 'web-website'] as const;

export type LanguageSite = (typeof LANGUAGE_SITES)[number];

export const LANGUAGE_SITE_LABEL: Readonly<Record<LanguageSite, string>> = {
    manage: 'Manage',
    web: 'Web Portal',
    'web-website': 'Web Website',
};

export type Language = {
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
    readonly search: string;
    readonly status: LanguageStatusCode | undefined;
    readonly page: number;
};

export type AppTranslation = {
    readonly id: number;
    readonly enText: string;
    readonly texts: TranslatedTexts;
    readonly status: AppTranslationStatusCode;
    readonly updatedAt: string;
};

export type TranslatedTexts = Readonly<Record<string, string>>;

export type AppTranslationInput = {
    readonly enText: string;
    readonly texts: TranslatedTexts;
};

export type AppTranslationLanguage = {
    readonly code: string;
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
};

export type AppTranslationFilters = {
    readonly search: string;
    readonly status: AppTranslationStatusCode | undefined;
    readonly missing: string | undefined;
    readonly page: number;
};

export type AppTranslationExportRow = {
    readonly enText: string;
    readonly texts: TranslatedTexts;
};

export type AppTranslationUploadResult = {
    readonly added: number;
    readonly updated: number;
    readonly unchanged: number;
    readonly refused: readonly { readonly row: number; readonly message: string }[];
};

export type LastPublish = { readonly publishedAt: string | null };

export type PublishResult = {
    readonly publishedAt: string;
    readonly entries: number;
    readonly files: readonly string[];
};
