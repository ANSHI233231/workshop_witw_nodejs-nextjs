import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PackageApprovalList } from '@/components/package/package-approval-list';
import { approvalListUrl } from '@/components/package/package-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listPackageApprovals } from '@/services/package.service';
import { type ApprovalFilters, PACKAGE_LIMITS } from '@/types/package.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Package Approvals'),
});

export default async function PackageApprovalsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: ApprovalFilters = {
        search: searchParam(query['search'], PACKAGE_LIMITS.SEARCH),
        page: pageParam(query['page']),
    };
    const result = await listPackageApprovals(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(approvalListUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <PackageApprovalList filters={filters} result={result} />;
}
