import type { GalleryStatusCode, GalleryTabKey } from '../types/gallery.types';

export type GalleryParkDto = {
    readonly id: number;
    readonly name: string | null;
};

export type GalleryPhotoDto = {
    readonly id: number;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
    readonly isThumbnail: boolean;
    readonly fileVersion: string;
};

export type GalleryListItemDto = {
    readonly id: number;
    readonly title: string;
    readonly approvedTitle: string | null;
    readonly park: GalleryParkDto;
    readonly status: GalleryStatusCode;
    readonly hasApprovedSet: boolean;
    readonly rejectReason: string | null;
    readonly photoCount: number;
    readonly thumbnailPhotoId: number | null;
    readonly thumbnailFileVersion: string | null;
    readonly sentAt: string | null;
    readonly decidedAt: string | null;
    readonly createdAt: string;
};

export type GalleryConsoleItemDto = GalleryListItemDto & {
    readonly partner: { readonly id: number; readonly businessName: string | null };
};

export type GalleryDetailDto = Omit<GalleryListItemDto, 'photoCount' | 'thumbnailPhotoId' | 'thumbnailFileVersion'> & {
    readonly partner: { readonly id: number; readonly businessName: string | null };
    readonly approvedPhotos: readonly GalleryPhotoDto[];
    readonly draftPhotos: readonly GalleryPhotoDto[];
};

export type GalleryTabCounts = Readonly<Record<GalleryTabKey, number>>;

export type GalleryTabList = {
    readonly tab: GalleryTabKey;
    readonly items: readonly GalleryListItemDto[];
    readonly counts: GalleryTabCounts;
};

export type NewGallery = {
    readonly title: string;
    readonly masterParkId: number;
};

export type DraftPhotoEdit = {
    readonly id: number;
    readonly title: string | null;
    readonly caption: string | null;
};

export type GalleryDraft = NewGallery & {
    readonly photos: readonly DraftPhotoEdit[];
    readonly thumbnailPhotoId: number | null;
};

export type GalleryConsoleFilters = {
    readonly search: string | undefined;
};

export type GalleryConsolePage = {
    readonly items: readonly GalleryConsoleItemDto[];
    readonly total: number;
};

export type GalleryPhotoFile = {
    readonly content: Buffer;
    readonly contentType: string;
};

export type DeletedDraft = {
    readonly gallery: GalleryDetailDto | null;
    readonly restoredApproved: boolean;
};

export type ApprovedGalleryOption = {
    readonly id: number;
    readonly title: string;
    readonly park: GalleryParkDto;
    readonly photoCount: number;
    readonly thumbnailPhotoId: number | null;
};

export type GalleryCopyPhoto = {
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
    readonly isThumbnail: boolean;
};

export type GalleryCopy = {
    readonly galleryId: number;
    readonly title: string;
    readonly photos: readonly GalleryCopyPhoto[];
};

export type IncomingPhoto = {
    readonly originalName: string;
    readonly content: Buffer;
};
