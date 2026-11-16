import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { DemoGallery } from '../dto/gallery-demo.dto';
import type { DraftPhotoEdit, GalleryTabCounts } from '../dto/gallery.dto';
import type {
    GalleryListRow,
    GalleryPhotoRow,
    GalleryPhotoSetCode,
    GalleryRow,
    GalleryTabKey,
} from '../types/gallery.types';

export type ConsoleListScope = {
    readonly list: 'waiting' | 'approved';
    readonly search: string | undefined;
};

export type NewPhotoRow = {
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
    readonly isThumbnail: boolean;
};

export type PhotoPlacement = DraftPhotoEdit & { readonly sortOrder: number; readonly isThumbnail: boolean };

export interface IGalleryRepository {
    listOfPartner(db: DbExecutor, partnerId: number, tab: GalleryTabKey): Promise<GalleryListRow[]>;
    tabCountsOfPartner(db: DbExecutor, partnerId: number): Promise<GalleryTabCounts>;
    approvedOfPartner(db: DbExecutor, partnerId: number): Promise<GalleryListRow[]>;
    listForConsole(db: DbExecutor, scope: ConsoleListScope, pagination: PaginationQuery): Promise<GalleryListRow[]>;
    countForConsole(db: DbExecutor, scope: ConsoleListScope): Promise<number>;
    findById(db: DbExecutor, id: number): Promise<GalleryRow | undefined>;
    findByPartnerAndTitle(db: DbExecutor, partnerId: number, title: string): Promise<GalleryRow | undefined>;
    photosOf(db: DbExecutor, galleryId: number): Promise<GalleryPhotoRow[]>;
    insert(db: DbExecutor, partnerId: number, masterParkId: number, title: string, actorId: number): Promise<number>;
    insertDemo(db: DbExecutor, gallery: DemoGallery, decidedBy: number | null): Promise<number>;
    updateDraft(db: DbExecutor, id: number, title: string, masterParkId: number, actorId: number): Promise<boolean>;
    send(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    moveBack(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    startEdit(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    restoreApproved(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    discard(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    approve(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    reject(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean>;
    deleteByAdmin(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean>;
    insertPhotos(
        db: DbExecutor,
        galleryId: number,
        set: GalleryPhotoSetCode,
        photos: readonly NewPhotoRow[],
        actorId: number,
    ): Promise<void>;
    placePhotos(db: DbExecutor, galleryId: number, photos: readonly PhotoPlacement[], actorId: number): Promise<void>;
    replacePhotoFile(db: DbExecutor, galleryId: number, photoId: number, fileName: string, actorId: number): Promise<boolean>;
    removeDraftPhotos(db: DbExecutor, galleryId: number, photoIds: readonly number[], actorId: number): Promise<number>;
    removeSet(db: DbExecutor, galleryId: number, set: GalleryPhotoSetCode, actorId: number): Promise<void>;
    copyApprovedToDraft(db: DbExecutor, galleryId: number, actorId: number): Promise<void>;
    promoteDraftSet(db: DbExecutor, galleryId: number, actorId: number): Promise<void>;
    nextSortOrder(db: DbExecutor, galleryId: number): Promise<number>;
    hasDraftThumbnail(db: DbExecutor, galleryId: number): Promise<boolean>;
    galleriesOfPartners(db: DbExecutor, partnerIds: readonly number[]): Promise<GalleryRow[]>;
    deleteGalleries(db: DbExecutor, galleryIds: readonly number[]): Promise<number>;
}
