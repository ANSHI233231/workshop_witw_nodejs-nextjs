type ListShape = {
    readonly status: boolean;
    readonly search: boolean;
};

const listWhere = (shape: ListShape): string =>
    ['WHERE 1 = 1', shape.status ? ' AND reason.status = ?' : '', shape.search ? ' AND reason.name LIKE ?' : ''].join(
        '',
    );

const COLUMNS = 'id, name, status';

export const MasterFlagReasonSQL = {
    list: (shape: ListShape) => `
        SELECT reason.id, reason.name, reason.status, COALESCE(usage_count.total, 0) AS used_in_flags
        FROM master_flag_reason reason
        LEFT JOIN (
            SELECT master_flag_reason_id, COUNT(*) AS total
            FROM shared_safari_comment_flag
            GROUP BY master_flag_reason_id
        ) usage_count ON usage_count.master_flag_reason_id = reason.id
        ${listWhere(shape)}
        ORDER BY reason.id`,

    listActive: `
        SELECT ${COLUMNS}
        FROM master_flag_reason
        WHERE status = ?
        ORDER BY id`,

    findById: `
        SELECT ${COLUMNS}
        FROM master_flag_reason
        WHERE id = ?`,

    findActiveById: `
        SELECT ${COLUMNS}
        FROM master_flag_reason
        WHERE id = ? AND status = ?`,

    findOtherByName: `
        SELECT ${COLUMNS}
        FROM master_flag_reason
        WHERE name = ? AND id <> ?
        LIMIT 1`,

    insert: `
        INSERT INTO master_flag_reason (name, status, created_by, updated_by)
        VALUES (?, ?, ?, ?)`,

    update: `
        UPDATE master_flag_reason
        SET name = ?, status = ?, updated_by = ?
        WHERE id = ?`,

    updateStatus: `
        UPDATE master_flag_reason
        SET status = ?, updated_by = ?
        WHERE id = ?`,
} as const;
