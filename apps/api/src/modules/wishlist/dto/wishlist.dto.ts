export type { WishlistPackageDto, WishlistSafariDto } from '../contracts/wishlist-cards.contract';

export type WishlistIdsDto = {
    readonly packageIds: readonly number[];
    readonly sharedSafariIds: readonly number[];
};

export type WishlistPage<T> = {
    readonly items: readonly T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type WishlistChangeDto = {
    readonly itemType: number;
    readonly itemId: number;
    readonly isSaved: boolean;
};

export type SavedItem = {
    readonly userId: number;
    readonly itemType: number;
    readonly packageId: number | null;
    readonly sharedSafariId: number | null;
    readonly savedPricePerPerson: number | null;
};

export type VisibilityChanges = {
    readonly hiddenIds: readonly number[];
    readonly returnedIds: readonly number[];
    readonly droppedIds: readonly number[];
};
