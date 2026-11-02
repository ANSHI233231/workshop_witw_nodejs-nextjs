import { listUrl } from '@/lib/list-url';
import type { UserListFilters } from '@/types/users.types';

export const USERS_PATH = '/users';

export const userListParams = (filters: UserListFilters) => ({
    search: filters.search,
    status: filters.status,
    role: filters.metaRoleId,
});

export const usersUrl = (filters: UserListFilters): string =>
    listUrl(USERS_PATH, { ...userListParams(filters), page: filters.page });
