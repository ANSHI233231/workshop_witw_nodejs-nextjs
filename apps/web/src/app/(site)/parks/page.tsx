import type { Metadata } from 'next';

import { ParkList } from '@/components/park/park-list';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Wildlife Parks'),
});

export default async function ParksPage() {
    const { t } = await serverTranslator();
    return (
        <>
            <SiteBanner title={t('Wildlife Parks')} />
            <div className="page">
                <ParkList />
            </div>
        </>
    );
}
