import type { Metadata } from 'next';

import { MySharedSafaris } from '@/components/shared-safari/my-shared-safaris';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { currentSitePartner } from '@/lib/site-partner';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('My Shared Safaris'),
});

export default async function MySharedSafarisPage() {
    const partner = await currentSitePartner();
    return (
        <div className="page">
            <MySharedSafaris isPartner={partner !== null} />
        </div>
    );
}
