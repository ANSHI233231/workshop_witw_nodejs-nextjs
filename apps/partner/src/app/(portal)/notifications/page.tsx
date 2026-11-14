import type { Metadata } from 'next';

import { PortalNotificationList } from '@/components/portal-notifications/portal-notification-list';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { pageParam } from '@/lib/search-params';
import type { PageSearchParams } from '@/lib/search-params';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { listNotifications } from '@/services/notification-feed.service';

const pageTime = (): number => Date.now();

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Notifications'),
});

export default async function NotificationsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireActivePartner();
    const page = pageParam((await searchParams)['page']);
    const result = await listNotifications(null, 'all', page, await readAccessToken());
    return <PortalNotificationList page={page} result={result} now={pageTime()} />;
}
