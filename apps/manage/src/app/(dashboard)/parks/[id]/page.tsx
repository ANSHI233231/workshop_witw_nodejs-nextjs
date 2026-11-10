import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { ParkDetailView } from '@/components/parks/park-detail-view';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { idParam } from '@/lib/search-params';
import { ApiError } from '@/services/api-error';
import { getPark } from '@/services/park.service';
import type { ParkDetail } from '@/types/park.types';

type ParkParams = { readonly params: Promise<{ id: string }> };

const loadPark = async (id: number | undefined): Promise<ParkDetail> => {
    if (id === undefined) notFound();
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    try {
        return await getPark(id, accessToken);
    } catch (error) {
        if (error instanceof ApiError && error.code === 'PARK_NOT_FOUND') notFound();
        throw error;
    }
};

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Park'),
});

export default async function ParkDetailPage({ params }: ParkParams) {
    await requireConsoleArea('platform');
    const park = await loadPark(idParam((await params).id));
    return <ParkDetailView park={park} />;
}
