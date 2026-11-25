import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { ProfileController } from '../controllers/profile.controller';
import { PROFILE_LIMITS, ProfileImageKind } from '../types/profile.types';
import {
    generalSchema,
    partnerIdSchema,
    partnerPageSchema,
    PROFILE_MESSAGES,
    userIdSchema,
    userImageSchema,
    userPageSchema,
} from '../validators/profile.validators';

export type ProfileAccess = {
    readonly signedIn: AccessGuard;
    readonly viewer: AccessGuard;
};

const photoUpload = fileUpload({
    field: 'photo',
    maxFiles: 1,
    maxFileBytes: PROFILE_LIMITS.PHOTO_MAX_BYTES,
    tooLargeMessage: PROFILE_MESSAGES.PHOTO_SIZE,
});

const coverPhotoUpload = fileUpload({
    field: 'coverPhoto',
    maxFiles: 1,
    maxFileBytes: PROFILE_LIMITS.COVER_PHOTO_MAX_BYTES,
    tooLargeMessage: PROFILE_MESSAGES.COVER_PHOTO_SIZE,
});

export const createProfileRouter = (controller: ProfileController, access: ProfileAccess): ApiRouter => {
    const route = apiRouter();
    const { signedIn, viewer } = access;
    const { PHOTO, COVER_PHOTO } = ProfileImageKind;

    route.get('/me', signedIn, asyncHandler(controller.mine));
    route.put('/me', signedIn, validate(generalSchema), asyncHandler(controller.saveGeneral));
    route.put('/me/photo', signedIn, photoUpload, asyncHandler(controller.setImage(PHOTO)));
    route.delete('/me/photo', signedIn, asyncHandler(controller.removeImage(PHOTO)));
    route.put('/me/cover-photo', signedIn, coverPhotoUpload, asyncHandler(controller.setImage(COVER_PHOTO)));
    route.delete('/me/cover-photo', signedIn, asyncHandler(controller.removeImage(COVER_PHOTO)));

    route.get('/users/:id', viewer, validate(userIdSchema), asyncHandler(controller.view));
    route.get('/users/:id/safaris', signedIn, validate(userPageSchema), asyncHandler(controller.safaris));
    route.get('/users/:id/photo', publicAccess, validate(userImageSchema), asyncHandler(controller.image(PHOTO)));
    route.get(
        '/users/:id/cover-photo',
        publicAccess,
        validate(userImageSchema),
        asyncHandler(controller.image(COVER_PHOTO)),
    );

    route.get('/partners/:id', publicAccess, validate(partnerIdSchema), asyncHandler(controller.partner));
    route.get('/partners/:id/packages', publicAccess, validate(partnerPageSchema), asyncHandler(controller.partnerPackages));
    route.get('/partners/:id/parks', publicAccess, validate(partnerPageSchema), asyncHandler(controller.partnerParks));

    return route;
};
