import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { UsersTestDataSQL } from '../sql/users-test-data.sql';
import { MetaRole } from '../types/users.types';

const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (character) => `\\${character}`);

export interface TestAccountRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
}

export interface MarkedAccountRow extends TestAccountRow {
    super_admin_roles: number;
}

export interface TestRoleRow extends RowDataPacket {
    id: number;
    user_id: number;
    meta_role_id: number;
}

export class UsersTestDataRepository {
    async findMarked(db: DbExecutor, emailPrefix: string, keptEmails: readonly string[]): Promise<MarkedAccountRow[]> {
        const pattern = `${escapeLike(emailPrefix)}%`;
        return db.query<MarkedAccountRow>(UsersTestDataSQL.findMarked(keptEmails.length), [
            MetaRole.SUPER_ADMIN,
            pattern,
            pattern,
            ...keptEmails,
        ]);
    }

    async rolesOf(db: DbExecutor, userIds: readonly number[]): Promise<TestRoleRow[]> {
        if (userIds.length === 0) return [];
        return db.query<TestRoleRow>(UsersTestDataSQL.rolesOf(userIds.length), userIds);
    }

    async withEmailEnding(db: DbExecutor, suffix: string): Promise<TestAccountRow[]> {
        return db.query<TestAccountRow>(UsersTestDataSQL.withEmailEnding, [`%${escapeLike(suffix)}`]);
    }

    async withEmails(db: DbExecutor, emails: readonly string[]): Promise<TestAccountRow[]> {
        if (emails.length === 0) return [];
        return db.query<TestAccountRow>(UsersTestDataSQL.withEmails(emails.length), emails);
    }

    async deleteUsers(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        await db.execute(UsersTestDataSQL.deleteRoles(ids.length), ids);
        return (await db.execute(UsersTestDataSQL.deleteUsers(ids.length), ids)).affectedRows;
    }
}
