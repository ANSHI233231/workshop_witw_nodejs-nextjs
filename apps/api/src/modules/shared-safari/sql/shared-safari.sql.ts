export type PublicListShape = {
    readonly park: boolean;
    readonly month: boolean;
    readonly priceMin: boolean;
    readonly priceMax: boolean;
    readonly safarisMin: boolean;
    readonly safarisMax: boolean;
    readonly themes: number;
    readonly stays: number;
    readonly order: string;
};

export type ConsoleListShape = {
    readonly search: boolean;
    readonly status: boolean;
    readonly host: boolean;
};

const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const SAFARI_COLUMNS = `
    s.id,
    s.user_id AS userId,
    u.name AS hostName,
    u.email AS hostEmail,
    u.status AS hostStatus,
    s.master_park_id AS masterParkId,
    p.name AS parkName,
    p.status AS parkStatus,
    s.slug,
    s.title,
    s.theme,
    DATE_FORMAT(s.start_date, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(s.end_date, '%Y-%m-%d') AS endDate,
    s.safari_count AS safariCount,
    s.total_seats AS totalSeats,
    s.shared_seats AS sharedSeats,
    s.price_per_person_min AS pricePerPersonMin,
    s.price_per_person_max AS pricePerPersonMax,
    s.stay_category AS stayCategory,
    s.cover_image AS coverImage,
    s.safari_plan AS safariPlan,
    s.is_pinned AS isPinned,
    s.delete_reason AS deleteReason,
    s.delete_details AS deleteDetails,
    s.status,
    s.created_at AS createdAt,
    s.updated_at AS updatedAt,
    s.deleted_at AS deletedAt,
    d.name AS deletedByName,
    (SELECT COUNT(*) FROM shared_safari_member m JOIN user mu ON mu.id = m.user_id
        WHERE m.shared_safari_id = s.id AND m.status = ? AND mu.status = ?) AS joinedCount,
    (SELECT COUNT(*) FROM shared_safari_member m
        WHERE m.shared_safari_id = s.id AND m.status = ?) AS leftCount,
    (SELECT COUNT(*) FROM shared_safari_comment c JOIN user cu ON cu.id = c.user_id
        WHERE c.shared_safari_id = s.id AND c.status = ? AND cu.status = ?) AS commentCount`;

const SAFARI_FROM = `
    FROM shared_safari s
    JOIN user u ON u.id = s.user_id
    JOIN master_park p ON p.id = s.master_park_id
    LEFT JOIN user d ON d.id = s.deleted_by`;

const publicWhere = (shape: PublicListShape): string =>
    [
        'WHERE s.status IN (?, ?) AND s.end_date >= ? AND u.status = ?',
        shape.park ? ' AND s.master_park_id = ?' : '',
        shape.month ? ' AND MONTH(s.start_date) = ?' : '',
        shape.priceMin ? ' AND s.price_per_person_max >= ?' : '',
        shape.priceMax ? ' AND s.price_per_person_min <= ?' : '',
        shape.safarisMin ? ' AND s.safari_count >= ?' : '',
        shape.safarisMax ? ' AND s.safari_count <= ?' : '',
        shape.themes > 0 ? ` AND s.theme IN (${placeholders(shape.themes)})` : '',
        shape.stays > 0 ? ` AND s.stay_category IN (${placeholders(shape.stays)})` : '',
    ].join('');

const consoleWhere = (shape: ConsoleListShape): string =>
    [
        'WHERE 1 = 1',
        shape.search ? ' AND (s.title LIKE ? OR p.name LIKE ?)' : '',
        shape.status ? ' AND s.status = ?' : '',
        shape.host ? ' AND s.user_id = ?' : '',
    ].join('');

