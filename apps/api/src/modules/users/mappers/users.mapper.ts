import type { RoleListItemDto, UserListItemDto } from '../dto/users.dto';
import type { RoleListRow, UserListRow } from '../types/users.types';

export const toUserListItem = (row: UserListRow, roleNames: readonly string[]): UserListItemDto => ({
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    mobile: row.mobile,
    roleNames,
    status: row.status,
});

export const toRoleListItem = (row: RoleListRow): RoleListItemDto => ({
    id: row.id,
    name: row.name,
    status: row.status,
});
