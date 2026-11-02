import { listUrl } from '@/lib/list-url';
import {
    AppLogLevel,
    type AppLogFilters,
    type AppLogLevelCode,
    AppLogSource,
    type AppLogSourceCode,
} from '@/types/app-log.types';

export const ERROR_LOGS_PATH = '/error-logs';

export const SOURCE_LABELS: Readonly<Record<AppLogSourceCode, string>> = {
    [AppLogSource.API]: 'API',
    [AppLogSource.MANAGE]: 'Admin Console',
    [AppLogSource.WEB]: 'Web',
};

export const SOURCE_OPTIONS: readonly AppLogSourceCode[] = [
    AppLogSource.API,
    AppLogSource.MANAGE,
    AppLogSource.WEB,
];

export const LEVEL_MARKS: Readonly<Record<AppLogLevelCode, { readonly tone: string; readonly label: string }>> = {
    [AppLogLevel.ERROR]: { tone: ' is-err', label: 'Error' },
    [AppLogLevel.WARNING]: { tone: ' is-warn', label: 'Warning' },
    [AppLogLevel.INFO]: { tone: '', label: 'Info' },
    [AppLogLevel.DEBUG]: { tone: '', label: 'Debug' },
};

export const LEVEL_OPTIONS: readonly AppLogLevelCode[] = [
    AppLogLevel.ERROR,
    AppLogLevel.WARNING,
    AppLogLevel.INFO,
    AppLogLevel.DEBUG,
];

export const appLogParams = (filters: AppLogFilters) => ({
    search: filters.search,
    app: filters.app,
    level: filters.level,
    from: filters.from,
    to: filters.to,
});

export const appLogUrl = (filters: AppLogFilters): string =>
    listUrl(ERROR_LOGS_PATH, { ...appLogParams(filters), page: filters.page });
