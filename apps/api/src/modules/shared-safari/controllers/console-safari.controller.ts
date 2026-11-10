import type { Request, Response } from 'express';

import { ok, paginated, sendInline } from '../../../core/http';
import type { IConsoleSafariService } from '../contracts/console-safari-service.contract';
import type { AdminDeleteInput } from '../dto/shared-safari.dto';
import type { ConsoleListQuery, FlaggedListQuery } from '../validators/shared-safari.validators';

type SignedInUser = { readonly id: number };

const actorOf = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const idOf = (req: Request): number => (req.params as unknown as { id: number }).id;

export class ConsoleSafariController {
    constructor(private readonly service: IConsoleSafariService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ConsoleListQuery;
        const result = await this.service.list(
            { search: query.search, status: query.status, hostId: query.hostId },
            query.page,
            query.limit,
        );
        paginated(res, result.items, { page: query.page, limit: query.limit, total: result.total });
    };

    hosts = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.hosts());
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(idOf(req)));
    };

    cover = async (req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.service.cover(idOf(req))), isPublic: false });
    };

    remove = async (req: Request, res: Response): Promise<void> => {
        await this.service.remove(idOf(req), req.body as AdminDeleteInput, actorOf(res));
        ok(res, null, 'Safari deleted.');
    };

    makeActive = async (req: Request, res: Response): Promise<void> => {
        await this.service.makeActive(idOf(req), actorOf(res));
        ok(res, null, 'Safari is active again.');
    };

    setPinned = async (req: Request, res: Response): Promise<void> => {
        const { pinned } = req.body as { pinned: boolean };
        await this.service.setPinned(idOf(req), pinned, actorOf(res));
        ok(res, null, pinned ? 'Safari pinned.' : 'Safari unpinned.');
    };

    removeComment = async (req: Request, res: Response): Promise<void> => {
        await this.service.removeComment(idOf(req), actorOf(res));
        ok(res, null, 'Comment deleted.');
    };

    ignoreFlags = async (req: Request, res: Response): Promise<void> => {
        await this.service.ignoreFlags(idOf(req), actorOf(res));
        ok(res, null, 'Flags ignored.');
    };

    flagged = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as FlaggedListQuery;
        const result = await this.service.flagged(query.search, query.page, query.limit);
        paginated(res, result.items, { page: query.page, limit: query.limit, total: result.total });
    };

    flagsOf = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.flagsOf(idOf(req)));
    };
}
