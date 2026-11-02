'use client';

import { useEffect } from 'react';

const POPUPS = '.overlay, [aria-modal="true"], [role="dialog"], .modal-backdrop, .drawer-overlay';

const LOCK_CLASS = 'mf-lock';

const MIN_SIZE = 2;

const isShown = (element: Element): boolean => {
    const box = element.getBoundingClientRect();
    if (box.width < MIN_SIZE || box.height < MIN_SIZE) return false;
    const style = getComputedStyle(element);
    return style.visibility !== 'hidden' && style.display !== 'none' && Number.parseFloat(style.opacity) > 0;
};

export function usePopupPageLock(): void {
    useEffect(() => {
        const root = document.documentElement;
        const update = () => {
            const open = Array.from(document.querySelectorAll(POPUPS)).some(isShown);
            root.classList.toggle(LOCK_CLASS, open);
        };
        const observer = new MutationObserver(update);
        observer.observe(document.body, { childList: true, subtree: true });
        update();
        return () => {
            observer.disconnect();
            root.classList.remove(LOCK_CLASS);
        };
    }, []);
}
