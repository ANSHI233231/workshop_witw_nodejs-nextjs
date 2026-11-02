import type { ClientAppCode } from '../../../core/context';
import type { PaginationQuery } from '../../../core/validation';
import type {
    NewNotification,
    NotificationCountsDto,
    NotificationFilters,
    NotificationPage,
    NotificationPlace,
} from '../dto/notification.dto';

export type TestNotification = {
    readonly userId: number;
    readonly clientApp: ClientAppCode;
    readonly message: string;
    readonly actorId: number | null;
};

export interface INotificationService {
    notify(notifications: readonly NewNotification[]): Promise<void>;
    markEntityRead(userId: number, entityType: number, entityId: number): Promise<void>;
    sendTest(notification: TestNotification): Promise<void>;
}

export interface INotificationFeedService {
    list(userId: number, filters: NotificationFilters, pagination: PaginationQuery): Promise<NotificationPage>;
    counts(userId: number, place: NotificationPlace): Promise<NotificationCountsDto>;
    unreadCount(userId: number, place: NotificationPlace): Promise<number>;
    markRead(userId: number, id: number): Promise<void>;
    markUnread(userId: number, id: number): Promise<void>;
    markAllRead(userId: number, place: NotificationPlace): Promise<number>;
}
