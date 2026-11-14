import type { Request, Response } from 'express';

import { ok, paginated, sendInline } from '../../../core/http';
import type { IGalleryConsoleService } from '../contracts/gallery-console-service.contract';
import type { GalleryConsolePage } from '../dto/gallery.dto';
import type { ConsoleListQuery, GalleryParams, GalleryPhotoParams } from '../validators/gallery.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const idOf = (req: Request): number => (req.params as unknown as GalleryParams).id;

const reasonOf = (req: Request): string => (req.body as { readonly reason: string }).reason;

const listQueryOf = (req: Request) => {
    const query = req.query as unknown as ConsoleListQuery;
    return { filters: { search: query.search }, pagination: { page: query.page, limit: query.limit } };
};

const sendPage = (res: Response, page: GalleryConsolePage, pagination: { page: number; limit: number }): void => {
    paginated(res, page.items, { ...pagination, total: page.total });
};

export class GalleryConsoleController {
    constructor(private readonly service: IGalleryConsoleService) {}

    listWaiting = async (req: Request, res: Response): Promise<void> => {
        const { filters, pagination } = listQueryOf(req);
        sendPage(res, await this.service.listWaiting(filters, pagination), pagination);
    };

    listApproved = async (req: Request, res: Response): Promise<void> => {
        const { filters, pagination } = listQueryOf(req);
        sendPage(res, await this.service.listApproved(filters, pagination), pagination);
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(idOf(req)));
    };

    approve = async (req: Request, res: Response): Promise<void> => {
        const gallery = await this.service.approve(idOf(req), signedInUserId(res));
        ok(res, gallery, `${gallery.title} is approved.`);
    };

    reject = async (req: Request, res: Response): Promise<void> => {
        const gallery = await this.service.reject(idOf(req), reasonOf(req), signedInUserId(res));
        ok(res, gallery, 'Gallery rejected. It is back in draft with your reason.');
    };

    remove = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.remove(idOf(req), reasonOf(req), signedInUserId(res)), 'Gallery deleted.');
    };

    photoFile = async (req: Request, res: Response): Promise<void> => {
        const file = await this.service.photoFile(idOf(req), (req.params as unknown as GalleryPhotoParams).photoId);
        sendInline(res, { ...file, isPublic: false });
    };
}
