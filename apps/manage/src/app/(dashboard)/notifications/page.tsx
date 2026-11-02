import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import {
    CONSOLE_NOTIFICATION_EMPTY,
    CONSOLE_NOTIFICATION_LINKS,
    CONSOLE_NOTIFICATION_TABS,
    CONSOLE_NOTIFICATIONS_PATH,
} from '@/components/console/console-notifications';
import { NotificationFeedList } from '@/components/notification-feed/notification-feed-list';
import { type PageSearchParams, pageParam, singleParam } from '@/lib/search-params';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { getNotificationCounts, listNotifications } from '@/services/notification-feed.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { NotificationTab } from '@/types/notification-feed.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Notifications'),
});

export default async function NotificationsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    const query = await searchParams;
    const tabParam = singleParam(query['tab']);
    const tab: NotificationTab = CONSOLE_NOTIFICATION_TABS.find((option) => option.key === tabParam)?.key ?? 'all';
    const page = pageParam(query['page']);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, counts] = await Promise.all([
        listNotifications(null, tab, page, accessToken),
        getNotificationCounts(null, accessToken),
    ]);
    return (
        <NotificationFeedList
            owner={null}
            feedPath={CONSOLE_NOTIFICATIONS_PATH}
            links={CONSOLE_NOTIFICATION_LINKS}
            tabs={CONSOLE_NOTIFICATION_TABS}
            emptyText={CONSOLE_NOTIFICATION_EMPTY}
            tab={tab}
            page={page}
            counts={counts}
            result={result}
        />
    );
}
