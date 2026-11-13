import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { UsersSeedSQL } from '../sql/users-seed.sql';

interface SeedAccountRow extends RowDataPacket {
    id: number;
    email: string;
    roleCount: number;
}

export class UsersSeedRepository {
    async findByEmails(db: DbExecutor, emails: readonly string[]): Promise<SeedAccountRow[]> {
        if (emails.length === 0) return [];
        return db.query<SeedAccountRow>(UsersSeedSQL.findByEmails(emails.length), emails);
    }

    async deleteUsers(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        await db.execute(UsersSeedSQL.deleteRoles(ids.length), ids);
        return (await db.execute(UsersSeedSQL.deleteUsers(ids.length), ids)).affectedRows;
    }
}
