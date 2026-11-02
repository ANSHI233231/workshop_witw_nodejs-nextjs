'use client';

import { createContext, useContext } from 'react';

import { BASE_LANGUAGE, DEFAULT_LOCALE, type Locale, type PublishedLanguage } from '@/lib/i18n/locale';

export type AppLanguageChoice = {
    readonly locale: Locale;
    readonly languages: readonly PublishedLanguage[];
};

export const LanguageContext = createContext<AppLanguageChoice>({ locale: DEFAULT_LOCALE, languages: [BASE_LANGUAGE] });

export const useLanguages = (): AppLanguageChoice => useContext(LanguageContext);
