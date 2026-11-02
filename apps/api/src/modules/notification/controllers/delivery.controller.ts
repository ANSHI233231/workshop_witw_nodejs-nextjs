import type { Request, Response } from 'express';

import { ok, paginated } from '../../../core/http';
import type { IDeliveryService } from '../contracts/delivery-service.contract';
import type { DeliveryChannelCode, DeliveryStatusCode } from '../types/delivery.types';
import type { NotificationTemplateStatusCode } from '../types/notification-template.types';
import type {
    InAppDeliveryParams,
    ListDeliveryQuery,
    ListNotificationTemplatesQuery,
} from '../validators/delivery.validators';

export class DeliveryController {
    constructor(private readonly service: IDeliveryService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const { search, channel, status, template, page, limit } = req.query as unknown as ListDeliveryQuery;
        const result = await this.service.list(
            {
                search,
                channel: channel as DeliveryChannelCode | undefined,
                status: status as DeliveryStatusCode | undefined,
                templateKey: template,
            },
            { page, limit },
        );
        paginated(res, result.items, { page, limit, total: result.total });
    };

    inAppDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.inAppDetail((req.params as unknown as InAppDeliveryParams).id));
    };

    templates = async (req: Request, res: Response): Promise<void> => {
        const { search, status } = req.query as unknown as ListNotificationTemplatesQuery;
        ok(res, await this.service.templates({ search, status: status as NotificationTemplateStatusCode | undefined }));
    };
}
