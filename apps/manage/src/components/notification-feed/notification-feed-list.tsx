'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { TablePager } from '@/components/ui/table-pager';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';
import {
    markAllNotificationsRead,
    markNotificationRead,
    markNotificationUnread,
} from '@/services/notification-feed.service';
import type { Paginated } from '@/types/api.types';
import {
    announceNotificationsChanged,
    type NotificationCounts,
    type NotificationItem,
    type NotificationLinks,
    type NotificationOwner,
    type NotificationTab,
    type NotificationTabOption,
} from '@/types/notification-feed.types';

import {
    actorInitials,
    DAY_GROUPS,
    dayGroupOf,
    KIND_STYLE,
    relativeTime,
    SentenceContent,
} from './notification-feed-format';
import { BellIcon, CheckCheckIcon, CheckIcon, ClockIcon } from './notification-feed-icons';

const log = logger.category('notifications');

type Notice = { readonly message: string; readonly isError: boolean };

const tabUrl = (feedPath: string, tab: NotificationTab): string =>
    tab === 'all' ? feedPath : `${feedPath}?tab=${tab}`;

export function NotificationFeedList({
    owner,
    feedPath,
    links,
    tabs,
    emptyText,
    tab,
    page,
    counts,
    result,
}: {
    readonly owner: NotificationOwner;
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
    const [notice, setNotice] = useState<Notice | null>(null);
    const [now] = useState(() => Date.now());
    const isRead = (item: NotificationItem): boolean => readState[item.id] ?? item.isRead;

    const markAll = async () => {
        try {
            await markAllNotificationsRead(owner);
            setReadState(Object.fromEntries(result.items.map((item) => [item.id, true])));
            setNotice({ message: t('All notifications marked as read.'), isError: false });
            announceNotificationsChanged();
            router.refresh();
        } catch (error) {
            log.warn('Mark all read failed', { error });
            setNotice({ message: t('This could not be done. Please try again.'), isError: true });
        }
    };

    const flip = async (item: NotificationItem) => {
        const next = !isRead(item);
        setReadState((current) => ({ ...current, [item.id]: next }));
        try {
            await (next ? markNotificationRead(item.id) : markNotificationUnread(item.id));
            announceNotificationsChanged();
            router.refresh();
        } catch (error) {
            log.warn('Mark read failed', { error });
            setReadState((current) => ({ ...current, [item.id]: !next }));
        }
    };

    const grouped = DAY_GROUPS.map((group) => ({
        group,
        items: result.items.filter((item) => dayGroupOf(item.createdAt, now) === group),
    })).filter((entry) => entry.items.length > 0);

    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <span>{t('Notifications')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Notifications')}</h1>
                    <div className="actions">
                        <button
                            type="button"
                            className="btn btn-secondary nt-all"
                            disabled={counts.unread === 0}
                            onClick={() => void markAll()}
                        >
                            <CheckCheckIcon />
                            {t('Mark all as read')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="nt-card">
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
                <div className="nt-body">
                    {grouped.map((entry) => (
                        <section className="nt-grp" key={entry.group}>
                            <h3>{t(entry.group)}</h3>
                            <div className="nt-list">
                                {entry.items.map((item) => {
                                    const style = KIND_STYLE[item.notificationKind];
                                    const read = isRead(item);
                                    return (
                                        <div className={`nt-item${read ? '' : ' is-unread'}`} key={item.id}>
                                            <span className="nt-av">
                                                {actorInitials(item)}
                                                {style && (
                                                    <span className={`nt-kic ${style.css}`}>
                                                        <style.Icon />
                                                    </span>
                                                )}
                                            </span>
                                            <div className="nt-bd">
                                                <p>
                                                    {links[item.notificationKind] ? (
                                                        <Link
                                                            href={links[item.notificationKind] ?? feedPath}
                                                            onClick={() => {
                                                                if (!read) void flip(item);
                                                            }}
                                                        >
                                                            <SentenceContent item={item} />
                                                        </Link>
                                                    ) : (
                                                        <SentenceContent item={item} />
                                                    )}
                                                </p>
                                                {item.excerpt && <q className={style?.css}>{item.excerpt}</q>}
                                                <small>
                                                    {style && (
                                                        <span className={`nt-tag ${style.css}`}>{t(style.tag)}</span>
                                                    )}
                                                    <ClockIcon />
                                                    {relativeTime(item.createdAt, now, t)}
                                                </small>
                                            </div>
                                            <div className="nt-ac">
                                                <span
                                                    className="nt-dot"
                                                    aria-label={read ? undefined : t('Unread')}
                                                ></span>
                                                <button
                                                    type="button"
                                                    className="btn-icon nt-mk"
                                                    aria-label={read ? t('Mark as unread') : t('Mark as read')}
                                                    data-tooltip={read ? t('Mark as unread') : t('Mark as read')}
                                                    onClick={() => void flip(item)}
                                                >
                                                    <CheckIcon />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                    {grouped.length === 0 && (
                        <div className="nt-empty">
                            <span>
                                <BellIcon />
                            </span>
                            <b>{t("You're all caught up")}</b>
                            <small>{t(emptyText)}</small>
                        </div>
                    )}
                </div>
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
