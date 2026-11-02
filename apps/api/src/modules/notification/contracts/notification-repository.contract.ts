import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { NewNotification, NotificationPlace } from '../dto/notification.dto';
import type { NotificationKindCode, NotificationKindCountRow, NotificationRow } from '../types/notification.types';

export type NotificationQuery = {
    readonly userId: number;
    readonly place: NotificationPlace;
    readonly unreadOnly: boolean;
    readonly kinds: readonly NotificationKindCode[] | undefined;
};

export interface INotificationRepository {
    list(db: DbExecutor, query: NotificationQuery, pagination: PaginationQuery): Promise<NotificationRow[]>;
    count(db: DbExecutor, query: NotificationQuery): Promise<number>;
    countsByKind(db: DbExecutor, userId: number, place: NotificationPlace): Promise<NotificationKindCountRow[]>;
    unreadCount(db: DbExecutor, userId: number, place: NotificationPlace): Promise<number>;
    insert(db: DbExecutor, rows: readonly NewNotification[]): Promise<number>;
    markRead(db: DbExecutor, id: number, userId: number): Promise<boolean>;
    markUnread(db: DbExecutor, id: number, userId: number): Promise<boolean>;
    markAllRead(db: DbExecutor, userId: number, place: NotificationPlace): Promise<number>;
    markEntityRead(db: DbExecutor, userId: number, entityType: number, entityId: number): Promise<void>;
}
