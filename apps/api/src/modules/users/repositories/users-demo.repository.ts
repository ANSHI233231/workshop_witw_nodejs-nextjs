import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { UsersDemoSQL } from '../sql/users-demo.sql';
import { MetaRole, UserRoleStatus } from '../types/users.types';

export interface DemoAccountRow extends RowDataPacket {
    id: number;
    email: string;
    super_admin_roles: number;
}

export class UsersDemoRepository {
    async findByEmails(db: DbExecutor, emails: readonly string[]): Promise<DemoAccountRow[]> {
        if (emails.length === 0) return [];
        return db.query<DemoAccountRow>(UsersDemoSQL.findByEmails(emails.length), [MetaRole.SUPER_ADMIN, UserRoleStatus.ACTIVE, ...emails]);
    }

    async deleteUsers(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        await db.execute(UsersDemoSQL.deleteRoles(ids.length), ids);
        return (await db.execute(UsersDemoSQL.deleteUsers(ids.length), ids)).affectedRows;
    }
}
