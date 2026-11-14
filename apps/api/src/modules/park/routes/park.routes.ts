import {
    type AccessGuard,
    type ApiRouter,
    apiRouter,
    asyncHandler,
    fileUpload,
    publicAccess,
} from '../../../core/http';
import { validate } from '../../../core/validation';
import type { ParkController } from '../controllers/park.controller';
import type { ParkWebsiteController } from '../controllers/park-website.controller';
import { FEATURE_IMAGE_FIELD, PARK_LIMITS } from '../types/park.types';
import {
    createParkSchema,
    featureImageSchema,
    listParkSchema,
    PARK_MESSAGES,
    parkIdSchema,
    parkSlugSchema,
    parkStatusSchema,
    updateParkSchema,
    websiteParkListSchema,
} from '../validators/park.validators';

const featureImageUpload = fileUpload({
    field: FEATURE_IMAGE_FIELD,
    maxFiles: 1,
    maxFileBytes: PARK_LIMITS.FEATURE_IMAGE_MAX_BYTES,
    tooLargeMessage: PARK_MESSAGES.IMAGE_SIZE,
});

export const createParkRouter = (
    controllers: { readonly console: ParkController; readonly website: ParkWebsiteController },
    superAdmin: AccessGuard,
): ApiRouter => {
    const route = apiRouter();
    const park = controllers.console;
    const website = controllers.website;

    route.get('/active', publicAccess, asyncHandler(park.active));

    route.get('/parks', publicAccess, validate(websiteParkListSchema), asyncHandler(website.list));
    route.get('/parks/:slug', publicAccess, validate(parkSlugSchema), asyncHandler(website.page));
    route.get('/parks/:slug/feature-image', publicAccess, validate(parkSlugSchema), asyncHandler(website.featureImage));

    route.get('/', superAdmin, validate(listParkSchema), asyncHandler(park.list));
    route.get('/:id', superAdmin, validate(parkIdSchema), asyncHandler(park.detail));
    route.post('/', superAdmin, validate(createParkSchema), asyncHandler(park.create));
    route.put('/:id', superAdmin, validate(updateParkSchema), asyncHandler(park.update));
    route.patch('/:id/status', superAdmin, validate(parkStatusSchema), asyncHandler(park.setStatus));
    route.get('/:id/feature-image', superAdmin, validate(featureImageSchema), asyncHandler(park.featureImage));
    route.put(
        '/:id/feature-image',
        superAdmin,
        featureImageUpload,
        validate(featureImageSchema),
        asyncHandler(park.setFeatureImage),
    );

    return route;
};
