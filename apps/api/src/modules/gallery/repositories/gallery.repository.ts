import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type {
    ConsoleListScope,
    IGalleryRepository,
    NewPhotoRow,
    PhotoPlacement,
} from '../contracts/gallery-repository.contract';
import type { DemoGallery } from '../dto/gallery-demo.dto';
import type { GalleryTabCounts } from '../dto/gallery.dto';
import { GallerySQL, type GalleryListWhere } from '../sql/gallery.sql';
import {
    type CountRow,
    type GalleryListRow,
    GalleryPhotoSet,
    type GalleryPhotoSetCode,
    GalleryPhotoStatus,
    type GalleryPhotoRow,
    type GalleryRow,
    GalleryStatus,
    type GalleryStatusCode,
    GalleryTab,
    type GalleryTabCountRow,
    type GalleryTabKey,
    IN_USE_STATUSES,
    type PhotoFileRow,
} from '../types/gallery.types';

const ACTIVE = GalleryPhotoStatus.ACTIVE;

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const summaryValues = (set: GalleryPhotoSetCode): unknown[] => [set, ACTIVE, set, ACTIVE, set, ACTIVE];

type TabShape = { readonly where: GalleryListWhere; readonly statuses: readonly GalleryStatusCode[]; readonly set: GalleryPhotoSetCode };

const TAB_SHAPES: Readonly<Record<GalleryTabKey, TabShape>> = {
    [GalleryTab.APPROVED]: { where: 'approved', statuses: IN_USE_STATUSES, set: GalleryPhotoSet.APPROVED },
    [GalleryTab.DRAFT]: { where: 'status', statuses: [GalleryStatus.DRAFT], set: GalleryPhotoSet.DRAFT },
    [GalleryTab.WAITING]: { where: 'status', statuses: [GalleryStatus.WAITING], set: GalleryPhotoSet.DRAFT },
};

const consoleShapeOf = (scope: ConsoleListScope): TabShape =>
    scope.list === 'approved' ? TAB_SHAPES[GalleryTab.APPROVED] : TAB_SHAPES[GalleryTab.WAITING];

const searchValues = (search: string | undefined): unknown[] =>
    search === undefined ? [] : [likeAnywhere(search), likeAnywhere(search), likeAnywhere(search)];

const asCount = (value: number | string | null): number => Number(value ?? 0);

export class GalleryRepository implements IGalleryRepository {
    async listOfPartner(db: DbExecutor, partnerId: number, tab: GalleryTabKey): Promise<GalleryListRow[]> {
        const shape = TAB_SHAPES[tab];
        return db.query<GalleryListRow>(GallerySQL.listOfPartner(shape.where, shape.statuses.length), [
            ...summaryValues(shape.set),
            ...shape.statuses,
            partnerId,
        ]);
    }

    async tabCountsOfPartner(db: DbExecutor, partnerId: number): Promise<GalleryTabCounts> {
        const rows = await db.query<GalleryTabCountRow>(GallerySQL.tabCountsOfPartner(IN_USE_STATUSES.length), [
            GalleryStatus.DRAFT,
            GalleryStatus.WAITING,
            partnerId,
            ...IN_USE_STATUSES,
        ]);
        const row = rows[0];
        return {
            approved: asCount(row?.approved ?? null),
            draft: asCount(row?.draft ?? null),
            waiting: asCount(row?.waiting ?? null),
        };
    }

    async approvedOfPartner(db: DbExecutor, partnerId: number): Promise<GalleryListRow[]> {
        return this.listOfPartner(db, partnerId, GalleryTab.APPROVED);
    }

    async listForConsole(db: DbExecutor, scope: ConsoleListScope, pagination: PaginationQuery): Promise<GalleryListRow[]> {
        const shape = consoleShapeOf(scope);
        return db.query<GalleryListRow>(
            GallerySQL.listForConsole(shape.where, shape.statuses.length, scope.search !== undefined),
            [...summaryValues(shape.set), ...shape.statuses, ...searchValues(scope.search), pagination.limit, toOffset(pagination)],
        );
    }

