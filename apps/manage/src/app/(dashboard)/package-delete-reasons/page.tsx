import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DeleteReasonList } from '@/components/package/delete-reason-list';
import { reasonListUrl } from '@/components/package/package-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listDeleteReasons } from '@/services/package.service';
import { DELETE_REASON_STATUSES, type DeleteReasonFilters, PACKAGE_LIMITS } from '@/types/package.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Package Delete Reasons'),
});

export default async function PackageDeleteReasonsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: DeleteReasonFilters = {
        search: searchParam(query['search'], PACKAGE_LIMITS.SEARCH),
        status: codeParam(query['status'], DELETE_REASON_STATUSES),
        page: pageParam(query['page']),
    };
    const result = await listDeleteReasons(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(reasonListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <DeleteReasonList filters={filters} result={result} />;
}
