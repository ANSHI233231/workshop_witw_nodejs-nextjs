const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const SHOWN_FROM = `
        FROM package p
        JOIN package_version v ON v.live_version_key = p.id
        JOIN partner ON partner.id = p.partner_id`;

export const SHOWN_WHERE = 'p.website_status = ? AND partner.status = ?';

export type WebsiteListShape = {
    readonly search: boolean;
    readonly park: boolean;
    readonly priceMin: boolean;
    readonly priceMax: boolean;
    readonly nightsMin: boolean;
    readonly nightsMax: boolean;
    readonly safarisMin: boolean;
    readonly safarisMax: boolean;
    readonly stays: number;
    readonly features: number;
    readonly inclusions: number;
};

export const WEBSITE_ORDERS = {
    popular: 'p.is_popular DESC, p.first_live_at DESC, p.id DESC',
    newest: 'p.first_live_at DESC, p.id DESC',
    'fewest-safaris': 'v.safari_count ASC, p.first_live_at DESC, p.id DESC',
    'most-safaris': 'v.safari_count DESC, p.first_live_at DESC, p.id DESC',
    'price-low': 'v.price_per_person ASC, p.first_live_at DESC, p.id DESC',
} as const;

const filtersOf = (shape: WebsiteListShape): string =>
    [
        `WHERE ${SHOWN_WHERE}`,
        shape.search ? ' AND v.name LIKE ?' : '',
        shape.park
            ? ` AND EXISTS (SELECT 1 FROM package_version_park f_park
                WHERE f_park.package_version_id = v.id AND f_park.status = 1 AND f_park.master_park_id = ?)`
            : '',
        shape.priceMin ? ' AND v.price_per_person >= ?' : '',
        shape.priceMax ? ' AND v.price_per_person <= ?' : '',
        shape.nightsMin ? ' AND v.day_count - 1 >= ?' : '',
        shape.nightsMax ? ' AND v.day_count - 1 <= ?' : '',
        shape.safarisMin ? ' AND v.safari_count >= ?' : '',
        shape.safarisMax ? ' AND v.safari_count <= ?' : '',
        shape.stays > 0 ? ` AND v.stay IN (${placeholders(shape.stays)})` : '',
        shape.features > 0
            ? ` AND EXISTS (SELECT 1 FROM package_version_feature f_feature
                WHERE f_feature.package_version_id = v.id AND f_feature.status = 1
                    AND f_feature.feature IN (${placeholders(shape.features)}))`
            : '',
        shape.inclusions > 0
            ? ` AND EXISTS (SELECT 1 FROM package_version_inclusion f_inclusion
                WHERE f_inclusion.package_version_id = v.id AND f_inclusion.status = 1 AND f_inclusion.is_included = 1
                    AND f_inclusion.inclusion IN (${placeholders(shape.inclusions)}))`
            : '',
    ].join('');

const CARD_COLUMNS = `p.id AS package_id, p.slug, p.is_popular, p.is_best_deal, p.first_live_at, p.partner_id,
            partner.user_id AS partner_user_id, partner.business_name, v.id AS version_id, v.version_number`;

export const WebsiteSQL = {
    list: (shape: WebsiteListShape, sort: keyof typeof WEBSITE_ORDERS) => `
        SELECT ${CARD_COLUMNS}
        ${SHOWN_FROM}
        ${filtersOf(shape)}
        ORDER BY ${WEBSITE_ORDERS[sort]}
        LIMIT ? OFFSET ?`,

    count: (shape: WebsiteListShape) => `
        SELECT COUNT(*) AS total
        ${SHOWN_FROM}
        ${filtersOf(shape)}`,

    shownById: `
        SELECT ${CARD_COLUMNS}
        ${SHOWN_FROM}
        WHERE ${SHOWN_WHERE} AND p.id = ?`,

    shownByIds: (count: number) => `
        SELECT ${CARD_COLUMNS}
        ${SHOWN_FROM}
        WHERE ${SHOWN_WHERE} AND p.id IN (${placeholders(count)})`,

    shownOfPartner: `
        SELECT ${CARD_COLUMNS}
        ${SHOWN_FROM}
        WHERE ${SHOWN_WHERE} AND p.partner_id = ?
        ORDER BY ${WEBSITE_ORDERS.newest}
        LIMIT ? OFFSET ?`,

    countShownOfPartner: `
        SELECT COUNT(*) AS total
        ${SHOWN_FROM}
        WHERE ${SHOWN_WHERE} AND p.partner_id = ?`,

    shownBySlug: `
        SELECT ${CARD_COLUMNS}
        ${SHOWN_FROM}
        WHERE ${SHOWN_WHERE} AND p.slug = ?`,

    priceRanges: (parkCount: number) => `
        SELECT pvp.master_park_id, MIN(v.price_per_person) AS lowest, MAX(v.price_per_person) AS highest,
            COUNT(DISTINCT p.id) AS package_count
        ${SHOWN_FROM}
        JOIN package_version_park pvp ON pvp.package_version_id = v.id AND pvp.status = 1
        WHERE ${SHOWN_WHERE}${parkCount > 0 ? ` AND pvp.master_park_id IN (${placeholders(parkCount)})` : ''}
        GROUP BY pvp.master_park_id`,
} as const;
