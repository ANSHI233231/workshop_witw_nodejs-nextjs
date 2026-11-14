const COLUMNS = `r.id, r.name, r.status, r.created_at,
            (SELECT COUNT(*) FROM package p WHERE p.master_package_delete_reason_id = r.id AND p.website_status = ?)
                AS used_count`;

const listWhere = (search: boolean, status: boolean): string =>
    ['WHERE 1 = 1', search ? ' AND r.name LIKE ?' : '', status ? ' AND r.status = ?' : ''].join('');

export const DeleteReasonSQL = {
    list: (search: boolean, status: boolean) => `
        SELECT ${COLUMNS}
        FROM master_package_delete_reason r
        ${listWhere(search, status)}
        ORDER BY r.id
        LIMIT ? OFFSET ?`,

    count: (search: boolean, status: boolean) => `
        SELECT COUNT(*) AS total
        FROM master_package_delete_reason r
        ${listWhere(search, status)}`,

    active: `
        SELECT ${COLUMNS}
        FROM master_package_delete_reason r
        WHERE r.status = ?
        ORDER BY r.id`,

    findById: `
        SELECT ${COLUMNS}
        FROM master_package_delete_reason r
        WHERE r.id = ?`,

    findByName: `
        SELECT ${COLUMNS}
        FROM master_package_delete_reason r
        WHERE LOWER(r.name) = LOWER(?)`,

    insert: `
        INSERT INTO master_package_delete_reason (name, status, created_by, updated_by)
        VALUES (?, ?, ?, ?)`,

    update: `
        UPDATE master_package_delete_reason
        SET name = ?, status = ?, updated_by = ?
        WHERE id = ?`,

    setStatus: `
        UPDATE master_package_delete_reason
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,
} as const;
