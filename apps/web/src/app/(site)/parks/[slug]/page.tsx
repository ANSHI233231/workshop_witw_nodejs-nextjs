import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { PARK_TABS } from '@/components/park/park-tabs';
import { ParkView } from '@/components/park/park-view';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { priceRange } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { getParkPage } from '@/services/park.service';
import { PARK_REGION_LABEL, type ParkPageData } from '@/types/park.types';

type ParkParams = {
    readonly params: Promise<{ readonly slug: string }>;
    readonly searchParams: Promise<{ readonly tab?: string }>;
};

const loadPark = cache(async (slug: string): Promise<ParkPageData> => {
    try {
        return await getParkPage(slug);
    } catch (error) {
        if (error instanceof ApiError && error.code === 'PARK_NOT_FOUND') notFound();
        throw error;
    }
});

export const generateMetadata = async ({ params }: ParkParams): Promise<Metadata> => ({
    title: (await loadPark(decodeURIComponent((await params).slug))).name,
});

export default async function ParkPageRoute({ params, searchParams }: ParkParams) {
    const { t } = await serverTranslator();
    const park = await loadPark(decodeURIComponent((await params).slug));
    const { tab } = await searchParams;
    const initialTab = PARK_TABS.find((key) => key === tab) ?? 'overview';
    const price =
        park.avgSafariPriceMin !== null && park.avgSafariPriceMax !== null
            ? `${priceRange(park.avgSafariPriceMin, park.avgSafariPriceMax)} ${t('average safari price')}`
            : t('Price not set');
    return (
        <>
            <SiteBanner title={park.name} text={`${t(PARK_REGION_LABEL[park.region])} · ${price}`} />
            <div className="page">
                <ParkView key={park.id} park={park} initialTab={initialTab} />
            </div>
        </>
    );
}
