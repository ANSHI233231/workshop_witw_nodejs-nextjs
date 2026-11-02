import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { type LogApp, type LogAppInfo, type LogLines, LOG_PAGE_LINES } from '@/types/system-log.types';

import { apiClient } from './api-client';

const PATH = '/system-log';

const BROWSER_APP_QUERY = { app: 'manage' } as const;

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listLogApps = (accessToken?: string): Promise<LogAppInfo[]> =>
    apiClient.get<LogAppInfo[]>(`${PATH}/apps`, { headers: cookieHeader(accessToken) });

export const getLogLines = (app: LogApp, name: string, endLine?: number): Promise<LogLines> =>
    apiClient.get<LogLines>(`${PATH}/${app}/${encodeURIComponent(name)}`, {
        query: { endLine, limit: LOG_PAGE_LINES },
    });

export const logDownloadUrl = (app: LogApp, name: string): string =>
    apiClient.url(`${PATH}/${app}/${encodeURIComponent(name)}/download`, BROWSER_APP_QUERY);
