import type { Request, Response } from 'express';

import { ok, paginated } from '../../../core/http';
import { EXPORT_PAGE } from '../../../core/validation';
import type { IAuditLogService } from '../contracts/audit-log-service.contract';
import type { AuditLogFilters } from '../dto/audit.dto';
import type { AuditLogIdParams, AuditSummaryQuery, ListAuditLogsQuery } from '../validators/audit.validators';

const DAY_MS = 24 * 60 * 60 * 1000;

const utcDay = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

const toFilters = (query: AuditSummaryQuery): AuditLogFilters => ({
    search: query.search,
    module: query.module,
    action: query.action,
    outcome: query.outcome,
    clientApp: query.clientApp,
    from: query.from ? utcDay(query.from) : undefined,
    toBefore: query.to ? new Date(utcDay(query.to).getTime() + DAY_MS) : undefined,
});

export class AuditLogController {
    constructor(private readonly auditLogService: IAuditLogService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListAuditLogsQuery;
        const result = await this.auditLogService.list(toFilters(query), { page: query.page, limit: query.limit });
        paginated(res, result.items, { page: query.page, limit: query.limit, total: result.total });
    };

    exportAll = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListAuditLogsQuery;
        ok(res, (await this.auditLogService.list(toFilters(query), EXPORT_PAGE)).items);
    };

    summary = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.auditLogService.summary(toFilters(req.query as unknown as AuditSummaryQuery)));
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.auditLogService.detail((req.params as unknown as AuditLogIdParams).id));
    };

    options = (_req: Request, res: Response): void => {
        ok(res, this.auditLogService.options());
    };
}
