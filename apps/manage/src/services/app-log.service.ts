import type { Paginated } from '@/types/api.types';
import type { AppLogDetail, AppLogFilters, AppLogItem } from '@/types/app-log.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

import { apiClient } from './api-client';

export const APP_LOGS_PER_PAGE = 20;

const cookieOf = (accessToken: string | undefined): Record<string, string> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listAppLogs = (filters: AppLogFilters, accessToken: string | undefined): Promise<Paginated<AppLogItem>> =>
    apiClient.paginated<AppLogItem>('/system-log/app-log', {
        query: {
            search: filters.search || undefined,
            app: filters.app,
            level: filters.level,
            from: filters.from,
            to: filters.to,
            page: filters.page,
            limit: APP_LOGS_PER_PAGE,
        },
        headers: cookieOf(accessToken),
    });

export const getAppLog = (id: number): Promise<AppLogDetail> =>
    apiClient.get<AppLogDetail>(`/system-log/app-log/${id}`);
