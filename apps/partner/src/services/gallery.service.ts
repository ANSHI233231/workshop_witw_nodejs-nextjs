import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    DeletedDraft,
    GalleryDetail,
    GalleryDraftInput,
    GalleryTabKey,
    GalleryTabList,
} from '@/types/gallery.types';

import { apiClient } from './api-client';

const GALLERIES = '/gallery/galleries';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listGalleries = (tab: GalleryTabKey, accessToken?: string): Promise<GalleryTabList> =>
    apiClient.get<GalleryTabList>(GALLERIES, { query: { tab }, headers: cookieHeader(accessToken) });

export const getGallery = (id: number, accessToken?: string): Promise<GalleryDetail> =>
    apiClient.get<GalleryDetail>(`${GALLERIES}/${id}`, { headers: cookieHeader(accessToken) });

export const createGallery = (title: string, masterParkId: number): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(GALLERIES, { title, masterParkId });

export const saveGalleryDraft = (id: number, input: GalleryDraftInput): Promise<GalleryDetail> =>
    apiClient.put<GalleryDetail>(`${GALLERIES}/${id}`, input);

export const uploadGalleryPhotos = (id: number, files: readonly File[]): Promise<GalleryDetail> => {
    const body = new FormData();
    for (const file of files) body.append('photos', file);
    return apiClient.post<GalleryDetail>(`${GALLERIES}/${id}/photos`, body);
};

export const replaceGalleryPhoto = (id: number, photoId: number, photo: File): Promise<GalleryDetail> => {
    const body = new FormData();
    body.append('photo', photo);
    return apiClient.put<GalleryDetail>(`${GALLERIES}/${id}/photos/${photoId}/file`, body);
};

export const sendGallery = (id: number): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${GALLERIES}/${id}/send`);

export const moveGalleryBack = (id: number): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${GALLERIES}/${id}/move-back`);

export const startGalleryEdit = (id: number): Promise<GalleryDetail> =>
    apiClient.post<GalleryDetail>(`${GALLERIES}/${id}/edit`);

export const deleteGalleryDraft = (id: number): Promise<DeletedDraft> =>
    apiClient.delete<DeletedDraft>(`${GALLERIES}/${id}`);

export const galleryPhotoUrl = (id: number, photoId: number, fileVersion: string): string =>
    apiClient.fileUrl(`${GALLERIES}/${id}/photos/${photoId}/file`, { v: fileVersion });
