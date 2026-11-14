import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PartnerList } from '@/components/partners/partner-list';
import { PARTNERS_PATH, partnerListUrl } from '@/components/partners/partner-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listActiveParks, listPartners } from '@/services/partner.service';
import { PARTNER_LIMITS, PARTNER_STATUSES, type PartnerFilters } from '@/types/partner.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Partners'),
});

export default async function PartnersPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: PartnerFilters = {
        search: searchParam(query['search'], PARTNER_LIMITS.SEARCH),
        status: codeParam(query['status'], PARTNER_STATUSES),
        page: pageParam(query['page']),
    };
    const [result, parks] = await Promise.all([listPartners(filters, accessToken), listActiveParks()]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(partnerListUrl(PARTNERS_PATH, { ...filters, page: result.meta.totalPages }));
    }
    return <PartnerList filters={filters} result={result} parks={parks} />;
}
