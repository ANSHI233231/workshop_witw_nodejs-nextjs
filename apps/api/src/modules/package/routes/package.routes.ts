import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { PackageConsoleController } from '../controllers/package-console.controller';
import type { PackagePortalController } from '../controllers/package-portal.controller';
import type { PackageWebsiteController } from '../controllers/package-website.controller';
import { PACKAGE_LIMITS } from '../types/package.types';
import {
    adminDeleteSchema,
    approvalsListSchema,
    basicSchema,
    consoleListSchema,
    createPackageSchema,
    dayImageSchema,
    faqsSchema,
    gettingThereSchema,
    imageSchema,
    inclusionsSchema,
    itinerarySchema,
    PACKAGE_MESSAGES,
    packageIdSchema,
    portalListSchema,
    reasonCreateSchema,
    reasonListSchema,
    reasonStatusSchema,
    reasonUpdateSchema,
    rejectSchema,
    switchSchema,
    versionFileSchema,
    versionIdSchema,
    websiteFileSchema,
    websiteListSchema,
    websiteSlugSchema,
    websiteStatusSchema,
} from '../validators/package.validators';

export type PackageAccess = {
    readonly signedIn: AccessGuard;
    readonly superAdmin: AccessGuard;
};

export type PackageControllers = {
    readonly portal: PackagePortalController;
    readonly console: PackageConsoleController;
    readonly website: PackageWebsiteController;
};

const imageUpload = fileUpload({
    field: 'image',
    maxFiles: 1,
    maxFileBytes: PACKAGE_LIMITS.IMAGE_MAX_BYTES,
    tooLargeMessage: PACKAGE_MESSAGES.IMAGE_SIZE,
});

const dayImageUpload = fileUpload({
    field: 'image',
    maxFiles: 1,
    maxFileBytes: PACKAGE_LIMITS.DAY_IMAGE_MAX_BYTES,
    tooLargeMessage: PACKAGE_MESSAGES.DAY_IMAGE_SIZE,
});

const VERSION = '/packages/:id/versions/:versionId';

