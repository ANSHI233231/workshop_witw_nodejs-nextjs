'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { FallbackImage } from '@/components/package/fallback-image';
import { useT } from '@/hooks/i18n/use-t';
import { DEFAULT_PACKAGE_IMAGE } from '@/lib/package-format';
import { priceRange } from '@/lib/shared-safari-format';
import { parkImageUrl } from '@/services/park.service';
import { PARK_REGION_LABEL, type ParkCard as ParkCardValue } from '@/types/park.types';

export const parkPath = (slug: string): string => `/parks/${encodeURIComponent(slug)}`;

export const parkImageSources = (park: Pick<ParkCardValue, 'slug' | 'featureImage'>): readonly string[] => [
    ...(park.featureImage ? [parkImageUrl(park.slug, park.featureImage)] : []),
    DEFAULT_PACKAGE_IMAGE,
];

export function ParkCard({ park }: { readonly park: ParkCardValue }) {
    const t = useT();
    const router = useRouter();
    const path = parkPath(park.slug);
    const priced = park.avgSafariPriceMin !== null && park.avgSafariPriceMax !== null;

    return (
        <div className="pk-card pk5-card" onClick={() => router.push(path)}>
            <div className="pk-img">
                <FallbackImage sources={parkImageSources(park)} />
            </div>
            <div className="pk-body">
                <h3 className="pk-name">
                    <Link href={path} onClick={(event) => event.stopPropagation()}>
                        {park.name}
                    </Link>
                </h3>
                <span className="pk5-region">{t(PARK_REGION_LABEL[park.region])}</span>
                <span className="pk5-price">
                    {priced ? priceRange(park.avgSafariPriceMin ?? 0, park.avgSafariPriceMax ?? 0) : t('Price not set')}{' '}
                    <small>{priced ? t('average safari price') : ''}</small>
                </span>
            </div>
        </div>
    );
}
