import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ParkList } from '@/components/parks/park-list';
import { parkUrl } from '@/components/parks/park-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listParks } from '@/services/park.service';
import { PARK_LIMITS, PARK_REGIONS, PARK_STATUSES, type ParkFilters } from '@/types/park.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Parks'),
});

export default async function ParksPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: ParkFilters = {
        search: searchParam(query['search'], PARK_LIMITS.SEARCH),
        region: codeParam(query['region'], PARK_REGIONS),
        status: codeParam(query['status'], PARK_STATUSES),
        page: pageParam(query['page']),
    };
    const result = await listParks(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(parkUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <ParkList filters={filters} result={result} />;
}
