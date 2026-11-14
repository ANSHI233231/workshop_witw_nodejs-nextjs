import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { PackageNotInUse } from '@/components/package/package-not-in-use';
import { PackageView } from '@/components/package/package-view';
import type { QuoteViewer } from '@/components/package/quote-form';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { cardImageSources } from '@/lib/package-format';
import { currentSitePartner } from '@/lib/site-partner';
import { ApiError } from '@/services/api-error';
import { getPackagePage, packageFileUrl } from '@/services/package.service';
import type { PackagePageAnswer } from '@/types/package.types';

const viewerOf = async (): Promise<QuoteViewer> => {
    const session = await consoleSession();
    if (!session) return 'guest';
    const partner = await currentSitePartner();
    return partner ? 'partner' : 'user';
};

type PackageParams = { readonly params: Promise<{ readonly slug: string }> };

const loadPackage = cache(async (slug: string): Promise<PackagePageAnswer> => {
    try {
        return await getPackagePage(slug);
    } catch (error) {
        if (error instanceof ApiError && error.code === 'PACKAGE_NOT_FOUND') redirect('/');
        throw error;
    }
});

export const generateMetadata = async ({ params }: PackageParams): Promise<Metadata> => {
    const { t } = await serverTranslator();
    const answer = await loadPackage(decodeURIComponent((await params).slug));
    return { title: answer.package?.name ?? t('Safari Packages') };
};

export default async function PackagePageRoute({ params }: PackageParams) {
    const slug = decodeURIComponent((await params).slug);
    const { t } = await serverTranslator();
    const answer = await loadPackage(slug);
    const pkg = answer.inUse ? answer.package : null;
    if (!pkg) {
        return (
            <>
                <SiteBanner title={t('Safari Packages')} />
                <div className="page">
                    <PackageNotInUse />
                </div>
            </>
        );
    }
    const banner = pkg.bannerImage ? packageFileUrl(pkg.slug, pkg.bannerImage) : cardImageSources(pkg)[0];
    return (
        <>
            <SiteBanner title={pkg.name} image={banner} />
            <div className="page">
                <PackageView pkg={pkg} viewer={await viewerOf()} />
            </div>
        </>
    );
}
