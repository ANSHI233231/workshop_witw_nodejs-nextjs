import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, type IAuditService } from '../../audit';
import type { INotificationTestDataService } from '../contracts/notification-test-data-service.contract';
import type { NotificationTestData, NotificationTestDataScope } from '../dto/notification-test-data.dto';
import type {
    NotificationTestDataRepository,
    TestNotificationRow,
} from '../repositories/notification-test-data.repository';

const notificationLabel = (row: TestNotificationRow): string =>
    `to user ${row.user_id}, kind ${row.notification_kind}, entity ${row.entity_type}/${row.entity_id}: ${row.title_start}${
        row.excerpt_start ? ` / ${row.excerpt_start}` : ''
    }`;

export class NotificationTestDataService implements INotificationTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: NotificationTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: NotificationTestDataScope): Promise<NotificationTestData> {
        this.refuseInProduction();
        const rows = await this.repository.marked(this.db, scope.userIds, scope.textPrefix, scope.entities);
        const notificationIds = rows.map((row) => row.id);
        return {
            notificationIds,
            tables: [{ table: 'notification', rows: rows.map((row) => ({ id: row.id, label: notificationLabel(row) })) }],
            keptCount: await this.repository.countNotIn(this.db, notificationIds),
        };
    }

    async remove(found: NotificationTestData): Promise<number> {
        this.refuseInProduction();
        if (found.notificationIds.length === 0) return 0;
        const event = { action: AuditAction.NOTIFICATION_TEST_DATA_REMOVED } as const;
        try {
            return await this.db.transaction(async () => {
                const removed = await this.repository.deleteNotifications(this.db, found.notificationIds);
                await this.auditService.record({ ...event, details: { removed: found.notificationIds } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.NOTIFICATION_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
