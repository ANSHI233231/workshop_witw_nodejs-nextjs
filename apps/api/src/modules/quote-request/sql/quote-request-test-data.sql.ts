const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

const COLUMNS = `quote_request.id, quote_request.user_id, quote_request.partner_id, quote_request.package_id,
            LEFT(quote_request.notes, 40) AS notes_start`;

export const QuoteRequestTestDataSQL = {
    marked: (userCount: number, partnerCount: number, packageCount: number) => `
        SELECT ${COLUMNS}
        FROM quote_request
        WHERE quote_request.user_id IN (${inList(userCount)})
            OR quote_request.partner_id IN (${inList(partnerCount)})
            OR quote_request.package_id IN (${inList(packageCount)})
            OR quote_request.notes LIKE ?
        ORDER BY quote_request.id`,

    quoteRequestsNotIn: (count: number) => `
        SELECT ${COLUMNS}
        FROM quote_request
        WHERE quote_request.id NOT IN (${inList(count)})
        ORDER BY quote_request.id`,

    deleteQuoteRequests: (count: number) => `
        DELETE FROM quote_request
        WHERE id IN (${inList(count)})`,
} as const;
