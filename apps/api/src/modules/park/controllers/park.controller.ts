import type { Request, Response } from 'express';

import { created, ok, paginated } from '../../../core/http';
import type { IParkService } from '../contracts/park-service.contract';
import type { ParkInput, ParkUpdate } from '../dto/park.dto';
import { ParkStatus, type ParkStatusCode } from '../types/park.types';
import type { ListParkQuery, ParkParams } from '../validators/park.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const parkIdOf = (req: Request): number => (req.params as unknown as ParkParams).id;

export class ParkController {
    constructor(private readonly service: IParkService) {}

    active = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.listActive());
    };

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListParkQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.list(
            { search: query.search, region: query.region, status: query.status },
            pagination,
        );
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(parkIdOf(req)));
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const park = await this.service.create(req.body as ParkInput, signedInUserId(res));
        created(res, park, `Park "${park.name}" added.`);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const park = await this.service.update(parkIdOf(req), req.body as ParkUpdate, signedInUserId(res));
        ok(res, park, `Park "${park.name}" updated.`);
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { status } = req.body as { readonly status: ParkStatusCode };
        const park = await this.service.setStatus(parkIdOf(req), status, signedInUserId(res));
        ok(res, park, `Park "${park.name}" is now ${park.status === ParkStatus.ACTIVE ? 'active' : 'inactive'}.`);
    };
}
