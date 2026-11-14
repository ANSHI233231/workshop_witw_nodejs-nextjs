import { listUrl } from '@/lib/list-url';
import type { GalleryFilters } from '@/types/gallery.types';

export const GALLERY_APPROVALS_PATH = '/gallery-approvals';

export const GALLERIES_PATH = '/galleries';

export const galleryListParams = (filters: Omit<GalleryFilters, 'page'>) => ({ search: filters.search });

export const galleryListUrl = (path: string, filters: GalleryFilters): string =>
    listUrl(path, { ...galleryListParams(filters), page: filters.page });
