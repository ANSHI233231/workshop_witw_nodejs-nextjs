import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UsersList } from '@/components/users/users-list';
import { usersUrl } from '@/components/users/users-url';
import { codeParam, idParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { listAllRoles } from '@/services/roles.service';
import { listUsers } from '@/services/users.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import {
    USER_LIST_LIMITS,
    UserStatus,
    type UserListFilters,
    type UserStatusCode,
} from '@/types/users.types';
import { requireConsoleArea } from '@/lib/console-session';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Users') });

const LISTED_STATUSES: readonly UserStatusCode[] = [UserStatus.ACTIVE, UserStatus.INACTIVE];

const toFilters = (params: PageSearchParams): UserListFilters => ({
    search: searchParam(params['search'], USER_LIST_LIMITS.SEARCH),
    status: codeParam(params['status'], LISTED_STATUSES),
    metaRoleId: idParam(params['role']),
    page: pageParam(params['page']),
});

export default async function UsersPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const filters = toFilters(await searchParams);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, roles] = await Promise.all([listUsers(filters, accessToken), listAllRoles(accessToken)]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(usersUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <UsersList filters={filters} result={result} roles={roles} />;
}
