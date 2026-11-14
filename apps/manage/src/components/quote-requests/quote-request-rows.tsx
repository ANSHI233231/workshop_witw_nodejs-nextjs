'use client';

import { EmptyListIcon, ToggleStatusIcon } from '@/components/partners/partner-icons';
import { BellIcon, ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useQuoteRequestActions } from '@/hooks/quote-requests/use-quote-request-actions';
import { formatCount } from '@/lib/format';
import { type QuoteRequest, QuoteRequestStatus } from '@/types/quote-request.types';

import {
    contactOf,
    markLabelOf,
    packageTextOf,
    QUOTE_STATUS_BADGE,
    receivedTextOf,
    startTextOf,
} from './quote-request-format';
import { QuoteRequestNotifyDialog } from './quote-request-notify-dialog';
import { QuoteRequestViewDialog } from './quote-request-view-dialog';

type Actions = ReturnType<typeof useQuoteRequestActions>;

function RowActions({ request, actions }: { readonly request: QuoteRequest; readonly actions: Actions }) {
    const t = useT();
    const toggleLabel =
        request.status === QuoteRequestStatus.ACTIVE ? t('Make inactive') : t('Make active');
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('View')}
                data-tooltip={t('View')}
                onClick={() => actions.view(request)}
            >
                <ViewIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={toggleLabel}
                data-tooltip={toggleLabel}
                disabled={actions.busy === request.id || actions.refreshing}
                onClick={() => void actions.changeStatus(request)}
            >
                <ToggleStatusIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={t('Send a notification')}
                data-tooltip={t('Send a notification')}
                onClick={() => actions.notify(request)}
            >
                <BellIcon />
            </button>
        </div>
    );
}

function UserCell({ request }: { readonly request: QuoteRequest }) {
    return (
        <div className="pq-cell">
            <b>{request.user.name}</b>
            <span className="ss-cap">{contactOf(request)}</span>
        </div>
    );
}

function PackageCell({ request }: { readonly request: QuoteRequest }) {
    return (
        <div className="pq-cell">
            <span>{packageTextOf(request)}</span>
            <span className="ss-cap">{request.partner.businessName}</span>
        </div>
    );
}

export function QuoteRequestRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly QuoteRequest[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const actions = useQuoteRequestActions();
    const { viewing, notifying } = actions;
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('No quote requests match.')}</p>
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
                            <th scope="col">{t('User')}</th>
                            <th scope="col">{t('Package')}</th>
                            <th scope="col" className="col-center">
                                {t('Travellers')}
                            </th>
                            <th scope="col">{t('Start date')}</th>
                            <th scope="col">{t('Received')}</th>
                            <th scope="col">{t('Mark')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((request, index) => {
                            const badge = QUOTE_STATUS_BADGE[request.status];
                            return (
                                <tr key={request.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td>
                                        <UserCell request={request} />
                                    </td>
                                    <td>
                                        <PackageCell request={request} />
                                    </td>
                                    <td className="col-center">{formatCount(request.travellerCount)}</td>
                                    <td>{startTextOf(request)}</td>
                                    <td>{receivedTextOf(request)}</td>
                                    <td>{t(markLabelOf(request.mark))}</td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-actions">
                                        <RowActions request={request} actions={actions} />
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={9}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((request, index) => {
                    const badge = QUOTE_STATUS_BADGE[request.status];
                    return (
                        <div key={request.id} className="ssc-card">
                            <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                            <div className="pq-kv">
                                <span>{t('User')}</span>
                                <span>
                                    <UserCell request={request} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Package')}</span>
                                <span>
                                    <PackageCell request={request} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Travellers')}</span>
                                <span>{formatCount(request.travellerCount)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Start date')}</span>
                                <span>{startTextOf(request)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Received')}</span>
                                <span>{receivedTextOf(request)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Mark')}</span>
                                <span>{t(markLabelOf(request.mark))}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Status')}</span>
                                <span>
                                    <span className={badge.className}>{t(badge.label)}</span>
                                </span>
                            </div>
                            <RowActions request={request} actions={actions} />
                        </div>
                    );
                })}
                {rows.length === 0 && empty}
            </div>
            {viewing && <QuoteRequestViewDialog request={viewing} onClose={actions.closeView} />}
            {notifying && (
                <QuoteRequestNotifyDialog
                    key={notifying.id}
                    request={notifying}
                    onSent={actions.notified}
                    onClose={actions.closeNotify}
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
