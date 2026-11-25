import type { RowDataPacket } from '../../../database/connection';

export const WishlistItemType = { PACKAGE: 1, SHARED_SAFARI: 2 } as const;

export type WishlistItemTypeCode = (typeof WishlistItemType)[keyof typeof WishlistItemType];

export const WishlistItemStatus = { SAVED: 1, DROPPED: 2, REMOVED: -1 } as const;

export type WishlistItemStatusCode = (typeof WishlistItemStatus)[keyof typeof WishlistItemStatus];

export const WISHLIST_LIMITS = { PAGE_SIZE: 6 } as const;

export interface WishlistItemRow extends RowDataPacket {
    id: number;
    user_id: number;
    item_type: WishlistItemTypeCode;
    package_id: number | null;
    shared_safari_id: number | null;
    saved_price_per_person: number | null;
    is_hidden: number;
    saved_at: Date;
    status: WishlistItemStatusCode;
}
