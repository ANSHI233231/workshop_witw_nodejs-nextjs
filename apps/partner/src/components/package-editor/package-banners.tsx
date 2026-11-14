'use client';

import Link from 'next/link';

import { useT } from '@/hooks/i18n/use-t';
import {
    type EditorMode,
    PackageVersionStatus,
    type PackageView,
    type VersionDetail,
} from '@/types/package.types';

export function PackageBanners({
    mode,
    view,
    version,
    backHref,
    dateOf,
}: {
    readonly mode: EditorMode;
    readonly view: PackageView;
    readonly version: VersionDetail;
    readonly backHref: string;
    readonly dateOf: (iso: string) => string;
}) {
    const t = useT();
    const { package: pkg } = view;
    const partner = mode === 'partner';
    const status = version.status;
    const deleted = pkg.deleted;
    const n = version.versionNumber;
    const liveN = pkg.live?.versionNumber;

    if (status === PackageVersionStatus.REPLACED) {
        return (
            <div className="banner banner-info pq-banner pq-viewbn" role="status">
                <span>{t("You are viewing version {n} (Replaced). It can't be changed.", { n })}</span>
                <Link className="btn btn-text" href={backHref}>
                    {t('Back to the current version')}
                </Link>
            </div>
        );
    }

    return (
        <>
            {(status === PackageVersionStatus.REJECTED ||
                (status === PackageVersionStatus.DRAFT && version.rejectReason)) && (
                <div className="banner banner-danger pq-banner" role="alert">
                    <b>{t('Version {n} was rejected.', { n })}</b> {version.rejectReason}
                </div>
            )}
            {status === PackageVersionStatus.WAITING && (
                <div className="banner banner-warning pq-banner" role="status">
                    <span>
                        {partner
                            ? t("Version {n} is waiting for approval and can't be changed.", { n })
                            : t('You are editing version {n}, waiting for approval. Approve or reject it as a whole.', { n })}
                    </span>
                </div>
            )}
            {partner && status === PackageVersionStatus.LIVE && !deleted && (
                <div className="banner banner-info pq-banner" role="status">
                    <span>
                        {t(
                            'This is the live version v{n}. Choose Edit to make a new version; the live one stays on the website until the new one is approved.',
                            { n },
                        )}
                    </span>
                </div>
            )}
            {!partner && status === PackageVersionStatus.LIVE && !deleted && (
                <div className="banner banner-warning pq-banner" role="status">
                    <span>
                        {t(
                            'You are editing the live version v{n}. Saved changes show on the website at once, with no approval step.',
                            { n },
                        )}
                    </span>
                </div>
            )}
            {deleted && (
                <div className="banner banner-danger pq-banner" role="status">
                    <span>
                        {partner
                            ? t('Deleted by Super Admin on {date}. Reason: {reason}', {
                                  date: deleted.deletedAt ? dateOf(deleted.deletedAt) : '',
                                  reason: deleted.reasonName ?? '',
                              })
                            : t('Deleted on {date}. Reason: {reason}', {
                                  date: deleted.deletedAt ? dateOf(deleted.deletedAt) : '',
                                  reason: deleted.reasonName ?? '',
                              })}
                        {deleted.details ? ` — ${deleted.details}` : ''}
                    </span>
                </div>
            )}
            {partner &&
                liveN !== undefined &&
                !deleted &&
                (status === PackageVersionStatus.DRAFT || status === PackageVersionStatus.REJECTED) && (
                    <div className="banner banner-info pq-banner" role="status">
                        <span>
                            {t('The live version v{live} stays on the website until version {n} is approved.', {
                                live: liveN,
                                n,
                            })}
                        </span>
                    </div>
                )}
        </>
    );
}
