'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { logger } from '@/lib/logger';
import { getMyProfile } from '@/services/profile.service';

const log = logger.category('profile');

type MyPhotoValue = {
    readonly userId: number;
    readonly photoVersion: string | null;
    readonly setPhotoVersion: (photoVersion: string | null) => void;
};

const MyPhotoContext = createContext<MyPhotoValue>({ userId: 0, photoVersion: null, setPhotoVersion: () => undefined });

export const useMyPhoto = (): MyPhotoValue => useContext(MyPhotoContext);

export function MyPhotoProvider({ userId, children }: { readonly userId: number | null; readonly children: ReactNode }) {
    const [photoVersion, setPhotoVersion] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) return;
        getMyProfile()
            .then((profile) => setPhotoVersion(profile.photoVersion))
            .catch((error: unknown) => log.error('Your profile picture could not be loaded.', { error }));
    }, [userId]);

    const value = useMemo(() => ({ userId: userId ?? 0, photoVersion, setPhotoVersion }), [userId, photoVersion]);

    return <MyPhotoContext.Provider value={value}>{children}</MyPhotoContext.Provider>;
}
