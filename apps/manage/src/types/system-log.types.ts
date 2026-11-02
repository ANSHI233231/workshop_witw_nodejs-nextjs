export const LOG_APPS = ['api', 'manage', 'web'] as const;

export type LogApp = (typeof LOG_APPS)[number];

export const LOG_APP_LABEL: Readonly<Record<LogApp, string>> = {
    api: 'API',
    manage: 'Manage',
    web: 'Web',
};

export const LOG_PAGE_LINES = 100;

export type LogFileCopy = {
    readonly name: string;
    readonly copy: number;
    readonly sizeBytes: number;
    readonly updatedAt: string;
};

export type LogFileInfo = {
    readonly file: string;
    readonly name: string;
    readonly sizeBytes: number;
    readonly updatedAt: string | null;
    readonly copies: readonly LogFileCopy[];
};

export type LogAppInfo = {
    readonly app: LogApp;
    readonly isConfigured: boolean;
    readonly files: readonly LogFileInfo[];
};

export type LogLines = {
    readonly app: LogApp;
    readonly name: string;
    readonly lines: readonly string[];
    readonly totalLines: number;
    readonly startLine: number;
    readonly endLine: number;
    readonly hasMore: boolean;
};
