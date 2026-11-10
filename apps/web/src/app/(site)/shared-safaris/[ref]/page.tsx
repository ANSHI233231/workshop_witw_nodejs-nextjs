import type { Metadata } from 'next';

import { SafariViewPage } from '@/components/shared-safari/safari-view';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Shared Safari'),
});

export default async function SharedSafariPage({ params }: { readonly params: Promise<{ readonly ref: string }> }) {
    const { ref } = await params;
    const { t } = await serverTranslator();
    const session = await consoleSession();
    return (
        <>
            <SiteBanner title={t('Shared Safari')} />
            <div className="page">
                <SafariViewPage key={ref} safariRef={decodeURIComponent(ref)} meName={session?.user.name ?? ''} />
            </div>
        </>
    );
}
