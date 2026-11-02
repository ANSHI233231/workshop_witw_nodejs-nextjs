import type { Request, Response } from 'express';

import { ok, sendDownload } from '../../../core/http';
import type { ISystemLogService } from '../contracts/system-log-service.contract';
import type { LogFileParams, LogLinesQuery } from '../validators/system-log.validators';

export class SystemLogController {
    constructor(private readonly service: ISystemLogService) {}

    apps = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.apps());
    };

    lines = async (req: Request, res: Response): Promise<void> => {
        const { app, name } = req.params as unknown as LogFileParams;
        const query = req.query as unknown as LogLinesQuery;
        ok(res, await this.service.lines(app, name, query.endLine, query.limit));
    };

    download = async (req: Request, res: Response): Promise<void> => {
        const { app, name } = req.params as unknown as LogFileParams;
        sendDownload(res, await this.service.download(app, name));
    };
}
