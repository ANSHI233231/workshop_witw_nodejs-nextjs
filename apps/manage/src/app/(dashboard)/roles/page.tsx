import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { RolesList } from '@/components/roles/roles-list';
import { rolesUrl } from '@/components/roles/roles-url';
import { type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { listRoles } from '@/services/roles.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { ROLE_LIST_LIMITS, type RoleListFilters } from '@/types/roles.types';
import { requireConsoleArea } from '@/lib/console-session';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Roles') });

const toFilters = (params: PageSearchParams): RoleListFilters => ({
    search: searchParam(params['search'], ROLE_LIST_LIMITS.SEARCH),
    page: pageParam(params['page']),
});

export default async function RolesPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const filters = toFilters(await searchParams);
    const result = await listRoles(filters, (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(rolesUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <RolesList filters={filters} result={result} />;
}
