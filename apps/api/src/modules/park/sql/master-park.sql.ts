type ListShape = {
    readonly search: boolean;
    readonly region: boolean;
    readonly status: boolean;
};

const listWhere = (shape: ListShape): string =>
    [
        'WHERE 1 = 1',
        shape.search ? ' AND master_park.name LIKE ?' : '',
        shape.region ? ' AND master_park.region = ?' : '',
        shape.status ? ' AND master_park.status = ?' : '',
    ].join('');

const LIST_COLUMNS = `master_park.id, master_park.name, master_park.slug, master_park.region,
            master_park.avg_safari_price_min, master_park.avg_safari_price_max, master_park.status,
            (SELECT COUNT(*)
                FROM shared_safari
                WHERE shared_safari.master_park_id = master_park.id
                    AND shared_safari.status IN (?, ?)
                    AND shared_safari.start_date >= ?) AS upcoming_safari_count`;

export const MasterParkSQL = {
    list: (shape: ListShape) => `
        SELECT ${LIST_COLUMNS}
        FROM master_park
        ${listWhere(shape)}
        ORDER BY master_park.name
        LIMIT ? OFFSET ?`,

    count: (shape: ListShape) => `
        SELECT COUNT(*) AS total
        FROM master_park
        ${listWhere(shape)}`,

    listActive: `
        SELECT id, name
        FROM master_park
        WHERE status = ?
        ORDER BY name`,

    findState: `
        SELECT id, name, status
        FROM master_park
        WHERE id = ?`,

    findById: `
        SELECT ${LIST_COLUMNS},
            master_park.short_description, master_park.feature_image, master_park.latitude,
            master_park.longitude, master_park.official_website
        FROM master_park
        WHERE master_park.id = ?`,

    upcomingSafaris: `
        SELECT shared_safari.id, shared_safari.title,
            DATE_FORMAT(shared_safari.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(shared_safari.end_date, '%Y-%m-%d') AS end_date,
            shared_safari.status, user.name AS host_name
        FROM shared_safari
        LEFT JOIN user ON user.id = shared_safari.user_id
        WHERE shared_safari.master_park_id = ?
            AND shared_safari.status IN (?, ?)
            AND shared_safari.start_date >= ?
        ORDER BY shared_safari.start_date, shared_safari.id`,

    findOtherByName: `
        SELECT id, name, status
        FROM master_park
        WHERE LOWER(name) = LOWER(?) AND id <> ?
        LIMIT 1`,

    findBySlug: `
        SELECT id
        FROM master_park
        WHERE slug = ?
        LIMIT 1`,

    insert: `
        INSERT INTO master_park
            (name, slug, region, avg_safari_price_min, avg_safari_price_max, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

    update: `
        UPDATE master_park
        SET name = ?, region = ?, avg_safari_price_min = ?, avg_safari_price_max = ?, status = ?, updated_by = ?
        WHERE id = ?`,

    updateStatus: `
        UPDATE master_park
        SET status = ?, updated_by = ?
        WHERE id = ?`,
};
