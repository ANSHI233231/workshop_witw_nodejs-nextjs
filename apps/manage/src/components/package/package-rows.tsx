'use client';

import Link from 'next/link';
import { useState } from 'react';

import { EmptyListIcon } from '@/components/partners/partner-icons';
import { FallbackImage } from '@/components/package/fallback-image';
import { PackageDeleteDialog } from '@/components/package/package-delete-dialog';
import { packageViewUrl } from '@/components/package/package-url';
import { WEBSITE_STATUS_BADGE } from '@/components/package-editor/package-labels';
import { DeleteIcon, EditIcon, ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { usePackageConsoleActions } from '@/hooks/package/use-package-console-actions';
import { formatCount } from '@/lib/format';
import { packagePictureSources } from '@/services/package.service';
import { type PackageListItem, PackageWebsiteStatus } from '@/types/package.types';

type Actions = ReturnType<typeof usePackageConsoleActions>;

function Switch({
    on,
    label,
    disabled,
    onToggle,
}: {
    readonly on: boolean;
    readonly label: string;
    readonly disabled: boolean;
    readonly onToggle: () => void;
}) {
    return (
        <div className="ssc-sw">
            <button
                type="button"
                className={on ? 'mt-switch is-on' : 'mt-switch'}
                role="switch"
                aria-checked={on}
                aria-label={label}
                disabled={disabled}
                onClick={onToggle}
            >
                <span className="mt-knob"></span>
            </button>
        </div>
    );
}

function RowActions({
    item,
    onDelete,
}: {
    readonly item: PackageListItem;
    readonly onDelete: (item: PackageListItem) => void;
}) {
    const t = useT();
    const deleted = item.websiteStatus === PackageWebsiteStatus.DELETED_BY_ADMIN;
    return (
        <div className="us-acts">
            <Link
                className="btn-icon"
                href={packageViewUrl(item.id, 'live', 'preview')}
                aria-label={t('View')}
                data-tooltip={t('View')}
            >
                <ViewIcon />
            </Link>
            {!deleted && (
                <>
                    <Link
                        className="btn-icon"
                        href={packageViewUrl(item.id, 'live', 'edit')}
                        aria-label={t('Edit')}
                        data-tooltip={t('Edit')}
                    >
                        <EditIcon />
                    </Link>
                    <button
                        type="button"
                        className="btn-icon is-danger"
                        aria-label={t('Delete')}
                        data-tooltip={t('Delete')}
                        onClick={() => onDelete(item)}
                    >
                        <DeleteIcon />
                    </button>
                </>
            )}
        </div>
    );
}

function Title({ item }: { readonly item: PackageListItem }) {
    return (
        <div className="ss-row" style={{ flexWrap: 'nowrap' }}>
            <FallbackImage className="pq-thumb" sources={packagePictureSources(item.id, item.shownVersionId, item.packageImage, item.mainPark)} />
            <div className="pq-cell">
                <b>{item.name}</b>
                <span className="ss-cap">{item.parkNames}</span>
            </div>
        </div>
    );
}

function StatusCell({ item }: { readonly item: PackageListItem }) {
    const t = useT();
    const badge = WEBSITE_STATUS_BADGE[item.websiteStatus];
    return (
        <>
            <span className={badge.css}>{t(badge.label)}</span>
            {!item.partner.isActive && <span className="ssc-sub">{t('Hidden: partner inactive')}</span>}
        </>
    );
}

export function PackageRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly PackageListItem[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const actions: Actions = usePackageConsoleActions();
    const [deleting, setDeleting] = useState<PackageListItem | null>(null);
    const locked = (item: PackageListItem) =>
        item.websiteStatus === PackageWebsiteStatus.DELETED_BY_ADMIN || actions.busy === item.id || actions.refreshing;
    const switches = (item: PackageListItem) => (
        <Switch
            on={item.isPopular}
            label={t('Popular: {name}', { name: item.name })}
            disabled={locked(item)}
            onToggle={() => void actions.setPopular(item, !item.isPopular)}
        />
    );
    const bestSwitch = (item: PackageListItem) => (
        <Switch
            on={item.isBestDeal}
            label={t('Best deal: {name}', { name: item.name })}
            disabled={locked(item)}
            onToggle={() => void actions.setBestDeal(item, !item.isBestDeal)}
        />
    );
    const liveText = (item: PackageListItem) => (item.live ? `v${item.live.versionNumber}` : '–');
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('No packages match.')}</p>
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
                            <th scope="col">{t('Live')}</th>
                            <th scope="col">{t('Popular')}</th>
                            <th scope="col">{t('Best deal')}</th>
                            <th scope="col" className="col-status">
                                {t('Website status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={item.id}>
                                <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                <td>
                                    <Title item={item} />
                                </td>
                                <td>{item.partner.businessName}</td>
                                <td>{liveText(item)}</td>
                                <td>{switches(item)}</td>
                                <td>{bestSwitch(item)}</td>
                                <td className="col-status">
                                    <StatusCell item={item} />
                                </td>
                                <td className="col-actions">
                                    <RowActions item={item} onDelete={setDeleting} />
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={8}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((item, index) => (
                    <div key={item.id} className="ssc-card">
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
                            <span>{t('Live')}</span>
                            <span>{liveText(item)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Popular')}</span>
                            <span>{switches(item)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Best deal')}</span>
                            <span>{bestSwitch(item)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Website status')}</span>
                            <span>
                                <StatusCell item={item} />
                            </span>
                        </div>
                        <RowActions item={item} onDelete={setDeleting} />
                    </div>
                ))}
                {rows.length === 0 && empty}
            </div>
            {deleting && (
                <PackageDeleteDialog
                    item={deleting}
                    onClose={() => setDeleting(null)}
                    onDone={(message) => {
                        setDeleting(null);
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
