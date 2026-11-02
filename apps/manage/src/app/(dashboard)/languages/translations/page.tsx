import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { translationUrl } from '@/components/languages/language-url';
import { TranslationList } from '@/components/languages/translation-list';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, type PageSearchParams, pageParam, searchParam, singleParam } from '@/lib/search-params';
import { getLastPublish, listAppTranslationLanguages, listAppTranslations } from '@/services/language.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import {
    APP_TRANSLATION_LIMITS,
    type AppTranslationFilters,
    AppTranslationStatus,
    type AppTranslationStatusCode,
} from '@/types/language.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('App Translations'),
});

const LISTED_STATUSES: readonly AppTranslationStatusCode[] = [
    AppTranslationStatus.ACTIVE,
    AppTranslationStatus.INACTIVE,
];

export default async function TranslationPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: AppTranslationFilters = {
        search: searchParam(query['search'], APP_TRANSLATION_LIMITS.SEARCH),
        status: codeParam(query['status'], LISTED_STATUSES),
        missing: singleParam(query['missing']) || undefined,
        page: pageParam(query['page']),
    };
    const [result, lastPublish, languages] = await Promise.all([
        listAppTranslations(filters, accessToken),
        getLastPublish(accessToken),
        listAppTranslationLanguages(accessToken),
    ]);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(translationUrl({ ...filters, page: result.meta.totalPages }));
    }
    return (
        <TranslationList
            filters={filters}
            result={result}
            languages={languages}
            lastPublishedAt={lastPublish.publishedAt}
        />
    );
}
