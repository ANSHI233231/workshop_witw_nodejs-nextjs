import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { PARK_REFERENCING_TABLES, ParkTestDataSQL } from '../sql/park-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestParkRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    status: number;
}

export interface ParkReferenceRow extends RowDataPacket {
    id: number;
    master_park_id: number;
}

export type ParkReferences = { readonly table: string; readonly rows: readonly ParkReferenceRow[] };

export class ParkTestDataRepository {
    async marked(db: DbExecutor, textPrefix: string, slugPrefix: string): Promise<TestParkRow[]> {
        return db.query<TestParkRow>(ParkTestDataSQL.marked, [startsWith(textPrefix), startsWith(slugPrefix)]);
    }

    async referencesTo(db: DbExecutor, parkIds: readonly number[]): Promise<ParkReferences[]> {
        if (parkIds.length === 0) return [];
        const references: ParkReferences[] = [];
        for (const table of PARK_REFERENCING_TABLES) {
            references.push({ table, rows: await db.query<ParkReferenceRow>(ParkTestDataSQL.referencesIn(table, parkIds.length), parkIds) });
        }
        references.push({
            table: 'data_translation',
            rows: await db.query<ParkReferenceRow>(ParkTestDataSQL.translationsOf(parkIds.length), parkIds),
        });
        return references;
    }

    async deleteParks(db: DbExecutor, parkIds: readonly number[]): Promise<number> {
        if (parkIds.length === 0) return 0;
        return (await db.execute(ParkTestDataSQL.deleteParks(parkIds.length), parkIds)).affectedRows;
    }
}
