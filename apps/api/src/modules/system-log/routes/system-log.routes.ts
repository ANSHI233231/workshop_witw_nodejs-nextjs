import { AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { AppLogController } from '../controllers/app-log.controller';
import type { SystemLogController } from '../controllers/system-log.controller';
import { appLogIdSchema, ingestAppLogSchema, listAppLogSchema } from '../validators/app-log.validators';
import { logFileSchema, logLinesSchema } from '../validators/system-log.validators';

import { requireIngestKey } from './ingest-key.guard';

export const createSystemLogRouter = (
    controller: SystemLogController,
    appLogs: AppLogController,
    superAdmin: AccessGuard,
    ingestKey: string | null,
): ApiRouter => {
    const route = apiRouter();
    route.post('/app-log', AccessGuard.define('key', requireIngestKey(ingestKey)), validate(ingestAppLogSchema), asyncHandler(appLogs.ingest));
    route.get('/app-log', superAdmin, validate(listAppLogSchema), asyncHandler(appLogs.list));
    route.get('/app-log/:id', superAdmin, validate(appLogIdSchema), asyncHandler(appLogs.detail));
    route.get('/apps', superAdmin, asyncHandler(controller.apps));
    route.get('/:app/:name', superAdmin, validate(logLinesSchema), asyncHandler(controller.lines));
    route.get('/:app/:name/download', superAdmin, validate(logFileSchema), asyncHandler(controller.download));
    return route;
};
