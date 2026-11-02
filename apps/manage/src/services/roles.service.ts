import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type { RoleListFilters, RoleListItem } from '@/types/roles.types';

import { apiClient } from './api-client';

export const ROLES_PER_PAGE = 20;

const ALL_ROLES_LIMIT = 100;

export const listRoles = (
    filters: RoleListFilters,
    accessToken: string | undefined,
): Promise<Paginated<RoleListItem>> =>
    apiClient.paginated<RoleListItem>('/users/roles', {
        query: {
            search: filters.search || undefined,
            page: filters.page,
            limit: ROLES_PER_PAGE,
        },
        headers: accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {},
    });

export const listAllRoles = async (accessToken: string | undefined): Promise<readonly RoleListItem[]> =>
    (
        await apiClient.paginated<RoleListItem>('/users/roles', {
            query: { page: 1, limit: ALL_ROLES_LIMIT },
            headers: accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {},
        })
    ).items;
