import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import type { Paginated } from '@/types/api.types';
import type { RoleListItem } from '@/types/roles.types';
import type { UserListFilters, UserListItem } from '@/types/users.types';
import { serverTranslator } from '@/lib/i18n/server-translator';

import { AddUserButton } from './add-user-button';
import { UsersExport } from './users-export';
import { UsersFilterBar } from './users-filter-bar';
import { UsersTable } from './users-table';
import { USERS_PATH, userListParams } from './users-url';

export async function UsersList({
    filters,
    result,
    roles,
}: {
    readonly filters: UserListFilters;
    readonly result: Paginated<UserListItem>;
    readonly roles: readonly RoleListItem[];
}) {
    const { t } = await serverTranslator();
    const firstSerial = (filters.page - 1) * result.meta.limit + 1;
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('User & Role')}</a>
                    <BreadcrumbChevronIcon />
                    <a>{t('Users & Roles')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Users')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Users')}</h1>
                    <div className="actions">
                        <UsersExport filters={filters} />
                        <AddUserButton />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <UsersFilterBar filters={filters} roles={roles} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <UsersTable users={result.items} firstSerial={firstSerial} />
                <TablePager
                    path={USERS_PATH}
                    params={userListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
