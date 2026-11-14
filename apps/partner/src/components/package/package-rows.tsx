'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FallbackImage } from '@/components/package/fallback-image';
import { EmptyPackagesIcon } from '@/components/package/package-icons';
import { PackageDeleteDialog, PackageSendDialog } from '@/components/package/package-dialogs';
import { PACKAGES_PATH, usePackageActions } from '@/hooks/package/use-package-actions';
import { ToggleStatusIcon, SendIcon } from '@/components/portal/portal-icons';
import { DeleteIcon, EditIcon, ViewIcon } from '@/components/ui/icons';
import {
    VERSION_STATUS_BADGE,
    WEBSITE_STATUS_BADGE,
} from '@/components/package-editor/package-labels';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import { packagePictureSources } from '@/services/package.service';
import {
    PackageWebsiteStatus,
    PortalAction,
    type PackageListItem,
    type PortalActionKey,
} from '@/types/package.types';

type Actions = ReturnType<typeof usePackageActions>;

type Pending = { readonly item: PackageListItem; readonly kind: 'send' | 'delete' };

const LABELS: Readonly<Record<PortalActionKey, string>> = {
    view: 'View',
    edit: 'Edit',
    send: 'Send',
    delete: 'Delete',
    deleteDraft: 'Delete draft',
    makeInactive: 'Make inactive',
    makeActive: 'Make active',
};

function ActionIcon({ action }: { readonly action: PortalActionKey }) {
    if (action === PortalAction.VIEW) return <ViewIcon />;
    if (action === PortalAction.EDIT) return <EditIcon />;
    if (action === PortalAction.SEND) return <SendIcon />;
    if (action === PortalAction.DELETE || action === PortalAction.DELETE_DRAFT) return <DeleteIcon />;
    return <ToggleStatusIcon />;
}

function RowActions({
    item,
    actions,
    ask,
}: {
    readonly item: PackageListItem;
    readonly actions: Actions;
    readonly ask: (pending: Pending) => void;
}) {
    const t = useT();
    const locked = actions.busy !== null;
    return (
        <div className="us-acts">
            {item.actions.map((action) => {
                const label = t(LABELS[action]);
                const danger = action === PortalAction.DELETE || action === PortalAction.DELETE_DRAFT;
                const css = danger ? 'btn-icon is-danger' : 'btn-icon';
                if (action === PortalAction.VIEW || (action === PortalAction.EDIT && item.working)) {
                    return (
                        <Link
                            key={action}
                            className={css}
                            href={`${PACKAGES_PATH}/${item.id}`}
                            aria-label={label}
                            data-tooltip={label}
                        >
                            <ActionIcon action={action} />
                        </Link>
                    );
                }
                const onClick = () => {
                    if (action === PortalAction.EDIT) void actions.startEdit(item.id, true);
                    else if (action === PortalAction.SEND) ask({ item, kind: 'send' });
                    else if (danger) ask({ item, kind: 'delete' });
                    else void actions.setActive(item.id, item.name, action === PortalAction.MAKE_ACTIVE);
                };
                return (
                    <button
                        key={action}
                        type="button"
                        className={css}
                        aria-label={label}
                        data-tooltip={label}
                        disabled={locked}
                        onClick={onClick}
                    >
                        <ActionIcon action={action} />
                    </button>
                );
            })}
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

function VersionCell({ item }: { readonly item: PackageListItem }) {
    const t = useT();
    const badge = item.working ? VERSION_STATUS_BADGE[item.working.status] : null;
    return (
        <div className="pq-ver">
            <span className="ss-cap">
                {item.live ? t('Live: v{n}', { n: item.live.versionNumber }) : t('Not live yet')}
            </span>
            {item.working && badge && (
                <span className={badge.css}>
                    v{item.working.versionNumber} · {t(badge.label)}
                </span>
            )}
        </div>
    );
}

function WebsiteCell({ item }: { readonly item: PackageListItem }) {
    const t = useT();
    const badge = WEBSITE_STATUS_BADGE[item.websiteStatus];
    return (
        <>
            <span className={badge.css}>{t(badge.label)}</span>
            {!item.partner.isActive && <span className="ssc-sub">{t('Hidden: partner inactive')}</span>}
        </>
    );
}

export function PackageRows({ rows }: { readonly rows: readonly PackageListItem[] }) {
    const t = useT();
    const actions = usePackageActions();
    const [pending, setPending] = useState<Pending | null>(null);

    const confirm = () => {
        if (!pending) return;
        const { item, kind } = pending;
        setPending(null);
        if (kind === 'send' && item.working) void actions.send(item.id, item.working.id, item.working.versionNumber);
        else if (item.working) void actions.discard(item.id, item.working.id);
    };

    const empty = (
        <div className="state">
            <EmptyPackagesIcon />
            <p className="state-title">{t('No packages match.')}</p>
        </div>
    );

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">{t('Package')}</th>
                            <th scope="col">{t('Version')}</th>
                            <th scope="col" className="col-status">
                                {t('Website status')}
                            </th>
                            <th scope="col">{t('Updated')}</th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <Title item={item} />
                                </td>
                                <td>
                                    <VersionCell item={item} />
                                </td>
                                <td className="col-status">
                                    <WebsiteCell item={item} />
                                </td>
                                <td>{formatDateTime(item.updatedAt)}</td>
                                <td className="col-actions">
                                    <RowActions item={item} actions={actions} ask={setPending} />
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={5}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((item) => (
                    <div key={item.id} className="ssc-card">
                        <div className="pq-mrow">
                            <Title item={item} />
                        </div>
                        <div className="pq-kv">
                            <span>{t('Version')}</span>
                            <span>
                                <VersionCell item={item} />
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Website status')}</span>
                            <span>
                                <WebsiteCell item={item} />
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Updated')}</span>
                            <span>{formatDateTime(item.updatedAt)}</span>
                        </div>
                        <RowActions item={item} actions={actions} ask={setPending} />
                    </div>
                ))}
                {rows.length === 0 && empty}
            </div>
            {pending?.kind === 'send' && (
                <PackageSendDialog busy={actions.busy !== null} onConfirm={confirm} onClose={() => setPending(null)} />
            )}
            {pending?.kind === 'delete' && (
                <PackageDeleteDialog
                    neverLive={pending.item.websiteStatus === PackageWebsiteStatus.NOT_LIVE}
                    busy={actions.busy !== null}
                    onConfirm={confirm}
                    onClose={() => setPending(null)}
                />
            )}
        </>
    );
}
