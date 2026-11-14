import type { Request, Response } from 'express';

import { ok } from '../../../core/http';
import type { IQuoteRequestPortalService } from '../contracts/quote-request-portal-service.contract';
import { QuoteMark } from '../types/quote-request.types';
import type { MarkBody } from '../validators/quote-request.validators';
import { idOf, signedInUserId } from './request-values';

export class QuoteRequestPortalController {
    constructor(private readonly service: IQuoteRequestPortalService) {}

    list = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.list(signedInUserId(res)));
    };

    summary = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.summary(signedInUserId(res)));
    };

    mark = async (req: Request, res: Response): Promise<void> => {
        const { mark } = req.body as MarkBody;
        const quote = await this.service.mark(signedInUserId(res), idOf(req), mark);
        ok(res, quote, mark === QuoteMark.HOT ? 'Marked Hot.' : 'Marked Cold.');
    };
}
