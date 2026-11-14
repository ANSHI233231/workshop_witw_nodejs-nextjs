import type { Metadata } from 'next';

import { PackageBrowser } from '@/components/package/package-browser';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Safari Packages'),
});

export default async function PackagesPage() {
    const { t } = await serverTranslator();
    return (
        <>
            <SiteBanner title={t('Wildlife Safari Tour Packages')} />
            <div className="page">
                <PackageBrowser />
            </div>
        </>
    );
}
