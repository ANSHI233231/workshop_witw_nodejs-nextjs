import type { Translate } from '@/lib/i18n/locale';
import type { AuditLogListItem } from '@/types/audit.types';

const english: Translate = (text) => text;

const SYSTEM_APPS = new Set(['CLI', 'SYSTEM']);

export const actorOf = (
    event: AuditLogListItem,
    t: Translate = english,
): { readonly name: string; readonly detail: string | null } => {
    if (event.userName) return { name: event.userName, detail: event.username };
    if (event.actorLabel) return { name: event.actorLabel, detail: event.userId ? null : t('not signed in') };
    if (SYSTEM_APPS.has(event.clientAppName)) return { name: t('System'), detail: null };
    return { name: t('Guest'), detail: null };
};

export const entityOf = (event: AuditLogListItem): string | null => {
    if (!event.entityName) return null;
    const name = `${event.entityName[0] ?? ''}${event.entityName.slice(1).toLowerCase()}`;
    return event.entityId === null ? name : `${name} #${event.entityId}`;
};
