const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const WishlistTestDataSQL = {
    marked: (userCount: number, packageCount: number, safariCount: number) => `
        SELECT id, user_id, item_type, package_id, shared_safari_id
        FROM wishlist_item
        WHERE user_id IN (${inList(userCount)})
            OR package_id IN (${inList(packageCount)})
            OR shared_safari_id IN (${inList(safariCount)})
        ORDER BY id`,

    deleteItems: (count: number) => `
        DELETE FROM wishlist_item
        WHERE id IN (${inList(count)})`,
} as const;
