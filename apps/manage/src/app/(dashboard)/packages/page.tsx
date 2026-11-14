import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PackageList } from '@/components/package/package-list';
import { packageListUrl } from '@/components/package/package-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, idParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listConsolePackages, listPartnerOptions } from '@/services/package.service';
import { CONSOLE_WEBSITE_STATUSES, PACKAGE_LIMITS, type PackageListFilters } from '@/types/package.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Packages'),
});

export default async function PackagesPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: PackageListFilters = {
        search: searchParam(query['search'], PACKAGE_LIMITS.SEARCH),
        websiteStatus: codeParam(query['websiteStatus'], CONSOLE_WEBSITE_STATUSES),
        partnerId: idParam(query['partnerId']),
        page: pageParam(query['page']),
    };
    const [result, partners] = await Promise.all([
        listConsolePackages(filters, accessToken),
        listPartnerOptions(accessToken),
    ]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(packageListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <PackageList filters={filters} result={result} partners={partners} />;
}
