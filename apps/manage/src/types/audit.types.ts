export const AuditOutcome = { SUCCESS: 1, FAILURE: 2 } as const;

export type AuditOutcomeCode = (typeof AuditOutcome)[keyof typeof AuditOutcome];

export const AUDIT_LOG_LIMITS = { SEARCH: 100 } as const;

export type AuditLogListItem = {
    readonly id: number;
    readonly createdAt: string;
    readonly clientApp: number;
    readonly clientAppName: string;
    readonly module: number;
    readonly moduleName: string;
    readonly action: number;
    readonly actionName: string;
    readonly outcome: AuditOutcomeCode;
    readonly userId: number | null;
    readonly userName: string | null;
    readonly username: string | null;
    readonly actorLabel: string | null;
    readonly entityType: number | null;
    readonly entityName: string | null;
    readonly entityId: number | null;
    readonly ipAddress: string | null;
};

export type AuditLogDetail = AuditLogListItem & {
    readonly changes: unknown;
    readonly details: unknown;
    readonly requestId: string | null;
    readonly userAgent: string | null;
};

export type AuditSummary = {
    readonly total: number;
    readonly failed: number;
    readonly signIn: number;
    readonly today: number;
};

export type AuditOption = { readonly code: number; readonly name: string };

export type AuditOptions = {
    readonly modules: readonly AuditOption[];
    readonly actions: readonly (AuditOption & { readonly module: number })[];
    readonly clientApps: readonly AuditOption[];
};

export type AuditLogFilters = {
    readonly search: string;
    readonly module: number | undefined;
    readonly action: number | undefined;
    readonly outcome: AuditOutcomeCode | undefined;
    readonly clientApp: number | undefined;
    readonly from: string | undefined;
    readonly to: string | undefined;
    readonly page: number;
};
