'use client';

import { type CSSProperties, useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';

import { ArrowUpIcon } from './safari-icons';

const SHOW_AFTER_PX = 300;

const DOCK_STYLE: CSSProperties = { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 'var(--z-dropdown)' };

export function BackToTop() {
    const t = useT();
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const update = () => setShown(window.scrollY > SHOW_AFTER_PX);
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, []);

    if (!shown) return null;
    return (
        <div style={DOCK_STYLE}>
            <button
                type="button"
                className="wb-fab"
                aria-label={t('Back to top')}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <ArrowUpIcon />
            </button>
        </div>
    );
}
