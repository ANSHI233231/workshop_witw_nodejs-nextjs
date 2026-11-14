import type { Request, Response } from 'express';

import { ok, sendInline } from '../../../core/http';
import type { IPackageService } from '../contracts/package-service.contract';
import type { WebsiteQuery } from '../dto/package.dto';
import { fileNameOf } from './request-values';

const slugOf = (req: Request): string => (req.params as unknown as { slug: string }).slug;

export class PackageWebsiteController {
    constructor(private readonly service: IPackageService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.listShown(req.query as unknown as WebsiteQuery));
    };

    page = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.pageBySlug(slugOf(req)));
    };

    file = async (req: Request, res: Response): Promise<void> => {
        const file = await this.service.websiteFile(slugOf(req), fileNameOf(req));
        sendInline(res, { ...file, isPublic: true });
    };
}
