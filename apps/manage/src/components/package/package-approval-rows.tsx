'use client';

import Link from 'next/link';
import { useState } from 'react';

import { EmptyListIcon, ApproveIcon, RejectIcon } from '@/components/partners/partner-icons';
import { FallbackImage } from '@/components/package/fallback-image';
import { PackageRejectDialog } from '@/components/package/package-reject-dialog';
import { packageViewUrl } from '@/components/package/package-url';
import { EditIcon, ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { usePackageConsoleActions } from '@/hooks/package/use-package-console-actions';
import { formatCount, formatDateTime } from '@/lib/format';
import { packagePictureSources } from '@/services/package.service';
import type { ApprovalItem } from '@/types/package.types';

type Actions = ReturnType<typeof usePackageConsoleActions>;

function RowActions({
    item,
    actions,
    onReject,
}: {
    readonly item: ApprovalItem;
    readonly actions: Actions;
    readonly onReject: (item: ApprovalItem) => void;
}) {
    const t = useT();
    const busy = actions.busy === item.packageId || actions.refreshing;
    return (
        <div className="us-acts">
            <Link
                className="btn-icon"
                href={packageViewUrl(item.packageId, 'waiting', 'preview')}
                aria-label={t('Preview')}
                data-tooltip={t('Preview')}
            >
                <ViewIcon />
            </Link>
            <Link
                className="btn-icon"
                href={packageViewUrl(item.packageId, 'waiting', 'edit')}
                aria-label={t('Edit')}
                data-tooltip={t('Edit')}
            >
                <EditIcon />
            </Link>
            <button
                type="button"
                className="btn-icon"
                aria-label={t('Approve')}
                data-tooltip={t('Approve')}
                disabled={busy}
                onClick={() => void actions.approve(item)}
            >
                <ApproveIcon />
            </button>
            <button
                type="button"
                className="btn-icon"
                aria-label={t('Reject')}
                data-tooltip={t('Reject')}
                onClick={() => onReject(item)}
            >
                <RejectIcon />
            </button>
        </div>
    );
}

function Title({ item }: { readonly item: ApprovalItem }) {
    return (
        <div className="ss-row" style={{ flexWrap: 'nowrap' }}>
            <FallbackImage className="pq-thumb" sources={packagePictureSources(item.packageId, item.versionId, item.packageImage, item.mainPark)} />
            <div className="pq-cell">
                <b>{item.name}</b>
                <span className="ss-cap">{item.parkNames}</span>
            </div>
        </div>
    );
}

export function PackageApprovalRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly ApprovalItem[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const actions = usePackageConsoleActions();
    const [rejecting, setRejecting] = useState<ApprovalItem | null>(null);
    const liveText = (item: ApprovalItem) =>
        item.liveVersionNumber === null
            ? t('First version')
            : t('Live now: v{n}', { n: item.liveVersionNumber });
    const sentText = (item: ApprovalItem) => (item.sentAt ? formatDateTime(item.sentAt) : '–');
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('Nothing is waiting for approval.')}</p>
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
                            <th scope="col">{t('Package')}</th>
                            <th scope="col">{t('Partner')}</th>
                            <th scope="col">{t('Version')}</th>
                            <th scope="col">{t('Sent on')}</th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={item.versionId}>
                                <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                <td>
                                    <Title item={item} />
                                </td>
                                <td>{item.partner.businessName}</td>
                                <td>
                                    <div className="pq-ver">
                                        <span>v{item.versionNumber}</span>
                                        <span className="ss-cap">{liveText(item)}</span>
                                    </div>
                                </td>
                                <td>{sentText(item)}</td>
                                <td className="col-actions">
                                    <RowActions item={item} actions={actions} onReject={setRejecting} />
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((item, index) => (
                    <div key={item.versionId} className="ssc-card">
                        <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                        <div className="pq-kv">
                            <span>{t('Package')}</span>
                            <span>
                                <Title item={item} />
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Partner')}</span>
                            <span>{item.partner.businessName}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Version')}</span>
                            <span>
                                <div className="pq-ver">
                                    <span>v{item.versionNumber}</span>
                                    <span className="ss-cap">{liveText(item)}</span>
                                </div>
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Sent on')}</span>
                            <span>{sentText(item)}</span>
                        </div>
                        <RowActions item={item} actions={actions} onReject={setRejecting} />
                    </div>
                ))}
                {rows.length === 0 && empty}
            </div>
            {rejecting && (
                <PackageRejectDialog
                    packageId={rejecting.packageId}
                    versionId={rejecting.versionId}
                    versionNumber={rejecting.versionNumber}
                    onClose={() => setRejecting(null)}
                    onDone={(message) => {
                        setRejecting(null);
                        actions.say(message);
                    }}
                />
            )}
            {actions.notice && (
                <Toast message={actions.notice.message} isError={actions.notice.isError} onClose={actions.clearNotice} />
            )}
        </>
    );
}
