'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { TablePager } from '@/components/ui/table-pager';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { logger } from '@/lib/logger';
import { markAllNotificationsRead, markNotificationRead } from '@/services/notification-feed.service';
import type { Paginated } from '@/types/api.types';
import {
    announceNotificationsChanged,
    NotificationKind,
    type NotificationCounts,
    type NotificationItem,
    type NotificationLinks,
    type NotificationTab,
    type NotificationTabOption,
} from '@/types/notification-feed.types';

import { actorInitials, initialsOf, linkOf, SentenceContent } from './notification-feed-format';
import { BellIcon, CircleCheckIcon } from './notification-feed-icons';

const log = logger.category('notifications');

const INDIA = 'Asia/Kolkata';

const DAY_MS = 86_400_000;

const MONTH_LIMIT_DAYS = 30;

const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: INDIA });

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: INDIA });

const PARTS = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: INDIA });

const dayNumber = (at: Date): number => Date.parse(PARTS.format(at)) / DAY_MS;

const stampOf = (iso: string, now: number, t: Translate): string => {
    const at = new Date(iso);
    const days = Math.round(dayNumber(new Date(now)) - dayNumber(at));
    const day =
        days <= 0
            ? t('Today')
            : days === 1
              ? t('1 day ago')
              : days < MONTH_LIMIT_DAYS
                ? t('{days} days ago', { days })
                : DATE.format(at);
    return `${day}, ${TIME.format(at)}`;
};

const SHARED_SAFARI_KINDS: readonly number[] = [
    NotificationKind.SHARED_SAFARI_JOINED,
    NotificationKind.SHARED_SAFARI_COMMENTED,
];

const tagOf = (item: NotificationItem): { readonly label: string; readonly css: string } =>
    SHARED_SAFARI_KINDS.includes(item.notificationKind)
        ? { label: 'Shared Safari', css: 'badge badge-success' }
        : { label: 'Account', css: 'badge badge-info' };

const tabUrl = (feedPath: string, tab: NotificationTab): string =>
    tab === 'all' ? feedPath : `${feedPath}?tab=${tab}`;

export function SiteNotificationList({
    userName,
    feedPath,
    links,
    tabs,
    emptyText,
    tab,
    page,
    counts,
    result,
}: {
    readonly userName: string;
    readonly feedPath: string;
    readonly links: NotificationLinks;
    readonly tabs: readonly NotificationTabOption[];
    readonly emptyText: string;
    readonly tab: NotificationTab;
    readonly page: number;
    readonly counts: NotificationCounts;
    readonly result: Paginated<NotificationItem>;
}) {
    const t = useT();
    const router = useRouter();
    const [readState, setReadState] = useState<Readonly<Record<number, boolean>>>({});
    const [notice, setNotice] = useState<{ readonly message: string; readonly isError: boolean } | null>(null);
    const [now] = useState(() => Date.now());

    const isRead = (item: NotificationItem): boolean => readState[item.id] ?? item.isRead;
    const unread = counts.unread;

    const markAll = async () => {
        try {
            await markAllNotificationsRead(null);
            setReadState(Object.fromEntries(result.items.map((item) => [item.id, true])));
            setNotice({ message: t('All notifications marked as read.'), isError: false });
            announceNotificationsChanged();
            router.refresh();
        } catch (error) {
            log.warn('Mark all read failed', { error });
            setNotice({ message: t('This could not be done. Please try again.'), isError: true });
        }
    };

    const open = (item: NotificationItem) => {
        if (isRead(item)) return;
        setReadState((current) => ({ ...current, [item.id]: true }));
        void markNotificationRead(item.id)
            .then(announceNotificationsChanged)
            .catch((error: unknown) => log.warn('Mark read failed', { error }));
    };

    return (
        <div className="page">
            <div className="wn-head">
                <span className="wb-count">
                    {t('You have')} <b>{unread}</b> {t('unread notifications')}
                </span>
                <button type="button" className="btn btn-secondary" onClick={() => void markAll()}>
                    <CircleCheckIcon />
                    {t('Mark all as read')}
                </button>
            </div>
            <div className="wn-card">
                <div className="nt-tabs" role="tablist">
                    {tabs.map((option) => (
                        <Link
                            key={option.key}
                            className={`nt-tab${tab === option.key ? ' is-on' : ''}`}
                            role="tab"
                            aria-selected={tab === option.key}
                            href={tabUrl(feedPath, option.key)}
                        >
                            {t(option.label)}
                            <span>{counts[option.key] ?? 0}</span>
                        </Link>
                    ))}
                </div>
                <div className="wn-list">
                    {result.items.map((item) => {
                        const tag = tagOf(item);
                        const isSafari = SHARED_SAFARI_KINDS.includes(item.notificationKind);
                        const read = isRead(item);
                        return (
                            <Link
                                key={item.id}
                                className={`wn-i${read ? '' : ' is-unread'}`}
                                href={linkOf(links, item, feedPath)}
                                onClick={() => open(item)}
                            >
                                <span className="avatar">{isSafari ? actorInitials(item) : initialsOf(userName)}</span>
                                <span>
                                    <span className="wn-t">
                                        <SentenceContent item={item} />
                                    </span>
                                    <span className="wn-m">
                                        <span className={tag.css}>{t(tag.label)}</span>
                                        <span>{stampOf(item.createdAt, now, t)}</span>
                                    </span>
                                </span>
                                {!read && <span className="wn-dot" aria-label={t('Unread')}></span>}
                            </Link>
                        );
                    })}
                </div>
                {result.items.length === 0 && (
                    <div className="state">
                        <BellIcon />
                        <p className="state-title">{t(emptyText)}</p>
                    </div>
                )}
                {result.meta.totalPages > 1 && (
                    <TablePager
                        path={feedPath}
                        params={{ tab: tab === 'all' ? undefined : tab }}
                        page={page}
                        total={result.meta.total}
                        totalPages={result.meta.totalPages}
                        limit={result.meta.limit}
                    />
                )}
            </div>
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </div>
    );
}
