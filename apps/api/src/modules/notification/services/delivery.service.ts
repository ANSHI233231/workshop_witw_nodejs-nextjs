import { NotFoundException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import type { IDeliveryRepository, INotificationTemplateRepository } from '../contracts/delivery-repository.contract';
import type { IDeliveryService } from '../contracts/delivery-service.contract';
import type {
    DeliveryFilters,
    DeliveryItemDto,
    DeliveryPage,
    InAppDeliveryDto,
    NotificationTemplateDto,
    NotificationTemplateFilters,
} from '../dto/delivery.dto';
import { type DeliveryRow, DeliveryStatus, type InAppDeliveryRow } from '../types/delivery.types';
import type { NotificationTemplateRow } from '../types/notification-template.types';

const notFound = (): NotFoundException =>
    new NotFoundException('This notification was not found.', 'NOTIFICATION_NOT_FOUND');

const toItem = (row: DeliveryRow): DeliveryItemDto => ({
    channel: Number(row.channel) as DeliveryItemDto['channel'],
    id: Number(row.recordId),
    recipient: row.recipient ?? '–',
    title: row.title,
    templateName: row.templateName,
    sentAt: new Date(row.sentAt).toISOString(),
    status: Number(row.deliveryStatus) as DeliveryItemDto['status'],
});

const personOf = (row: InAppDeliveryRow): string =>
    row.recipientUsername ? `${row.recipientName ?? ''} (${row.recipientUsername})` : (row.recipientName ?? '–');

const toNotificationTemplate = (row: NotificationTemplateRow): NotificationTemplateDto => ({
    id: row.id,
    notificationKind: row.notificationKind,
    clientApp: row.clientApp,
    code: row.code,
    name: row.name,
    titleTemplate: row.titleTemplate,
    sentWhen: row.sentWhen,
    opens: row.opens,
    status: row.status,
    updatedAt: new Date(row.updatedAt).toISOString(),
});

export class DeliveryService implements IDeliveryService {
    constructor(
        private readonly db: Database,
        private readonly deliveries: IDeliveryRepository,
        private readonly templateRepository: INotificationTemplateRepository,
    ) {}

    async list(filters: DeliveryFilters, pagination: PaginationQuery): Promise<DeliveryPage> {
        const [rows, total] = await Promise.all([
            this.deliveries.list(this.db, filters, pagination),
            this.deliveries.count(this.db, filters),
        ]);
        return { items: rows.map(toItem), total };
    }

    async inAppDetail(id: number): Promise<InAppDeliveryDto> {
        const row = await this.deliveries.inAppDetail(this.db, id);
        if (!row) throw notFound();
        return {
            id: row.id,
            recipient: personOf(row),
            clientApp: row.clientApp,
            templateName: row.templateName,
            sentAt: new Date(row.createdAt).toISOString(),
            status: row.readAt !== null ? DeliveryStatus.READ : DeliveryStatus.SENT,
            title: row.title,
            excerpt: row.excerpt,
            actorName: row.actorName,
            notificationKind: row.notificationKind,
            opens: row.opens,
            titleTemplate: row.titleTemplate,
            readAt: row.readAt ? new Date(row.readAt).toISOString() : null,
        };
    }

    async templates(filters: NotificationTemplateFilters): Promise<readonly NotificationTemplateDto[]> {
        return (await this.templateRepository.list(this.db, filters)).map(toNotificationTemplate);
    }
}
