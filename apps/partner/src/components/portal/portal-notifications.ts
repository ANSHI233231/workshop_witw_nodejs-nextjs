import { NotificationKind, type NotificationLinks } from '@/types/notification-feed.types';

export const PORTAL_NOTIFICATIONS_PATH = '/notifications';

export const QUOTE_REQUESTS_PATH = '/quote-requests';

export const PORTAL_NOTIFICATION_LINKS: NotificationLinks = {
    [NotificationKind.QUOTE_REQUEST_RECEIVED]: QUOTE_REQUESTS_PATH,
    [NotificationKind.QUOTE_REQUEST_ADMIN_MESSAGE]: PORTAL_NOTIFICATIONS_PATH,
};
