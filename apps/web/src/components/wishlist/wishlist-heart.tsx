'use client';

import type { MouseEvent } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { cn } from '@/lib/class-names';
import type { WishlistItemTypeCode } from '@/types/wishlist.types';

import { useWishlist } from './wishlist-provider';

function HeartIcon() {
    return (
        <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
    );
}

export function WishlistHeart({
    itemType,
    itemId,
    inline = false,
    alwaysShown = true,
}: {
    readonly itemType: WishlistItemTypeCode;
    readonly itemId: number;
    readonly inline?: boolean;
    readonly alwaysShown?: boolean;
}) {
    const t = useT();
    const { viewer, isSaved, toggle } = useWishlist();
    if (viewer === 'partner') return null;
    const on = viewer === 'user' && isSaved(itemType, itemId);
    if (!alwaysShown && !on) return null;
    const label = on ? t('Remove from wishlist') : t('Add to wishlist');

    const press = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        void toggle(itemType, itemId);
    };

    return (
        <button
            type="button"
            className={cn('wl-heart', on && 'is-on', inline && 'is-inline')}
            aria-label={label}
            aria-pressed={on}
            onClick={press}
        >
            <HeartIcon />
        </button>
    );
}
