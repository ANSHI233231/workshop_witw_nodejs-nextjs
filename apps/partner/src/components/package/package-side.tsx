'use client';

import Link from 'next/link';
import { useState } from 'react';

import { announcePackageNotice } from '@/components/package-editor/package-notice';
import { PackageDeleteDialog, PackageSendDialog } from '@/components/package/package-dialogs';
import type { EditorSideContext } from '@/components/package-editor/package-editor';
import {
    VERSION_STATUS_BADGE,
    WEBSITE_STATUS_BADGE,
} from '@/components/package-editor/package-labels';
import { useT } from '@/hooks/i18n/use-t';
import { PACKAGES_PATH, usePackageActions } from '@/hooks/package/use-package-actions';
import { formatDateTime } from '@/lib/format';
import {
    PackageVersionStatus,
    PackageWebsiteStatus,
    PortalAction,
    type PackageSummary,
    type VersionSummary,
} from '@/types/package.types';

const versionDates = (t: ReturnType<typeof useT>, version: VersionSummary): string => {
    const parts = [t('Made {date}', { date: formatDateTime(version.createdAt) })];
    if (version.sentAt) parts.push(t('sent {date}', { date: formatDateTime(version.sentAt) }));
    if (version.status === PackageVersionStatus.DISCARDED && version.deletedAt)
        parts.push(t('deleted {date}', { date: formatDateTime(version.deletedAt) }));
    else if (version.decidedAt) {
        parts.push(
            version.status === PackageVersionStatus.REJECTED
                ? t('rejected {date}', { date: formatDateTime(version.decidedAt) })
                : t('approved {date}', { date: formatDateTime(version.decidedAt) }),
        );
    }
    if (version.adminEditedAt) parts.push(t('edited by Super Admin'));
    return parts.join(' · ');
};

function VersionsCard({ pkg }: { readonly pkg: PackageSummary | null }) {
    const t = useT();
    const versions = pkg?.versions ?? [];
    return (
        <div className="pq-card">
            <h3>{t('Versions')}</h3>
            {versions.map((version) => {
                const badge = VERSION_STATUS_BADGE[version.status];
                const showReason =
                    !!version.rejectReason &&
                    (version.status === PackageVersionStatus.REJECTED || version.status === PackageVersionStatus.DRAFT);
                return (
                    <div className="pq-vrow" key={version.id}>
                        <div>
                            <b>v{version.versionNumber}</b>
                            <span>{versionDates(t, version)}</span>
                            {showReason && (
                                <>
                                    <br />
                                    <span>{t('Reason: {reason}', { reason: version.rejectReason ?? '' })}</span>
                                </>
                            )}
                        </div>
                        <div className="pq-vside">
                            <span className={badge.css}>{t(badge.label)}</span>
                            {version.status === PackageVersionStatus.REPLACED && pkg && (
                                <Link
                                    className="btn btn-text pq-vbtn"
                                    href={`${PACKAGES_PATH}/${pkg.id}?version=${version.id}`}
                                >
                                    {t('View')}
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
            {versions.length === 0 && (
                <p className="ss-cap" style={{ margin: 0 }}>
                    {t('v1 is made when you save Basic.')}
                </p>
            )}
        </div>
    );
}

export function PackageSide({
    context,
    partnerName,
}: {
    readonly context: EditorSideContext;
    readonly partnerName: string;
}) {
    const t = useT();
    const actions = usePackageActions();
    const [dialog, setDialog] = useState<'send' | 'delete' | null>(null);
    const { view, dirty } = context;
    const pkg = view?.package ?? null;
    const working = pkg?.working ?? null;
    const live = pkg?.live ?? null;
    const has = (action: (typeof PortalAction)[keyof typeof PortalAction]) => pkg?.actions.includes(action) ?? false;
    const versionBadge = working
        ? VERSION_STATUS_BADGE[working.status]
        : null;
    const webBadge = pkg ? WEBSITE_STATUS_BADGE[pkg.websiteStatus] : WEBSITE_STATUS_BADGE[PackageWebsiteStatus.NOT_LIVE];
    const nextNumber = (pkg?.versions.reduce((max, item) => Math.max(max, item.versionNumber), 0) ?? 0) + 1;
    const busy = actions.busy !== null || context.busy;
    const neverLive = pkg?.websiteStatus === PackageWebsiteStatus.NOT_LIVE;

    const send = () => {
        if (dirty) {
            announcePackageNotice(t('Save or discard your changes first.'), true);
            return;
        }
        setDialog('send');
    };

    return (
        <aside className="pq-side">
            <div className="pq-card">
                <h3>{pkg ? t('Package') : t('New package')}</h3>
                <div className="ss-row">
                    {versionBadge && working ? (
                        <span className={versionBadge.css}>
                            v{working.versionNumber} · {t(versionBadge.label)}
                        </span>
                    ) : (
                        <span className="badge badge-neutral">
                            {live ? t('Live v{n}', { n: live.versionNumber }) : t('Not saved yet')}
                        </span>
                    )}
                    <span className={webBadge.css}>{t(webBadge.label)}</span>
                </div>
                <dl className="ss-dl" style={{ gridTemplateColumns: '110px minmax(0,1fr)' }}>
                    <dt>{t('Package link')}</dt>
                    <dd>{pkg ? `/packages/${pkg.slug}` : t('Made from the name when you save Basic')}</dd>
                    <dt>{t('Partner')}</dt>
                    <dd>{partnerName}</dd>
                </dl>
                {pkg && has(PortalAction.SEND) && working && (
                    <button type="button" className="btn btn-primary" disabled={busy} onClick={send}>
                        {t('Send for approval')}
                    </button>
                )}
                {pkg && !working && live && has(PortalAction.EDIT) && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy}
                        onClick={() => void actions.startEdit(pkg.id, false)}
                    >
                        {t('Edit (makes version {n})', { n: nextNumber })}
                    </button>
                )}
                {pkg && (has(PortalAction.MAKE_INACTIVE) || has(PortalAction.MAKE_ACTIVE)) && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy}
                        onClick={() => {
                            if (dirty) {
                                announcePackageNotice(t('Save or discard your changes first.'), true);
                                return;
                            }
                            void actions.setActive(pkg.id, view?.version.name ?? '', has(PortalAction.MAKE_ACTIVE));
                        }}
                    >
                        {has(PortalAction.MAKE_ACTIVE) ? t('Make active') : t('Make inactive')}
                    </button>
                )}
                {pkg && working && (has(PortalAction.DELETE) || has(PortalAction.DELETE_DRAFT)) && (
                    <button
                        type="button"
                        className="btn btn-secondary ss-danger-link"
                        disabled={busy}
                        onClick={() => setDialog('delete')}
                    >
                        {has(PortalAction.DELETE) ? t('Delete') : t('Delete draft')}
                    </button>
                )}
            </div>
            <VersionsCard pkg={pkg} />
            {dialog === 'send' && pkg && working && (
                <PackageSendDialog
                    busy={busy}
                    onClose={() => setDialog(null)}
                    onConfirm={() => {
                        setDialog(null);
                        void actions.send(pkg.id, working.id, working.versionNumber);
                    }}
                />
            )}
            {dialog === 'delete' && pkg && working && (
                <PackageDeleteDialog
                    neverLive={neverLive}
                    busy={busy}
                    onClose={() => setDialog(null)}
                    onConfirm={() => {
                        setDialog(null);
                        void actions.discard(pkg.id, working.id);
                    }}
                />
            )}
        </aside>
    );
}
