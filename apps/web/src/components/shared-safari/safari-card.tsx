'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useState } from 'react';

import { PersonLink } from '@/components/profile/person-link';
import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { useT } from '@/hooks/i18n/use-t';
import { cn } from '@/lib/class-names';
import { dayOfMonth, monthShort } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { getSafari, joinSafari, leaveSafari } from '@/services/shared-safari.service';
import { SafariStatus, type SafariCard as SafariCardValue } from '@/types/shared-safari.types';

import { PersonAvatar } from './person-avatar';
import { coverSource } from './safari-cover';
import { MapPinIcon } from './safari-icons';

export const safariPath = (slug: string): string => `/shared-safaris/${encodeURIComponent(slug)}`;

type ButtonState = { readonly label: string; readonly className: string };

const buttonOf = (card: SafariCardValue, viewOnly: boolean): ButtonState => {
    const full = card.status === SafariStatus.SEAT_FULL;
    if (card.viewer.isHost || viewOnly) return { label: 'View Safari', className: 'btn-secondary' };
    if (card.viewer.joined) return { label: 'Leave Safari', className: 'btn-secondary wb-leave' };
    if (full) return { label: 'Seat Full', className: 'btn-secondary is-full' };
    return { label: 'Join Safari', className: 'btn-primary' };
};

export function SafariCard({
    card,
    onChanged,
    onMessage,
    onError,
    viewOnly = false,
}: {
    readonly card: SafariCardValue;
    readonly viewOnly?: boolean;
    readonly onChanged: (card: SafariCardValue) => void;
    readonly onMessage: (message: string) => void;
    readonly onError: (message: string) => void;
}) {
    const t = useT();
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const full = card.status === SafariStatus.SEAT_FULL;
    const button = buttonOf(card, viewOnly);
    const path = safariPath(card.slug);
    const showButton = !card.viewer.isPartner || card.viewer.isHost || card.viewer.joined;
    const more = card.joinedCount - card.faces.length;

    const refresh = async () => {
        try {
            onChanged(await getSafari(card.slug));
        } catch {
            return;
        }
    };

    const act = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (busy) return;
        if (card.viewer.isHost || viewOnly || (full && !card.viewer.joined)) {
            router.push(path);
            return;
        }
        if (!card.viewer.signedIn) {
            router.push(SITE_PATHS.signIn);
            return;
        }
        setBusy(true);
        try {
            if (card.viewer.joined) {
                await leaveSafari(card.id);
                onMessage(t("You've left this safari."));
            } else {
                await joinSafari(card.id);
                onMessage(t("You've joined this safari."));
            }
            await refresh();
        } catch (error) {
            onError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
            await refresh();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="wb-card" onClick={() => router.push(path)}>
            <div className="wb-img">
                <img src={coverSource(card.id, card.coverVersion)} alt="" />
                <span className="wb-date">
                    {t(monthShort(card.startDate))}
                    <br />
                    {dayOfMonth(card.startDate)}
                </span>
            </div>
            <div className={cn('wb-strip', full && 'is-full')}>
                <span>
                    {t('Safaris')}
                    <b>{card.safariCount}</b>
                </span>
                <span>
                    {t('Seats')}
                    <b>{t('{share} of {total}', { share: card.sharedSeats, total: card.totalSeats })}</b>
                </span>
            </div>
            <div className="wb-body">
                <h3 className="wb-title">
                    <Link href={path} onClick={(event) => event.stopPropagation()}>
                        {card.title}
                    </Link>
                </h3>
                <div className="wb-host">
                    <PersonAvatar person={card.host} />
                    <div>
                        <div className="wb-by">
                            <PersonLink person={card.host}>
                                <b>{card.host.name}</b>
                            </PersonLink>{' '}
                            {t('has shared a safari')}
                        </div>
                        <div className="wb-park">
                            <MapPinIcon />
                            <span>{card.park.name}</span>
                        </div>
                    </div>
                </div>
                <div className="wb-cfoot">
                    <div className="wb-faces">
                        {card.faces.length > 0 && (
                            <span className="wb-stack">
                                {card.faces.map((face) => (
                                    <PersonAvatar key={face.id} person={face} title={face.name} />
                                ))}
                                {more > 0 && <span className="avatar wb-more">+{more}</span>}
                            </span>
                        )}
                        <span className="ss-cap">{t('{n} joined', { n: card.joinedCount })}</span>
                    </div>
                    {showButton && (
                        <button
                            type="button"
                            className={cn('btn', button.className, 'wb-join')}
                            onClick={(event) => void act(event)}
                            disabled={busy}
                        >
                            {t(button.label)}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
