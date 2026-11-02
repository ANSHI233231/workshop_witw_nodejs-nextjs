import type { AuditActionCode, AuditEntityCode } from '../types/audit.types';

export type AuditChanges = Readonly<Record<string, unknown>>;

export type AuditEvent = {
    readonly action: AuditActionCode;
    readonly entityType?: AuditEntityCode;
    readonly entityId?: number;
    readonly changes?: AuditChanges;
    readonly details?: Readonly<Record<string, unknown>>;
    readonly actorLabel?: string;
};

export type AuditLogRecord = {
    readonly clientApp: number;
    readonly module: number;
    readonly action: number;
    readonly outcome: number;
    readonly userId: number | null;
    readonly actorLabel: string | null;
    readonly entityType: number | null;
    readonly entityId: number | null;
    readonly changes: string | null;
    readonly details: string | null;
    readonly requestId: string | null;
    readonly ipAddress: string | null;
    readonly userAgent: string | null;
};

export type AuditLogFilters = {
    readonly search: string | undefined;
    readonly module: number | undefined;
    readonly action: number | undefined;
    readonly outcome: number | undefined;
    readonly clientApp: number | undefined;
    readonly from: Date | undefined;
    readonly toBefore: Date | undefined;
};

export type AuditLogListItemDto = {
    readonly id: number;
    readonly createdAt: string;
    readonly clientApp: number;
    readonly clientAppName: string;
    readonly module: number;
    readonly moduleName: string;
    readonly action: number;
    readonly actionName: string;
    readonly outcome: number;
    readonly userId: number | null;
    readonly userName: string | null;
    readonly username: string | null;
    readonly actorLabel: string | null;
    readonly entityType: number | null;
    readonly entityName: string | null;
    readonly entityId: number | null;
    readonly ipAddress: string | null;
};

export type AuditLogDetailDto = AuditLogListItemDto & {
    readonly changes: unknown;
    readonly details: unknown;
    readonly requestId: string | null;
    readonly userAgent: string | null;
};

export type AuditLogPage = { readonly items: readonly AuditLogListItemDto[]; readonly total: number };

export type AuditSummaryDto = {
    readonly total: number;
    readonly failed: number;
    readonly signIn: number;
    readonly today: number;
};

export type AuditOptionDto = { readonly code: number; readonly name: string };

export type AuditOptionsDto = {
    readonly modules: readonly AuditOptionDto[];
    readonly actions: readonly (AuditOptionDto & { readonly module: number })[];
    readonly clientApps: readonly AuditOptionDto[];
};
