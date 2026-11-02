import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { UsersSummary } from '@/types/dashboard.types';

import { apiClient } from './api-client';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const getUsersSummary = (accessToken: string | undefined): Promise<UsersSummary> =>
    apiClient.get<UsersSummary>('/users/summary', { headers: cookieHeader(accessToken) });
