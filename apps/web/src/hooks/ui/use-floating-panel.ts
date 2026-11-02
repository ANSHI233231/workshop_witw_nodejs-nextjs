'use client';

import { type RefObject, useLayoutEffect } from 'react';

const GAP = 4;
const EDGE = 8;
const ROOM_NEEDED_BELOW = 320;

export function useFloatingPanel(
    anchorRef: RefObject<HTMLElement | null>,
    panelRef: RefObject<HTMLElement | null>,
    open: boolean,
    minWidthOf: (anchor: HTMLElement) => number,
): void {
    useLayoutEffect(() => {
        if (!open) return;
        const place = () => {
            const anchor = anchorRef.current;
            const panel = panelRef.current;
            if (!anchor || !panel) return;
            const rect = anchor.getBoundingClientRect();
            const width = Math.min(Math.max(rect.width, minWidthOf(anchor)), window.innerWidth - 2 * EDGE);
            const left = Math.min(Math.max(rect.left, EDGE), window.innerWidth - width - EDGE);
            const roomBelow = window.innerHeight - rect.bottom;
            const upward = roomBelow < ROOM_NEEDED_BELOW && rect.top > roomBelow;
            Object.assign(panel.style, {
                position: 'fixed',
                left: `${left}px`,
                right: 'auto',
                width: `${width}px`,
                minWidth: '0',
                top: upward ? 'auto' : `${rect.bottom + GAP}px`,
                bottom: upward ? `${window.innerHeight - rect.top + GAP}px` : 'auto',
            });
        };
        place();
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    }, [anchorRef, panelRef, open, minWidthOf]);
}
