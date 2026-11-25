import type { DbExecutor } from '../../../database/connection';
import { ProfileTestDataSQL } from '../sql/profile-test-data.sql';
import type { TestProfileRow } from '../types/profile.types';

export class ProfileTestDataRepository {
    async ofUsers(db: DbExecutor, userIds: readonly number[]): Promise<TestProfileRow[]> {
        if (userIds.length === 0) return [];
        return db.query<TestProfileRow>(ProfileTestDataSQL.ofUsers(userIds.length), [...userIds]);
    }

    async deleteProfiles(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(ProfileTestDataSQL.deleteProfiles(ids.length), [...ids])).affectedRows;
    }
}
