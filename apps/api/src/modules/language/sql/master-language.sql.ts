type ListShape = {
    readonly status: boolean;
    readonly search: boolean;
};

const listWhere = (shape: ListShape): string =>
    [
        'WHERE 1 = 1',
        shape.status ? ' AND status = ?' : '',
        shape.search ? ' AND (name LIKE ? OR native_name LIKE ? OR code LIKE ?)' : '',
    ].join('');

const COLUMNS = 'code, name, native_name, short_name, status';

const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const MasterLanguageSQL = {
    list: (shape: ListShape) => `
        SELECT ${COLUMNS}
        FROM master_language
        ${listWhere(shape)}
        ORDER BY code = ? DESC, name
        LIMIT ? OFFSET ?`,

    count: (shape: ListShape) => `
        SELECT COUNT(*) AS total
        FROM master_language
        ${listWhere(shape)}`,

    listActive: `
        SELECT ${COLUMNS}
        FROM master_language
        WHERE status = ?
        ORDER BY code = ? DESC, name`,

    findByCode: `
        SELECT ${COLUMNS}
        FROM master_language
        WHERE code = ?`,

    findOtherByName: `
        SELECT ${COLUMNS}
        FROM master_language
        WHERE LOWER(name) = LOWER(?) AND code <> ?
        LIMIT 1`,

    insert: `
        INSERT INTO master_language (code, name, native_name, short_name, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    update: `
        UPDATE master_language
        SET name = ?, native_name = ?, short_name = ?, updated_by = ?
        WHERE code = ?`,

    updateStatus: `
        UPDATE master_language
        SET status = ?, updated_by = ?
        WHERE code = ?`,

    sitesOf: (codeCount: number) => `
        SELECT master_language_code, site, is_default
        FROM master_language_site
        WHERE status = ? AND master_language_code IN (${placeholders(codeCount)})
        ORDER BY site`,

    showSite: `
        INSERT INTO master_language_site
            (master_language_code, site, is_default, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE
            is_default = incoming.is_default,
            status = incoming.status,
            updated_by = incoming.updated_by,
            deleted_at = NULL,
            deleted_by = NULL`,

    hideSite: `
        UPDATE master_language_site
        SET status = ?, is_default = 0, updated_by = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?
        WHERE master_language_code = ? AND site = ? AND status <> ?`,

    makeDefault: `
        UPDATE master_language_site
        SET is_default = 1, updated_by = ?
        WHERE master_language_code = ? AND site = ? AND status = ?`,

    clearDefaultExcept: `
        UPDATE master_language_site
        SET is_default = 0, updated_by = ?
        WHERE site = ? AND master_language_code <> ? AND is_default = 1`,
} as const;
