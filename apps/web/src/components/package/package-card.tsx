'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { WishlistHeart } from '@/components/wishlist/wishlist-heart';
import { useT } from '@/hooks/i18n/use-t';
import { activityText, cardImageSources, durationText, priceMessageOf } from '@/lib/package-format';
import { rupees } from '@/lib/shared-safari-format';
import type { PackageCard as PackageCardValue } from '@/types/package.types';
import { WishlistItemType } from '@/types/wishlist.types';

import { CarIcon, MapPinIcon } from '../shared-safari/safari-icons';

import { FallbackImage } from './fallback-image';
import { ClockIcon, StarIcon } from './package-icons';

export const packagePath = (slug: string): string => `/packages/${encodeURIComponent(slug)}`;

export function PackageCard({ card }: { readonly card: PackageCardValue }) {
    const t = useT();
    const router = useRouter();
    const path = packagePath(card.slug);

    return (
        <div className="pk-card" onClick={() => router.push(path)}>
            <div className="pk-img">
                <FallbackImage sources={cardImageSources(card)} />
                <WishlistHeart itemType={WishlistItemType.PACKAGE} itemId={card.id} />
                {card.isBestDeal && (
                    <span className="pk-best">
                        <StarIcon />
                        {t('Best deal')}
                    </span>
                )}
                {card.tag.text && (
                    <span
                        className="pk-tag"
                        style={{ background: card.tag.backgroundColor, color: card.tag.textColor }}
                    >
                        {card.tag.text}
                    </span>
                )}
            </div>
            <div className="pk-body">
                <h3 className="pk-name">
                    <Link href={path} onClick={(event) => event.stopPropagation()}>
                        {card.name}
                    </Link>
                </h3>
                <div className="pk-park">
                    <MapPinIcon />
                    <span>{card.mainPark.name}</span>
                </div>
                <div className="pk-lines">
                    <span className="pk-line">
                        <ClockIcon />
                        {durationText(card.nightCount, card.dayCount, t)}
                    </span>
                    <span className="pk-line">
                        <CarIcon />
                        {activityText(card, t)}
                    </span>
                </div>
                <div className="pk-foot">
                    <div>
                        {card.priceBeforeDiscount !== null && (
                            <span className="pk-old">{rupees(card.priceBeforeDiscount)}</span>
                        )}
                        <span className="pk-ppp">
                            {rupees(card.pricePerPerson)} <small>{t('/Person')}</small>
                        </span>
                        <span className="pk-tot">{t('Total Price {amount}', { amount: rupees(card.totalPrice) })}</span>
                    </div>
                    <button type="button" className="btn btn-primary pk-view">
                        {t('View Details')}
                    </button>
                </div>
                <div className="pk-msg">{priceMessageOf(card.priceMessage, t)}</div>
            </div>
        </div>
    );
}
