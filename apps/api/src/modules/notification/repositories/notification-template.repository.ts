import type { DbExecutor } from '../../../database/connection';
import type { INotificationTemplateRepository } from '../contracts/delivery-repository.contract';
import type { NotificationTemplateFilters } from '../dto/delivery.dto';
import { NotificationTemplateSQL } from '../sql/notification-template.sql';
import { type NotificationTemplateRow, NotificationTemplateStatus } from '../types/notification-template.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export class NotificationTemplateRepository implements INotificationTemplateRepository {
    list(db: DbExecutor, filters: NotificationTemplateFilters): Promise<NotificationTemplateRow[]> {
        const search = filters.search !== undefined ? likeAnywhere(filters.search) : undefined;
        return db.query<NotificationTemplateRow>(
            NotificationTemplateSQL.list({ search: search !== undefined, status: filters.status !== undefined }),
            [
                ...(search !== undefined ? [search, search] : []),
                ...(filters.status !== undefined ? [filters.status] : []),
            ],
        );
    }

    active(db: DbExecutor): Promise<NotificationTemplateRow[]> {
        return db.query<NotificationTemplateRow>(NotificationTemplateSQL.active, [NotificationTemplateStatus.ACTIVE]);
    }
}
