'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { avatarOf, linkOf, relativeTime, SentenceContent } from '@/components/notification-feed/notification-feed-format';
import { PORTAL_NOTIFICATION_LINKS, PORTAL_NOTIFICATIONS_PATH } from '@/components/portal/portal-notifications';
import { CheckCheckIcon } from '@/components/notification-feed/notification-feed-icons';
import { EmptyBellIcon } from '@/components/portal/portal-icons';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';
import { markAllNotificationsRead, markNotificationRead } from '@/services/notification-feed.service';
import type { Paginated } from '@/types/api.types';
import { announceNotificationsChanged, type NotificationItem } from '@/types/notification-feed.types';

const log = logger.category('notifications');

const SUPER_ADMIN_INITIALS = 'SA';

type Notice = { readonly message: string; readonly isError: boolean };

export function PortalNotificationList({
    page,
    result,
    now,
}: {
    readonly page: number;
    readonly result: Paginated<NotificationItem>;
    readonly now: number;
}) {
    const t = useT();
    const router = useRouter();
    const [readIds, setReadIds] = useState<ReadonlySet<number>>(new Set());
    const [notice, setNotice] = useState<Notice | null>(null);
    const isRead = (item: NotificationItem): boolean => item.isRead || readIds.has(item.id);

    const markAll = async () => {
        try {
            await markAllNotificationsRead(null);
            setReadIds(new Set(result.items.map((item) => item.id)));
            setNotice({ message: t('All notifications marked as read.'), isError: false });
            announceNotificationsChanged();
            router.refresh();
        } catch (error) {
            log.warn('Mark all read failed', { error });
            setNotice({ message: t('This could not be done. Please try again.'), isError: true });
        }
    };

    const open = async (item: NotificationItem) => {
        if (isRead(item)) return;
        setReadIds((current) => new Set(current).add(item.id));
        try {
            await markNotificationRead(item.id);
            announceNotificationsChanged();
        } catch (error) {
            log.warn('Mark read failed', { error });
        }
    };

    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partner Portal')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Notifications')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Notifications')}</h1>
                    <div className="actions">
                        <button type="button" className="btn btn-secondary" onClick={() => void markAll()}>
                            <CheckCheckIcon />
                            {t('Mark all as read')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="pq-card pq-noteslist">
                {result.items.map((item) => (
                    <Link
                        key={item.id}
                        className={`wn-i${isRead(item) ? '' : ' is-unread'}`}
                        href={linkOf(PORTAL_NOTIFICATION_LINKS, item, PORTAL_NOTIFICATIONS_PATH)}
                        onClick={() => void open(item)}
                    >
                        <span className="avatar">
                            {avatarOf(item, SUPER_ADMIN_INITIALS)}
                        </span>
                        <span>
                            <span className="wn-t">
                                <SentenceContent item={item} />
                                {item.excerpt && <> {item.excerpt}</>}
                            </span>
                            <span className="ss-cap" style={{ display: 'block' }}>
                                {relativeTime(item.createdAt, now, t)}
                            </span>
                        </span>
                        {!isRead(item) && <span className="wn-dot" aria-label={t('Unread')}></span>}
                    </Link>
                ))}
                {result.items.length === 0 && (
                    <div className="state">
                        <EmptyBellIcon className="icon state-icon" />
                        <p className="state-title">{t('No notifications yet.')}</p>
                    </div>
                )}
            </div>
            {result.meta.totalPages > 1 && (
                <TablePager
                    path={PORTAL_NOTIFICATIONS_PATH}
                    params={{}}
                    page={page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </div>
    );
}
