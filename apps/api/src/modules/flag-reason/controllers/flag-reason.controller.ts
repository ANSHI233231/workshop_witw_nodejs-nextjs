import type { Request, Response } from 'express';

import { created, ok } from '../../../core/http';
import type { IFlagReasonService } from '../contracts/flag-reason-service.contract';
import type {
    CreateFlagReasonBody,
    FlagReasonParams,
    FlagReasonStatusBody,
    ListFlagReasonQuery,
    UpdateFlagReasonBody,
} from '../validators/flag-reason.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

export class FlagReasonController {
    constructor(private readonly service: IFlagReasonService) {}

    active = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.listActive());
    };

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListFlagReasonQuery;
        ok(res, await this.service.list({ search: query.search, status: query.status }));
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const record = await this.service.create(req.body as CreateFlagReasonBody, signedInUserId(res));
        created(res, record, `Reason "${record.name}" added.`);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params as unknown as FlagReasonParams;
        const record = await this.service.update(id, req.body as UpdateFlagReasonBody, signedInUserId(res));
        ok(res, record, `Reason "${record.name}" updated.`);
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params as unknown as FlagReasonParams;
        const { status } = req.body as FlagReasonStatusBody;
        ok(res, await this.service.setStatus(id, status, signedInUserId(res)));
    };
}
