import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { NotificationEntityRefs } from '../dto/notification-test-data.dto';
import { NotificationTestDataSQL } from '../sql/notification-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestNotificationRow extends RowDataPacket {
    id: number;
    user_id: number;
    notification_kind: number;
    entity_type: number;
    entity_id: number;
    title_start: string;
    excerpt_start: string | null;
}

interface TotalRow extends RowDataPacket {
    total: number;
}

export class NotificationTestDataRepository {
    async marked(
        db: DbExecutor,
        userIds: readonly number[],
        textPrefix: string,
        entities: readonly NotificationEntityRefs[],
    ): Promise<TestNotificationRow[]> {
        const pattern = startsWith(textPrefix);
        const used = entities.filter((entity) => entity.entityIds.length > 0);
        return db.query<TestNotificationRow>(
            NotificationTestDataSQL.marked(
                userIds.length,
                used.map((entity) => entity.entityIds.length),
            ),
            [...userIds, ...userIds, pattern, pattern, pattern, ...used.flatMap((entity) => [entity.entityType, ...entity.entityIds])],
        );
    }

    async countNotIn(db: DbExecutor, ids: readonly number[]): Promise<number> {
        const rows = await db.query<TotalRow>(NotificationTestDataSQL.countNotIn(ids.length), ids);
        return Number(rows[0]?.total ?? 0);
    }

    async deleteNotifications(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(NotificationTestDataSQL.deleteNotifications(ids.length), ids)).affectedRows;
    }
}
