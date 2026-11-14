const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const PartnerTestDataSQL = {
    partnersOf: (count: number) => `
        SELECT partner.id, partner.user_id, partner.business_name, partner.status
        FROM partner
        WHERE partner.user_id IN (${inList(count)})
        ORDER BY partner.id`,

    partnersNotIn: (count: number) => `
        SELECT partner.id, partner.user_id, partner.business_name, partner.status
        FROM partner
        WHERE partner.id NOT IN (${inList(count)})
        ORDER BY partner.id`,

    parksOf: (count: number) => `
        SELECT partner_park.id, partner_park.partner_id, partner_park.master_park_id
        FROM partner_park
        WHERE partner_park.partner_id IN (${inList(count)})
        ORDER BY partner_park.id`,

    deleteParks: (count: number) => `
        DELETE FROM partner_park
        WHERE id IN (${inList(count)})`,

    deletePartners: (count: number) => `
        DELETE FROM partner
        WHERE id IN (${inList(count)})`,
} as const;
