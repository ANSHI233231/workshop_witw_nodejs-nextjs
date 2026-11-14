'use client';

import { createContext, useCallback, useContext } from 'react';

import { type Dictionary, type TextValues, type Translate, translate } from '@/lib/i18n/locale';

export const DictionaryContext = createContext<Dictionary>({});

export const useT = (): Translate => {
    const dictionary = useContext(DictionaryContext);
    return useCallback((text: string, values?: TextValues) => translate(dictionary, text, values), [dictionary]);
};
