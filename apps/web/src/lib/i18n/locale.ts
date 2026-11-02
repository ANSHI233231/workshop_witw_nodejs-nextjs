export const LOCALE_COOKIE = 'locale';

export type Locale = string;

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_PATTERN = /^[a-z]{2,3}$/;

export type PublishedLanguage = {
    readonly code: Locale;
    readonly nativeName: string;
    readonly shortName: string;
};

export const BASE_LANGUAGE: PublishedLanguage = { code: DEFAULT_LOCALE, nativeName: 'English', shortName: 'EN' };

export type Dictionary = Readonly<Record<string, string>>;

export type TextValues = Readonly<Record<string, string | number>>;

export type Translate = (text: string, values?: TextValues) => string;

const SLOT = /\{(\w+)\}/g;

const fill = (text: string, values: TextValues | undefined): string =>
    values ? text.replace(SLOT, (slot, name: string) => (name in values ? String(values[name]) : slot)) : text;

export const translate = (dictionary: Dictionary, text: string, values?: TextValues): string =>
    fill(dictionary[text.trim().toLowerCase()] ?? text, values);
