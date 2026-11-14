import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { PartnerTestDataSQL } from '../sql/partner-test-data.sql';

export interface TestPartnerRow extends RowDataPacket {
    id: number;
    user_id: number;
    business_name: string;
    status: number;
}

export interface TestPartnerParkRow extends RowDataPacket {
    id: number;
    partner_id: number;
    master_park_id: number;
}

export class PartnerTestDataRepository {
    async partnersOf(db: DbExecutor, userIds: readonly number[]): Promise<TestPartnerRow[]> {
        if (userIds.length === 0) return [];
        return db.query<TestPartnerRow>(PartnerTestDataSQL.partnersOf(userIds.length), userIds);
    }

    async partnersNotIn(db: DbExecutor, partnerIds: readonly number[]): Promise<TestPartnerRow[]> {
        return db.query<TestPartnerRow>(PartnerTestDataSQL.partnersNotIn(partnerIds.length), partnerIds);
    }

    async parksOf(db: DbExecutor, partnerIds: readonly number[]): Promise<TestPartnerParkRow[]> {
        if (partnerIds.length === 0) return [];
        return db.query<TestPartnerParkRow>(PartnerTestDataSQL.parksOf(partnerIds.length), partnerIds);
    }

    async deleteParks(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(PartnerTestDataSQL.deleteParks(ids.length), ids)).affectedRows;
    }

    async deletePartners(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(PartnerTestDataSQL.deletePartners(ids.length), ids)).affectedRows;
    }
}
