import { ClientApp, type ClientAppCode, getRequestContext } from '../../../core/context';
import { ForbiddenException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { NotificationFeedGates } from '../contracts/notification-feed-gate.contract';
import type { INotificationFeedService } from '../contracts/notification-service.contract';
import type {
    NotificationCountsDto,
    NotificationFilters,
    NotificationPage,
    NotificationPlace,
} from '../dto/notification.dto';

const feedClosed = (): ForbiddenException =>
    new ForbiddenException('These notifications are not available to you.', 'NOTIFICATION_FEED_CLOSED');

export class GatedNotificationFeed implements INotificationFeedService {
    constructor(
        private readonly feed: INotificationFeedService,
        private readonly gates: NotificationFeedGates,
    ) {}

    async list(userId: number, filters: NotificationFilters, pagination: PaginationQuery): Promise<NotificationPage> {
        await this.open(userId, filters.place.clientApp);
        return this.feed.list(userId, filters, pagination);
    }

    async counts(userId: number, place: NotificationPlace): Promise<NotificationCountsDto> {
        await this.open(userId, place.clientApp);
        return this.feed.counts(userId, place);
    }

    async unreadCount(userId: number, place: NotificationPlace): Promise<number> {
        await this.open(userId, place.clientApp);
        return this.feed.unreadCount(userId, place);
    }

    async markRead(userId: number, id: number): Promise<void> {
        await this.open(userId, this.callingApp());
        await this.feed.markRead(userId, id);
    }

    async markUnread(userId: number, id: number): Promise<void> {
        await this.open(userId, this.callingApp());
        await this.feed.markUnread(userId, id);
    }

    async markAllRead(userId: number, place: NotificationPlace): Promise<number> {
        await this.open(userId, place.clientApp);
        return this.feed.markAllRead(userId, place);
    }

    private callingApp(): ClientAppCode {
        return getRequestContext()?.clientApp ?? ClientApp.SYSTEM;
    }

    private async open(userId: number, clientApp: ClientAppCode): Promise<void> {
        const gate = this.gates[clientApp];
        if (gate && !(await gate(userId))) throw feedClosed();
    }
}
