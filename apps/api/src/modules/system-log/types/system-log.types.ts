export const LOG_APPS = ['api', 'manage', 'web'] as const;

export type LogApp = (typeof LOG_APPS)[number];

export const LOG_FILES = ['app', 'error', 'warning', 'info', 'debug', 'access'] as const;

export type LogFile = (typeof LOG_FILES)[number];

export const LOG_COPIES = 5;

export const LOG_LIMITS = { DEFAULT_LINES: 100, MAX_LINES: 500 } as const;

export const LOG_FILE_NAME = /^(app|error|warning|info|debug|access)\.log(\.[1-5])?$/;