export const createPackageRouter = (controllers: PackageControllers, access: PackageAccess): ApiRouter => {
    const route = apiRouter();
    const { portal, console: admin, website } = controllers;
    const { signedIn, superAdmin } = access;

    route.get('/packages', publicAccess, validate(websiteListSchema), asyncHandler(website.list));
    route.get('/packages/:slug', publicAccess, validate(websiteSlugSchema), asyncHandler(website.page));
    route.get('/packages/:slug/files/:fileName', publicAccess, validate(websiteFileSchema), asyncHandler(website.file));

    route.get('/portal/dashboard', signedIn, asyncHandler(portal.dashboard));
    route.get('/portal/form-options', signedIn, asyncHandler(portal.formOptions));
    route.get('/portal/packages', signedIn, validate(portalListSchema), asyncHandler(portal.list));
    route.post('/portal/packages', signedIn, validate(createPackageSchema), asyncHandler(portal.create));
    route.get('/portal/packages/:id', signedIn, validate(packageIdSchema), asyncHandler(portal.detail));
    route.post('/portal/packages/:id/edit', signedIn, validate(packageIdSchema), asyncHandler(portal.startEdit));
    route.put('/portal/packages/:id/website-status', signedIn, validate(websiteStatusSchema), asyncHandler(portal.setWebsiteStatus));
    route.get(`/portal${VERSION}`, signedIn, validate(versionIdSchema), asyncHandler(portal.version));
    route.delete(`/portal${VERSION}`, signedIn, validate(versionIdSchema), asyncHandler(portal.deleteWorking));
    route.post(`/portal${VERSION}/send`, signedIn, validate(versionIdSchema), asyncHandler(portal.send));
    route.put(`/portal${VERSION}/basic`, signedIn, validate(basicSchema), asyncHandler(portal.saveBasic));
    route.put(`/portal${VERSION}/itinerary`, signedIn, validate(itinerarySchema), asyncHandler(portal.saveItinerary));
    route.put(`/portal${VERSION}/inclusions`, signedIn, validate(inclusionsSchema), asyncHandler(portal.saveInclusions));
    route.put(`/portal${VERSION}/getting-there`, signedIn, validate(gettingThereSchema), asyncHandler(portal.saveGettingThere));
    route.put(`/portal${VERSION}/faqs`, signedIn, validate(faqsSchema), asyncHandler(portal.saveFaqs));
    route.put(`/portal${VERSION}/images/:kind`, signedIn, imageUpload, validate(imageSchema), asyncHandler(portal.setImage));
    route.delete(`/portal${VERSION}/images/:kind`, signedIn, validate(imageSchema), asyncHandler(portal.removeImage));
    route.put(
        `/portal${VERSION}/days/:dayNumber/image`,
        signedIn,
        dayImageUpload,
        validate(dayImageSchema),
        asyncHandler(portal.setImage),
    );
    route.delete(`/portal${VERSION}/days/:dayNumber/image`, signedIn, validate(dayImageSchema), asyncHandler(portal.removeImage));
    route.get(`/portal${VERSION}/files/:fileName`, signedIn, validate(versionFileSchema), asyncHandler(portal.file));

    route.get('/admin/approvals', superAdmin, validate(approvalsListSchema), asyncHandler(admin.approvals));
    route.get('/admin/packages', superAdmin, validate(consoleListSchema), asyncHandler(admin.list));
    route.get('/admin/packages/:id', superAdmin, validate(packageIdSchema), asyncHandler(admin.detail));
    route.get('/admin/packages/:id/form-options', superAdmin, validate(packageIdSchema), asyncHandler(admin.formOptions));
    route.post('/admin/packages/:id/delete', superAdmin, validate(adminDeleteSchema), asyncHandler(admin.remove));
    route.put('/admin/packages/:id/popular', superAdmin, validate(switchSchema), asyncHandler(admin.setPopular));
    route.put('/admin/packages/:id/best-deal', superAdmin, validate(switchSchema), asyncHandler(admin.setBestDeal));
    route.get(`/admin${VERSION}`, superAdmin, validate(versionIdSchema), asyncHandler(admin.version));
    route.post(`/admin${VERSION}/approve`, superAdmin, validate(versionIdSchema), asyncHandler(admin.approve));
    route.post(`/admin${VERSION}/reject`, superAdmin, validate(rejectSchema), asyncHandler(admin.reject));
    route.put(`/admin${VERSION}/basic`, superAdmin, validate(basicSchema), asyncHandler(admin.saveBasic));
    route.put(`/admin${VERSION}/itinerary`, superAdmin, validate(itinerarySchema), asyncHandler(admin.saveItinerary));
    route.put(`/admin${VERSION}/inclusions`, superAdmin, validate(inclusionsSchema), asyncHandler(admin.saveInclusions));
    route.put(`/admin${VERSION}/getting-there`, superAdmin, validate(gettingThereSchema), asyncHandler(admin.saveGettingThere));
    route.put(`/admin${VERSION}/faqs`, superAdmin, validate(faqsSchema), asyncHandler(admin.saveFaqs));
    route.put(`/admin${VERSION}/images/:kind`, superAdmin, imageUpload, validate(imageSchema), asyncHandler(admin.setImage));
    route.delete(`/admin${VERSION}/images/:kind`, superAdmin, validate(imageSchema), asyncHandler(admin.removeImage));
    route.put(
        `/admin${VERSION}/days/:dayNumber/image`,
        superAdmin,
        dayImageUpload,
        validate(dayImageSchema),
        asyncHandler(admin.setImage),
    );
    route.delete(`/admin${VERSION}/days/:dayNumber/image`, superAdmin, validate(dayImageSchema), asyncHandler(admin.removeImage));
    route.get(`/admin${VERSION}/files/:fileName`, superAdmin, validate(versionFileSchema), asyncHandler(admin.file));

    route.get('/admin/delete-reasons', superAdmin, validate(reasonListSchema), asyncHandler(admin.reasonList));
    route.get('/admin/delete-reasons/active', superAdmin, asyncHandler(admin.reasonActive));
    route.post('/admin/delete-reasons', superAdmin, validate(reasonCreateSchema), asyncHandler(admin.reasonAdd));
    route.put('/admin/delete-reasons/:id', superAdmin, validate(reasonUpdateSchema), asyncHandler(admin.reasonUpdate));
    route.put('/admin/delete-reasons/:id/status', superAdmin, validate(reasonStatusSchema), asyncHandler(admin.reasonStatus));

    return route;
};
