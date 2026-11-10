import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SafariList } from '@/components/shared-safari/safari-list';
import { safariListUrl } from '@/components/shared-safari/shared-safari-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, idParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listSafariHosts, listSharedSafaris } from '@/services/shared-safari.service';
import { SAFARI_STATUSES, type SafariFilters, SHARED_SAFARI_LIMITS } from '@/types/shared-safari.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Shared Safaris'),
});

export default async function SharedSafarisPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: SafariFilters = {
        search: searchParam(query['search'], SHARED_SAFARI_LIMITS.SEARCH),
        status: codeParam(query['status'], SAFARI_STATUSES),
        hostId: idParam(query['hostId']),
        page: pageParam(query['page']),
    };
    const [result, hosts] = await Promise.all([
        listSharedSafaris(filters, accessToken),
        listSafariHosts(accessToken),
    ]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(safariListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <SafariList filters={filters} hosts={hosts} result={result} />;
}
