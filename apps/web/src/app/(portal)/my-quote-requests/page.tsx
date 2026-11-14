import type { Metadata } from 'next';

import { SiteBanner } from '@/components/website/witw-site-frame';
import { MyQuoteRequestsScreen } from '@/components/quote/my-quote-requests';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('My Quote Requests'),
});

export default async function MyQuoteRequestsPage() {
    const { t } = await serverTranslator();
    return (
        <>
            <SiteBanner title={t('My Quote Requests')} />
            <div className="page">
                <MyQuoteRequestsScreen />
            </div>
        </>
    );
}
