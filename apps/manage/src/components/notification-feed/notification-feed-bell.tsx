'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';
import {
    getUnreadCount,
    listNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/services/notification-feed.service';
import {
    BELL_REFRESH_MS,
    NOTIFICATIONS_CHANGED,
    type NotificationItem,
    type NotificationLinks,
    type NotificationOwner,
} from '@/types/notification-feed.types';

import { actorInitials, KIND_STYLE, linkOf, relativeTime, SentenceContent } from './notification-feed-format';
import { BellIcon, MailIcon } from './notification-feed-icons';

const log = logger.category('notifications');

const BADGE_MAX = 99;

const PANEL_SIZE = 5;

const PANEL_GAP = 8;

const PANEL_EDGE = 12;

type Panel = { readonly items: readonly NotificationItem[]; readonly unread: number };

export function NotificationFeedBell({
    owner,
    feedPath,
    links,
    look = 'console',
}: {
    readonly owner: NotificationOwner;
    readonly feedPath: string;
    readonly links: NotificationLinks;
    readonly look?: 'console' | 'site';
}) {
    const t = useT();
    const pathname = usePathname();
    const bellRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [panel, setPanel] = useState<Panel | null>(null);
    const [place, setPlace] = useState<CSSProperties>({});
    const [now, setNow] = useState(() => Date.now());
    const current = decodeURIComponent(pathname) === decodeURIComponent(feedPath);
    const isSite = look === 'site';

    const loadUnread = useCallback(() => {
        getUnreadCount(owner)
            .then(setUnread)
            .catch((error: unknown) => log.warn('Unread count failed', { error }));
    }, [owner]);

    useEffect(() => {
        loadUnread();
        const timer = window.setInterval(loadUnread, BELL_REFRESH_MS);
        window.addEventListener(NOTIFICATIONS_CHANGED, loadUnread);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener(NOTIFICATIONS_CHANGED, loadUnread);
        };
    }, [loadUnread, pathname]);

    const placePanel = useCallback(() => {
        const bell = bellRef.current;
        if (!bell) return;
        const box = bell.getBoundingClientRect();
        setPlace({
            top: Math.round(box.bottom + PANEL_GAP),
            right: Math.max(PANEL_EDGE, Math.round(window.innerWidth - box.right - PANEL_GAP)),
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (panelRef.current?.contains(target) || bellRef.current?.contains(target)) return;
            setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', placePanel);
        return () => {
            document.removeEventListener('mousedown', closeOutside);
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', placePanel);
        };
    }, [open, placePanel]);

    const toggle = async () => {
        if (open) {
            setOpen(false);
            return;
        }
        placePanel();
        setNow(Date.now());
        setOpen(true);
        try {
            const [page, count] = await Promise.all([
                listNotifications(owner, 'all', 1, undefined, PANEL_SIZE),
                getUnreadCount(owner),
            ]);
            setPanel({ items: page.items, unread: count });
            setUnread(count);
        } catch (error) {
            log.warn('Notification panel failed', { error });
            setPanel({ items: [], unread });
        }
    };

    const markAll = async () => {
        try {
            await markAllNotificationsRead(owner);
            setPanel((shown) => shown && { items: shown.items.map((item) => ({ ...item, isRead: true })), unread: 0 });
            setUnread(0);
        } catch (error) {
            log.warn('Mark all read failed', { error });
        }
    };

    const openItem = (item: NotificationItem) => {
        setOpen(false);
        if (item.isRead) return;
        void markNotificationRead(item.id)
            .then(loadUnread)
            .catch((error: unknown) => log.warn('Mark read failed', { error }));
    };

    const button = (
        <button
            ref={bellRef}
            type="button"
            className={isSite ? 'wb-ic is-bell' : `btn-icon nt-bell${current ? ' is-current' : ''}`}
            aria-label={t('Notifications')}
            data-tooltip={isSite ? undefined : t('Notifications')}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => void toggle()}
        >
            {isSite ? <MailIcon /> : <BellIcon />}
            {unread > 0 && (
                <span className={isSite ? 'wb-cnt' : 'nt-cnt'}>{unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}</span>
            )}
        </button>
    );

    const popover = open && (
        <div
            ref={panelRef}
            className="ntp"
            role="dialog"
            aria-label={t('Notifications')}
            style={isSite ? undefined : place}
        >
            <div className="ntp-h">
                <b>{t('Notifications')}</b>
                {panel && panel.unread > 0 && (
                    <span className="ntp-c">{t('{count} new', { count: panel.unread })}</span>
                )}
                {panel && panel.unread > 0 && (
                    <button type="button" className="ntp-mk" onClick={() => void markAll()}>
                        {t('Mark all as read')}
                    </button>
                )}
            </div>
            <div className="ntp-l">
                {panel?.items.map((item) => {
                    const style = KIND_STYLE[item.notificationKind];
                    return (
                        <Link
                            key={item.id}
                            className={`ntp-i${item.isRead ? '' : ' is-unread'}`}
                            href={linkOf(links, item, feedPath)}
                            onClick={() => openItem(item)}
                        >
                            <span className="ntp-av">
                                {actorInitials(item)}
                                {style && (
                                    <span className={`ntp-k ${style.css}`}>
                                        <style.Icon />
                                    </span>
                                )}
                            </span>
                            <span className="ntp-t">
                                <span className="ntp-p">
                                    <SentenceContent item={item} />
                                </span>
                                <small>{relativeTime(item.createdAt, now, t)}</small>
                            </span>
                            <span className="ntp-dot" aria-hidden="true"></span>
                        </Link>
                    );
                })}
            </div>
            <Link className="ntp-f" href={feedPath} onClick={() => setOpen(false)}>
                {t('Show all notifications')}
            </Link>
        </div>
    );

    if (isSite) {
        return (
            <div className="wb-wrap">
                {button}
                {popover && <div className="wb-pop">{popover}</div>}
            </div>
        );
    }

    return (
        <>
            {button}
            {popover}
        </>
    );
}
