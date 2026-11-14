import type { RowDataPacket } from '../../../database/connection';

export const GalleryStatus = { DRAFT: 1, WAITING: 2, APPROVED: 3, DELETED_BY_ADMIN: 4, DISCARDED: -1 } as const;

export type GalleryStatusCode = (typeof GalleryStatus)[keyof typeof GalleryStatus];

export const GalleryPhotoSet = { APPROVED: 1, DRAFT: 2 } as const;

export type GalleryPhotoSetCode = (typeof GalleryPhotoSet)[keyof typeof GalleryPhotoSet];

export const GalleryPhotoStatus = { ACTIVE: 1, DELETED: -1 } as const;

export const IN_USE_STATUSES: readonly GalleryStatusCode[] = [
    GalleryStatus.DRAFT,
    GalleryStatus.WAITING,
    GalleryStatus.APPROVED,
];

export const GalleryTab = { APPROVED: 'approved', DRAFT: 'draft', WAITING: 'waiting' } as const;

export type GalleryTabKey = (typeof GalleryTab)[keyof typeof GalleryTab];

export const GALLERY_TABS: readonly GalleryTabKey[] = [GalleryTab.APPROVED, GalleryTab.DRAFT, GalleryTab.WAITING];

export const GALLERY_LIMITS = {
    TITLE_MAX: 255,
    PHOTO_TITLE_MAX: 255,
    CAPTION_MAX: 1000,
    REASON_MAX: 512,
    SEARCH: 100,
    PHOTOS_PER_SAVE: 500,
    PHOTOS_PER_UPLOAD: 20,
    PHOTO_MAX_BYTES: 8 * 1024 * 1024,
} as const;

export const GALLERY_FOLDER = 'gallery';

export const PHOTO_CONTENT_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export interface GalleryRow extends RowDataPacket {
    id: number;
    partner_id: number;
    master_park_id: number;
    park_name: string | null;
    business_name: string | null;
    title: string;
    approved_title: string | null;
    has_approved_set: number;
    reject_reason: string | null;
    delete_reason: string | null;
    sent_at: Date | null;
    decided_at: Date | null;
    created_at: Date;
    status: GalleryStatusCode;
}

export interface GalleryListRow extends GalleryRow {
    photo_count: number;
    thumbnail_photo_id: number | null;
    thumbnail_file_name: string | null;
}

export interface GalleryPhotoRow extends RowDataPacket {
    id: number;
    gallery_id: number;
    photo_set: GalleryPhotoSetCode;
    file_name: string;
    title: string | null;
    caption: string | null;
    sort_order: number;
    is_thumbnail: number;
}

export interface GalleryTabCountRow extends RowDataPacket {
    approved: number | string | null;
    draft: number | string | null;
    waiting: number | string | null;
}

export interface PhotoFileRow extends RowDataPacket {
    gallery_id: number;
    file_name: string;
}

export interface CountRow extends RowDataPacket {
    total: number;
}
