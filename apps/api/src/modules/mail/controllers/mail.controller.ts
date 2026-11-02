import type { Request, Response } from 'express';

import { ok, paginated } from '../../../core/http';
import type { IMailService } from '../contracts/mail-service.contract';
import type { MailLogStatusCode, MailTemplateStatusCode } from '../types/mail.types';
import type {
    ListMailLogsQuery,
    ListMailTemplatesQuery,
    MailLogIdParams,
    MailTemplateIdParams,
} from '../validators/mail.validators';

export class MailController {
    constructor(private readonly mailService: IMailService) {}

    logs = async (req: Request, res: Response): Promise<void> => {
        const { search, status, template, page, limit } = req.query as unknown as ListMailLogsQuery;
        const result = await this.mailService.listLogs(
            { search, status: status as MailLogStatusCode | undefined, templateCode: template },
            { page, limit },
        );
        paginated(res, result.items, { page, limit, total: result.total });
    };

    logDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.mailService.logDetail((req.params as unknown as MailLogIdParams).id));
    };

    templates = async (req: Request, res: Response): Promise<void> => {
        const { search, status } = req.query as unknown as ListMailTemplatesQuery;
        ok(res, await this.mailService.listTemplates({ search, status: status as MailTemplateStatusCode | undefined }));
    };

    templateDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.mailService.templateDetail((req.params as unknown as MailTemplateIdParams).id));
    };
}
