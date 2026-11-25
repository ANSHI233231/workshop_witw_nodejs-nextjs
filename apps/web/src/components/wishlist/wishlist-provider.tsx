'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import { getWishlistIds, removePackage, removeSafari, savePackage, saveSafari } from '@/services/wishlist.service';
import { WishlistItemType, type WishlistItemTypeCode } from '@/types/wishlist.types';

const log = logger.category('wishlist');

const SIGN_IN_PATH = '/login';

export type WishlistViewer = 'guest' | 'user' | 'partner';

export type WishlistChangedDetail = {
    readonly itemType: WishlistItemTypeCode;
    readonly itemId: number;
    readonly isSaved: boolean;
};

export const WISHLIST_CHANGED = 'wishlist-changed';

type WishlistValue = {
    readonly viewer: WishlistViewer;
    readonly isSaved: (itemType: WishlistItemTypeCode, itemId: number) => boolean;
    readonly toggle: (itemType: WishlistItemTypeCode, itemId: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistValue>({
    viewer: 'guest',
    isSaved: () => false,
    toggle: () => Promise.resolve(),
});

export const useWishlist = (): WishlistValue => useContext(WishlistContext);

const keyOf = (itemType: WishlistItemTypeCode, itemId: number): string => `${itemType}:${itemId}`;

export function WishlistProvider({ viewer, children }: { readonly viewer: WishlistViewer; readonly children: ReactNode }) {
    const t = useT();
    const router = useRouter();
    const pathname = usePathname();
    const { toast, show, showError, hide } = useSiteToast();
    const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
    const busy = useRef(false);

    useEffect(() => {
        if (viewer !== 'user') return;
        getWishlistIds()
            .then((ids) =>
                setSaved(
                    new Set([
                        ...ids.packageIds.map((id) => keyOf(WishlistItemType.PACKAGE, id)),
                        ...ids.sharedSafariIds.map((id) => keyOf(WishlistItemType.SHARED_SAFARI, id)),
                    ]),
                ),
            )
            .catch((error: unknown) => log.error('The wishlist could not be loaded.', { error }));
    }, [viewer]);

    const isSaved = useCallback(
        (itemType: WishlistItemTypeCode, itemId: number) => saved.has(keyOf(itemType, itemId)),
        [saved],
    );

    const toggle = useCallback(
        async (itemType: WishlistItemTypeCode, itemId: number) => {
            if (viewer === 'guest') {
                const here = `${window.location.pathname}${window.location.search}`;
                router.push(`${SIGN_IN_PATH}?next=${encodeURIComponent(here || pathname)}`);
                return;
            }
            if (viewer !== 'user' || busy.current) return;
            busy.current = true;
            const wasSaved = saved.has(keyOf(itemType, itemId));
            const name = itemType === WishlistItemType.PACKAGE ? t('Package') : t('Shared Safari');
            try {
                if (itemType === WishlistItemType.PACKAGE) {
                    await (wasSaved ? removePackage(itemId) : savePackage(itemId));
                } else {
                    await (wasSaved ? removeSafari(itemId) : saveSafari(itemId));
                }
                setSaved((current) => {
                    const next = new Set(current);
                    if (wasSaved) next.delete(keyOf(itemType, itemId));
                    else next.add(keyOf(itemType, itemId));
                    return next;
                });
                show(
                    wasSaved
                        ? t('You removed the {item} from your wishlist!', { item: name })
                        : t('You added the {item} to your wishlist!', { item: name }),
                );
                window.dispatchEvent(
                    new CustomEvent<WishlistChangedDetail>(WISHLIST_CHANGED, {
                        detail: { itemType, itemId, isSaved: !wasSaved },
                    }),
                );
            } catch (error) {
                showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
            } finally {
                busy.current = false;
            }
        },
        [viewer, saved, router, pathname, show, showError, t],
    );

    const value = useMemo(() => ({ viewer, isSaved, toggle }), [viewer, isSaved, toggle]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
            <SiteToast toast={toast} onClose={hide} />
        </WishlistContext.Provider>
    );
}
