import type { Request, Response } from 'express';

import { ok, paginated } from '../../../core/http';
import type { IQuoteRequestConsoleService } from '../contracts/quote-request-console-service.contract';
import { QuoteRequestStatus } from '../types/quote-request.types';
import type { ConsoleListQuery, StatusBody } from '../validators/quote-request.validators';
import { idOf, signedInUserId } from './request-values';

export class QuoteRequestConsoleController {
    constructor(private readonly service: IQuoteRequestConsoleService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ConsoleListQuery;
        const pagination = { page: query.page, limit: query.limit };
        const page = await this.service.list({ search: query.search, status: query.status }, pagination);
        paginated(res, page.items, { ...pagination, total: page.total });
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(idOf(req)));
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { status } = req.body as StatusBody;
        const quote = await this.service.setStatus(idOf(req), status, signedInUserId(res));
        ok(
            res,
            quote,
            status === QuoteRequestStatus.INACTIVE
                ? 'Request is now hidden from the partner and the user.'
                : 'Request is active again.',
        );
    };

    notifyPartner = async (req: Request, res: Response): Promise<void> => {
        const { message } = req.body as { readonly message: string };
        const quote = await this.service.notifyPartner(idOf(req), message, signedInUserId(res));
        ok(res, quote, `Notification sent to ${quote.partner.businessName}.`);
    };
}
