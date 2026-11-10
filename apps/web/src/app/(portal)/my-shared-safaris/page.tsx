import type { Metadata } from 'next';

import { MySharedSafaris } from '@/components/shared-safari/my-shared-safaris';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('My Shared Safaris'),
});

export default function MySharedSafarisPage() {
    return (
        <div className="page">
            <MySharedSafaris />
        </div>
    );
}
