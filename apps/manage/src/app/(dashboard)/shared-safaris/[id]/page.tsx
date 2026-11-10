import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { type DetailTab, SafariDetailView } from '@/components/shared-safari/safari-detail-view';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { idParam, type PageSearchParams, singleParam } from '@/lib/search-params';
import { ApiError } from '@/services/api-error';
import { getSharedSafari } from '@/services/shared-safari.service';
import type { ConsoleSafariDetail } from '@/types/shared-safari.types';

type SafariPageProps = {
    readonly params: Promise<{ id: string }>;
    readonly searchParams: Promise<PageSearchParams>;
};

const TABS: readonly DetailTab[] = ['joined', 'left', 'comments'];

const loadSafari = async (id: number | undefined): Promise<ConsoleSafariDetail> => {
    if (id === undefined) notFound();
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    try {
        return await getSharedSafari(id, accessToken);
    } catch (error) {
        if (error instanceof ApiError && error.code === 'SHARED_SAFARI_NOT_FOUND') notFound();
        throw error;
    }
};

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Shared Safari'),
});

export default async function SharedSafariPage({ params, searchParams }: SafariPageProps) {
    await requireConsoleArea('platform');
    const safari = await loadSafari(idParam((await params).id));
    const requested = singleParam((await searchParams)['tab']);
    const tab = TABS.find((key) => key === requested) ?? 'joined';
    return <SafariDetailView safari={safari} tab={tab} />;
}
