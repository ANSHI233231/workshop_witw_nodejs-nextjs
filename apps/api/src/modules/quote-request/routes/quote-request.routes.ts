import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { QuoteRequestConsoleController } from '../controllers/quote-request-console.controller';
import type { QuoteRequestPortalController } from '../controllers/quote-request-portal.controller';
import type { QuoteRequestWebsiteController } from '../controllers/quote-request-website.controller';
import {
    consoleListSchema,
    markSchema,
    notifySchema,
    quoteIdSchema,
    sendQuoteSchema,
    statusSchema,
} from '../validators/quote-request.validators';

export type QuoteRequestAccess = {
    readonly signedIn: AccessGuard;
    readonly superAdmin: AccessGuard;
};

export type QuoteRequestControllers = {
    readonly website: QuoteRequestWebsiteController;
    readonly portal: QuoteRequestPortalController;
    readonly console: QuoteRequestConsoleController;
};

export const createQuoteRequestRouter = (controllers: QuoteRequestControllers, access: QuoteRequestAccess): ApiRouter => {
    const route = apiRouter();
    const { website, portal, console: admin } = controllers;
    const { signedIn, superAdmin } = access;

    route.post('/requests', signedIn, validate(sendQuoteSchema), asyncHandler(website.send));
    route.get('/requests/mine', signedIn, asyncHandler(website.mine));

    route.get('/portal/requests', signedIn, asyncHandler(portal.list));
    route.get('/portal/summary', signedIn, asyncHandler(portal.summary));
    route.put('/portal/requests/:id/mark', signedIn, validate(markSchema), asyncHandler(portal.mark));

    route.get('/admin/requests', superAdmin, validate(consoleListSchema), asyncHandler(admin.list));
    route.get('/admin/requests/:id', superAdmin, validate(quoteIdSchema), asyncHandler(admin.detail));
    route.patch('/admin/requests/:id/status', superAdmin, validate(statusSchema), asyncHandler(admin.setStatus));
    route.post('/admin/requests/:id/notify', superAdmin, validate(notifySchema), asyncHandler(admin.notifyPartner));

    return route;
};
