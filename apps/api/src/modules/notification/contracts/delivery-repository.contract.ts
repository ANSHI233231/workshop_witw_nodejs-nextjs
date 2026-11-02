import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { DeliveryFilters, NotificationTemplateFilters } from '../dto/delivery.dto';
import type { DeliveryRow, InAppDeliveryRow } from '../types/delivery.types';
import type { NotificationTemplateRow } from '../types/notification-template.types';

export interface IDeliveryRepository {
    list(db: DbExecutor, filters: DeliveryFilters, pagination: PaginationQuery): Promise<DeliveryRow[]>;
    count(db: DbExecutor, filters: DeliveryFilters): Promise<number>;
    inAppDetail(db: DbExecutor, id: number): Promise<InAppDeliveryRow | undefined>;
}

export interface INotificationTemplateRepository {
    list(db: DbExecutor, filters: NotificationTemplateFilters): Promise<NotificationTemplateRow[]>;
    active(db: DbExecutor): Promise<NotificationTemplateRow[]>;
}
