import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { GalleryList } from '@/components/galleries/gallery-list';
import { GALLERY_APPROVALS_PATH, galleryListUrl } from '@/components/galleries/gallery-url';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, pageParam, searchParam } from '@/lib/search-params';
import { listGalleryApprovals } from '@/services/gallery.service';
import { GALLERY_LIMITS, type GalleryFilters } from '@/types/gallery.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Gallery Approvals'),
});

export default async function GalleryApprovalsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const query = await searchParams;
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const filters: GalleryFilters = {
        search: searchParam(query['search'], GALLERY_LIMITS.SEARCH),
        page: pageParam(query['page']),
    };
    const result = await listGalleryApprovals(filters, accessToken);
    if (filters.page > result.meta.totalPages && result.meta.totalPages > 0) {
        redirect(galleryListUrl(GALLERY_APPROVALS_PATH, { ...filters, page: result.meta.totalPages }));
    }
    return <GalleryList kind="waiting" filters={filters} result={result} />;
}
