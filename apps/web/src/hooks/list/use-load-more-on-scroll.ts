'use client';

import { useEffect } from 'react';

const LOAD_MORE_MARGIN_PX = 700;

export function useLoadMoreOnScroll(loadMore: () => void): void {
    useEffect(() => {
        const check = () => {
            if (window.innerHeight + window.scrollY > document.documentElement.scrollHeight - LOAD_MORE_MARGIN_PX) {
                loadMore();
            }
        };
        window.addEventListener('scroll', check, { passive: true });
        return () => window.removeEventListener('scroll', check);
    }, [loadMore]);
}
