import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { GalleryConsoleController } from '../controllers/gallery-console.controller';
import type { GalleryPortalController } from '../controllers/gallery-portal.controller';
import { GALLERY_LIMITS } from '../types/gallery.types';
import {
    consoleListSchema,
    createGallerySchema,
    GALLERY_MESSAGES,
    galleryIdSchema,
    galleryPhotoSchema,
    listTabSchema,
    reasonSchema,
    saveDraftSchema,
} from '../validators/gallery.validators';

export type GalleryAccess = {
    readonly signedIn: AccessGuard;
    readonly superAdmin: AccessGuard;
};

const photosUpload = fileUpload({
    field: 'photos',
    maxFiles: GALLERY_LIMITS.PHOTOS_PER_UPLOAD,
    maxFileBytes: GALLERY_LIMITS.PHOTO_MAX_BYTES,
    tooLargeMessage: GALLERY_MESSAGES.PHOTO_SIZE,
});

const photoUpload = fileUpload({
    field: 'photo',
    maxFiles: 1,
    maxFileBytes: GALLERY_LIMITS.PHOTO_MAX_BYTES,
    tooLargeMessage: GALLERY_MESSAGES.PHOTO_SIZE,
});

export const createGalleryRouter = (
    controllers: { readonly portal: GalleryPortalController; readonly console: GalleryConsoleController },
    access: GalleryAccess,
): ApiRouter => {
    const route = apiRouter();
    const { portal, console: admin } = controllers;
    const { signedIn, superAdmin } = access;

    route.get('/galleries', signedIn, validate(listTabSchema), asyncHandler(portal.list));
    route.post('/galleries', signedIn, validate(createGallerySchema), asyncHandler(portal.create));
    route.get('/galleries/:id', signedIn, validate(galleryIdSchema), asyncHandler(portal.detail));
    route.put('/galleries/:id', signedIn, validate(saveDraftSchema), asyncHandler(portal.saveDraft));
    route.delete('/galleries/:id', signedIn, validate(galleryIdSchema), asyncHandler(portal.deleteDraft));
    route.post('/galleries/:id/send', signedIn, validate(galleryIdSchema), asyncHandler(portal.send));
    route.post('/galleries/:id/move-back', signedIn, validate(galleryIdSchema), asyncHandler(portal.moveBack));
    route.post('/galleries/:id/edit', signedIn, validate(galleryIdSchema), asyncHandler(portal.startEdit));
    route.post('/galleries/:id/photos', signedIn, photosUpload, validate(galleryIdSchema), asyncHandler(portal.addPhotos));
    route.delete('/galleries/:id/photos/:photoId', signedIn, validate(galleryPhotoSchema), asyncHandler(portal.removePhoto));
    route.get('/galleries/:id/photos/:photoId/file', signedIn, validate(galleryPhotoSchema), asyncHandler(portal.photoFile));
    route.put(
        '/galleries/:id/photos/:photoId/file',
        signedIn,
        photoUpload,
        validate(galleryPhotoSchema),
        asyncHandler(portal.replacePhoto),
    );

    route.get('/admin/approvals', superAdmin, validate(consoleListSchema), asyncHandler(admin.listWaiting));
    route.get('/admin/galleries', superAdmin, validate(consoleListSchema), asyncHandler(admin.listApproved));
    route.get('/admin/galleries/:id', superAdmin, validate(galleryIdSchema), asyncHandler(admin.detail));
    route.post('/admin/galleries/:id/approve', superAdmin, validate(galleryIdSchema), asyncHandler(admin.approve));
    route.post('/admin/galleries/:id/reject', superAdmin, validate(reasonSchema), asyncHandler(admin.reject));
    route.post('/admin/galleries/:id/delete', superAdmin, validate(reasonSchema), asyncHandler(admin.remove));
    route.get(
        '/admin/galleries/:id/photos/:photoId/file',
        superAdmin,
        validate(galleryPhotoSchema),
        asyncHandler(admin.photoFile),
    );

    return route;
};
