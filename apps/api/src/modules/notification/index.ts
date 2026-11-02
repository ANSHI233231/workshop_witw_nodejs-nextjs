import type { NotificationModuleDependencies } from './contracts/notification-module.contract';
import type { INotificationService } from './contracts/notification-service.contract';
import { DeliveryController } from './controllers/delivery.controller';
import { NotificationController } from './controllers/notification.controller';
import { DeliveryRepository } from './repositories/delivery.repository';
import { NotificationTemplateRepository } from './repositories/notification-template.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { createNotificationRouter, type NotificationAccess } from './routes/notification.routes';
import { DeliveryService } from './services/delivery.service';
import { NotificationService } from './services/notification.service';

export type { NotificationModuleDependencies } from './contracts/notification-module.contract';
export type { INotificationService, TestNotification } from './contracts/notification-service.contract';
export type { NewNotification } from './dto/notification.dto';
export type { MailStatusCodes } from './types/delivery.types';
export { NotificationKind, type NotificationKindCode } from './types/notification.types';

export const createNotificationModule = (dependencies: NotificationModuleDependencies) => {
    const templateRepository = new NotificationTemplateRepository();
    const service = new NotificationService(
        dependencies.db,
        new NotificationRepository(),
        templateRepository,
        dependencies.auditService,
    );
    const notificationService: INotificationService = service;
    const controller = new NotificationController(service);
    const delivery = new DeliveryController(
        new DeliveryService(dependencies.db, new DeliveryRepository(dependencies.mailStatus), templateRepository),
    );

    return {
        notificationService,
        createRouter: (access: NotificationAccess) => createNotificationRouter(controller, delivery, access),
    };
};
