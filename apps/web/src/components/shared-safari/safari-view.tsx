'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import type { Translate } from '@/lib/i18n/locale';
import { dateRange, priceRange, tripDays } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { deleteSafari, getSafari, joinSafari, leaveSafari, setSafariStatus } from '@/services/shared-safari.service';
import {
    type HostStatus,
    SAFARI_LIMITS,
    type SafariView as SafariViewValue,
    SafariStatus,
    STAY_OPTIONS,
    THEME_OPTIONS,
} from '@/types/shared-safari.types';

import { OrganiseDialog } from './organise-dialog';
import { coverSource } from './safari-cover';
import {
    DeleteSafariDialog,
    FlagDialog,
    InterestedDialog,
    LeaveSafariDialog,
    StatusDialog,
    statusLabel,
} from './safari-dialogs';
import { SafariDiscussion } from './safari-discussion';
import { rememberFlash, takeFlash } from './safari-flash';
import {
    BinocularsStateIcon,
    BuildingIcon,
    CalendarIcon,
    CarIcon,
    CheckCircleIcon,
    FacebookIcon,
    InfoIcon,
    InstagramLogoIcon,
    LinkedInIcon,
    LinkIcon,
    MapPinIcon,
    RupeeIcon,
    TelegramIcon,
    UsersIcon,
    WhatsAppIcon,
    XLogoIcon,
} from './safari-icons';
import { SiteToast } from './site-toast';

const NOT_AVAILABLE = 'SHARED_SAFARI_NOT_AVAILABLE';

type Dialog = 'who' | 'status' | 'delete' | 'leave' | 'edit' | null;

const SHARE_ICONS = [
    { name: 'Facebook', tone: 'is-facebook', Icon: FacebookIcon },
    { name: 'X', tone: 'is-x', Icon: XLogoIcon },
    { name: 'Instagram', tone: 'is-instagram', Icon: InstagramLogoIcon },
    { name: 'WhatsApp', tone: 'is-whatsapp', Icon: WhatsAppIcon },
    { name: 'LinkedIn', tone: 'is-linkedin', Icon: LinkedInIcon },
    { name: 'Telegram', tone: 'is-telegram', Icon: TelegramIcon },
    { name: 'Copy link', tone: 'is-copy-link', Icon: LinkIcon },
] as const;

const durationOf = (safari: SafariViewValue, t: Translate): string => {
    const days = tripDays(safari.startDate, safari.endDate);
    const nights = days - 1;
    const nightText = nights === 1 ? t('{n} Night', { n: nights }) : t('{n} Nights', { n: nights });
    const dayText = days === 1 ? t('{n} Day', { n: days }) : t('{n} Days', { n: days });
    return `${nightText}, ${dayText}`;
};

const badgeClassOf = (status: number): string =>
    status === SafariStatus.SEAT_FULL ? 'badge badge-warning' : 'badge badge-neutral';

function NotAvailable() {
    const t = useT();
    return (
        <div className="card">
            <div className="state">
                <BinocularsStateIcon className="icon state-icon" />
                <p className="state-title">{t('This safari is not available.')}</p>
                <Link className="btn btn-secondary" href={SITE_PATHS.home}>
                    {t('Back to Shared Safaris')}
                </Link>
            </div>
        </div>
    );
}

