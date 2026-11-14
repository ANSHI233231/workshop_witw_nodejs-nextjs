import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import type { GalleryFilters, GalleryItem, GalleryListKind } from '@/types/gallery.types';

import { GalleryFilterBar } from './gallery-filter-bar';
import { GalleryRows } from './gallery-rows';
import { GALLERIES_PATH, GALLERY_APPROVALS_PATH, galleryListParams } from './gallery-url';

export async function GalleryList({
    kind,
    filters,
    result,
}: {
    readonly kind: GalleryListKind;
    readonly filters: GalleryFilters;
    readonly result: Paginated<GalleryItem>;
}) {
    const { t } = await serverTranslator();
    const waiting = kind === 'waiting';
    const path = waiting ? GALLERY_APPROVALS_PATH : GALLERIES_PATH;
    const heading = waiting ? t('Gallery Approvals') : t('Galleries');
    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Packages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{heading}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{heading}</h1>
                </div>
            </div>
            <div className="table-card">
                <GalleryFilterBar path={path} filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {waiting ? t('Waiting for approval') : t('Approved galleries')}:{' '}
                        <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <GalleryRows kind={kind} rows={result.items} firstSerial={(filters.page - 1) * result.meta.limit + 1} />
                <TablePager
                    path={path}
                    params={galleryListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
