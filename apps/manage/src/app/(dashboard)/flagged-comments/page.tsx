import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { FlaggedList } from '@/components/shared-safari/flagged-list';
import { flaggedListUrl } from '@/components/shared-safari/shared-safari-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listFlaggedComments } from '@/services/shared-safari.service';
import { type FlaggedFilters, SHARED_SAFARI_LIMITS } from '@/types/shared-safari.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Flagged Comments'),
});

export default async function FlaggedCommentsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: FlaggedFilters = {
        search: searchParam(query['search'], SHARED_SAFARI_LIMITS.SEARCH),
        page: pageParam(query['page']),
    };
    const result = await listFlaggedComments(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(flaggedListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <FlaggedList filters={filters} result={result} />;
}
