import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { WishlistController } from '../controllers/wishlist.controller';
import { packageItemSchema, safariItemSchema, wishlistPageSchema } from '../validators/wishlist.validators';

export const createWishlistRouter = (controller: WishlistController, signedIn: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.get('/ids', signedIn, asyncHandler(controller.ids));
    route.get('/packages', signedIn, validate(wishlistPageSchema), asyncHandler(controller.packages));
    route.put('/packages/:id', signedIn, validate(packageItemSchema), asyncHandler(controller.addPackage));
    route.delete('/packages/:id', signedIn, validate(packageItemSchema), asyncHandler(controller.removePackage));
    route.get('/shared-safaris', signedIn, validate(wishlistPageSchema), asyncHandler(controller.sharedSafaris));
    route.put('/shared-safaris/:id', signedIn, validate(safariItemSchema), asyncHandler(controller.addSharedSafari));
    route.delete(
        '/shared-safaris/:id',
        signedIn,
        validate(safariItemSchema),
        asyncHandler(controller.removeSharedSafari),
    );

    return route;
};
