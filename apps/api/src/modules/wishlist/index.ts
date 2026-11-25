import type {
    WishlistModuleDependencies,
    WishlistTestDataModuleDependencies,
} from './contracts/wishlist-module.contract';
import type { IWishlistService } from './contracts/wishlist-service.contract';
import type { IWishlistTestDataService } from './contracts/wishlist-test-data-service.contract';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistTestDataRepository } from './repositories/wishlist-test-data.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { createWishlistRouter } from './routes/wishlist.routes';
import { WishlistTestDataService } from './services/wishlist-test-data.service';
import { WishlistService } from './services/wishlist.service';
import type { AccessGuard } from '../../core/http';

export type { WishlistModuleDependencies } from './contracts/wishlist-module.contract';
export type { IWishlistService } from './contracts/wishlist-service.contract';
export { WishlistItemType, type WishlistItemTypeCode } from './types/wishlist.types';

export const createWishlistModule = (dependencies: WishlistModuleDependencies) => {
    const wishlistService: IWishlistService = new WishlistService(
        dependencies.db,
        new WishlistRepository(),
        dependencies.auditService,
        dependencies.packageService,
        dependencies.sharedSafariService,
        dependencies.partnerService,
    );
    const controller = new WishlistController(wishlistService);
    return {
        wishlistService,
        createRouter: (signedIn: AccessGuard) => createWishlistRouter(controller, signedIn),
    };
};

export type { IWishlistTestDataService } from './contracts/wishlist-test-data-service.contract';
export type { WishlistTestData, WishlistTestDataScope } from './dto/wishlist-test-data.dto';

export const createWishlistTestDataModule = (dependencies: WishlistTestDataModuleDependencies) => {
    const wishlistTestDataService: IWishlistTestDataService = new WishlistTestDataService(
        dependencies.db,
        new WishlistTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { wishlistTestDataService };
};
