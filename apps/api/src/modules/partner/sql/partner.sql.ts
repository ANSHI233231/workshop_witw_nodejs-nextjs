const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

type ListShape = {
    readonly statusCount: number;
    readonly search: boolean;
};

const listWhere = (shape: ListShape): string =>
    [
        `WHERE partner.status IN (${placeholders(shape.statusCount)})`,
        shape.search ? ' AND (partner.business_name LIKE ? OR partner.owner_name LIKE ?)' : '',
    ].join('');

const COLUMNS = `partner.id, partner.user_id, partner.business_name, partner.owner_name, partner.business_phone,
            partner.business_email, partner.about, partner.logo, partner.is_phone_shown, partner.reject_reason,
            partner.requested_at, partner.decided_at, partner.approved_at, partner.status,
            user.name AS user_name, user.email AS user_email, user.mobile AS user_mobile,
            CASE WHEN partner.status = ? THEN
                (SELECT COUNT(*)
                    FROM package
                    WHERE package.partner_id = partner.id AND package.website_status = ?)
            ELSE 0 END AS live_package_count`;

export const PartnerSQL = {
    list: (shape: ListShape, order: 'requests' | 'partners') => `
        SELECT ${COLUMNS}
        FROM partner
        LEFT JOIN user ON user.id = partner.user_id
        ${listWhere(shape)}
        ORDER BY ${
            order === 'requests'
                ? 'CASE WHEN partner.status = ? THEN 0 ELSE 1 END, partner.requested_at DESC, partner.id DESC'
                : 'partner.business_name, partner.id'
        }
        LIMIT ? OFFSET ?`,

    count: (shape: ListShape) => `
        SELECT COUNT(*) AS total
        FROM partner
        ${listWhere(shape)}`,

    findById: `
        SELECT ${COLUMNS}
        FROM partner
        LEFT JOIN user ON user.id = partner.user_id
        WHERE partner.id = ?`,

    findByUserId: `
        SELECT ${COLUMNS}
        FROM partner
        LEFT JOIN user ON user.id = partner.user_id
        WHERE partner.user_id = ?`,

    findByUserIds: (count: number) => `
        SELECT ${COLUMNS}
        FROM partner
        LEFT JOIN user ON user.id = partner.user_id
        WHERE partner.user_id IN (${placeholders(count)})`,

    parksOf: (count: number) => `
        SELECT partner_park.partner_id, master_park.id, master_park.name, master_park.status
        FROM partner_park
        JOIN master_park ON master_park.id = partner_park.master_park_id
        WHERE partner_park.partner_id IN (${placeholders(count)}) AND partner_park.status = ?
        ORDER BY master_park.name`,

    insert: `
        INSERT INTO partner
            (user_id, business_name, owner_name, business_phone, business_email, about, status, requested_at,
             created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?)`,

    insertDecided: `
        INSERT INTO partner
            (user_id, business_name, owner_name, business_phone, business_email, about, is_phone_shown, status,
             reject_reason, requested_at, decided_at, decided_by, approved_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    sendAgain: `
        UPDATE partner
        SET business_name = ?, owner_name = ?, business_phone = ?, business_email = ?, about = ?, status = ?,
            reject_reason = NULL, requested_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND status = ?`,

    updateDetails: `
        UPDATE partner
        SET business_name = ?, owner_name = ?, business_phone = ?, business_email = ?, about = ?, updated_by = ?
        WHERE id = ?`,

    approve: `
        UPDATE partner
        SET status = ?, reject_reason = NULL, decided_at = UTC_TIMESTAMP(), decided_by = ?,
            approved_at = COALESCE(approved_at, UTC_TIMESTAMP()), updated_by = ?
        WHERE id = ? AND status = ?`,

    reject: `
        UPDATE partner
        SET status = ?, reject_reason = ?, decided_at = UTC_TIMESTAMP(), decided_by = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    updateStatus: `
        UPDATE partner
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    updatePhoneShown: `
        UPDATE partner
        SET is_phone_shown = ?, updated_by = ?
        WHERE id = ?`,

    updateLogo: `
        UPDATE partner
        SET logo = ?, updated_by = ?
        WHERE id = ?`,

    upsertPark: `
        INSERT INTO partner_park (partner_id, master_park_id, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE status = incoming.status, updated_by = incoming.updated_by`,

    removeParksExcept: (keepCount: number) => `
        UPDATE partner_park
        SET status = ?, updated_by = ?
        WHERE partner_id = ? AND status = ?${keepCount > 0 ? ` AND master_park_id NOT IN (${placeholders(keepCount)})` : ''}`,

    deleteParksOfPartners: (count: number) => `
        DELETE FROM partner_park
        WHERE partner_id IN (${placeholders(count)})`,

    deletePartners: (count: number) => `
        DELETE FROM partner
        WHERE id IN (${placeholders(count)})`,
} as const;
