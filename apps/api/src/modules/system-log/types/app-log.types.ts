import type { RowDataPacket } from '../../../database/connection';

export const AppLogSource = { API: 1, MANAGE: 2, WEB: 3 } as const;

export type AppLogSourceCode = (typeof AppLogSource)[keyof typeof AppLogSource];

export const AppLogLevel = { ERROR: 1, WARNING: 2, INFO: 3, DEBUG: 4 } as const;

export type AppLogLevelCode = (typeof AppLogLevel)[keyof typeof AppLogLevel];

export const INGEST_SOURCES = {
    manage: AppLogSource.MANAGE,
    web: AppLogSource.WEB,
} as const;

export type IngestSourceKey = keyof typeof INGEST_SOURCES;

export const APP_LOG_LIMITS = {
    CATEGORY: 100,
    MESSAGE: 10_000,
    ERROR_NAME: 150,
    ERROR_MESSAGE: 10_000,
    STACK: 100_000,
    CONTEXT: 50_000,
    REQUEST_ID: 64,
    IP: 45,
    METHOD: 10,
    URL: 500,
    USER_AGENT: 255,
    SEARCH: 100,
    INGEST_BATCH: 50,
    WRITE_BATCH: 100,
    BUFFER: 1000,
    FLUSH_EVERY_MS: 1000,
    PRUNE_DAYS_MIN: 1,
    PRUNE_DAYS_MAX: 3650,
} as const;

export interface AppLogListRow extends RowDataPacket {
    id: number;
    sourceApp: AppLogSourceCode;
    logLevel: AppLogLevelCode;
    category: string;
    message: string;
    errorName: string | null;
    requestId: string | null;
    userId: number | null;
    userName: string | null;
    ipAddress: string | null;
    httpMethod: string | null;
    requestUrl: string | null;
    loggedAt: Date;
}

export interface AppLogDetailRow extends AppLogListRow {
    fullMessage: string;
    errorMessage: string | null;
    errorStack: string | null;
    logContext: unknown;
    clientApp: number | null;
    userAgent: string | null;
}

export interface AppLogTotalRow extends RowDataPacket {
    total: number;
}
