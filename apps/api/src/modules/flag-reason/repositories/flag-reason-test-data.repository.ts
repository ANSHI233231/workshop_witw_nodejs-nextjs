import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { FlagReasonTestDataSQL } from '../sql/flag-reason-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestFlagReasonRow extends RowDataPacket {
    id: number;
    name: string;
    status: number;
}

export interface FlagReasonReferenceRow extends RowDataPacket {
    id: number;
    master_flag_reason_id: number;
}

export class FlagReasonTestDataRepository {
    async marked(db: DbExecutor, textPrefix: string): Promise<TestFlagReasonRow[]> {
        return db.query<TestFlagReasonRow>(FlagReasonTestDataSQL.marked, [startsWith(textPrefix)]);
    }

    async commentFlagsOf(db: DbExecutor, flagReasonIds: readonly number[]): Promise<FlagReasonReferenceRow[]> {
        if (flagReasonIds.length === 0) return [];
        return db.query<FlagReasonReferenceRow>(FlagReasonTestDataSQL.referencesIn(flagReasonIds.length), flagReasonIds);
    }

    async deleteReasons(db: DbExecutor, flagReasonIds: readonly number[]): Promise<number> {
        if (flagReasonIds.length === 0) return 0;
        return (await db.execute(FlagReasonTestDataSQL.deleteReasons(flagReasonIds.length), flagReasonIds)).affectedRows;
    }
}
