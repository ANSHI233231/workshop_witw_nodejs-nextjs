import Link from 'next/link';

import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { GalleryDetail } from '@/types/gallery.types';
import type { ParkOption } from '@/types/partner.types';

import { GalleryEditor } from './gallery-editor';
import { GALLERY_PATH } from './gallery-format';

export async function GalleryEditPage({
    gallery,
    parks,
}: {
    readonly gallery: GalleryDetail | null;
    readonly parks: readonly ParkOption[];
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partner Portal')}</a>
                    <BreadcrumbChevronIcon />
                    <Link href={GALLERY_PATH}>{t('Gallery')}</Link>
                    <BreadcrumbChevronIcon />
                    <span>{gallery ? t('Edit gallery') : t('Add gallery')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{gallery ? gallery.title : t('Add gallery')}</h1>
                </div>
            </div>
            <GalleryEditor
                key={gallery ? `${gallery.id}-${gallery.status}` : 'new'}
                gallery={gallery}
                parks={parks}
            />
        </div>
    );
}
