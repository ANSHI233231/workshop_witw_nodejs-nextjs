import type { Request, Response } from 'express';

import { created, ok } from '../../../core/http';
import type { IQuoteRequestWebsiteService } from '../contracts/quote-request-website-service.contract';
import type { SendQuoteBody } from '../validators/quote-request.validators';
import { signedInUserId } from './request-values';

export class QuoteRequestWebsiteController {
    constructor(private readonly service: IQuoteRequestWebsiteService) {}

    send = async (req: Request, res: Response): Promise<void> => {
        const quote = await this.service.send(signedInUserId(res), req.body as SendQuoteBody);
        created(res, quote, `Your quote request is sent to ${quote.partner.businessName}.`);
    };

    mine = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.mine(signedInUserId(res)));
    };
}
