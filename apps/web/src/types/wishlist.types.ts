import type { PackageCard } from './package.types';
import type { SafariCard } from './shared-safari.types';

export const WishlistItemType = { PACKAGE: 1, SHARED_SAFARI: 2 } as const;

export type WishlistItemTypeCode = (typeof WishlistItemType)[keyof typeof WishlistItemType];

export const WISHLIST_PAGE_SIZE = 6;

export type WishlistIds = {
    readonly packageIds: readonly number[];
    readonly sharedSafariIds: readonly number[];
};

export type WishlistChange = {
    readonly itemType: WishlistItemTypeCode;
    readonly itemId: number;
    readonly isSaved: boolean;
};

export type WishlistPage<T> = {
    readonly items: readonly T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type WishlistPackage = PackageCard & { readonly savedAt: string };

export type WishlistSafari = SafariCard & { readonly savedAt: string };

