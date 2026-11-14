import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type { GalleryDetail, GalleryFilters, GalleryItem } from '@/types/gallery.types';

import { apiClient } from './api-client';

export const GALLERY_PAGE_SIZE = 20;

const ADMIN = '/gallery/admin';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

const listOf = (path: string, filters: GalleryFilters, accessToken: string | undefined): Promise<Paginated<GalleryItem>> =>
    apiClient.paginated<GalleryItem>(path, {
        query: { search: filters.search || undefined, page: filters.page, limit: GALLERY_PAGE_SIZE },
        headers: cookieHeader(accessToken),
    });

export const listGalleryApprovals = (filters: GalleryFilters, accessToken: string | undefined) =>
    listOf(`${ADMIN}/approvals`, filters, accessToken);

export const listApprovedGalleries = (filters: GalleryFilters, accessToken: string | undefined) =>
    listOf(`${ADMIN}/galleries`, filters, accessToken);

export const getGallery = (id: number): Promise<GalleryDetail> =>
    apiClient.get<GalleryDetail>(`${ADMIN}/galleries/${id}`);

export const approveGallery = (id: number): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${ADMIN}/galleries/${id}/approve`);

export const rejectGallery = (id: number, reason: string): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${ADMIN}/galleries/${id}/reject`, { reason });

export const deleteGallery = (id: number, reason: string): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${ADMIN}/galleries/${id}/delete`, { reason });

export const galleryPhotoUrl = (id: number, photoId: number, fileVersion: string): string =>
    apiClient.fileUrl(`${ADMIN}/galleries/${id}/photos/${photoId}/file`, { v: fileVersion });
