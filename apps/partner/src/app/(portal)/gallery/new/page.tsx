import type { Metadata } from 'next';

import { GalleryEditPage } from '@/components/gallery/gallery-edit-page';
import { activeParksOf } from '@/components/gallery/gallery-parks';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { requireActivePartner } from '@/lib/portal-session';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Add gallery'),
});

export default async function NewGalleryPage() {
    const { request } = await requireActivePartner();
    return <GalleryEditPage gallery={null} parks={activeParksOf(request)} />;
}