    async countForConsole(db: DbExecutor, scope: ConsoleListScope): Promise<number> {
        const shape = consoleShapeOf(scope);
        const rows = await db.query<CountRow>(
            GallerySQL.countForConsole(shape.where, shape.statuses.length, scope.search !== undefined),
            [...shape.statuses, ...searchValues(scope.search)],
        );
        return Number(rows[0]?.total ?? 0);
    }

    async findById(db: DbExecutor, id: number): Promise<GalleryRow | undefined> {
        return (await db.query<GalleryRow>(GallerySQL.findById, [id]))[0];
    }

    async findByPartnerAndTitle(db: DbExecutor, partnerId: number, title: string): Promise<GalleryRow | undefined> {
        return (await db.query<GalleryRow>(GallerySQL.findByPartnerAndTitle, [partnerId, title, GalleryStatus.DISCARDED]))[0];
    }

    async photosOf(db: DbExecutor, galleryId: number): Promise<GalleryPhotoRow[]> {
        return db.query<GalleryPhotoRow>(GallerySQL.photosOf, [galleryId, ACTIVE]);
    }

    async insert(db: DbExecutor, partnerId: number, masterParkId: number, title: string, actorId: number): Promise<number> {
        const result = await db.execute(GallerySQL.insert, [
            partnerId,
            masterParkId,
            title,
            GalleryStatus.DRAFT,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async insertDemo(db: DbExecutor, gallery: DemoGallery, decidedBy: number | null): Promise<number> {
        const hasApprovedSet = gallery.approvedPhotos !== null;
        const result = await db.execute(GallerySQL.insertDemo, [
            gallery.partnerId,
            gallery.masterParkId,
            gallery.title,
            hasApprovedSet ? gallery.title : null,
            hasApprovedSet ? 1 : 0,
            gallery.rejectReason,
            gallery.sentAt,
            gallery.decidedAt,
            gallery.decidedAt === null ? null : decidedBy,
            gallery.status,
            gallery.sentAt ?? new Date(),
            gallery.userId,
            gallery.userId,
        ]);
        return result.insertId;
    }

    async updateDraft(db: DbExecutor, id: number, title: string, masterParkId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.updateDraft, [title, masterParkId, actorId, id, GalleryStatus.DRAFT]);
        return result.affectedRows > 0;
    }

    async send(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.send, [GalleryStatus.WAITING, actorId, id, GalleryStatus.DRAFT]);
        return result.affectedRows > 0;
    }

    async moveBack(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.moveBack, [GalleryStatus.DRAFT, actorId, id, GalleryStatus.WAITING]);
        return result.affectedRows > 0;
    }

