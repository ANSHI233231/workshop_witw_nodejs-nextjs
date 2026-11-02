'use client';

import { type ExportColumn, ExportButton, serialColumn } from '@/components/ui/export-button';
import { localDay } from '@/lib/csv';
import { formatMobile } from '@/lib/format';
import { exportUsers } from '@/services/users.service';
import type { UserListFilters, UserListItem } from '@/types/users.types';

import { STATUS_BADGES } from './user-labels';

const COLUMNS: readonly ExportColumn<UserListItem>[] = [
    serialColumn(),
    { header: 'Name', value: (user) => user.name },
    { header: 'Username', value: (user) => user.username },
    { header: 'Mobile', value: (user) => (user.mobile ? formatMobile(user.mobile) : null) },
    { header: 'Email', value: (user) => user.email },
    { header: 'Role', value: (user) => user.roleNames.join(', ') },
    { header: 'Status', value: (user) => STATUS_BADGES[user.status].label },
];

export function UsersExport({ filters }: { readonly filters: UserListFilters }) {
    return <ExportButton fileName={`users-${localDay()}.csv`} columns={COLUMNS} load={() => exportUsers(filters)} />;
}
