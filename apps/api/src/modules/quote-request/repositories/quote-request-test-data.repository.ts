import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { QuoteRequestTestDataSQL } from '../sql/quote-request-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestQuoteRequestRow extends RowDataPacket {
    id: number;
    user_id: number;
    partner_id: number;
    package_id: number;
    notes_start: string | null;
}

export class QuoteRequestTestDataRepository {
    async marked(
        db: DbExecutor,
        userIds: readonly number[],
        partnerIds: readonly number[],
        packageIds: readonly number[],
        textPrefix: string,
    ): Promise<TestQuoteRequestRow[]> {
        return db.query<TestQuoteRequestRow>(
            QuoteRequestTestDataSQL.marked(userIds.length, partnerIds.length, packageIds.length),
            [...userIds, ...partnerIds, ...packageIds, startsWith(textPrefix)],
        );
    }

    async quoteRequestsNotIn(db: DbExecutor, ids: readonly number[]): Promise<TestQuoteRequestRow[]> {
        return db.query<TestQuoteRequestRow>(QuoteRequestTestDataSQL.quoteRequestsNotIn(ids.length), ids);
    }

    async deleteQuoteRequests(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(QuoteRequestTestDataSQL.deleteQuoteRequests(ids.length), ids)).affectedRows;
    }
}
