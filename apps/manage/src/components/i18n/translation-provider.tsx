'use client';

import type { ReactNode } from 'react';

import { LanguageContext } from '@/hooks/i18n/use-languages';
import { DictionaryContext } from '@/hooks/i18n/use-t';
import type { Dictionary, Locale, PublishedLanguage } from '@/lib/i18n/locale';

export function TranslationProvider({
    locale,
    languages,
    dictionary,
    children,
}: {
    readonly locale: Locale;
    readonly languages: readonly PublishedLanguage[];
    readonly dictionary: Dictionary;
    readonly children: ReactNode;
}) {
    return (
        <LanguageContext.Provider value={{ locale, languages }}>
            <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>
        </LanguageContext.Provider>
    );
}
