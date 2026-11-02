import type { Paginated } from '@/types/api.types';
import type {
    AuditLogDetail,
    AuditLogFilters,
    AuditLogListItem,
    AuditOptions,
    AuditSummary,
} from '@/types/audit.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

import { apiClient } from './api-client';

export const AUDIT_LOGS_PER_PAGE = 20;

const cookieOf = (accessToken: string | undefined): Record<string, string> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

const filterQuery = (filters: AuditLogFilters) => ({
    search: filters.search || undefined,
    module: filters.module,
    action: filters.action,
    outcome: filters.outcome,
    clientApp: filters.clientApp,
    from: filters.from,
    to: filters.to,
});

export const listAuditLogs = (
    filters: AuditLogFilters,
    accessToken: string | undefined,
): Promise<Paginated<AuditLogListItem>> =>
    apiClient.paginated<AuditLogListItem>('/audit/logs', {
        query: { ...filterQuery(filters), page: filters.page, limit: AUDIT_LOGS_PER_PAGE },
        headers: cookieOf(accessToken),
    });

export const exportAuditLogs = (filters: AuditLogFilters): Promise<readonly AuditLogListItem[]> =>
    apiClient.get<readonly AuditLogListItem[]>('/audit/logs/export', { query: filterQuery(filters) });

export const getAuditSummary = (filters: AuditLogFilters, accessToken: string | undefined): Promise<AuditSummary> =>
    apiClient.get<AuditSummary>('/audit/summary', { query: filterQuery(filters), headers: cookieOf(accessToken) });

export const getAuditOptions = (accessToken: string | undefined): Promise<AuditOptions> =>
    apiClient.get<AuditOptions>('/audit/options', { headers: cookieOf(accessToken) });

export const getAuditLog = (id: number): Promise<AuditLogDetail> => apiClient.get<AuditLogDetail>(`/audit/logs/${id}`);
