'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { confirmSession } from '@/services/auth.service';
import { watchSessionUser } from '@/services/session-user';

export const useSessionWatch = (userId: number): void => {
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const location = `${pathname}?${search}`;
    const checkedLocation = useRef(location);

    useEffect(() => watchSessionUser(userId), [userId]);

    useEffect(() => {
        if (checkedLocation.current === location) return;
        checkedLocation.current = location;
        void confirmSession();
    }, [location]);
};
