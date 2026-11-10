import { NotificationKind, type NotificationLinks, type NotificationTabOption } from '@/types/notification-feed.types';

export const PORTAL_NOTIFICATIONS_PATH = '/notifications';

export const PORTAL_NOTIFICATION_TABS: readonly NotificationTabOption[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'shared-safari', label: 'Shared Safari' },
    { key: 'account', label: 'Account' },
];

export const PORTAL_NOTIFICATION_EMPTY = 'No notifications here.';

export const PORTAL_NOTIFICATION_LINKS: NotificationLinks = {
    [NotificationKind.SHARED_SAFARI_JOINED]: '/shared-safaris/{id}',
    [NotificationKind.SHARED_SAFARI_COMMENTED]: '/shared-safaris/{id}',
};
