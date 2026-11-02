import type { AppLogLevelCode, AppLogSourceCode } from '../types/app-log.types';

export type NewAppLog = {
    readonly sourceApp: AppLogSourceCode;
    readonly logLevel: AppLogLevelCode;
    readonly category: string;
    readonly message: string;
    readonly errorName: string | null;
    readonly errorMessage: string | null;
    readonly errorStack: string | null;
    readonly logContext: string | null;
    readonly requestId: string | null;
    readonly ipAddress: string | null;
    readonly userId: number | null;
    readonly httpMethod: string | null;
    readonly requestUrl: string | null;
    readonly clientApp: number | null;
    readonly userAgent: string | null;
    readonly loggedAt: Date;
};

export type IngestedLog = {
    readonly category: string;
    readonly message: string;
    readonly loggedAt: string;
    readonly errorName?: string | undefined;
    readonly errorMessage?: string | undefined;
    readonly errorStack?: string | undefined;
    readonly context?: Readonly<Record<string, unknown>> | undefined;
    readonly requestId?: string | undefined;
    readonly ipAddress?: string | undefined;
    readonly userId?: number | undefined;
    readonly httpMethod?: string | undefined;
    readonly requestUrl?: string | undefined;
    readonly userAgent?: string | undefined;
};

export type AppLogFilters = {
    readonly search: string | undefined;
    readonly sourceApp: AppLogSourceCode | undefined;
    readonly logLevel: AppLogLevelCode | undefined;
    readonly from: string | undefined;
    readonly to: string | undefined;
};

export type AppLogItemDto = {
    readonly id: number;
    readonly sourceApp: AppLogSourceCode;
    readonly logLevel: AppLogLevelCode;
    readonly category: string;
    readonly message: string;
    readonly errorName: string | null;
    readonly requestId: string | null;
    readonly userId: number | null;
    readonly userName: string | null;
    readonly ipAddress: string | null;
    readonly httpMethod: string | null;
    readonly requestUrl: string | null;
    readonly loggedAt: string;
};

export type AppLogDetailDto = AppLogItemDto & {
    readonly errorMessage: string | null;
    readonly errorStack: string | null;
    readonly logContext: unknown;
    readonly clientApp: number | null;
    readonly userAgent: string | null;
};

export type AppLogPage = {
    readonly items: readonly AppLogItemDto[];
    readonly total: number;
};

export type AppLogPruneResult = {
    readonly days: number;
    readonly before: string;
    readonly matching: number;
    readonly deleted: number;
};
