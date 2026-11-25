import type { DbExecutor } from '../../../database/connection';
import type { SavedItem } from '../dto/wishlist.dto';
import type { WishlistItemRow, WishlistItemStatusCode, WishlistItemTypeCode } from '../types/wishlist.types';

export interface IWishlistRepository {
    savedOfUser(db: DbExecutor, userId: number, itemType: WishlistItemTypeCode): Promise<WishlistItemRow[]>;
    findPackageItem(db: DbExecutor, userId: number, packageId: number): Promise<WishlistItemRow | undefined>;
    findSafariItem(db: DbExecutor, userId: number, sharedSafariId: number): Promise<WishlistItemRow | undefined>;
    save(db: DbExecutor, item: SavedItem): Promise<number>;
    setStatus(
        db: DbExecutor,
        id: number,
        from: WishlistItemStatusCode,
        to: WishlistItemStatusCode,
        actorId: number,
    ): Promise<boolean>;
    setHidden(db: DbExecutor, ids: readonly number[], isHidden: boolean, actorId: number): Promise<number>;
    drop(db: DbExecutor, ids: readonly number[], actorId: number): Promise<number>;
}
