import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PartnerRequestList } from '@/components/partners/partner-request-list';
import { PARTNER_REQUESTS_PATH, partnerListUrl } from '@/components/partners/partner-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listPartnerRequests } from '@/services/partner.service';
import { PARTNER_LIMITS, type PartnerFilters, REQUEST_STATUSES } from '@/types/partner.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Partner Requests'),
});

export default async function PartnerRequestsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: PartnerFilters = {
        search: searchParam(query['search'], PARTNER_LIMITS.SEARCH),
        status: codeParam(query['status'], REQUEST_STATUSES),
        page: pageParam(query['page']),
    };
    const result = await listPartnerRequests(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(partnerListUrl(PARTNER_REQUESTS_PATH, { ...filters, page: result.meta.totalPages }));
    }
    return <PartnerRequestList filters={filters} result={result} />;
}
