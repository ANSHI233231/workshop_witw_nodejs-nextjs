import { type ApiRouter, apiRouter, asyncHandler, publicAccess } from '../../../core/http';
import type { HealthController } from '../controllers/health.controller';

export const createHealthRouter = (healthController: HealthController): ApiRouter => {
    const route = apiRouter();

    route.get('/', publicAccess, asyncHandler(healthController.check));

    return route;
};
