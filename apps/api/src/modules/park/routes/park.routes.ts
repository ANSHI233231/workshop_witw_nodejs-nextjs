import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { ParkController } from '../controllers/park.controller';
import {
    createParkSchema,
    listParkSchema,
    parkIdSchema,
    parkStatusSchema,
    updateParkSchema,
} from '../validators/park.validators';

export const createParkRouter = (park: ParkController, superAdmin: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.get('/active', publicAccess, asyncHandler(park.active));

    route.get('/', superAdmin, validate(listParkSchema), asyncHandler(park.list));
    route.get('/:id', superAdmin, validate(parkIdSchema), asyncHandler(park.detail));
    route.post('/', superAdmin, validate(createParkSchema), asyncHandler(park.create));
    route.put('/:id', superAdmin, validate(updateParkSchema), asyncHandler(park.update));
    route.patch('/:id/status', superAdmin, validate(parkStatusSchema), asyncHandler(park.setStatus));

    return route;
};
