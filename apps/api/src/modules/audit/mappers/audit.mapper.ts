import type { AuditLogDetailDto, AuditLogListItemDto } from '../dto/audit.dto';
import {
    AUDIT_ACTION_NAMES,
    AUDIT_ENTITY_NAMES,
    AUDIT_MODULE_NAMES,
    type AuditLogDetailRow,
    type AuditLogListRow,
} from '../types/audit.types';

const UNKNOWN = 'UNKNOWN';

const parsedJson = (value: unknown): unknown => {
    if (typeof value !== 'string') return value ?? null;
    try {
        return JSON.parse(value) as unknown;
    } catch {
        return value;
    }
};

export const toAuditLogListItem = (
    row: AuditLogListRow,
    clientAppNames: ReadonlyMap<number, string>,
): AuditLogListItemDto => ({
    id: row.id,
    createdAt: row.created_at.toISOString(),
    clientApp: row.client_app,
    clientAppName: clientAppNames.get(row.client_app) ?? UNKNOWN,
    module: row.module,
    moduleName: AUDIT_MODULE_NAMES.get(row.module) ?? UNKNOWN,
    action: row.action,
    actionName: AUDIT_ACTION_NAMES.get(row.action) ?? UNKNOWN,
    outcome: row.outcome,
    userId: row.user_id,
    userName: row.user_name,
    username: row.username,
    actorLabel: row.actor_label,
    entityType: row.entity_type,
    entityName: row.entity_type === null ? null : (AUDIT_ENTITY_NAMES.get(row.entity_type) ?? UNKNOWN),
    entityId: row.entity_id,
    ipAddress: row.ip_address,
});

export const toAuditLogDetail = (
    row: AuditLogDetailRow,
    clientAppNames: ReadonlyMap<number, string>,
): AuditLogDetailDto => ({
    ...toAuditLogListItem(row, clientAppNames),
    changes: parsedJson(row.changes),
    details: parsedJson(row.details),
    requestId: row.request_id,
    userAgent: row.user_agent,
});
