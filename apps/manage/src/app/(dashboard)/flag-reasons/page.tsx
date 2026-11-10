import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { FlagReasonList } from '@/components/flag-reasons/flag-reason-list';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, searchParam } from '@/lib/search-params';
import { listFlagReasons } from '@/services/flag-reason.service';
import {
    FLAG_REASON_LIMITS,
    type FlagReasonFilters,
    FlagReasonStatus,
    type FlagReasonStatusCode,
} from '@/types/flag-reason.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Flag Reasons'),
});

const LISTED_STATUSES: readonly FlagReasonStatusCode[] = [FlagReasonStatus.ACTIVE, FlagReasonStatus.INACTIVE];

export default async function FlagReasonsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: FlagReasonFilters = {
        search: searchParam(query['search'], FLAG_REASON_LIMITS.SEARCH),
        status: codeParam(query['status'], LISTED_STATUSES),
    };
    const rows = await listFlagReasons(filters, accessToken);
    return <FlagReasonList filters={filters} rows={rows} />;
}
