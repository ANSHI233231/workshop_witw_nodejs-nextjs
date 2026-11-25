import type { Metadata } from 'next';

import { WishlistPage } from '@/components/wishlist/wishlist-page';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { requireMember } from '@/lib/member-session';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Wishlist'),
});

export default async function WishlistRoute() {
    const { t } = await serverTranslator();
    await requireMember('/wishlist', { partnerGoesHome: true });
    return (
        <>
            <SiteBanner title={t('Wishlist')} />
            <WishlistPage />
        </>
    );
}
