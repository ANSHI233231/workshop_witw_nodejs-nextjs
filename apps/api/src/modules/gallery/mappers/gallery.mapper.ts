import type {
    ApprovedGalleryOption,
    GalleryConsoleItemDto,
    GalleryDetailDto,
    GalleryListItemDto,
    GalleryPhotoDto,
} from '../dto/gallery.dto';
import {
    type GalleryListRow,
    GalleryPhotoSet,
    type GalleryPhotoRow,
    type GalleryRow,
} from '../types/gallery.types';

const isoOf = (value: Date | null): string | null => (value === null ? null : value.toISOString());

export const toPhoto = (row: GalleryPhotoRow): GalleryPhotoDto => ({
    id: row.id,
    title: row.title,
    caption: row.caption,
    sortOrder: row.sort_order,
    isThumbnail: row.is_thumbnail === 1,
    fileVersion: row.file_name,
});

const galleryBase = (row: GalleryRow) => ({
    id: row.id,
    title: row.title,
    approvedTitle: row.approved_title,
    park: { id: row.master_park_id, name: row.park_name },
    status: row.status,
    hasApprovedSet: row.has_approved_set === 1,
    rejectReason: row.reject_reason,
    sentAt: isoOf(row.sent_at),
    decidedAt: isoOf(row.decided_at),
    createdAt: row.created_at.toISOString(),
});

export const toListItem = (row: GalleryListRow): GalleryListItemDto => ({
    ...galleryBase(row),
    photoCount: Number(row.photo_count),
    thumbnailPhotoId: row.thumbnail_photo_id,
    thumbnailFileVersion: row.thumbnail_file_name,
});

export const toConsoleItem = (row: GalleryListRow): GalleryConsoleItemDto => ({
    ...toListItem(row),
    partner: { id: row.partner_id, businessName: row.business_name },
});

export const toDetail = (row: GalleryRow, photos: readonly GalleryPhotoRow[]): GalleryDetailDto => ({
    ...galleryBase(row),
    partner: { id: row.partner_id, businessName: row.business_name },
    approvedPhotos: photos.filter((photo) => photo.photo_set === GalleryPhotoSet.APPROVED).map(toPhoto),
    draftPhotos: photos.filter((photo) => photo.photo_set === GalleryPhotoSet.DRAFT).map(toPhoto),
});

export const toApprovedOption = (row: GalleryListRow): ApprovedGalleryOption => ({
    id: row.id,
    title: row.approved_title ?? row.title,
    park: { id: row.master_park_id, name: row.park_name },
    photoCount: Number(row.photo_count),
    thumbnailPhotoId: row.thumbnail_photo_id,
});
