import type { Request, Response } from 'express';

import { ok, paginated } from '../../../core/http';
import type { IAppLogService } from '../contracts/app-log-service.contract';
import { type AppLogLevelCode, type AppLogSourceCode, INGEST_SOURCES } from '../types/app-log.types';
import type { AppLogIdParams, IngestAppLogBody, ListAppLogQuery } from '../validators/app-log.validators';

export class AppLogController {
    constructor(private readonly service: IAppLogService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const { search, app, level, from, to, page, limit } = req.query as unknown as ListAppLogQuery;
        const result = await this.service.list(
            {
                search,
                sourceApp: app as AppLogSourceCode | undefined,
                logLevel: level as AppLogLevelCode | undefined,
                from,
                to,
            },
            { page, limit },
        );
        paginated(res, result.items, { page, limit, total: result.total });
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail((req.params as unknown as AppLogIdParams).id));
    };

    ingest = (req: Request, res: Response): Promise<void> => {
        const body = req.body as IngestAppLogBody;
        ok(res, { accepted: this.service.ingest(INGEST_SOURCES[body.app], body.entries) });
        return Promise.resolve();
    };
}
