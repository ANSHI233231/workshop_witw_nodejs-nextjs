import { listUrl } from '@/lib/list-url';
import type { AuditLogFilters } from '@/types/audit.types';

export const AUDIT_LOG_PATH = '/audit-log';

export const auditLogParams = (filters: AuditLogFilters) => ({
    search: filters.search,
    module: filters.module,
    action: filters.action,
    outcome: filters.outcome,
    app: filters.clientApp,
    from: filters.from,
    to: filters.to,
});

export const auditLogUrl = (filters: AuditLogFilters): string =>
    listUrl(AUDIT_LOG_PATH, { ...auditLogParams(filters), page: filters.page });
