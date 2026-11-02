'use client';

import { useEffect } from 'react';

const PHONE_FRAME_CLASS = 'mdr-mob';

const DRAWER_OPEN_CLASS = 'mdr-on';

export function useDrawerTools(drawerOpen: boolean): void {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add(PHONE_FRAME_CLASS);
        return () => root.classList.remove(PHONE_FRAME_CLASS);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle(DRAWER_OPEN_CLASS, drawerOpen);
        return () => root.classList.remove(DRAWER_OPEN_CLASS);
    }, [drawerOpen]);
}
