import { NotificationKind, type NotificationLinks, type NotificationTabOption } from '@/types/notification-feed.types';

export const CONSOLE_NOTIFICATIONS_PATH = '/notifications';

export const CONSOLE_NOTIFICATION_TABS: readonly NotificationTabOption[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'account', label: 'Account' },
    { key: 'jobs', label: 'Jobs' },
];

export const CONSOLE_NOTIFICATION_EMPTY = 'Account changes and failed background jobs will appear here.';

export const CONSOLE_NOTIFICATION_LINKS: NotificationLinks = {
    [NotificationKind.JOB_FAILED]: '/background-jobs?tab=logs&errorsOnly=1',
};
