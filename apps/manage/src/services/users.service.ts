import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    UserDetail,
    UserListFilters,
    UserListItem,
    UserPasswordInput,
    UserPickerOption,
    UserUpdateInput,
    UserStatusCode,
} from '@/types/users.types';

import { apiClient } from './api-client';

export const USERS_PER_PAGE = 20;

const userQuery = (filters: UserListFilters) => ({
    search: filters.search || undefined,
    status: filters.status,
    metaRoleId: filters.metaRoleId,
});

export const listUsers = (
    filters: UserListFilters,
    accessToken: string | undefined,
): Promise<Paginated<UserListItem>> =>
    apiClient.paginated<UserListItem>('/users', {
        query: { ...userQuery(filters), page: filters.page, limit: USERS_PER_PAGE },
        headers: accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {},
    });

export const exportUsers = (filters: UserListFilters): Promise<readonly UserListItem[]> =>
    apiClient.get<readonly UserListItem[]>('/users/export', { query: userQuery(filters) });

export const getUser = (id: number): Promise<UserDetail> => apiClient.get<UserDetail>(`/users/${id}`);

export const updateUser = (id: number, input: UserUpdateInput): Promise<UserDetail> =>
    apiClient.patch<UserDetail>(`/users/${id}`, input);

export const createUser = (
    input: UserUpdateInput & { readonly password: string; readonly confirmPassword: string },
): Promise<UserDetail> => apiClient.post<UserDetail>('/users', input);

export const setUserStatus = (id: number, status: UserStatusCode): Promise<UserDetail> =>
    apiClient.patch<UserDetail>(`/users/${id}/status`, { status });

export const setUserPassword = (id: number, input: UserPasswordInput): Promise<void> =>
    apiClient.post<void>(`/users/${id}/password`, input);

export const USER_PICKER_PAGE_SIZE = 20;

export const searchUserPicker = (
    search: string,
    page: number,
    signal?: AbortSignal,
): Promise<Paginated<UserPickerOption>> =>
    apiClient.paginated<UserPickerOption>('/users/picker', {
        query: { search: search || undefined, page, limit: USER_PICKER_PAGE_SIZE },
        signal,
    });
