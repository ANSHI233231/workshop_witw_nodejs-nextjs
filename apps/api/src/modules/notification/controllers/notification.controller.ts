import type { Request, Response } from 'express';

import { ClientApp, getRequestContext } from '../../../core/context';
import { noContent, ok, paginated } from '../../../core/http';
import type { INotificationFeedService } from '../contracts/notification-service.contract';
import type { NotificationPlace } from '../dto/notification.dto';
import type {
    ListNotificationQuery,
    NotificationOwnerQuery,
    NotificationParams,
} from '../validators/notification.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const placeOf = (query: NotificationOwnerQuery): NotificationPlace => ({
    clientApp: getRequestContext()?.clientApp ?? ClientApp.SYSTEM,
    ownerType: query.ownerType ?? null,
    ownerId: query.ownerId ?? null,
});

export class NotificationController {
    constructor(private readonly service: INotificationFeedService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListNotificationQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.list(
            signedInUserId(res),
            { place: placeOf(query), tab: query.tab },
            pagination,
        );
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    counts = async (req: Request, res: Response): Promise<void> => {
        ok(
            res,
            await this.service.counts(signedInUserId(res), placeOf(req.query as unknown as NotificationOwnerQuery)),
        );
    };

    unreadCount = async (req: Request, res: Response): Promise<void> => {
        const place = placeOf(req.query);
        ok(res, { unread: await this.service.unreadCount(signedInUserId(res), place) });
    };

    markRead = async (req: Request, res: Response): Promise<void> => {
        await this.service.markRead(signedInUserId(res), (req.params as unknown as NotificationParams).id);
        noContent(res);
    };

    markUnread = async (req: Request, res: Response): Promise<void> => {
        await this.service.markUnread(signedInUserId(res), (req.params as unknown as NotificationParams).id);
        noContent(res);
    };

    markAllRead = async (req: Request, res: Response): Promise<void> => {
        const place = placeOf(req.query);
        const marked = await this.service.markAllRead(signedInUserId(res), place);
        ok(res, { marked }, 'All notifications marked as read.');
    };
}
