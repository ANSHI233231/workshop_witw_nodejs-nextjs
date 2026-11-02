import type { NotificationLinks, NotificationTabOption } from '@/types/notification-feed.types';

export const PORTAL_NOTIFICATIONS_PATH = '/notifications';

export const PORTAL_NOTIFICATION_TABS: readonly NotificationTabOption[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'account', label: 'Account' },
];

export const PORTAL_NOTIFICATION_EMPTY = 'Changes to your account will appear here.';

export const PORTAL_NOTIFICATION_LINKS: NotificationLinks = {};
