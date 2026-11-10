'use client';

import { useSyncExternalStore } from 'react';

const PHONE_QUERY = '(max-width: 767px)';

const subscribe = (onChange: () => void): (() => void) => {
    const query = window.matchMedia(PHONE_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
};

export const useIsPhone = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => window.matchMedia(PHONE_QUERY).matches,
        () => false,
    );
