import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { AuditLogController } from '../controllers/audit-log.controller';
import { auditLogIdSchema, auditSummarySchema, listAuditLogsSchema } from '../validators/audit.validators';

export const createAuditRouter = (controller: AuditLogController, superAdmin: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.get('/logs', superAdmin, validate(listAuditLogsSchema), asyncHandler(controller.list));
    route.get('/logs/export', superAdmin, validate(listAuditLogsSchema), asyncHandler(controller.exportAll));
    route.get('/logs/:id', superAdmin, validate(auditLogIdSchema), asyncHandler(controller.detail));
    route.get('/summary', superAdmin, validate(auditSummarySchema), asyncHandler(controller.summary));
    route.get('/options', superAdmin, controller.options);

    return route;
};
