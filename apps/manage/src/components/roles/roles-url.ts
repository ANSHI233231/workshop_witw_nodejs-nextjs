import { listUrl } from '@/lib/list-url';
import type { RoleListFilters } from '@/types/roles.types';

export const ROLES_PATH = '/roles';

export const roleListParams = (filters: RoleListFilters) => ({
    search: filters.search,
});

export const rolesUrl = (filters: RoleListFilters): string =>
    listUrl(ROLES_PATH, { ...roleListParams(filters), page: filters.page });
