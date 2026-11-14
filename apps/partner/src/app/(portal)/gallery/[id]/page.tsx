import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GalleryEditPage } from '@/components/gallery/gallery-edit-page';
import { activeParksOf } from '@/components/gallery/gallery-parks';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { idParam } from '@/lib/search-params';
import { getGallery } from '@/services/gallery.service';
import { ApiError } from '@/services/api-error';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Edit gallery'),
});

export default async function GalleryPage({ params }: { readonly params: Promise<{ id: string }> }) {
    const { request } = await requireActivePartner();
    const id = idParam((await params).id);
    if (id === undefined) notFound();
    const gallery = await getGallery(id, await readAccessToken()).catch((error: unknown) => {
        if (error instanceof ApiError && error.code === 'GALLERY_NOT_FOUND') notFound();
        throw error;
    });
    return <GalleryEditPage gallery={gallery} parks={activeParksOf(request)} />;
}
