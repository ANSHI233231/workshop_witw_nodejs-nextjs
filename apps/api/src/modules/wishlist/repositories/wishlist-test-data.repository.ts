import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { WishlistTestDataSQL } from '../sql/wishlist-test-data.sql';

export interface TestWishlistItemRow extends RowDataPacket {
    id: number;
    user_id: number;
    item_type: number;
    package_id: number | null;
    shared_safari_id: number | null;
}

export class WishlistTestDataRepository {
    async marked(
        db: DbExecutor,
        userIds: readonly number[],
        packageIds: readonly number[],
        sharedSafariIds: readonly number[],
    ): Promise<TestWishlistItemRow[]> {
        return db.query<TestWishlistItemRow>(
            WishlistTestDataSQL.marked(userIds.length, packageIds.length, sharedSafariIds.length),
            [...userIds, ...packageIds, ...sharedSafariIds],
        );
    }

    async deleteItems(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(WishlistTestDataSQL.deleteItems(ids.length), [...ids])).affectedRows;
    }
}
