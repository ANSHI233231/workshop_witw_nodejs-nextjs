export const GalleryStatus = { DRAFT: 1, WAITING: 2, APPROVED: 3 } as const;

export type GalleryStatusCode = (typeof GalleryStatus)[keyof typeof GalleryStatus];

export const GalleryTab = { APPROVED: 'approved', DRAFT: 'draft', WAITING: 'waiting' } as const;

export type GalleryTabKey = (typeof GalleryTab)[keyof typeof GalleryTab];

export const GALLERY_TABS: readonly GalleryTabKey[] = [GalleryTab.APPROVED, GalleryTab.DRAFT, GalleryTab.WAITING];

export const GALLERY_LIMITS = {
    TITLE_MAX: 255,
    PHOTO_TITLE_MAX: 255,
    CAPTION_MAX: 1000,
    PHOTO_MAX_BYTES: 8 * 1024 * 1024,
    PHOTOS_PER_UPLOAD: 20,
} as const;

export const PHOTO_ACCEPT = '.jpg,.jpeg,.png';

export type GalleryPark = { readonly id: number; readonly name: string | null };

export type GalleryPhoto = {
    readonly id: number;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
    readonly isThumbnail: boolean;
    readonly fileVersion: string;
};

export type GalleryListItem = {
    readonly id: number;
    readonly title: string;
    readonly approvedTitle: string | null;
    readonly park: GalleryPark;
    readonly status: GalleryStatusCode;
    readonly hasApprovedSet: boolean;
    readonly rejectReason: string | null;
    readonly photoCount: number;
    readonly thumbnailPhotoId: number | null;
    readonly thumbnailFileVersion: string | null;
    readonly sentAt: string | null;
    readonly decidedAt: string | null;
};

export type GalleryTabCounts = Readonly<Record<GalleryTabKey, number>>;

export type GalleryTabList = {
    readonly tab: GalleryTabKey;
    readonly items: readonly GalleryListItem[];
    readonly counts: GalleryTabCounts;
};

export type GalleryDetail = {
    readonly id: number;
    readonly title: string;
    readonly approvedTitle: string | null;
    readonly park: GalleryPark;
    readonly status: GalleryStatusCode;
    readonly hasApprovedSet: boolean;
    readonly rejectReason: string | null;
    readonly decidedAt: string | null;
    readonly approvedPhotos: readonly GalleryPhoto[];
    readonly draftPhotos: readonly GalleryPhoto[];
};

export type DeletedDraft = { readonly gallery: GalleryDetail | null; readonly restoredApproved: boolean };

export type DraftPhotoInput = { readonly id: number; readonly title: string | null; readonly caption: string | null };

export type GalleryDraftInput = {
    readonly title: string;
    readonly masterParkId: number;
    readonly photos: readonly DraftPhotoInput[];
    readonly thumbnailPhotoId: number | null;
};
