import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LanguageList } from '@/components/languages/language-list';
import { languageUrl } from '@/components/languages/language-url';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listLanguages } from '@/services/language.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { LANGUAGE_LIMITS, type LanguageFilters, LanguageStatus, type LanguageStatusCode } from '@/types/language.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Language Master'),
});

const LISTED_STATUSES: readonly LanguageStatusCode[] = [LanguageStatus.ACTIVE, LanguageStatus.INACTIVE];

export default async function LanguageMasterPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: LanguageFilters = {
        search: searchParam(query['search'], LANGUAGE_LIMITS.SEARCH),
        status: codeParam(query['status'], LISTED_STATUSES),
        page: pageParam(query['page']),
    };
    const result = await listLanguages(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(languageUrl({ ...filters, page: result.meta.totalPages }));
    }
    return <LanguageList filters={filters} result={result} />;
}
