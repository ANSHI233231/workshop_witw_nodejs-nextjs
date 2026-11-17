export const ParkDemoSQL = {
    images: `
        SELECT id, name, feature_image
        FROM master_park
        WHERE status <> -1
        ORDER BY id`,

    fillImage: `
        UPDATE master_park
        SET feature_image = ?, updated_by = ?
        WHERE id = ? AND feature_image IS NULL`,

    clearImage: `
        UPDATE master_park
        SET feature_image = NULL, updated_by = ?
        WHERE id = ? AND feature_image = ?`,
} as const;