    async startEdit(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.startEdit, [GalleryStatus.DRAFT, actorId, id, GalleryStatus.APPROVED]);
        return result.affectedRows > 0;
    }

    async restoreApproved(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.restoreApproved, [
            GalleryStatus.APPROVED,
            actorId,
            id,
            GalleryStatus.DRAFT,
        ]);
        return result.affectedRows > 0;
    }

    async discard(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.discard, [
            GalleryStatus.DISCARDED,
            actorId,
            actorId,
            id,
            GalleryStatus.DRAFT,
        ]);
        return result.affectedRows > 0;
    }

    async approve(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.approve, [
            GalleryStatus.APPROVED,
            actorId,
            actorId,
            id,
            GalleryStatus.WAITING,
        ]);
        return result.affectedRows > 0;
    }

    async reject(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.reject, [
            GalleryStatus.DRAFT,
            reason,
            actorId,
            actorId,
            id,
            GalleryStatus.WAITING,
        ]);
        return result.affectedRows > 0;
    }

    async deleteByAdmin(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean> {
        const result = await db.execute(GallerySQL.deleteByAdmin(IN_USE_STATUSES.length), [
            GalleryStatus.DELETED_BY_ADMIN,
            reason,
            actorId,
            actorId,
            id,
            ...IN_USE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async insertPhotos(
        db: DbExecutor,
        galleryId: number,
        set: GalleryPhotoSetCode,
        photos: readonly NewPhotoRow[],
        actorId: number,
    ): Promise<void> {
        for (const photo of photos) {
            await db.execute(GallerySQL.insertPhoto, [
                galleryId,
                set,
                photo.fileName,
                photo.title,
                photo.caption,
                photo.sortOrder,
                photo.isThumbnail ? 1 : 0,
                ACTIVE,
                actorId,
                actorId,
            ]);
        }
    }

    async placePhotos(db: DbExecutor, galleryId: number, photos: readonly PhotoPlacement[], actorId: number): Promise<void> {
        for (const photo of photos) {
            await db.execute(GallerySQL.updatePhoto, [
                photo.title,
                photo.caption,
                photo.sortOrder,
                photo.isThumbnail ? 1 : 0,
                actorId,
                photo.id,
                galleryId,
                GalleryPhotoSet.DRAFT,
                ACTIVE,
            ]);
        }
    }

    async replacePhotoFile(
        db: DbExecutor,
        galleryId: number,
        photoId: number,
        fileName: string,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(GallerySQL.replacePhotoFile, [
            fileName,
            actorId,
            photoId,
            galleryId,
            GalleryPhotoSet.DRAFT,
            ACTIVE,
        ]);
        return result.affectedRows > 0;
    }

    async removeDraftPhotos(
        db: DbExecutor,
        galleryId: number,
        photoIds: readonly number[],
        actorId: number,
    ): Promise<number> {
        if (photoIds.length === 0) return 0;
        const result = await db.execute(GallerySQL.removePhotos(photoIds.length), [
            GalleryPhotoStatus.DELETED,
            actorId,
            galleryId,
            GalleryPhotoSet.DRAFT,
            ACTIVE,
            ...photoIds,
        ]);
        return result.affectedRows;
    }

    async removeSet(db: DbExecutor, galleryId: number, set: GalleryPhotoSetCode, actorId: number): Promise<void> {
        await db.execute(GallerySQL.removeSet, [GalleryPhotoStatus.DELETED, actorId, galleryId, set, ACTIVE]);
    }

    async copyApprovedToDraft(db: DbExecutor, galleryId: number, actorId: number): Promise<void> {
        await db.execute(GallerySQL.copyApprovedToDraft, [
            GalleryPhotoSet.DRAFT,
            actorId,
            actorId,
            galleryId,
            GalleryPhotoSet.APPROVED,
            ACTIVE,
        ]);
    }

    async promoteDraftSet(db: DbExecutor, galleryId: number, actorId: number): Promise<void> {
        await db.execute(GallerySQL.promoteDraftSet, [
            GalleryPhotoSet.APPROVED,
            actorId,
            galleryId,
            GalleryPhotoSet.DRAFT,
            ACTIVE,
        ]);
    }

    async nextSortOrder(db: DbExecutor, galleryId: number): Promise<number> {
        const rows = await db.query<CountRow>(GallerySQL.nextSortOrder, [galleryId, GalleryPhotoSet.DRAFT, ACTIVE]);
        return Number(rows[0]?.total ?? 0);
    }

    async hasDraftThumbnail(db: DbExecutor, galleryId: number): Promise<boolean> {
        const rows = await db.query<CountRow>(GallerySQL.thumbnailCount, [galleryId, GalleryPhotoSet.DRAFT, ACTIVE]);
        return Number(rows[0]?.total ?? 0) > 0;
    }

    async galleriesOfPartners(db: DbExecutor, partnerIds: readonly number[]): Promise<GalleryRow[]> {
        if (partnerIds.length === 0) return [];
        return db.query<GalleryRow>(GallerySQL.galleriesOfPartners(partnerIds.length), [...partnerIds]);
    }

    async photoFilesOf(db: DbExecutor, galleryIds: readonly number[]): Promise<PhotoFileRow[]> {
        if (galleryIds.length === 0) return [];
        return db.query<PhotoFileRow>(GallerySQL.photoFilesOfGalleries(galleryIds.length), [...galleryIds]);
    }

    async deleteGalleries(db: DbExecutor, galleryIds: readonly number[]): Promise<number> {
        if (galleryIds.length === 0) return 0;
        await db.execute(GallerySQL.deletePhotosOfGalleries(galleryIds.length), [...galleryIds]);
        const result = await db.execute(GallerySQL.deleteGalleries(galleryIds.length), [...galleryIds]);
        return result.affectedRows;
    }
}
