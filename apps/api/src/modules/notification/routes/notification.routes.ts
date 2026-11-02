import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { DeliveryController } from '../controllers/delivery.controller';
import type { NotificationController } from '../controllers/notification.controller';
import {
    inAppDeliveryIdSchema,
    listDeliverySchema,
    listNotificationTemplatesSchema,
} from '../validators/delivery.validators';
import {
    listNotificationSchema,
    notificationIdSchema,
    notificationOwnerSchema,
} from '../validators/notification.validators';

export type NotificationAccess = { readonly signedIn: AccessGuard; readonly superAdmin: AccessGuard };

export const createNotificationRouter = (
    controller: NotificationController,
    delivery: DeliveryController,
    access: NotificationAccess,
): ApiRouter => {
    const route = apiRouter();
    route.get('/templates', access.superAdmin, validate(listNotificationTemplatesSchema), asyncHandler(delivery.templates));
    route.get('/delivery-log', access.superAdmin, validate(listDeliverySchema), asyncHandler(delivery.list));
    route.get(
        '/delivery-log/in-app/:id',
        access.superAdmin,
        validate(inAppDeliveryIdSchema),
        asyncHandler(delivery.inAppDetail),
    );
    route.get('/', access.signedIn, validate(listNotificationSchema), asyncHandler(controller.list));
    route.get('/counts', access.signedIn, validate(notificationOwnerSchema), asyncHandler(controller.counts));
    route.get('/unread-count', access.signedIn, validate(notificationOwnerSchema), asyncHandler(controller.unreadCount));
    route.post('/read-all', access.signedIn, validate(notificationOwnerSchema), asyncHandler(controller.markAllRead));
    route.patch('/:id/read', access.signedIn, validate(notificationIdSchema), asyncHandler(controller.markRead));
    route.patch('/:id/unread', access.signedIn, validate(notificationIdSchema), asyncHandler(controller.markUnread));
    return route;
};
