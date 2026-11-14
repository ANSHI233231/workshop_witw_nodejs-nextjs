'use client';

import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';

const INVALID = '[aria-invalid="true"], .is-invalid, .error';

const FOCUSABLE = [
    'input:not([type="hidden"]):not([hidden]):not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

const focusTargetOf = (invalid: HTMLElement): HTMLElement | null =>
    invalid.matches(FOCUSABLE) ? invalid : invalid.querySelector<HTMLElement>(FOCUSABLE);

const reveal = (root: HTMLElement): void => {
    const invalid = root.querySelector<HTMLElement>(INVALID);
    if (!invalid) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    invalid.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    focusTargetOf(invalid)?.focus({ preventScroll: true });
};

export function useRevealFirstError<T extends HTMLElement = HTMLDivElement>(): {
    readonly formRef: RefObject<T | null>;
    readonly revealFirstError: () => void;
} {
    const formRef = useRef<T | null>(null);
    const [request, setRequest] = useState(0);

    useLayoutEffect(() => {
        if (request === 0) return;
        reveal(formRef.current ?? document.body);
    }, [request]);

    const revealFirstError = useCallback(() => setRequest((count) => count + 1), []);

    return { formRef, revealFirstError };
}
