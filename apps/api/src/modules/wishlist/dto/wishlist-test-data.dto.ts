export type WishlistTestDataRow = { readonly id: number; readonly label: string };

export type WishlistTestDataTable = { readonly table: string; readonly rows: readonly WishlistTestDataRow[] };

export type WishlistTestDataScope = {
    readonly userIds: readonly number[];
    readonly packageIds: readonly number[];
    readonly sharedSafariIds: readonly number[];
};

export type WishlistTestData = {
    readonly wishlistItemIds: readonly number[];
    readonly tables: readonly WishlistTestDataTable[];
};
