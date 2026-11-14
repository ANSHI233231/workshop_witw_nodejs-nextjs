'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PackageEditor } from '@/components/package-editor/package-editor';
import { announcePackageNotice } from '@/components/package-editor/package-notice';
import { VERSION_STATUS_BADGE, WEBSITE_STATUS_BADGE } from '@/components/package-editor/package-labels';
import { PackageConsoleSide } from '@/components/package/package-console-side';
import { PackagePreview } from '@/components/package/package-preview';
import { PackageRejectDialog } from '@/components/package/package-reject-dialog';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { approvePackageVersion } from '@/services/package.service';
import {
    type FormOptions,
    PackageVersionStatus,
    type PackageSummary,
    type PackageView,
    PackageWebsiteStatus,
} from '@/types/package.types';

export type DetailTab = 'preview' | 'edit';

export type DetailWhich = 'waiting' | 'live';

export function PackageConsoleDetail({
    summary,
    view,
    title,
    which,
    initialTab,
    options,
}: {
    readonly summary: PackageSummary;
    readonly view: PackageView | null;
    readonly title: string;
    readonly which: DetailWhich;
    readonly initialTab: DetailTab;
    readonly options: FormOptions | null;
}) {
    const t = useT();
    const router = useRouter();
    const deleted = summary.websiteStatus === PackageWebsiteStatus.DELETED_BY_ADMIN;
    const [tab, setTab] = useState<DetailTab>(deleted ? 'preview' : initialTab);
    const [current, setCurrent] = useState<PackageView | null>(view);
    const [dirty, setDirty] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [busy, setBusy] = useState(false);
    const shown = current?.version ?? null;
    const waiting = which === 'waiting' && shown?.status === PackageVersionStatus.WAITING;
    const partnerName = summary.partner.businessName ?? '';

    const approve = async () => {
        if (!shown || busy) return;
        if (dirty) {
            announcePackageNotice(t('Save or discard your changes first.'), true);
            return;
        }
        setBusy(true);
        try {
            const approved = await approvePackageVersion(summary.id, shown.id);
            announcePackageNotice(
                t('{name} v{n} is live on the website.', {
                    name: approved.version.name,
                    n: approved.version.versionNumber,
                }),
                false,
            );
            router.replace(`/packages/${summary.id}?version=live&tab=preview`);
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            announcePackageNotice(known ? t(error.message) : t('This could not be done. Please try again.'), true);
            if (known) router.refresh();
        } finally {
            setBusy(false);
        }
    };

    const status = shown ? VERSION_STATUS_BADGE[shown.status] : null;
    const subtitle = [
        partnerName,
        which === 'waiting'
            ? shown
                ? t('Version {n} · {status}', { n: shown.versionNumber, status: t(status?.label ?? '') })
                : t('No version waiting')
            : t('Live version v{n}', { n: shown?.versionNumber ?? '' }),
        t('Website: {status}', { status: t(WEBSITE_STATUS_BADGE[summary.websiteStatus].label) }),
    ].join(' · ');

    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Packages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Package preview / edit')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{title}</h1>
                    {waiting && shown && (
                        <div className="actions">
                            <button
                                type="button"
                                className="btn btn-secondary ss-danger-link"
                                disabled={busy}
                                onClick={() => {
                                    if (dirty) {
                                        announcePackageNotice(t('Save or discard your changes first.'), true);
                                        return;
                                    }
                                    setRejecting(true);
                                }}
                            >
                                {t('Reject')}
                            </button>
                            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void approve()}>
                                {t('Approve')}
                            </button>
                        </div>
                    )}
                </div>
                <p className="ss-muted" style={{ margin: '-8px 0 var(--space-lg)' }}>
                    {subtitle}
                </p>
            </div>
            <div className="nt-tabs" role="tablist" style={{ marginBottom: 'var(--space-lg)' }}>
                <a
                    className={tab === 'preview' ? 'nt-tab is-on' : 'nt-tab'}
                    role="tab"
                    aria-selected={tab === 'preview'}
                    onClick={() => setTab('preview')}
                >
                    {t('Preview')}
                </a>
                <a
                    className={deleted ? 'nt-tab pq-hide' : tab === 'edit' ? 'nt-tab is-on' : 'nt-tab'}
                    role="tab"
                    aria-selected={tab === 'edit'}
                    onClick={() => setTab('edit')}
                >
                    {t('Edit')}
                </a>
            </div>
            {tab === 'preview' && current && <PackagePreview view={current} />}
            {view && options && !deleted && (
                <div className={tab === 'edit' ? undefined : 'pq-hide'}>
                    <PackageEditor
                        mode="admin"
                        initial={view}
                        options={options}
                        listPath="/packages"
                        renderSide={(context) => <PackageConsoleSide context={context} partnerName={partnerName} />}
                        onViewChange={setCurrent}
                        onDirtyChange={setDirty}
                    />
                </div>
            )}
            {rejecting && shown && (
                <PackageRejectDialog
                    packageId={summary.id}
                    versionId={shown.id}
                    versionNumber={shown.versionNumber}
                    onClose={() => setRejecting(false)}
                    onDone={(message) => {
                        setRejecting(false);
                        announcePackageNotice(message, false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
