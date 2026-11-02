import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { INotificationRepository, NotificationQuery } from '../contracts/notification-repository.contract';
import type { NewNotification, NotificationPlace } from '../dto/notification.dto';
import { type NotificationListShape, NotificationSQL } from '../sql/notification.sql';
import {
    type NotificationKindCountRow,
    type NotificationRow,
    NotificationStatus,
    type NotificationTotalRow,
} from '../types/notification.types';

const ACTIVE = NotificationStatus.ACTIVE;

const NO_KIND = 0;

const shapeOf = (query: NotificationQuery): NotificationListShape => ({
    unreadOnly: query.unreadOnly,
    kinds: query.kinds !== undefined,
});

const placeValues = (userId: number, place: NotificationPlace): unknown[] => [
    userId,
    place.clientApp,
    place.ownerType,
    place.ownerId,
    ACTIVE,
];

const filterValues = (query: NotificationQuery): unknown[] => [
    ...placeValues(query.userId, query.place),
    ...(query.kinds !== undefined ? [query.kinds.length > 0 ? query.kinds : [NO_KIND]] : []),
];

export class NotificationRepository implements INotificationRepository {
    list(db: DbExecutor, query: NotificationQuery, pagination: PaginationQuery): Promise<NotificationRow[]> {
        return db.query<NotificationRow>(NotificationSQL.list(shapeOf(query)), [
            ...filterValues(query),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, query: NotificationQuery): Promise<number> {
        const rows = await db.query<NotificationTotalRow>(NotificationSQL.count(shapeOf(query)), filterValues(query));
        return Number(rows[0]?.total ?? 0);
    }

    countsByKind(db: DbExecutor, userId: number, place: NotificationPlace): Promise<NotificationKindCountRow[]> {
        return db.query<NotificationKindCountRow>(NotificationSQL.countsByKind, placeValues(userId, place));
    }

    async unreadCount(db: DbExecutor, userId: number, place: NotificationPlace): Promise<number> {
        const rows = await db.query<NotificationTotalRow>(NotificationSQL.unreadCount, placeValues(userId, place));
        return Number(rows[0]?.total ?? 0);
    }

    async insert(db: DbExecutor, rows: readonly NewNotification[]): Promise<number> {
        if (rows.length === 0) return 0;
        const result = await db.execute(
            NotificationSQL.insert(rows.length),
            rows.flatMap((row) => [
                row.userId,
                row.notificationKind,
                row.entityType,
                row.entityId,
                row.clientApp,
                row.ownerType,
                row.ownerId,
                row.title,
                row.excerpt,
                ACTIVE,
                row.actorId,
                row.actorId,
            ]),
        );
        return result.insertId;
    }

    async markRead(db: DbExecutor, id: number, userId: number): Promise<boolean> {
        const result = await db.execute(NotificationSQL.markRead, [userId, id, userId, ACTIVE]);
        return result.affectedRows > 0;
    }

    async markUnread(db: DbExecutor, id: number, userId: number): Promise<boolean> {
        const result = await db.execute(NotificationSQL.markUnread, [userId, id, userId, ACTIVE]);
        return result.affectedRows > 0;
    }

    async markAllRead(db: DbExecutor, userId: number, place: NotificationPlace): Promise<number> {
        const result = await db.execute(NotificationSQL.markAllRead, [
            userId,
            userId,
            place.clientApp,
            place.ownerType,
            place.ownerId,
            ACTIVE,
        ]);
        return result.affectedRows;
    }

    async markEntityRead(db: DbExecutor, userId: number, entityType: number, entityId: number): Promise<void> {
        await db.execute(NotificationSQL.markEntityRead, [userId, userId, entityType, entityId, ACTIVE]);
    }
}