export function SafariViewPage({ safariRef, meName }: { readonly safariRef: string; readonly meName: string }) {
    const t = useT();
    const router = useRouter();
    const { toast, show, showError, hide } = useSiteToast();
    const [safari, setSafari] = useState<SafariViewValue | null>(null);
    const [missing, setMissing] = useState(false);
    const [dialog, setDialog] = useState<Dialog>(null);
    const [flagId, setFlagId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            setSafari(await getSafari(safariRef));
            setMissing(false);
        } catch (error) {
            if (error instanceof ApiError && error.code === NOT_AVAILABLE) {
                setMissing(true);
                setSafari(null);
                return;
            }
            showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        }
    }, [safariRef, showError, t]);

    useEffect(() => {
        const flash = takeFlash();
        queueMicrotask(() => {
            void load();
            if (flash) show(flash);
        });
    }, [load, show]);

    const failed = (error: unknown) => {
        showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
    };

    const act = async (work: () => Promise<void>, message: string | null) => {
        if (busy) return;
        setBusy(true);
        try {
            await work();
            setDialog(null);
            if (message) show(message);
            await load();
        } catch (error) {
            setDialog(null);
            failed(error);
            await load();
        } finally {
            setBusy(false);
        }
    };

    const removeSafari = async (id: number) => {
        if (busy) return;
        setBusy(true);
        try {
            await deleteSafari(id);
            rememberFlash(t('Safari deleted.'));
            router.push(SITE_PATHS.mySharedSafaris);
        } catch (error) {
            setDialog(null);
            failed(error);
            setBusy(false);
        }
    };

    if (missing) return <NotAvailable />;
    if (!safari) return <SiteToast toast={toast} onClose={hide} />;

    const viewer = safari.viewer;
    const isOpen = safari.status === SafariStatus.ACTIVE || safari.status === SafariStatus.SEAT_FULL;
    const members = safari.interested;
    const firstMembers = members.slice(0, SAFARI_LIMITS.INTERESTED_SHOWN);
    const moreMembers = members.length - firstMembers.length;
    const stay = STAY_OPTIONS.find((option) => option.value === safari.stayCategory);
    const theme = THEME_OPTIONS.find((option) => option.value === safari.theme);
    const canJoinShown = !viewer.isHost && !viewer.joined && safari.status === SafariStatus.ACTIVE;

    const facts = [
        { label: 'Trip Duration', value: durationOf(safari, t), Icon: CalendarIcon },
        { label: 'Available Seats', value: `${safari.sharedSeats}/${safari.totalSeats}`, Icon: UsersIcon },
        {
            label: 'Safaris',
            value:
                safari.safariCount === 1
                    ? t('{n} Shared Safari', { n: safari.safariCount })
                    : t('{n} Shared Safaris', { n: safari.safariCount }),
            Icon: CarIcon,
        },
        { label: 'Stay Category', value: stay ? t(stay.label) : '–', Icon: BuildingIcon },
        { label: 'Theme', value: theme ? t(theme.label) : '', Icon: BinocularsStateIcon },
        { label: 'Cost', value: priceRange(safari.pricePerPersonMin, safari.pricePerPersonMax), Icon: RupeeIcon },
    ];

    return (
        <>
            <section className="ss3-top">
                <div className="ss3-head">
                    <div className="ss3-main">
                        <div className="ss3-pic">
                            <img src={coverSource(safari.id, safari.coverVersion)} alt="" />
                        </div>
                        <div className="ss3-info">
                            <div className="ss3-title">
                                <h1>{safari.title}</h1>
                                {safari.status !== SafariStatus.ACTIVE && (
                                    <span className={badgeClassOf(safari.status)}>{t(statusLabel(safari.status))}</span>
                                )}
                            </div>
                            <span className="ss3-dates">{dateRange(safari.startDate, safari.endDate)}</span>
                            <span className="ss3-park">
                                <MapPinIcon />
                                <span>{safari.park.name}</span>
                            </span>
                            <span className="ss3-org">
                                {t('Organized by')} <b>{safari.host.name}</b>
                            </span>
                        </div>
                    </div>
                    <div className="ss3-facts">
                        {facts.map(({ label, value, Icon }) => (
                            <div key={label} className="ss3-fact">
                                <Icon />
                                <div>
                                    <div className="ss3-fl">{t(label)}</div>
                                    <div className="ss3-fv">{value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {safari.isStarted && isOpen && (
                    <div className="banner ss3-bar" role="status">
                        <InfoIcon />
                        <span>{t('This safari has already started.')}</span>
                    </div>
                )}
                <div className="ss3-share">
                    <div className="ss3-sl">
                        <span>{t('Share this safari with your friends:')}</span>
                        <div className="ss3-soc">
                            {SHARE_ICONS.map(({ name, tone, Icon }) => (
                                <span key={name} className={tone} title={t(name)} aria-label={t(name)}>
                                    <Icon />
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="ss3-acts">
                        {canJoinShown && !viewer.signedIn && (
                            <Link className="btn btn-primary" href={SITE_PATHS.signIn}>
                                {t('Join Safari')}
                            </Link>
                        )}
                        {canJoinShown && viewer.signedIn && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => void act(() => joinSafari(safari.id), t("You've joined this safari."))}
                            >
                                {t('Join Safari')}
                            </button>
                        )}
                        {viewer.joined && !viewer.isHost && (
                            <>
                                <span className="banner banner-success">
                                    <CheckCircleIcon />
                                    <span>{t("You've joined this safari.")}</span>
                                </span>
                                <button type="button" className="btn btn-secondary" onClick={() => setDialog('leave')}>
                                    {t('Leave Safari')}
                                </button>
                            </>
                        )}
                        {viewer.isHost && (
                            <>
                                <button type="button" className="btn btn-secondary" onClick={() => setDialog('edit')}>
                                    {t('Update Safari')}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => setDialog('status')}>
                                    {t('Change Status')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>
            <div className="ss3">
                <div className="ss3-col">
                    <div className="ss3-box2">
                        <div className="ss3-bh">{t('Safari Plan')}</div>
                        <div className="ss3-bb">
                            <p className="ss-pre">{safari.safariPlan}</p>
                        </div>
                    </div>
                    <SafariDiscussion
                        safari={safari}
                        meInitial={meName.trim().charAt(0).toUpperCase()}
                        onChanged={load}
                        onMessage={show}
                        onError={showError}
                        onFlag={setFlagId}
                    />
                </div>
                <div className="ss3-col">
                    <div className="ss3-box2">
                        <button
                            type="button"
                            className="ss3-bh ss3-bh-btn"
                            onClick={() => setDialog('who')}
                            aria-haspopup="dialog"
                        >
                            <UsersIcon />
                            <span>{t('Interested - {n}', { n: members.length })}</span>
                        </button>
                        <div className="ss3-bb">
                            {members.length > 0 ? (
                                <div className="ss3-faces">
                                    {firstMembers.map((member) => (
                                        <span key={member.id} className="avatar ss3-face" title={member.name}>
                                            {member.initials}
                                        </span>
                                    ))}
                                    {moreMembers > 0 && <span className="avatar ss3-face ss3-more">+{moreMembers}</span>}
                                </div>
                            ) : (
                                <p className="ss3-empty">{t('No one is interested yet.')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {dialog === 'who' && <InterestedDialog members={members} onClose={() => setDialog(null)} />}
            {dialog === 'status' && viewer.isHost && (
                <StatusDialog
                    current={safari.status}
                    onClose={() => setDialog(null)}
                    onDelete={() => setDialog('delete')}
                    onSave={(status: HostStatus) =>
                        void act(
                            () => setSafariStatus(safari.id, status),
                            t('Status changed to {status}.', { status: t(statusLabel(status)) }),
                        )
                    }
                />
            )}
            {dialog === 'delete' && viewer.isHost && (
                <DeleteSafariDialog onClose={() => setDialog(null)} onConfirm={() => void removeSafari(safari.id)} />
            )}
            {dialog === 'leave' && viewer.joined && (
                <LeaveSafariDialog
                    onClose={() => setDialog(null)}
                    onConfirm={() => void act(() => leaveSafari(safari.id), t("You've left this safari."))}
                />
            )}
            {dialog === 'edit' && viewer.isHost && (
                <OrganiseDialog
                    safariId={safari.id}
                    onClose={() => setDialog(null)}
                    onError={showError}
                    onSaved={() => {
                        setDialog(null);
                        show(t('Safari updated.'));
                        void load();
                    }}
                />
            )}
            {flagId !== null && viewer.signedIn && (
                <FlagDialog
                    commentId={flagId}
                    onClose={() => setFlagId(null)}
                    onError={(message) => {
                        setFlagId(null);
                        showError(message);
                    }}
                    onFlagged={() => {
                        setFlagId(null);
                        show(t("Thanks, we'll review this comment."));
                    }}
                />
            )}
            <SiteToast toast={toast} onClose={hide} />
        </>
    );
}
