'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

import { EditIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useParkActions } from '@/hooks/parks/use-park-actions';
import { formatCount } from '@/lib/format';
import { PARK_REGION_LABEL, type Park } from '@/types/park.types';

import { ParkDialog } from './park-dialog';
import { PARK_STATUS_BADGE, parkPriceShort, statusToggleLabel } from './park-format';
import { StatusToggleIcon } from './park-icons';
import { parkPath } from './park-url';

const stopping =
    (action: () => void) =>
    (event: MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        action();
    };

function ParkActions({
    park,
    busy,
    onEdit,
    onToggle,
}: {
    readonly park: Park;
    readonly busy: boolean;
    readonly onEdit: () => void;
    readonly onToggle: () => void;
}) {
    const t = useT();
    const toggleLabel = t(statusToggleLabel(park.status));
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('Edit')}
                data-tooltip={t('Edit')}
                onClick={stopping(onEdit)}
            >
                <EditIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={toggleLabel}
                data-tooltip={toggleLabel}
                disabled={busy}
                onClick={stopping(onToggle)}
            >
                <StatusToggleIcon />
            </button>
        </div>
    );
}

export function ParkRows({ rows, firstSerial }: { readonly rows: readonly Park[]; readonly firstSerial: number }) {
    const t = useT();
    const router = useRouter();
    const actions = useParkActions();

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Park')}</th>
                            <th scope="col">{t('Region')}</th>
                            <th scope="col">{t('Avg. safari price')}</th>
                            <th scope="col" className="col-center">
                                {t('Upcoming safaris')}
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
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="mt-empty">
                                    {t('No parks match these filters.')}
                                </td>
                            </tr>
                        ) : (
                            rows.map((park, index) => {
                                const badge = PARK_STATUS_BADGE[park.status];
                                return (
                                    <tr
                                        key={park.id}
                                        className="ssc-row-link"
                                        onClick={(event) => {
                                            if ((event.target as HTMLElement).closest('a, button')) return;
                                            router.push(parkPath(park.id));
                                        }}
                                    >
                                        <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                        <td>
                                            <Link href={parkPath(park.id)}>{park.name}</Link>
                                        </td>
                                        <td>{t(PARK_REGION_LABEL[park.region])}</td>
                                        <td>{parkPriceShort(park)}</td>
                                        <td className="col-center">{formatCount(park.upcomingSafariCount)}</td>
                                        <td className="col-status">
                                            <span className={badge.className}>{t(badge.label)}</span>
                                        </td>
                                        <td className="col-actions">
                                            <ParkActions
                                                park={park}
                                                busy={actions.switching === park.id}
                                                onEdit={() => actions.startEdit(park)}
                                                onToggle={() => void actions.toggleStatus(park)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.length === 0 ? (
                    <div className="ssc-card mt-empty">{t('No parks match these filters.')}</div>
                ) : (
                    rows.map((park) => {
                        const badge = PARK_STATUS_BADGE[park.status];
                        return (
                            <Link
                                key={park.id}
                                className="ssc-card"
                                href={parkPath(park.id)}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="ss-between">
                                    <b>{park.name}</b>
                                    <span className={badge.className}>{t(badge.label)}</span>
                                </div>
                                <span className="ss-cap">
                                    {t(PARK_REGION_LABEL[park.region])} · {t('Avg. safari price')}{' '}
                                    {parkPriceShort(park)}
                                </span>
                                <div className="ss-between">
                                    <span className="ss-cap">
                                        {t('Upcoming safaris')} {formatCount(park.upcomingSafariCount)}
                                    </span>
                                    <ParkActions
                                        park={park}
                                        busy={actions.switching === park.id}
                                        onEdit={() => actions.startEdit(park)}
                                        onToggle={() => void actions.toggleStatus(park)}
                                    />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
            {actions.editing && (
                <ParkDialog editing={actions.editing} onSaved={actions.saved} onClose={actions.stopEdit} />
            )}
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
