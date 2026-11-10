import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import {
    PORTAL_NOTIFICATION_EMPTY,
    PORTAL_NOTIFICATION_LINKS,
    PORTAL_NOTIFICATION_TABS,
    PORTAL_NOTIFICATIONS_PATH,
} from '@/components/console/portal-notifications';
import { SiteNotificationList } from '@/components/notification-feed/site-notification-list';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { type PageSearchParams, pageParam, singleParam } from '@/lib/search-params';
import { consoleSession } from '@/lib/console-session';
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
    const tab: NotificationTab = PORTAL_NOTIFICATION_TABS.find((option) => option.key === tabParam)?.key ?? 'all';
    const page = pageParam(query['page']);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, counts] = await Promise.all([
        listNotifications(null, tab, page, accessToken),
        getNotificationCounts(null, accessToken),
    ]);
    const { t } = await serverTranslator();
    const session = await consoleSession();
    return (
        <>
            <SiteBanner title={t('Notifications')} />
            <SiteNotificationList
                userName={session?.user.name ?? ''}
                feedPath={PORTAL_NOTIFICATIONS_PATH}
                links={PORTAL_NOTIFICATION_LINKS}
                tabs={PORTAL_NOTIFICATION_TABS}
                emptyText={PORTAL_NOTIFICATION_EMPTY}
                tab={tab}
                page={page}
                counts={counts}
                result={result}
            />
        </>
    );
}
