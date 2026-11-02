'use client';

import { useState } from 'react';

import { ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount, formatDateTime } from '@/lib/format';
import { getAuditLog } from '@/services/audit.service';
import type { AuditLogDetail, AuditLogListItem } from '@/types/audit.types';

import { actorOf, entityOf } from './audit-actor';
import { appLabelOf, labelOf, OUTCOME_BADGES, titleOf } from './audit-labels';
import { AuditLogDialog } from './audit-log-dialog';

type Notice = { readonly message: string; readonly isError: boolean };

const COLUMNS = 9;

export function AuditLogTable({
    events,
    firstSerial,
}: {
    readonly events: readonly AuditLogListItem[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const [viewing, setViewing] = useState<AuditLogDetail | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const open = async (event: AuditLogListItem) => {
        try {
            setViewing(await getAuditLog(event.id));
        } catch {
            setNotice({ message: t('This event could not be opened. Please try again.'), isError: true });
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Date & Time')}</th>
                            <th scope="col">{t('Actor')}</th>
                            <th scope="col">{t('Action')}</th>
                            <th scope="col">{t('Entity')}</th>
                            <th scope="col">{t('App')}</th>
                            <th scope="col">{t('IP Address')}</th>
                            <th scope="col" className="col-status">
                                {t('Outcome')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS} className="al-empty">
                                    {t('No events match this filter.')}
                                </td>
                            </tr>
                        ) : (
                            events.map((event, index) => {
                                const badge = OUTCOME_BADGES[event.outcome];
                                const actor = actorOf(event, t);
                                return (
                                    <tr key={event.id}>
                                        <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                        <td className="al-nw">{formatDateTime(event.createdAt)}</td>
                                        <td>
                                            <div className="al-two">
                                                <b>{actor.name}</b>
                                                {actor.detail && <small>{actor.detail}</small>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="al-two">
                                                <span>{labelOf(event.actionName)}</span>
                                                <small>{titleOf(event.moduleName)}</small>
                                            </div>
                                        </td>
                                        <td>{entityOf(event) ?? <span className="empty-value">–</span>}</td>
                                        <td className="al-nw">{t(appLabelOf(event.clientAppName))}</td>
                                        <td className="al-nw al-mono">{event.ipAddress ?? '–'}</td>
                                        <td className="col-status">
                                            {badge ? <span className={badge.className}>{t(badge.label)}</span> : '–'}
                                        </td>
                                        <td className="col-actions">
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                aria-label={t('View event {id}', { id: event.id })}
                                                data-tooltip={t('View')}
                                                onClick={() => void open(event)}
                                            >
                                                <ViewIcon />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {viewing && <AuditLogDialog event={viewing} onClose={() => setViewing(null)} />}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
