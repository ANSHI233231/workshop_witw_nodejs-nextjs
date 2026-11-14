'use client';

import type { EditorSideContext } from '@/components/package-editor/package-editor';
import {
    VERSION_STATUS_BADGE,
    WEBSITE_STATUS_BADGE,
} from '@/components/package-editor/package-labels';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import { PackageVersionStatus, type VersionSummary } from '@/types/package.types';

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

export function PackageConsoleSide({
    context,
    partnerName,
}: {
    readonly context: EditorSideContext;
    readonly partnerName: string;
}) {
    const t = useT();
    const pkg = context.view?.package;
    const shown = context.view?.version;
    const badge = shown ? VERSION_STATUS_BADGE[shown.status] : null;
    const web = pkg ? WEBSITE_STATUS_BADGE[pkg.websiteStatus] : null;
    const versions = pkg?.versions ?? [];
    return (
        <aside className="pq-side">
            <div className="pq-card">
                <h3>{t('Package')}</h3>
                <div className="ss-row">
                    {badge && shown && (
                        <span className={badge.css}>
                            v{shown.versionNumber} · {t(badge.label)}
                        </span>
                    )}
                    {web && <span className={web.css}>{t(web.label)}</span>}
                </div>
                <dl className="ss-dl" style={{ gridTemplateColumns: '110px minmax(0,1fr)' }}>
                    <dt>{t('Package link')}</dt>
                    <dd>/packages/{pkg?.slug}</dd>
                    <dt>{t('Partner')}</dt>
                    <dd>{partnerName}</dd>
                </dl>
            </div>
            <div className="pq-card">
                <h3>{t('Versions')}</h3>
                {versions.map((version) => {
                    const versionBadge = VERSION_STATUS_BADGE[version.status];
                    const showReason =
                        !!version.rejectReason &&
                        (version.status === PackageVersionStatus.REJECTED ||
                            version.status === PackageVersionStatus.DRAFT);
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
                            <span className={versionBadge.css}>{t(versionBadge.label)}</span>
                        </div>
                    );
                })}
                {versions.length === 0 && (
                    <p className="ss-cap" style={{ margin: 0 }}>
                        {t('v1 is made when you save Basic.')}
                    </p>
                )}
            </div>
        </aside>
    );
}
