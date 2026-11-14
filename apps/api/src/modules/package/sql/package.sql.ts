const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const parkNamesOf = (versionId: string): string => `
            (SELECT GROUP_CONCAT(mp.name ORDER BY pvp.sort_order, pvp.id SEPARATOR ', ')
                FROM package_version_park pvp
                JOIN master_park mp ON mp.id = pvp.master_park_id
                WHERE pvp.package_version_id = ${versionId} AND pvp.status = 1)`;

const PACKAGE_COLUMNS = `p.id, p.partner_id, p.slug, p.website_status, p.is_popular, p.is_best_deal, p.first_live_at,
            p.master_package_delete_reason_id, p.delete_reason_name, p.delete_details, p.deleted_at, p.created_at,
            p.updated_at, partner.business_name, partner.status AS partner_status,
            live.id AS live_version_id, live.version_number AS live_version_number,
            work.id AS working_version_id, work.version_number AS working_version_number, work.status AS working_status`;

const FROM_PACKAGE = `
        FROM package p
        LEFT JOIN partner ON partner.id = p.partner_id
        LEFT JOIN package_version live ON live.live_version_key = p.id
        LEFT JOIN package_version work ON work.working_version_key = p.id`;

export type PackageListShape = {
    readonly websiteStatus: boolean;
    readonly partner: boolean;
    readonly search: boolean;
    readonly statusCount: number;
};

const LIVE_FIRST_NAME = 'COALESCE(live.name, work.name)';
const WORK_FIRST_NAME = 'COALESCE(work.name, live.name)';

const listWhere = (shape: PackageListShape, nameExpression: string): string =>
    [
        `WHERE p.website_status IN (${placeholders(shape.statusCount)})`,
        shape.websiteStatus ? ' AND p.website_status = ?' : '',
        shape.partner ? ' AND p.partner_id = ?' : '',
        shape.search ? ` AND ${nameExpression} LIKE ?` : '',
    ].join('');

export const PackageSQL = {
    findById: `
        SELECT ${PACKAGE_COLUMNS}
        ${FROM_PACKAGE}
        WHERE p.id = ?`,

    findBySlug: `
        SELECT ${PACKAGE_COLUMNS}
        ${FROM_PACKAGE}
        WHERE p.slug = ?`,

    slugTaken: 'SELECT COUNT(*) AS total FROM package WHERE slug = ?',

    listOfPartner: (shape: PackageListShape) => `
        SELECT ${PACKAGE_COLUMNS}, ${WORK_FIRST_NAME} AS name, ${parkNamesOf('COALESCE(work.id, live.id)')} AS park_names,
            COALESCE(work.id, live.id) AS shown_version_id,
            IF(work.id IS NULL, live.package_image, work.package_image) AS package_image,
            GREATEST(p.updated_at, COALESCE(work.updated_at, p.updated_at), COALESCE(live.updated_at, p.updated_at))
                AS last_changed_at
        ${FROM_PACKAGE}
        ${listWhere(shape, WORK_FIRST_NAME)}
        ORDER BY last_changed_at DESC, p.id DESC`,

    listForConsole: (shape: PackageListShape) => `
        SELECT ${PACKAGE_COLUMNS}, ${LIVE_FIRST_NAME} AS name, ${parkNamesOf('COALESCE(live.id, work.id)')} AS park_names,
            COALESCE(live.id, work.id) AS shown_version_id,
            IF(live.id IS NULL, work.package_image, live.package_image) AS package_image,
            p.updated_at AS last_changed_at
        ${FROM_PACKAGE}
        ${listWhere(shape, LIVE_FIRST_NAME)}
        ORDER BY p.first_live_at DESC, p.id DESC
        LIMIT ? OFFSET ?`,

    countForConsole: (shape: PackageListShape) => `
        SELECT COUNT(*) AS total
        ${FROM_PACKAGE}
        ${listWhere(shape, LIVE_FIRST_NAME)}`,

    latestActiveOfPartner: `
        SELECT ${PACKAGE_COLUMNS}, live.name AS name, ${parkNamesOf('live.id')} AS park_names, live.id AS shown_version_id,
            live.package_image AS package_image, live.decided_at AS last_changed_at
        ${FROM_PACKAGE}
        WHERE p.partner_id = ? AND p.website_status = ? AND live.id IS NOT NULL
        ORDER BY live.decided_at DESC, p.id DESC
        LIMIT ?`,

    insert: `
        INSERT INTO package (partner_id, slug, website_status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?)`,

    setWebsiteStatus: `
        UPDATE package
        SET website_status = ?, updated_by = ?
        WHERE id = ? AND website_status = ?`,

    goLive: (statusCount: number) => `
        UPDATE package
        SET website_status = ?, is_popular = 0, first_live_at = COALESCE(first_live_at, UTC_TIMESTAMP()), updated_by = ?
        WHERE id = ? AND website_status IN (${placeholders(statusCount)})`,

    deleteByAdmin: (statusCount: number) => `
        UPDATE package
        SET website_status = ?, is_popular = 0, master_package_delete_reason_id = ?, delete_reason_name = ?,
            delete_details = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ? AND website_status IN (${placeholders(statusCount)})`,

    setPopular: (statusCount: number) => `
        UPDATE package
        SET is_popular = ?, updated_by = ?
        WHERE id = ? AND website_status IN (${placeholders(statusCount)})`,

    setBestDeal: (statusCount: number) => `
        UPDATE package
        SET is_best_deal = ?, updated_by = ?
        WHERE id = ? AND website_status IN (${placeholders(statusCount)})`,

    touch: 'UPDATE package SET updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?',

    insertDemo: `
        INSERT INTO package
            (partner_id, slug, website_status, is_popular, is_best_deal, first_live_at, master_package_delete_reason_id,
             delete_reason_name, delete_details, deleted_at, deleted_by, created_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    demoPackagesOf: (partnerCount: number) => `
        SELECT id, slug FROM package WHERE partner_id IN (${placeholders(partnerCount)})`,
} as const;
