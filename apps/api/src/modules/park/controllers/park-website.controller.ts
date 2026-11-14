import type { Request, Response } from 'express';

import { ok, paginated, sendInline } from '../../../core/http';
import type { IParkWebsiteService } from '../contracts/park-website-service.contract';
import type { ParkSlugParams, WebsiteParkListQuery } from '../validators/park.validators';

const slugOf = (req: Request): string => (req.params as unknown as ParkSlugParams).slug;

export class ParkWebsiteController {
    constructor(private readonly service: IParkWebsiteService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as WebsiteParkListQuery;
        const result = await this.service.list({
            search: query.search,
            region: query.region,
            sort: query.sort,
            page: query.page,
        });
        paginated(res, result.items, { page: result.page, limit: result.limit, total: result.total });
    };

    page = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.page(slugOf(req)));
    };

    featureImage = async (req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.service.featureImage(slugOf(req))), isPublic: true });
    };
}
