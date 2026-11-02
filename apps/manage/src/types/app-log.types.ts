export const AppLogSource = { API: 1, MANAGE: 2, WEB: 3 } as const;

export type AppLogSourceCode = (typeof AppLogSource)[keyof typeof AppLogSource];

export const AppLogLevel = { ERROR: 1, WARNING: 2, INFO: 3, DEBUG: 4 } as const;

export type AppLogLevelCode = (typeof AppLogLevel)[keyof typeof AppLogLevel];

export const APP_LOG_LIMITS = { SEARCH: 100 } as const;

export type AppLogItem = {
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

export type AppLogDetail = AppLogItem & {
    readonly errorMessage: string | null;
    readonly errorStack: string | null;
    readonly logContext: unknown;
    readonly clientApp: number | null;
    readonly userAgent: string | null;
};

export type AppLogFilters = {
    readonly search: string;
    readonly app: AppLogSourceCode | undefined;
    readonly level: AppLogLevelCode | undefined;
    readonly from: string | undefined;
    readonly to: string | undefined;
    readonly page: number;
};
