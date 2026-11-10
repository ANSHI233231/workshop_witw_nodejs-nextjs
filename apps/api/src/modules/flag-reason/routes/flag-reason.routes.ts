import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { FlagReasonController } from '../controllers/flag-reason.controller';
import {
    createFlagReasonSchema,
    flagReasonStatusSchema,
    listFlagReasonSchema,
    updateFlagReasonSchema,
} from '../validators/flag-reason.validators';

export type FlagReasonAccess = { readonly signedIn: AccessGuard; readonly superAdmin: AccessGuard };

export const createFlagReasonRouter = (controller: FlagReasonController, access: FlagReasonAccess): ApiRouter => {
    const route = apiRouter();

    route.get('/active', access.signedIn, asyncHandler(controller.active));

    route.get('/', access.superAdmin, validate(listFlagReasonSchema), asyncHandler(controller.list));
    route.post('/', access.superAdmin, validate(createFlagReasonSchema), asyncHandler(controller.create));
    route.put('/:id', access.superAdmin, validate(updateFlagReasonSchema), asyncHandler(controller.update));
    route.patch('/:id/status', access.superAdmin, validate(flagReasonStatusSchema), asyncHandler(controller.setStatus));

    return route;
};
