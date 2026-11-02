import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IDeliveryRepository } from '../contracts/delivery-repository.contract';
import type { DeliveryFilters } from '../dto/delivery.dto';
import { DeliverySQL, type DeliveryListShape } from '../sql/delivery.sql';
import {
    DeliveryChannel,
    type DeliveryRow,
    DeliveryStatus,
    type DeliveryTotalRow,
    type InAppDeliveryRow,
    type MailStatusCodes,
} from '../types/delivery.types';
import { NotificationStatus } from '../types/notification.types';

const ACTIVE = NotificationStatus.ACTIVE;

const unionValues = (mail: MailStatusCodes): readonly unknown[] => [
    DeliveryChannel.EMAIL,
    mail.sent,
    DeliveryStatus.DELIVERED,
    mail.failed,
    DeliveryStatus.FAILED,
    DeliveryStatus.CAPTURED,
    DeliveryChannel.IN_APP,
    DeliveryStatus.SENT,
    DeliveryStatus.READ,
    ACTIVE,
];

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: DeliveryFilters): DeliveryListShape => ({
    search: filters.search !== undefined,
    channel: filters.channel !== undefined,
    templateKey: filters.templateKey !== undefined,
    status: filters.status !== undefined,
});

const valuesOf = (mail: MailStatusCodes, filters: DeliveryFilters): unknown[] => [
    ...unionValues(mail),
    ...(filters.search !== undefined ? Array.from({ length: 2 }, () => likeAnywhere(filters.search ?? '')) : []),
    ...(filters.channel !== undefined ? [filters.channel] : []),
    ...(filters.templateKey !== undefined ? [filters.templateKey] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
];

export class DeliveryRepository implements IDeliveryRepository {
    constructor(private readonly mailStatus: MailStatusCodes) {}

    list(db: DbExecutor, filters: DeliveryFilters, pagination: PaginationQuery): Promise<DeliveryRow[]> {
        return db.query<DeliveryRow>(DeliverySQL.list(shapeOf(filters)), [
            ...valuesOf(this.mailStatus, filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, filters: DeliveryFilters): Promise<number> {
        const rows = await db.query<DeliveryTotalRow>(
            DeliverySQL.count(shapeOf(filters)),
            valuesOf(this.mailStatus, filters),
        );
        return Number(rows[0]?.total ?? 0);
    }

    async inAppDetail(db: DbExecutor, id: number): Promise<InAppDeliveryRow | undefined> {
        const rows = await db.query<InAppDeliveryRow>(DeliverySQL.inAppDetail, [id, ACTIVE]);
        return rows[0];
    }
}
