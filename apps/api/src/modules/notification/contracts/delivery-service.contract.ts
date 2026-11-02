import type { PaginationQuery } from '../../../core/validation';
import type {
    DeliveryFilters,
    DeliveryPage,
    InAppDeliveryDto,
    NotificationTemplateDto,
    NotificationTemplateFilters,
} from '../dto/delivery.dto';

export interface IDeliveryService {
    list(filters: DeliveryFilters, pagination: PaginationQuery): Promise<DeliveryPage>;
    inAppDetail(id: number): Promise<InAppDeliveryDto>;
    templates(filters: NotificationTemplateFilters): Promise<readonly NotificationTemplateDto[]>;
}
