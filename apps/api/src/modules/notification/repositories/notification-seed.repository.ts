import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { SeedNotification } from '../dto/notification-seed.dto';
import { NotificationSeedSQL } from '../sql/notification-seed.sql';
import { NotificationStatus } from '../types/notification.types';

interface IdRow extends RowDataPacket {
    id: number;
}

interface CountRow extends RowDataPacket {
    total: number;
}

export class NotificationSeedRepository {
    async exists(db: DbExecutor, row: SeedNotification): Promise<boolean> {
        const rows = await db.query<IdRow>(NotificationSeedSQL.exists, [
            row.userId,
            row.notificationKind,
            row.entityType,
            row.entityId,
            row.createdAt,
        ]);
        return rows.length > 0;
    }

    async insert(db: DbExecutor, row: SeedNotification): Promise<void> {
        await db.execute(NotificationSeedSQL.insert, [
            row.userId,
            row.notificationKind,
            row.entityType,
            row.entityId,
            row.clientApp,
            row.ownerType,
            row.ownerId,
            row.title,
            row.excerpt,
            row.readAt,
            NotificationStatus.ACTIVE,
            row.createdAt,
            row.createdAt,
            row.actorId,
            row.actorId,
        ]);
    }

    async countFor(db: DbExecutor, entityType: number, entityIds: readonly number[], userIds: readonly number[]): Promise<number> {
        const rows = await db.query<CountRow>(NotificationSeedSQL.countFor(entityIds.length, userIds.length), [
            entityType,
            ...entityIds,
            ...userIds,
        ]);
        return Number(rows[0]?.total ?? 0);
    }

    async deleteForUsers(db: DbExecutor, userIds: readonly number[]): Promise<number> {
        if (userIds.length === 0) return 0;
        return (await db.execute(NotificationSeedSQL.deleteForUsers(userIds.length), userIds)).affectedRows;
    }

    async deleteForEntities(db: DbExecutor, entityType: number, entityIds: readonly number[]): Promise<number> {
        if (entityIds.length === 0) return 0;
        return (await db.execute(NotificationSeedSQL.deleteForEntities(entityIds.length), [entityType, ...entityIds]))
            .affectedRows;
    }
}
