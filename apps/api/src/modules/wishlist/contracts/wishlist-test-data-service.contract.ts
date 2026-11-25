import type { WishlistTestData, WishlistTestDataScope } from '../dto/wishlist-test-data.dto';

export interface IWishlistTestDataService {
    find(scope: WishlistTestDataScope): Promise<WishlistTestData>;
    remove(found: WishlistTestData): Promise<number>;
}
