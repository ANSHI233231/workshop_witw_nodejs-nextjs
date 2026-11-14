import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { PartnerConsoleController } from '../controllers/partner-console.controller';
import type { PartnerRequestController } from '../controllers/partner-request.controller';
import { PARTNER_LIMITS } from '../types/partner.types';
import {
    editPartnerSchema,
    listPartnersSchema,
    listRequestsSchema,
    PARTNER_MESSAGES,
    partnerIdSchema,
    partnerStatusSchema,
    phoneNumbersSchema,
    rejectSchema,
    sendRequestSchema,
    sendWithAccountSchema,
} from '../validators/partner.validators';

export type PartnerAccess = {
    readonly signedIn: AccessGuard;
    readonly superAdmin: AccessGuard;
};

const logoUpload = fileUpload({
    field: 'logo',
    maxFiles: 1,
    maxFileBytes: PARTNER_LIMITS.LOGO_MAX_BYTES,
    tooLargeMessage: PARTNER_MESSAGES.LOGO_SIZE,
});

export const createPartnerRouter = (
    controllers: { readonly request: PartnerRequestController; readonly console: PartnerConsoleController },
    access: PartnerAccess,
): ApiRouter => {
    const route = apiRouter();
    const { request, console: admin } = controllers;
    const { signedIn, superAdmin } = access;

    route.post('/requests/with-account', publicAccess, validate(sendWithAccountSchema), asyncHandler(request.sendWithAccount));
    route.get('/requests/mine', signedIn, asyncHandler(request.mine));
    route.post('/requests', signedIn, validate(sendRequestSchema), asyncHandler(request.send));
    route.put('/requests/mine', signedIn, validate(sendRequestSchema), asyncHandler(request.sendAgain));
    route.get('/requests/mine/logo', signedIn, asyncHandler(request.logo));
    route.put('/requests/mine/logo', signedIn, logoUpload, asyncHandler(request.setLogo));
    route.delete('/requests/mine/logo', signedIn, asyncHandler(request.removeLogo));
    route.get('/partners/:id/logo', publicAccess, validate(partnerIdSchema), asyncHandler(request.partnerLogo));

    route.get('/admin/requests', superAdmin, validate(listRequestsSchema), asyncHandler(admin.listRequests));
    route.get('/admin/requests/:id', superAdmin, validate(partnerIdSchema), asyncHandler(admin.requestDetail));
    route.post('/admin/requests/:id/approve', superAdmin, validate(partnerIdSchema), asyncHandler(admin.approve));
    route.post('/admin/requests/:id/reject', superAdmin, validate(rejectSchema), asyncHandler(admin.reject));
    route.get('/admin/partners', superAdmin, validate(listPartnersSchema), asyncHandler(admin.listPartners));
    route.get('/admin/partners/:id', superAdmin, validate(partnerIdSchema), asyncHandler(admin.partnerDetail));
    route.put('/admin/partners/:id', superAdmin, validate(editPartnerSchema), asyncHandler(admin.edit));
    route.get('/admin/partners/:id/logo', superAdmin, validate(partnerIdSchema), asyncHandler(admin.logo));
    route.put('/admin/partners/:id/logo', superAdmin, logoUpload, validate(partnerIdSchema), asyncHandler(admin.setLogo));
    route.delete('/admin/partners/:id/logo', superAdmin, validate(partnerIdSchema), asyncHandler(admin.removeLogo));
    route.patch(
        '/admin/partners/:id/phone-numbers',
        superAdmin,
        validate(phoneNumbersSchema),
        asyncHandler(admin.setPhoneShown),
    );
    route.patch('/admin/partners/:id/status', superAdmin, validate(partnerStatusSchema), asyncHandler(admin.setStatus));

    return route;
};
