'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSafariActions } from '@/hooks/shared-safari/use-safari-actions';
import { formatCount } from '@/lib/format';
import type { ConsoleSafari } from '@/types/shared-safari.types';

import { type MemberListKind, MembersDialog } from './members-dialog';
import { consoleDates, seatsShort, statusBadge } from './shared-safari-format';
import { PinToggleIcon, SearchStateIcon } from './shared-safari-icons';
import { sharedSafariPath } from './shared-safari-url';

type Opened = { readonly safari: ConsoleSafari; readonly kind: MemberListKind };

function RowActions({
    safari,
    busy,
    onView,
    onPin,
}: {
    readonly safari: ConsoleSafari;
    readonly busy: boolean;
    readonly onView: () => void;
    readonly onPin: () => void;
}) {
    const t = useT();
    const pinLabel = safari.isPinned ? t('Unpin') : t('Pin to top');
    return (
        <div className="us-acts">
            <div className="us-acts">
                <button type="button" className="btn-icon " aria-label={t('View')} data-tooltip={t('View')} onClick={onView}>
                    <ViewIcon />
                </button>
            </div>
            <button
                type="button"
                className={safari.isPinned ? 'btn-icon ssc-pinbtn is-on' : 'btn-icon ssc-pinbtn '}
                aria-pressed={safari.isPinned}
                aria-label={pinLabel}
                data-tooltip={pinLabel}
                disabled={busy}
                onClick={onPin}
            >
                <PinToggleIcon />
            </button>
        </div>
    );
}

function Counts({
    safari,
    mobile,
    onOpen,
}: {
    readonly safari: ConsoleSafari;
    readonly mobile: boolean;
    readonly onOpen: (kind: MemberListKind) => void;
}) {
    const t = useT();
    return (
        <span className="ssc-jl">
            {mobile && <span className="ss-cap">{t('Joined / left')}</span>}
            <button
                type="button"
                className="btn btn-text"
                aria-label={mobile ? t('Joined list') : t('Joined: {count}', { count: safari.joinedCount })}
                onClick={() => onOpen('joined')}
            >
                {formatCount(safari.joinedCount)}
            </button>
            {mobile ? <span>/</span> : '/'}
            <button
                type="button"
                className="btn btn-text"
                aria-label={mobile ? t('Left list') : t('Left: {count}', { count: safari.leftCount })}
                onClick={() => onOpen('left')}
            >
                {formatCount(safari.leftCount)}
            </button>
        </span>
    );
}

export function SafariRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly ConsoleSafari[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const router = useRouter();
    const actions = useSafariActions();
    const [opened, setOpened] = useState<Opened | null>(null);
    const view = (safari: ConsoleSafari) => router.push(sharedSafariPath(safari.id));

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Title')}</th>
                            <th scope="col">{t('Park')}</th>
                            <th scope="col">{t('Host')}</th>
                            <th scope="col">{t('Dates')}</th>
                            <th scope="col" className="col-center">
                                {t('Seats')}
                            </th>
                            <th scope="col" className="col-center">
                                {t('Joined / left')}
                            </th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((safari, index) => {
                            const badge = statusBadge(safari.status);
                            return (
                                <tr key={safari.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td>
                                        <Link href={sharedSafariPath(safari.id)}>{safari.title}</Link>
                                    </td>
                                    <td>{safari.park.name}</td>
                                    <td>{safari.host.name}</td>
                                    <td>{consoleDates(safari.startDate, safari.endDate)}</td>
                                    <td className="col-center">{seatsShort(safari)}</td>
                                    <td className="col-center">
                                        <Counts
                                            safari={safari}
                                            mobile={false}
                                            onOpen={(kind) => setOpened({ safari, kind })}
                                        />
                                    </td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-actions">
                                        <RowActions
                                            safari={safari}
                                            busy={actions.busy === safari.id}
                                            onView={() => view(safari)}
                                            onPin={() => void actions.togglePin(safari)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={9}>
                                    <div className="state">
                                        <SearchStateIcon />
                                        <p className="state-title">{t('No shared safaris match these filters.')}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((safari) => {
                    const badge = statusBadge(safari.status);
                    return (
                        <div key={safari.id} className="ssc-card">
                            <div className="ss-between">
                                <span className="ssc-title">{safari.title}</span>
                                <RowActions
                                    safari={safari}
                                    busy={actions.busy === safari.id}
                                    onView={() => view(safari)}
                                    onPin={() => void actions.togglePin(safari)}
                                />
                            </div>
                            <span className="ss-cap">
                                {safari.park.name} · {safari.host.name}
                            </span>
                            <span className="ss-cap">
                                {consoleDates(safari.startDate, safari.endDate)} · {t('Seats')} {seatsShort(safari)}
                            </span>
                            <div className="ss-between">
                                <Counts safari={safari} mobile onOpen={(kind) => setOpened({ safari, kind })} />
                                <span className={badge.className}>{t(badge.label)}</span>
                            </div>
                        </div>
                    );
                })}
                {rows.length === 0 && (
                    <div className="state">
                        <SearchStateIcon />
                        <p className="state-title">{t('No shared safaris match these filters.')}</p>
                    </div>
                )}
            </div>
            {opened && <MembersDialog safari={opened.safari} kind={opened.kind} onClose={() => setOpened(null)} />}
            {actions.notice && (
                <Toast
                    message={actions.notice.message}
                    isError={actions.notice.isError}
                    onClose={actions.clearNotice}
                />
            )}
        </>
    );
}
