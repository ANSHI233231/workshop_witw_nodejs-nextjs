import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { ConsoleSafariController } from '../controllers/console-safari.controller';
import type { WebsiteSafariController } from '../controllers/website-safari.controller';
import { SHARED_SAFARI_LIMITS } from '../types/shared-safari.types';
import {
    adminDeleteSchema,
    commentSchema,
    consoleListSchema,
    createSchema,
    editCommentSchema,
    flaggedListSchema,
    flagSchema,
    idSchema,
    mySchema,
    pinSchema,
    postCommentSchema,
    publicListSchema,
    statusSchema,
    updateSchema,
    viewSchema,
} from '../validators/shared-safari.validators';

export type SharedSafariAccess = {
    readonly viewer: AccessGuard;
    readonly signedIn: AccessGuard;
    readonly superAdmin: AccessGuard;
};

const coverUpload = fileUpload({
    field: 'image',
    maxFiles: 1,
    maxFileBytes: SHARED_SAFARI_LIMITS.IMAGE_MAX_BYTES,
    tooLargeMessage: 'Use an image up to 5 MB.',
});

export const createSharedSafariRouter = (
    controllers: { readonly website: WebsiteSafariController; readonly console: ConsoleSafariController },
    access: SharedSafariAccess,
): ApiRouter => {
    const route = apiRouter();
    const { website, console: admin } = controllers;
    const { viewer, signedIn, superAdmin } = access;

    route.get('/safaris', viewer, validate(publicListSchema), asyncHandler(website.list));
    route.get('/mine', signedIn, validate(mySchema), asyncHandler(website.mine));
    route.get('/safaris/:id/cover-image', viewer, validate(idSchema), asyncHandler(website.cover));
    route.get('/safaris/:id/edit', signedIn, validate(idSchema), asyncHandler(website.editForm));
    route.get('/safaris/:ref', viewer, validate(viewSchema), asyncHandler(website.view));
    route.post('/safaris', signedIn, validate(createSchema), asyncHandler(website.create));
    route.put('/safaris/:id', signedIn, validate(updateSchema), asyncHandler(website.update));
    route.put('/safaris/:id/cover-image', signedIn, coverUpload, validate(idSchema), asyncHandler(website.uploadCover));
    route.patch('/safaris/:id/status', signedIn, validate(statusSchema), asyncHandler(website.setStatus));
    route.delete('/safaris/:id', signedIn, validate(idSchema), asyncHandler(website.remove));
    route.post('/safaris/:id/join', signedIn, validate(idSchema), asyncHandler(website.join));
    route.post('/safaris/:id/leave', signedIn, validate(idSchema), asyncHandler(website.leave));
    route.post('/safaris/:id/comments', signedIn, validate(postCommentSchema), asyncHandler(website.postComment));
    route.patch('/comments/:id', signedIn, validate(editCommentSchema), asyncHandler(website.editComment));
    route.delete('/comments/:id', signedIn, validate(commentSchema), asyncHandler(website.removeComment));
    route.post('/comments/:id/flags', signedIn, validate(flagSchema), asyncHandler(website.flag));

    route.get('/admin/safaris', superAdmin, validate(consoleListSchema), asyncHandler(admin.list));
    route.get('/admin/hosts', superAdmin, asyncHandler(admin.hosts));
    route.get('/admin/safaris/:id', superAdmin, validate(idSchema), asyncHandler(admin.detail));
    route.get('/admin/safaris/:id/cover-image', superAdmin, validate(idSchema), asyncHandler(admin.cover));
    route.post('/admin/safaris/:id/delete', superAdmin, validate(adminDeleteSchema), asyncHandler(admin.remove));
    route.post('/admin/safaris/:id/make-active', superAdmin, validate(idSchema), asyncHandler(admin.makeActive));
    route.patch('/admin/safaris/:id/pin', superAdmin, validate(pinSchema), asyncHandler(admin.setPinned));
    route.delete('/admin/comments/:id', superAdmin, validate(commentSchema), asyncHandler(admin.removeComment));
    route.post('/admin/comments/:id/ignore-flags', superAdmin, validate(commentSchema), asyncHandler(admin.ignoreFlags));
    route.get('/admin/comments/:id/flags', superAdmin, validate(commentSchema), asyncHandler(admin.flagsOf));
    route.get('/admin/flagged-comments', superAdmin, validate(flaggedListSchema), asyncHandler(admin.flagged));

    return route;
};
