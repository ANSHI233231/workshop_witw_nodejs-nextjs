import type { Translate } from '@/lib/i18n/locale';
import { packageFileUrl } from '@/services/package.service';
import { parkImageUrl } from '@/services/park.service';
import { labelOf, type PackageCard, type PackageParkRef, SAFARI_TYPE_OPTIONS } from '@/types/package.types';

export const DEFAULT_PACKAGE_IMAGE = '/witw/default-cover.jpg';

export const DEFAULT_PRICE_MESSAGE = 'Include taxes and fees';

const nightsText = (count: number, t: Translate): string =>
    count === 1 ? t('{n} Night', { n: count }) : t('{n} Nights', { n: count });

const daysText = (count: number, t: Translate): string =>
    count === 1 ? t('{n} Day', { n: count }) : t('{n} Days', { n: count });

export const durationText = (nights: number, days: number, t: Translate): string =>
    `${nightsText(nights, t)}, ${daysText(days, t)}`;

export const activityText = (card: PackageCard, t: Translate): string => {
    if (card.activityMessage) return card.activityMessage;
    const type = t(labelOf(SAFARI_TYPE_OPTIONS, card.safariType));
    return card.safariCount === 1
        ? t('{n} {type} Safari', { n: card.safariCount, type })
        : t('{n} {type} Safaris', { n: card.safariCount, type });
};

export const priceMessageOf = (message: string | null, t: Translate): string => message ?? t(DEFAULT_PRICE_MESSAGE);

export const parkPictureUrl = (park: PackageParkRef): string | null =>
    park.featureImage ? parkImageUrl(park.slug, park.featureImage) : null;

export const cardImageSources = (card: Pick<PackageCard, 'slug' | 'packageImage' | 'mainPark'>): readonly string[] => {
    const own = card.packageImage ? packageFileUrl(card.slug, card.packageImage) : null;
    const park = parkPictureUrl(card.mainPark);
    return [...(own ? [own] : []), ...(park ? [park] : []), DEFAULT_PACKAGE_IMAGE];
};
