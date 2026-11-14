import type { Metadata } from 'next';

import { GalleryList } from '@/components/gallery/gallery-list';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { type PageSearchParams, singleParam } from '@/lib/search-params';
import { listGalleries } from '@/services/gallery.service';
import { GALLERY_TABS, GalleryTab } from '@/types/gallery.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Gallery'),
});

export default async function GalleryPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireActivePartner();
    const requested = singleParam((await searchParams)['tab']);
    const tab = GALLERY_TABS.find((key) => key === requested) ?? GalleryTab.APPROVED;
    return <GalleryList list={await listGalleries(tab, await readAccessToken())} />;
}
