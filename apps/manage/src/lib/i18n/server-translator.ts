import 'server-only';

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { z } from 'zod';

import { logger } from '@/lib/logger';

import {
    BASE_LANGUAGE,
    DEFAULT_LOCALE,
    type Dictionary,
    LOCALE_COOKIE,
    LOCALE_PATTERN,
    type Locale,
    type PublishedLanguage,
    type TextValues,
    translate,
} from './locale';

const TRANSLATIONS_FOLDER = 'translations';

const LANGUAGES_FILE = 'languages.json';

const log = logger.category('i18n');

const loaded = new Map<string, { readonly modifiedAt: number; readonly content: unknown }>();

const EMPTY: Dictionary = Object.freeze({});

const publishedLanguagesSchema = z.object({
    defaultLocale: z.string().nullable().catch(null),
    languages: z
        .array(
            z.object({
                code: z.string().regex(LOCALE_PATTERN),
                nativeName: z.string(),
                shortName: z.string().min(1),
            }),
        )
        .catch([]),
});

type AppLanguages = {
    readonly defaultLocale: Locale;
    readonly languages: readonly PublishedLanguage[];
};

const readPublished = async (fileName: string): Promise<unknown> => {
    const filePath = path.join(process.cwd(), TRANSLATIONS_FOLDER, fileName);
    try {
        const modifiedAt = (await stat(filePath)).mtimeMs;
        const known = loaded.get(fileName);
        if (known && known.modifiedAt === modifiedAt) return known.content;
        const content: unknown = JSON.parse(await readFile(filePath, 'utf8'));
        loaded.set(fileName, { modifiedAt, content });
        return content;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
            log.warn('Translations could not be read', { error, fileName });
        loaded.delete(fileName);
        return undefined;
    }
};

const appLanguages = cache(async (): Promise<AppLanguages> => {
    const published = publishedLanguagesSchema.safeParse(await readPublished(LANGUAGES_FILE));
    const languages =
        published.success && published.data.languages.length > 0 ? published.data.languages : [BASE_LANGUAGE];
    const codes = languages.map((language) => language.code);
    const chosenDefault = published.success ? published.data.defaultLocale : null;
    const defaultLocale = chosenDefault && codes.includes(chosenDefault) ? chosenDefault : (codes[0] ?? DEFAULT_LOCALE);
    return { defaultLocale, languages };
});

const readDictionary = async (locale: Locale): Promise<Dictionary> => {
    if (locale === DEFAULT_LOCALE) return EMPTY;
    const dictionary = await readPublished(`${locale}.json`);
    return dictionary && typeof dictionary === 'object' ? (dictionary as Dictionary) : EMPTY;
};

export const currentLocale = cache(async (): Promise<Locale> => {
    const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
    const { defaultLocale, languages } = await appLanguages();
    return languages.some((language) => language.code === chosen) && chosen ? chosen : defaultLocale;
});

export const serverTranslator = cache(async () => {
    const [locale, { languages }] = await Promise.all([currentLocale(), appLanguages()]);
    const dictionary = await readDictionary(locale);
    return {
        locale,
        languages,
        dictionary,
        t: (text: string, values?: TextValues): string => translate(dictionary, text, values),
    };
});
