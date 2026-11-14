const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const QUOTE_COLUMNS = `qr.id, qr.user_id, qr.partner_id, qr.package_id, qr.package_version_id, qr.traveller_count,
            DATE_FORMAT(qr.start_date, '%Y-%m-%d') AS start_date, qr.notes, qr.user_name, qr.user_email,
            qr.user_mobile, qr.mark, qr.marked_at, qr.status, qr.created_at, p.slug AS package_slug,
            pv.name AS package_name, pv.version_number, pt.business_name, pt.user_id AS partner_user_id`;

const QUOTE_FROM = `
        FROM quote_request qr
        JOIN package p ON p.id = qr.package_id
        JOIN package_version pv ON pv.id = qr.package_version_id
        JOIN partner pt ON pt.id = qr.partner_id`;

export type ConsoleWhereShape = { readonly search: boolean; readonly status: boolean };

const consoleWhere = (shape: ConsoleWhereShape): string =>
    [
        'WHERE 1 = 1',
        shape.status ? ' AND qr.status = ?' : '',
        shape.search ? ' AND (qr.user_name LIKE ? OR pv.name LIKE ? OR pt.business_name LIKE ?)' : '',
    ].join('');

export const QuoteRequestSQL = {
    insert: `
        INSERT INTO quote_request
            (user_id, partner_id, package_id, package_version_id, traveller_count, start_date, notes, user_name,
             user_email, user_mobile, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    findById: `
        SELECT ${QUOTE_COLUMNS}
        ${QUOTE_FROM}
        WHERE qr.id = ?`,

    listOfUser: `
        SELECT ${QUOTE_COLUMNS}
        ${QUOTE_FROM}
        WHERE qr.user_id = ? AND qr.status = ?
        ORDER BY qr.created_at DESC, qr.id DESC`,

    listOfPartner: `
        SELECT ${QUOTE_COLUMNS}
        ${QUOTE_FROM}
        WHERE qr.partner_id = ? AND qr.status = ?
        ORDER BY qr.created_at DESC, qr.id DESC`,

    countOfPartner: `
        SELECT COUNT(*) AS total
        FROM quote_request qr
        WHERE qr.partner_id = ? AND qr.status = ?`,

    listForConsole: (shape: ConsoleWhereShape) => `
        SELECT ${QUOTE_COLUMNS}
        ${QUOTE_FROM}
        ${consoleWhere(shape)}
        ORDER BY qr.created_at DESC, qr.id DESC
        LIMIT ? OFFSET ?`,

    countForConsole: (shape: ConsoleWhereShape) => `
        SELECT COUNT(*) AS total
        ${QUOTE_FROM}
        ${consoleWhere(shape)}`,

    mark: `
        UPDATE quote_request
        SET mark = ?, marked_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND partner_id = ? AND status = ?`,

    setStatus: `
        UPDATE quote_request
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    demoVersions: (count: number) => `
        SELECT p.id AS package_id, pv.id AS package_version_id, p.partner_id, pt.user_id AS partner_user_id, p.slug,
            pv.version_number, pv.name
        FROM package p
        JOIN package_version pv ON pv.package_id = p.id
        JOIN partner pt ON pt.id = p.partner_id
        WHERE p.slug IN (${placeholders(count)})`,

    demoExisting: `
        SELECT id
        FROM quote_request
        WHERE user_id = ? AND package_id = ? AND created_at = ?
        LIMIT 1`,

    demoInsert: `
        INSERT INTO quote_request
            (user_id, partner_id, package_id, package_version_id, traveller_count, start_date, notes, user_name,
             user_email, user_mobile, mark, marked_at, status, created_at, updated_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    demoIdsOf: (partners: number, users: number) => `
        SELECT id
        FROM quote_request
        WHERE partner_id IN (${partners === 0 ? 'NULL' : placeholders(partners)})
            OR user_id IN (${users === 0 ? 'NULL' : placeholders(users)})`,

    demoDelete: (count: number) => `
        DELETE FROM quote_request WHERE id IN (${placeholders(count)})`,
} as const;
