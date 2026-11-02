'use client';

import { useEffect, useState } from 'react';

const CELLS = '.table-scroll td';

const OWN_TITLE = 'data-cut-title';

const LONG_PRESS_MS = 500;

const MOVE_TOLERANCE = 10;

type Hint = { readonly text: string; readonly top: number };

const cellText = (cell: HTMLElement): string => (cell.textContent ?? '').replace(/\s+/g, ' ').trim();

const isCut = (cell: HTMLElement): boolean => cell.scrollWidth > cell.clientWidth + 1;

const cellAt = (target: EventTarget | null): HTMLElement | null =>
    target instanceof Element ? target.closest<HTMLElement>(CELLS) : null;

const showTitleIfCut = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const cell = cellAt(event.target);
    if (!cell) return;
    const ours = cell.hasAttribute(OWN_TITLE);
    if (cell.hasAttribute('title') && !ours) return;
    const text = cellText(cell);
    if (text && isCut(cell)) {
        if (cell.getAttribute('title') !== text) cell.setAttribute('title', text);
        if (!ours) cell.setAttribute(OWN_TITLE, '');
    } else if (ours) {
        cell.removeAttribute('title');
        cell.removeAttribute(OWN_TITLE);
    }
};

export function CutCellText() {
    const [hint, setHint] = useState<Hint | null>(null);

    useEffect(() => {
        document.addEventListener('pointerover', showTitleIfCut, true);
        return () => document.removeEventListener('pointerover', showTitleIfCut, true);
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let start: { x: number; y: number } | null = null;
        const cancel = () => {
            clearTimeout(timer);
            start = null;
        };
        const onDown = (event: PointerEvent) => {
            setHint(null);
            cancel();
            if (event.pointerType !== 'touch') return;
            const cell = cellAt(event.target);
            if (!cell || !isCut(cell)) return;
            start = { x: event.clientX, y: event.clientY };
            timer = setTimeout(() => {
                const box = cell.getBoundingClientRect();
                setHint({ text: cellText(cell), top: box.bottom + 4 });
            }, LONG_PRESS_MS);
        };
        const onMove = (event: PointerEvent) => {
            if (!start) return;
            if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE) cancel();
        };
        const hide = () => {
            cancel();
            setHint(null);
        };
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('pointermove', onMove, true);
        document.addEventListener('pointerup', cancel, true);
        document.addEventListener('pointercancel', cancel, true);
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);
        return () => {
            cancel();
            document.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointermove', onMove, true);
            document.removeEventListener('pointerup', cancel, true);
            document.removeEventListener('pointercancel', cancel, true);
            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
        };
    }, []);

    if (!hint) return null;
    return (
        <div className="cut-hint" role="tooltip" style={{ top: hint.top }}>
            {hint.text}
        </div>
    );
}
