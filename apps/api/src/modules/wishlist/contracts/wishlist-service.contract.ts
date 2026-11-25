import type {
    WishlistChangeDto,
    WishlistIdsDto,
    WishlistPackageDto,
    WishlistPage,
    WishlistSafariDto,
} from '../dto/wishlist.dto';

export interface IWishlistService {
    savedIds(userId: number): Promise<WishlistIdsDto>;
    packages(userId: number, page: number): Promise<WishlistPage<WishlistPackageDto>>;
    sharedSafaris(userId: number, page: number): Promise<WishlistPage<WishlistSafariDto>>;
    addPackage(userId: number, packageId: number): Promise<WishlistChangeDto>;
    removePackage(userId: number, packageId: number): Promise<WishlistChangeDto>;
    addSharedSafari(userId: number, sharedSafariId: number): Promise<WishlistChangeDto>;
    removeSharedSafari(userId: number, sharedSafariId: number): Promise<WishlistChangeDto>;
}
