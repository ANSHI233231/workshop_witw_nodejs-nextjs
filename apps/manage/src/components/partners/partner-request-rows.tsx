'use client';

import { ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useRequestActions } from '@/hooks/partners/use-request-actions';
import { formatCount, formatDateTime } from '@/lib/format';
import { type Partner, PartnerStatus } from '@/types/partner.types';

import { PARTNER_STATUS_BADGE, parkNamesOf } from './partner-format';
import { ApproveIcon, EmptyListIcon, RejectIcon } from './partner-icons';
import { PartnerRejectDialog } from './partner-reject-dialog';
import { PartnerRequestViewDialog } from './partner-request-view-dialog';

type Actions = ReturnType<typeof useRequestActions>;

function RowActions({ partner, actions }: { readonly partner: Partner; readonly actions: Actions }) {
    const t = useT();
    const pending = partner.status === PartnerStatus.PENDING;
    const busy = actions.busy === partner.id || actions.refreshing;
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('View')}
                data-tooltip={t('View')}
                onClick={() => actions.view(partner)}
            >
                <ViewIcon />
            </button>
            {pending && (
                <>
                    <button
                        type="button"
                        className="btn-icon "
                        aria-label={t('Approve')}
                        data-tooltip={t('Approve')}
                        disabled={busy}
                        onClick={() => void actions.approve(partner)}
                    >
                        <ApproveIcon />
                    </button>
                    <button
                        type="button"
                        className="btn-icon "
                        aria-label={t('Reject')}
                        data-tooltip={t('Reject')}
                        onClick={() => actions.startReject(partner)}
                    >
                        <RejectIcon />
                    </button>
                </>
            )}
        </div>
    );
}

function Account({ partner }: { readonly partner: Partner }) {
    return (
        <div className="pq-cell">
            <span>{partner.account.name}</span>
            <span className="ss-cap">{partner.account.email}</span>
        </div>
    );
}

function Business({ partner }: { readonly partner: Partner }) {
    return (
        <div className="pq-cell">
            <b>{partner.businessName}</b>
            <span className="ss-cap">{partner.ownerName}</span>
        </div>
    );
}

export function PartnerRequestRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly Partner[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const actions = useRequestActions();
    const viewing = actions.viewing;
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('No partner requests.')}</p>
        </div>
    );

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Business')}</th>
                            <th scope="col">{t('Account')}</th>
                            <th scope="col">{t('Parks')}</th>
                            <th scope="col">{t('Sent on')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((partner, index) => {
                            const badge = PARTNER_STATUS_BADGE[partner.status];
                            return (
                                <tr key={partner.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td>
                                        <Business partner={partner} />
                                    </td>
                                    <td>
                                        <Account partner={partner} />
                                    </td>
                                    <td>{parkNamesOf(partner.parks)}</td>
                                    <td>{formatDateTime(partner.requestedAt)}</td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-actions">
                                        <RowActions partner={partner} actions={actions} />
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={7}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((partner, index) => {
                    const badge = PARTNER_STATUS_BADGE[partner.status];
                    return (
                        <div key={partner.id} className="ssc-card">
                            <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                            <div className="pq-kv">
                                <span>{t('Business')}</span>
                                <span>
                                    <Business partner={partner} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Account')}</span>
                                <span>
                                    <Account partner={partner} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Parks')}</span>
                                <span>{parkNamesOf(partner.parks)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Sent on')}</span>
                                <span>{formatDateTime(partner.requestedAt)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Status')}</span>
                                <span>
                                    <span className={badge.className}>{t(badge.label)}</span>
                                </span>
                            </div>
                            <RowActions partner={partner} actions={actions} />
                        </div>
                    );
                })}
                {rows.length === 0 && empty}
            </div>
            {viewing && (
                <PartnerRequestViewDialog
                    partner={viewing}
                    busy={actions.busy === viewing.id || actions.refreshing}
                    onApprove={() => void actions.approve(viewing)}
                    onReject={() => actions.startReject(viewing)}
                    onClose={actions.closeView}
                />
            )}
            {actions.rejecting && (
                <PartnerRejectDialog
                    partner={actions.rejecting}
                    onRejected={actions.rejected}
                    onClose={actions.closeReject}
                />
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
