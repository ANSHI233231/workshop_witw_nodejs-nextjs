import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { AuthTestDataSQL } from '../sql/auth-test-data.sql';

export interface UserTokenRow extends RowDataPacket {
    id: number;
    user_id: number;
    client_app: number;
}

export class AuthTestDataRepository {
    async refreshTokensOf(db: DbExecutor, userIds: readonly number[]): Promise<UserTokenRow[]> {
        if (userIds.length === 0) return [];
        return db.query<UserTokenRow>(AuthTestDataSQL.refreshTokensOf(userIds.length), userIds);
    }

    async passwordResetsOf(db: DbExecutor, userIds: readonly number[]): Promise<UserTokenRow[]> {
        if (userIds.length === 0) return [];
        return db.query<UserTokenRow>(AuthTestDataSQL.passwordResetsOf(userIds.length), userIds);
    }

    async deleteRefreshTokens(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(AuthTestDataSQL.deleteRefreshTokens(ids.length), ids)).affectedRows;
    }

    async deletePasswordResets(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(AuthTestDataSQL.deletePasswordResets(ids.length), ids)).affectedRows;
    }
}