export const SharedSafariSQL = {
    publicList: (shape: PublicListShape) => `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        ${publicWhere(shape)}
        ORDER BY ${shape.order}
        LIMIT ? OFFSET ?`,

    publicCount: (shape: PublicListShape) => `
        SELECT COUNT(*) AS total
        ${SAFARI_FROM}
        ${publicWhere(shape)}`,

    publicTotal: `
        SELECT COUNT(*) AS total
        ${SAFARI_FROM}
        WHERE s.status IN (?, ?) AND s.end_date >= ? AND u.status = ?`,

    findById: `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        WHERE s.id = ?`,

    findBySlug: `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        WHERE s.slug = ?`,

    slugTaken: `
        SELECT id FROM shared_safari WHERE slug = ?`,

    organisedBy: `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        WHERE s.user_id = ? AND s.status IN (?, ?, ?) AND u.status = ?
        ORDER BY s.start_date DESC, s.id DESC`,

    joinedBy: `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        JOIN shared_safari_member me ON me.shared_safari_id = s.id AND me.user_id = ? AND me.status = ?
        WHERE s.status IN (?, ?) AND u.status = ?
        ORDER BY s.start_date DESC, s.id DESC`,

    consoleList: (shape: ConsoleListShape) => `
        SELECT ${SAFARI_COLUMNS}
        ${SAFARI_FROM}
        ${consoleWhere(shape)}
        ORDER BY s.is_pinned DESC, s.created_at DESC, s.id DESC
        LIMIT ? OFFSET ?`,

    consoleCount: (shape: ConsoleListShape) => `
        SELECT COUNT(*) AS total
        ${SAFARI_FROM}
        ${consoleWhere(shape)}`,

    hostOptions: `
        SELECT DISTINCT u.id, u.name
        FROM shared_safari s
        JOIN user u ON u.id = s.user_id
        ORDER BY u.name`,

    insert: `
        INSERT INTO shared_safari
            (user_id, master_park_id, slug, title, theme, start_date, end_date, safari_count, total_seats,
             shared_seats, price_per_person_min, price_per_person_max, stay_category, safari_plan, status,
             created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    update: `
        UPDATE shared_safari
        SET master_park_id = ?, title = ?, theme = ?, start_date = ?, end_date = ?, safari_count = ?,
            total_seats = ?, shared_seats = ?, price_per_person_min = ?, price_per_person_max = ?,
            stay_category = ?, safari_plan = ?, updated_by = ?
        WHERE id = ?`,

    setCover: `
        UPDATE shared_safari SET cover_image = ?, updated_by = ? WHERE id = ?`,

    setStatus: `
        UPDATE shared_safari SET status = ?, updated_by = ? WHERE id = ?`,

    deleteByHost: `
        UPDATE shared_safari
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ?`,

    deleteByAdmin: `
        UPDATE shared_safari
        SET status = ?, delete_reason = ?, delete_details = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?,
            updated_by = ?
        WHERE id = ?`,

    makeActive: `
        UPDATE shared_safari
        SET status = ?, delete_reason = NULL, delete_details = NULL, deleted_at = NULL, deleted_by = NULL,
            updated_by = ?
        WHERE id = ?`,

    setPinned: `
        UPDATE shared_safari SET is_pinned = ?, updated_by = ? WHERE id = ?`,

    faces: (count: number) => `
        SELECT m.shared_safari_id AS sharedSafariId, m.user_id AS userId, u.name, m.joined_at AS joinedAt,
               m.left_at AS leftAt
        FROM shared_safari_member m
        JOIN user u ON u.id = m.user_id
        WHERE m.shared_safari_id IN (${placeholders(count)}) AND m.status = ? AND u.status = ?
        ORDER BY m.joined_at, m.id`,

    leftMembers: `
        SELECT m.shared_safari_id AS sharedSafariId, m.user_id AS userId, u.name, m.joined_at AS joinedAt,
               m.left_at AS leftAt
        FROM shared_safari_member m
        JOIN user u ON u.id = m.user_id
        WHERE m.shared_safari_id = ? AND m.status = ?
        ORDER BY m.left_at DESC, m.id`,

    allMembers: `
        SELECT m.shared_safari_id AS sharedSafariId, m.user_id AS userId, u.name, m.joined_at AS joinedAt,
               m.left_at AS leftAt
        FROM shared_safari_member m
        JOIN user u ON u.id = m.user_id
        WHERE m.shared_safari_id = ? AND m.status = ?
        ORDER BY m.joined_at, m.id`,

    viewerMemberships: (count: number) => `
        SELECT id, shared_safari_id AS sharedSafariId, user_id AS userId, status,
               first_joined_at AS firstJoinedAt, joined_at AS joinedAt, left_at AS leftAt
        FROM shared_safari_member
        WHERE user_id = ? AND shared_safari_id IN (${placeholders(count)})`,

    findMember: `
        SELECT id, shared_safari_id AS sharedSafariId, user_id AS userId, status,
               first_joined_at AS firstJoinedAt, joined_at AS joinedAt, left_at AS leftAt
        FROM shared_safari_member
        WHERE shared_safari_id = ? AND user_id = ?`,

    insertMember: `
        INSERT INTO shared_safari_member
            (shared_safari_id, user_id, first_joined_at, joined_at, status, created_by, updated_by)
        VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?, ?, ?)`,

    rejoin: `
        UPDATE shared_safari_member SET status = ?, joined_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?`,

    leave: `
        UPDATE shared_safari_member SET status = ?, left_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?`,
} as const;
