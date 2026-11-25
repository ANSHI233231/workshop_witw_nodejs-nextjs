const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const ITEM_COLUMNS = `id, user_id, item_type, package_id, shared_safari_id, saved_price_per_person, is_hidden, saved_at,
            status`;

export const WishlistItemSQL = {
    savedOfUser: `
        SELECT ${ITEM_COLUMNS}
        FROM wishlist_item
        WHERE user_id = ? AND item_type = ? AND status = ?
        ORDER BY saved_at DESC, id DESC`,

    findPackageItem: `
        SELECT ${ITEM_COLUMNS}
        FROM wishlist_item
        WHERE user_id = ? AND package_id = ?`,

    findSafariItem: `
        SELECT ${ITEM_COLUMNS}
        FROM wishlist_item
        WHERE user_id = ? AND shared_safari_id = ?`,

    save: `
        INSERT INTO wishlist_item
            (user_id, item_type, package_id, shared_safari_id, saved_price_per_person, is_hidden, saved_at, status,
             created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, 0, UTC_TIMESTAMP(), ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(wishlist_item.id),
            saved_price_per_person = incoming.saved_price_per_person,
            is_hidden = 0,
            saved_at = incoming.saved_at,
            status = incoming.status,
            updated_by = incoming.updated_by`,

    setStatus: `
        UPDATE wishlist_item
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    setHidden: (count: number) => `
        UPDATE wishlist_item
        SET is_hidden = ?, updated_by = ?
        WHERE id IN (${placeholders(count)}) AND status = ?`,

    drop: (count: number) => `
        UPDATE wishlist_item
        SET is_hidden = 0, status = ?, updated_by = ?
        WHERE id IN (${placeholders(count)}) AND status = ?`,
} as const;
