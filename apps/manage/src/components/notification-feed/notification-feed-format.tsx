import type { ComponentType } from 'react';

import type { Translate } from '@/lib/i18n/locale';
import { NotificationKind, type NotificationItem, type NotificationLinks } from '@/types/notification-feed.types';

import { KeyIcon, MessageIcon, TriangleAlertIcon, UserPlusIcon, UsersIcon, BellIcon } from './notification-feed-icons';

const INDIA = 'Asia/Kolkata';

const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: INDIA });

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: INDIA });

const MINUTE = 60_000;

const HOUR = 60 * MINUTE;

const DAY = 24 * HOUR;

const timeOf = (iso: string): string =>
    TIME.format(new Date(iso)).replace(/\b(am|pm)\b/gi, (part) => part.toUpperCase());

export const initialsOf = (name: string | null): string =>
    (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || '?';

export const relativeTime = (iso: string, now: number, t: Translate): string => {
    const at = new Date(iso).getTime();
    const ago = now - at;
    if (ago < MINUTE) return t('Just now');
    if (ago < HOUR) return t('{minutes} min ago', { minutes: Math.floor(ago / MINUTE) });
    const day = DATE.format(new Date(at));
    if (day === DATE.format(new Date(now))) {
        const hours = Math.floor(ago / HOUR);
        return hours === 1 ? t('1 hour ago') : t('{hours} hours ago', { hours });
    }
    if (day === DATE.format(new Date(now - DAY))) return t('Yesterday, {time}', { time: timeOf(iso) });
    return `${day}, ${timeOf(iso)}`;
};

export const DAY_GROUPS = ['Today', 'Yesterday', 'Earlier'] as const;

export const dayGroupOf = (iso: string, now: number): (typeof DAY_GROUPS)[number] => {
    const day = DATE.format(new Date(iso));
    if (day === DATE.format(new Date(now))) return 'Today';
    if (day === DATE.format(new Date(now - DAY))) return 'Yesterday';
    return 'Earlier';
};

type KindStyle = { readonly css: string; readonly tag: string; readonly Icon: ComponentType };

export const KIND_STYLE: Readonly<Partial<Record<number, KindStyle>>> = {
    [NotificationKind.ACCOUNT_CREATED]: { css: 'is-account', tag: 'Account', Icon: UserPlusIcon },
    [NotificationKind.PASSWORD_CHANGED]: { css: 'is-account', tag: 'Account', Icon: KeyIcon },
    [NotificationKind.JOB_FAILED]: { css: 'is-jobs', tag: 'Jobs', Icon: TriangleAlertIcon },
    [NotificationKind.TEST]: { css: 'is-test', tag: 'Test', Icon: BellIcon },
    [NotificationKind.SHARED_SAFARI_JOINED]: { css: 'is-safari', tag: 'Shared Safari', Icon: UsersIcon },
    [NotificationKind.SHARED_SAFARI_COMMENTED]: { css: 'is-safari', tag: 'Shared Safari', Icon: MessageIcon },
};

export const actorInitials = (item: NotificationItem): string => (item.actorName ? initialsOf(item.actorName) : 'S');

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function SentenceContent({ item }: { readonly item: NotificationItem }) {
    if (!item.titleTemplate) return <b>{item.title}</b>;
    const actor = item.actorIsYou ? 'you' : (item.actorName ?? 'the system');
    const values: Readonly<Record<string, string>> = { actor, subject: item.title };
    return (
        <>
            {item.titleTemplate
                .split(PLACEHOLDER)
                .map((part, index) =>
                    index % 2 === 1 ? <b key={index}>{values[part] ?? ''}</b> : <span key={index}>{part}</span>,
                )}
        </>
    );
}

export const linkOf = (links: NotificationLinks, item: NotificationItem, fallback: string): string =>
    links[item.notificationKind]?.replace('{id}', String(item.entityId)) ?? fallback;
