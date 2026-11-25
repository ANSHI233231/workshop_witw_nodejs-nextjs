import type { DbExecutor } from '../../../database/connection';
import type { IWishlistRepository } from '../contracts/wishlist-repository.contract';
import type { SavedItem } from '../dto/wishlist.dto';
import { WishlistItemSQL } from '../sql/wishlist-item.sql';
import {
    type WishlistItemRow,
    WishlistItemStatus,
    type WishlistItemStatusCode,
    type WishlistItemTypeCode,
} from '../types/wishlist.types';

export class WishlistRepository implements IWishlistRepository {
    async savedOfUser(db: DbExecutor, userId: number, itemType: WishlistItemTypeCode): Promise<WishlistItemRow[]> {
        return db.query<WishlistItemRow>(WishlistItemSQL.savedOfUser, [userId, itemType, WishlistItemStatus.SAVED]);
    }

    async findPackageItem(db: DbExecutor, userId: number, packageId: number): Promise<WishlistItemRow | undefined> {
        return (await db.query<WishlistItemRow>(WishlistItemSQL.findPackageItem, [userId, packageId]))[0];
    }

    async findSafariItem(db: DbExecutor, userId: number, sharedSafariId: number): Promise<WishlistItemRow | undefined> {
        return (await db.query<WishlistItemRow>(WishlistItemSQL.findSafariItem, [userId, sharedSafariId]))[0];
    }

    async save(db: DbExecutor, item: SavedItem): Promise<number> {
        const result = await db.execute(WishlistItemSQL.save, [
            item.userId,
            item.itemType,
            item.packageId,
            item.sharedSafariId,
            item.savedPricePerPerson,
            WishlistItemStatus.SAVED,
            item.userId,
            item.userId,
        ]);
        return result.insertId;
    }

    async setStatus(
        db: DbExecutor,
        id: number,
        from: WishlistItemStatusCode,
        to: WishlistItemStatusCode,
        actorId: number,
    ): Promise<boolean> {
        return (await db.execute(WishlistItemSQL.setStatus, [to, actorId, id, from])).affectedRows > 0;
    }

    async setHidden(db: DbExecutor, ids: readonly number[], isHidden: boolean, actorId: number): Promise<number> {
        if (ids.length === 0) return 0;
        const result = await db.execute(WishlistItemSQL.setHidden(ids.length), [
            isHidden ? 1 : 0,
            actorId,
            ...ids,
            WishlistItemStatus.SAVED,
        ]);
        return result.affectedRows;
    }

    async drop(db: DbExecutor, ids: readonly number[], actorId: number): Promise<number> {
        if (ids.length === 0) return 0;
        const result = await db.execute(WishlistItemSQL.drop(ids.length), [
            WishlistItemStatus.DROPPED,
            actorId,
            ...ids,
            WishlistItemStatus.SAVED,
        ]);
        return result.affectedRows;
    }
}
