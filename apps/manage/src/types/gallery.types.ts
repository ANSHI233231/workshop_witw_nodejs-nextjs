export const GALLERY_LIMITS = { REASON_MAX: 512, SEARCH: 100 } as const;

export type GalleryPhoto = {
    readonly id: number;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
    readonly isThumbnail: boolean;
    readonly fileVersion: string;
};

export type GalleryItem = {
    readonly id: number;
    readonly title: string;
    readonly approvedTitle: string | null;
    readonly park: { readonly id: number; readonly name: string | null };
    readonly status: number;
    readonly hasApprovedSet: boolean;
    readonly photoCount: number;
    readonly thumbnailPhotoId: number | null;
    readonly thumbnailFileVersion: string | null;
    readonly sentAt: string | null;
    readonly decidedAt: string | null;
    readonly partner: { readonly id: number; readonly businessName: string | null };
};

export type GalleryDetail = Omit<GalleryItem, 'photoCount' | 'thumbnailPhotoId' | 'thumbnailFileVersion'> & {
    readonly approvedPhotos: readonly GalleryPhoto[];
    readonly draftPhotos: readonly GalleryPhoto[];
};

export type GalleryFilters = { readonly search: string; readonly page: number };

export type GalleryListKind = 'waiting' | 'approved';
