import type { RowDataPacket } from '../../../database/connection';

export const LanguageStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type LanguageStatusCode = (typeof LanguageStatus)[keyof typeof LanguageStatus];

export const AppTranslationStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type AppTranslationStatusCode = (typeof AppTranslationStatus)[keyof typeof AppTranslationStatus];

export const APP_TRANSLATION_DELETED = -1;

export const DataTranslationStatus = { ACTIVE: 1, DELETED: -1 } as const;

export const BASE_LANGUAGE_CODE = 'en';

export const LANGUAGE_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 100,
    NATIVE_NAME_MAX: 100,
    SHORT_NAME_MAX: 10,
    SEARCH: 100,
} as const;

export const LANGUAGE_CODE_PATTERN = /^[a-z]{2}$/;

export const APP_TRANSLATION_LIMITS = { TEXT_MAX: 500, SEARCH: 100 } as const;

export const DATA_TRANSLATION_LIMITS = { TEXT_MAX: 2000 } as const;

export const APP_TRANSLATION_UPLOAD_LIMITS = { MAX_BYTES: 2 * 1024 * 1024, MAX_ROWS: 5000 } as const;

export const APP_TRANSLATION_CSV_HEADERS = { ENGLISH: 'English Text', LANGUAGE_SUFFIX: ' Text' } as const;

export const APP_TRANSLATION_ENGLISH_COLUMN = 'en_text';

export const APP_TRANSLATION_TEXT_COLUMN = /^([a-z]{2,3})_text$/;

export const appTranslationColumnOf = (code: string): string => `${code}_text`;

export const LANGUAGE_SITES = ['manage', 'web', 'web-website'] as const;

export type LanguageSite = (typeof LANGUAGE_SITES)[number];

export const LanguageSiteCode = {
    MANAGE: 1,
    WEB_PORTAL: 2,
    WEB_WEBSITE: 3,
} as const;

export type LanguageSiteCodeValue = (typeof LanguageSiteCode)[keyof typeof LanguageSiteCode];

export const SITE_CODE_OF: Readonly<Record<LanguageSite, LanguageSiteCodeValue>> = {
    manage: LanguageSiteCode.MANAGE,
    web: LanguageSiteCode.WEB_PORTAL,
    'web-website': LanguageSiteCode.WEB_WEBSITE,
};

export const siteOfCode = (code: number): LanguageSite | undefined =>
    LANGUAGE_SITES.find((site) => SITE_CODE_OF[site] === code);

export const LanguageSiteStatus = { SHOWN: 1, HIDDEN: -1 } as const;

export const WEBSITE_OF_APP: Readonly<Record<string, LanguageSite>> = {
    web: 'web-website',
};

export const LANGUAGES_FILE = 'languages.json';

export const appTranslationKeyOf = (englishText: string): string => englishText.trim().toLowerCase();

export interface LanguageRow extends RowDataPacket {
    code: string;
    name: string;
    native_name: string;
    short_name: string;
    status: LanguageStatusCode;
}

export interface LanguageSiteRow extends RowDataPacket {
    master_language_code: string;
    site: number;
    is_default: number;
}

export type LanguageRecord = {
    readonly row: LanguageRow;
    readonly sites: readonly LanguageSiteRow[];
};

export interface AppTranslationRow extends RowDataPacket {
    id: number;
    en_text: string;
    status: AppTranslationStatusCode;
    updated_at: Date;
}

export interface ColumnNameRow extends RowDataPacket {
    column_name: string;
}

export type AppTranslationLanguage = {
    readonly code: string;
    readonly name: string;
    readonly nativeName: string;
    readonly shortName: string;
    readonly column: string;
};

export interface DataTranslationRow extends RowDataPacket {
    entity_table: string;
    entity_id: number;
    entity_column: string;
    master_language_code: string;
    translated_text: string;
}

export interface CountRow extends RowDataPacket {
    total: number;
}

