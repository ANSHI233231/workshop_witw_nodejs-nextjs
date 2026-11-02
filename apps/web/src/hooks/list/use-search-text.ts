'use client';

import { useEffect, useEffectEvent, useState } from 'react';

const SEARCH_PAUSE_MS = 400;

export function useSearchText(current: string, onSearch: (search: string) => void) {
    const [text, setShownText] = useState(current);
    const [typed, setTyped] = useState(false);
    const [shown, setShown] = useState(current);
    const [requested, setRequested] = useState(current);

    if (current !== shown) {
        setShown(current);
        if (current !== requested) {
            setRequested(current);
            setShownText(current);
            setTyped(false);
        }
    }

    const search = useEffectEvent((value: string) => {
        setRequested(value);
        setTyped(false);
        onSearch(value);
    });

    useEffect(() => {
        if (!typed) return;
        const value = text.trim();
        if (value === current) return;
        const timer = setTimeout(() => search(value), SEARCH_PAUSE_MS);
        return () => clearTimeout(timer);
    }, [text, current, typed]);

    const setText = (value: string) => {
        setShownText(value);
        setTyped(true);
    };

    const clearText = () => {
        setShownText('');
        setTyped(false);
    };

    return [text, setText, clearText] as const;
}
