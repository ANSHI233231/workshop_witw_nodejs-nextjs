import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { ParkDemoSQL } from '../sql/park-demo.sql';

export interface ParkImageRow extends RowDataPacket {
    id: number;
    name: string;
    feature_image: string | null;
}

export class ParkDemoRepository {
    async images(db: DbExecutor): Promise<ParkImageRow[]> {
        return db.query<ParkImageRow>(ParkDemoSQL.images);
    }

    async fillImage(db: DbExecutor, id: number, fileName: string, actorId: number | null): Promise<boolean> {
        return (await db.execute(ParkDemoSQL.fillImage, [fileName, actorId, id])).affectedRows > 0;
    }

    async clearImage(db: DbExecutor, id: number, fileName: string, actorId: number | null): Promise<boolean> {
        return (await db.execute(ParkDemoSQL.clearImage, [actorId, id, fileName])).affectedRows > 0;
    }
}
