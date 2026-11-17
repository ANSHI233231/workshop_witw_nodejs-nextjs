import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { JobTestDataSQL } from '../sql/job-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestJobRunRow extends RowDataPacket {
    id: number;
    title: string | null;
    command: string;
    status: number;
}

export class JobTestDataRepository {
    async marked(db: DbExecutor, textPrefix: string): Promise<TestJobRunRow[]> {
        return db.query<TestJobRunRow>(JobTestDataSQL.marked, [startsWith(textPrefix)]);
    }

    async retriesOf(db: DbExecutor, runIds: readonly number[]): Promise<TestJobRunRow[]> {
        if (runIds.length === 0) return [];
        return db.query<TestJobRunRow>(JobTestDataSQL.retriesOf(runIds.length), runIds);
    }

    async deleteRuns(db: DbExecutor, runIds: readonly number[]): Promise<number> {
        if (runIds.length === 0) return 0;
        return (await db.execute(JobTestDataSQL.deleteRuns(runIds.length), runIds)).affectedRows;
    }
}
