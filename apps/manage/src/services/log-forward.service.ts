import 'server-only';

import { apiClient } from './api-client';

const APP = 'manage';

export type ErrorLogEntry = {
    readonly level: 'error';
    readonly category: string;
    readonly message: string;
    readonly loggedAt: string;
    readonly errorName?: string;
    readonly errorMessage?: string;
    readonly errorStack?: string;
    readonly context?: Readonly<Record<string, unknown>>;
    readonly requestId?: string;
    readonly ipAddress?: string;
    readonly userId?: number;
    readonly httpMethod?: string;
    readonly requestUrl?: string;
    readonly userAgent?: string;
};

export const sendErrorLogs = (entries: readonly ErrorLogEntry[], ingestKey: string): Promise<{ accepted: number }> =>
    apiClient.post<{ accepted: number }>(
        '/system-log/app-log',
        { app: APP, entries },
        { headers: { 'X-Log-Key': ingestKey } },
    );
