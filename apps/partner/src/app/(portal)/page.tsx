import type { Metadata } from 'next';
import Link from 'next/link';

import { FallbackImage } from '@/components/package/fallback-image';
import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { PackageBoxIcon } from '@/components/portal/portal-icons';
import { PlusIcon } from '@/components/ui/icons';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { durationText, rupees } from '@/components/package-editor/package-labels';
import { getDashboardSummary } from '@/services/dashboard.service';
import { packagePictureSources } from '@/services/package.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Dashboard'),
});

export default async function DashboardPage() {
    await requireActivePartner();
    const { t } = await serverTranslator();
    const { activeQuoteRequests, latestPackages } = await getDashboardSummary(await readAccessToken());
    return (
        <div className="page">
            <div>
                <PageBreadcrumb
                    portalLabel={t('Partner Portal')}
                    pageLabel={t('Dashboard')}
                    ariaLabel={t('Breadcrumb')}
                />
                <div className="page-head">
                    <h1 className="page-title">{t('Dashboard')}</h1>
                </div>
            </div>
            <div className="pq-kpis">
                <Link className="pq-kpi" href="/quote-requests">
                    <span>{t('Active quote requests')}</span>
                    <b>{formatCount(activeQuoteRequests)}</b>
                </Link>
            </div>
            <div className="pq-sec">
                <h2>{t('Latest active packages')}</h2>
                <div className="pq-pkgs">
                    {latestPackages.map((pkg) => (
                        <div className="pq-pk" key={pkg.id}>
                            <FallbackImage
                                sources={packagePictureSources(pkg.id, pkg.liveVersionId, pkg.packageImage, pkg.mainPark)}
                            />
                            <div>
                                <b>{pkg.name}</b>
                                <span className="ss-cap">
                                    {pkg.parkNames} · {durationText(pkg.dayCount)}
                                </span>
                                <br />
                                <span className="ss-cap">
                                    {t('{price} per person · live v{version}', {
                                        price: rupees(pkg.pricePerPerson),
                                        version: pkg.liveVersionNumber,
                                    })}
                                </span>
                                <br />
                                <Link href={`/packages/${pkg.id}`}>{t('Open')}</Link>
                            </div>
                        </div>
                    ))}
                </div>
                {latestPackages.length === 0 && (
                    <div className="pq-card">
                        <div className="state">
                            <PackageBoxIcon className="icon state-icon" />
                            <p className="state-title">{t('No active packages yet.')}</p>
                            <Link className="btn btn-primary" href="/packages/new">
                                <PlusIcon />
                                {t('Add Package')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
