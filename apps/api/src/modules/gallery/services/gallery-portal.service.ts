import { ClientApp } from '../../../core/context';
import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import { ParkStatus } from '../../park';
import type { IPartnerService, PartnerRef } from '../../partner';
import { type IUsersService, MetaRole } from '../../users';
import type { IGalleryPortalService } from '../contracts/gallery-portal-service.contract';
import type { IGalleryRepository, PhotoPlacement } from '../contracts/gallery-repository.contract';
import type {
    DeletedDraft,
    GalleryDetailDto,
    GalleryDraft,
    GalleryPhotoFile,
    GalleryTabList,
    IncomingPhoto,
    NewGallery,
} from '../dto/gallery.dto';
import { toListItem } from '../mappers/gallery.mapper';
import {
    GalleryPhotoSet,
    type GalleryPhotoRow,
    type GalleryRow,
    GalleryStatus,
    type GalleryTabKey,
    IN_USE_STATUSES,
} from '../types/gallery.types';
import { GALLERY_MESSAGES } from '../validators/gallery.validators';
import {
    fieldError,
    galleryNotFound,
    type GalleryRecords,
    notDraft,
    notWaiting,
    photoNotFound,
} from './gallery-records';

const notActivePartner = (): ForbiddenException =>
    new ForbiddenException(GALLERY_MESSAGES.NOT_ACTIVE_PARTNER, 'GALLERY_PARTNER_NOT_ACTIVE');

const notApproved = (): ConflictException => new ConflictException(GALLERY_MESSAGES.NOT_APPROVED, 'GALLERY_NOT_APPROVED');

const thumbnailLocked = (): ConflictException =>
    new ConflictException(GALLERY_MESSAGES.THUMBNAIL_REMOVE, 'GALLERY_THUMBNAIL_REMOVE');

const draftPhotosOf = (photos: readonly GalleryPhotoRow[]): GalleryPhotoRow[] =>
    photos.filter((photo) => photo.photo_set === GalleryPhotoSet.DRAFT);

const ACTIONS = {
    created: { done: AuditAction.GALLERY_CREATED, failed: AuditAction.GALLERY_CREATE_FAILED },
    saved: { done: AuditAction.GALLERY_SAVED, failed: AuditAction.GALLERY_SAVE_FAILED },
    photosAdded: { done: AuditAction.GALLERY_PHOTOS_ADDED, failed: AuditAction.GALLERY_PHOTOS_ADD_FAILED },
    photoReplaced: { done: AuditAction.GALLERY_PHOTO_REPLACED, failed: AuditAction.GALLERY_PHOTO_REPLACE_FAILED },
    photoRemoved: { done: AuditAction.GALLERY_PHOTO_REMOVED, failed: AuditAction.GALLERY_PHOTO_REMOVE_FAILED },
    sent: { done: AuditAction.GALLERY_SENT, failed: AuditAction.GALLERY_SEND_FAILED },
    movedBack: { done: AuditAction.GALLERY_MOVED_BACK, failed: AuditAction.GALLERY_MOVE_BACK_FAILED },
    editStarted: { done: AuditAction.GALLERY_EDIT_STARTED, failed: AuditAction.GALLERY_EDIT_START_FAILED },
    draftDeleted: { done: AuditAction.GALLERY_DRAFT_DELETED, failed: AuditAction.GALLERY_DRAFT_DELETE_FAILED },
} as const;

export class GalleryPortalService implements IGalleryPortalService {
    constructor(
        private readonly db: Database,
        private readonly repository: IGalleryRepository,
        private readonly records: GalleryRecords,
        private readonly partnerService: IPartnerService,
        private readonly usersService: IUsersService,
        private readonly notificationService: INotificationService,
    ) {}

    async list(userId: number, tab: GalleryTabKey): Promise<GalleryTabList> {
        const partner = await this.activePartner(userId);
        const [rows, counts] = await Promise.all([
            this.repository.listOfPartner(this.db, partner.id, tab),
            this.repository.tabCountsOfPartner(this.db, partner.id),
        ]);
        return { tab, items: rows.map(toListItem), counts };
    }

    async detail(userId: number, id: number): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        await this.ownRow(partner, id);
        return this.records.detail(id);
    }

    async create(userId: number, gallery: NewGallery): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS.created, undefined, { ...gallery }, async () => {
            await this.checkPark(partner, gallery.masterParkId);
            const id = await this.repository.insert(this.db, partner.id, gallery.masterParkId, gallery.title, userId);
            return {
                result: await this.records.detail(id),
                id,
                changes: { title: gallery.title, masterParkId: gallery.masterParkId, status: GalleryStatus.DRAFT },
            };
        });
    }

    async saveDraft(userId: number, id: number, draft: GalleryDraft): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        const input = { title: draft.title, masterParkId: draft.masterParkId, photoIds: draft.photos.map((photo) => photo.id) };
        return this.records.audited(ACTIONS.saved, id, input, async () => {
            const before = await this.draftRow(partner, id);
            await this.checkPark(partner, draft.masterParkId);
            const current = draftPhotosOf(await this.repository.photosOf(this.db, id));
            const currentIds = new Set(current.map((photo) => photo.id));
            if (draft.photos.some((photo) => !currentIds.has(photo.id))) {
                throw fieldError('photos', GALLERY_MESSAGES.PHOTO_NOT_FOUND, 'GALLERY_PHOTO_NOT_FOUND');
            }
            if (current.length > 0 && draft.photos.length === 0) throw thumbnailLocked();
            const thumbnailId = this.thumbnailOf(draft);
            if (!(await this.repository.updateDraft(this.db, id, draft.title, draft.masterParkId, userId))) throw notDraft();
            const placements: PhotoPlacement[] = draft.photos.map((photo, index) => ({
                ...photo,
                sortOrder: index,
                isThumbnail: photo.id === thumbnailId,
            }));
            await this.repository.placePhotos(this.db, id, placements, userId);
            const keptIds = new Set(draft.photos.map((photo) => photo.id));
            const removedIds = current.filter((photo) => !keptIds.has(photo.id)).map((photo) => photo.id);
            await this.repository.removeDraftPhotos(this.db, id, removedIds, userId);
            return {
                result: await this.records.detail(id),
                id,
                changes: {
                    title: { from: before.title, to: draft.title },
                    masterParkId: { from: before.master_park_id, to: draft.masterParkId },
                    photoIds: { from: current.map((photo) => photo.id), to: draft.photos.map((photo) => photo.id) },
                    thumbnailPhotoId: thumbnailId,
                },
            };
        });
    }

    async addPhotos(userId: number, id: number, photos: readonly IncomingPhoto[]): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        const input = { files: photos.map((photo) => photo.originalName) };
        const stored = await this.records.refusalAudited(ACTIONS.photosAdded, id, input, async () => {
            await this.draftRow(partner, id);
            return this.records.storePhotos(id, photos, 'photos');
        });
        const fileNames = stored.map((photo) => photo.fileName);
        return this.records.audited(
            ACTIONS.photosAdded,
            id,
            input,
            async () => {
                await this.draftRow(partner, id);
                const firstOrder = await this.repository.nextSortOrder(this.db, id);
                const needsThumbnail = !(await this.repository.hasDraftThumbnail(this.db, id));
                await this.repository.insertPhotos(
                    this.db,
                    id,
                    GalleryPhotoSet.DRAFT,
                    fileNames.map((fileName, index) => ({
                        fileName,
                        title: null,
                        caption: null,
                        sortOrder: firstOrder + index,
                        isThumbnail: needsThumbnail && index === 0,
                    })),
                    userId,
                );
                return { result: await this.records.detail(id), id, changes: { added: fileNames } };
            },
            () => this.records.discardFiles(id, fileNames),
        );
    }

    async replacePhoto(userId: number, id: number, photoId: number, photo: IncomingPhoto): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        const input = { photoId, file: photo.originalName };
        const [stored] = await this.records.refusalAudited(ACTIONS.photoReplaced, id, input, async () => {
            this.draftPhoto(await this.records.photoOf(await this.draftRow(partner, id), photoId));
            return this.records.storePhotos(id, [photo], 'photo');
        });
        const fileName = stored?.fileName ?? '';
        return this.records.audited(
            ACTIONS.photoReplaced,
            id,
            input,
            async () => {
                const current = this.draftPhoto(await this.records.photoOf(await this.draftRow(partner, id), photoId));
                if (!(await this.repository.replacePhotoFile(this.db, id, photoId, fileName, userId))) throw photoNotFound();
                return {
                    result: await this.records.detail(id),
                    id,
                    changes: { photoId, fileName: { from: current.file_name, to: fileName } },
                };
            },
            () => this.records.discardFiles(id, [fileName]),
        );
    }

    async removePhoto(userId: number, id: number, photoId: number): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS.photoRemoved, id, { photoId }, async () => {
            const photo = this.draftPhoto(await this.records.photoOf(await this.draftRow(partner, id), photoId));
            if (photo.is_thumbnail === 1) throw thumbnailLocked();
            if ((await this.repository.removeDraftPhotos(this.db, id, [photoId], userId)) === 0) throw photoNotFound();
            return { result: await this.records.detail(id), id, changes: { removed: photoId, fileName: photo.file_name } };
        });
    }

    async send(userId: number, id: number): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS.sent, id, {}, async () => {
            const row = await this.draftRow(partner, id);
            if (draftPhotosOf(await this.repository.photosOf(this.db, id)).length === 0) {
                throw fieldError('photos', GALLERY_MESSAGES.PHOTOS_NONE, 'GALLERY_PHOTOS_REQUIRED');
            }
            if (!(await this.repository.send(this.db, id, userId))) throw notDraft();
            await this.notifySuperAdmins(row, partner, userId);
            return {
                result: await this.records.detail(id),
                id,
                changes: { status: { from: GalleryStatus.DRAFT, to: GalleryStatus.WAITING } },
            };
        });
    }

    async moveBack(userId: number, id: number): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS.movedBack, id, {}, async () => {
            const row = await this.ownRow(partner, id);
            if (row.status !== GalleryStatus.WAITING || !(await this.repository.moveBack(this.db, id, userId))) {
                throw notWaiting();
            }
            return {
                result: await this.records.detail(id),
                id,
                changes: { status: { from: GalleryStatus.WAITING, to: GalleryStatus.DRAFT } },
            };
        });
    }

    async startEdit(userId: number, id: number): Promise<GalleryDetailDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS.editStarted, id, {}, async () => {
            const row = await this.ownRow(partner, id);
            if (row.status !== GalleryStatus.APPROVED || row.has_approved_set !== 1) throw notApproved();
            if (!(await this.repository.startEdit(this.db, id, userId))) throw notApproved();
            await this.repository.removeSet(this.db, id, GalleryPhotoSet.DRAFT, userId);
            await this.repository.copyApprovedToDraft(this.db, id, userId);
            return {
                result: await this.records.detail(id),
                id,
                changes: { status: { from: GalleryStatus.APPROVED, to: GalleryStatus.DRAFT } },
            };
        });
    }

    async deleteDraft(userId: number, id: number): Promise<DeletedDraft> {
        const partner = await this.activePartner(userId);
        return this.records.audited<DeletedDraft>(ACTIONS.draftDeleted, id, {}, async () => {
            const row = await this.draftRow(partner, id);
            if (row.has_approved_set === 1) {
                if (!(await this.repository.restoreApproved(this.db, id, userId))) throw notDraft();
                await this.repository.removeSet(this.db, id, GalleryPhotoSet.DRAFT, userId);
                return {
                    result: { gallery: await this.records.detail(id), restoredApproved: true },
                    id,
                    changes: {
                        status: { from: GalleryStatus.DRAFT, to: GalleryStatus.APPROVED },
                        title: { from: row.title, to: row.approved_title ?? row.title },
                    },
                };
            }
            if (!(await this.repository.discard(this.db, id, userId))) throw notDraft();
            return {
                result: { gallery: null, restoredApproved: false },
                id,
                changes: { status: { from: GalleryStatus.DRAFT, to: GalleryStatus.DISCARDED } },
            };
        });
    }

    async photoFile(userId: number, id: number, photoId: number): Promise<GalleryPhotoFile> {
        const partner = await this.activePartner(userId);
        const photo = await this.records.photoOf(await this.ownRow(partner, id), photoId);
        return this.records.readPhoto(id, photo.file_name);
    }

    private async activePartner(userId: number): Promise<PartnerRef> {
        const partner = await this.partnerService.activePartnerOf(userId);
        if (!partner) throw notActivePartner();
        return partner;
    }

    private async ownRow(partner: PartnerRef, id: number): Promise<GalleryRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row || row.partner_id !== partner.id || !IN_USE_STATUSES.includes(row.status)) throw galleryNotFound();
        return row;
    }

    private async draftRow(partner: PartnerRef, id: number): Promise<GalleryRow> {
        const row = await this.ownRow(partner, id);
        if (row.status !== GalleryStatus.DRAFT) throw notDraft();
        return row;
    }

    private draftPhoto(photo: GalleryPhotoRow): GalleryPhotoRow {
        if (photo.photo_set !== GalleryPhotoSet.DRAFT) throw photoNotFound();
        return photo;
    }

    private async checkPark(partner: PartnerRef, masterParkId: number): Promise<void> {
        const parks = await this.partnerService.parksOf(partner.id);
        if (!parks.some((park) => park.id === masterParkId && park.status === ParkStatus.ACTIVE)) {
            throw fieldError('masterParkId', GALLERY_MESSAGES.PARK_NOT_AVAILABLE, 'GALLERY_PARK_NOT_AVAILABLE');
        }
    }

    private thumbnailOf(draft: GalleryDraft): number | null {
        const first = draft.photos[0];
        if (!first) return null;
        const chosen = draft.thumbnailPhotoId ?? first.id;
        if (!draft.photos.some((photo) => photo.id === chosen)) {
            throw fieldError('thumbnailPhotoId', GALLERY_MESSAGES.THUMBNAIL_NOT_LISTED, 'GALLERY_THUMBNAIL_NOT_LISTED');
        }
        return chosen;
    }

    private async notifySuperAdmins(row: GalleryRow, partner: PartnerRef, actorId: number): Promise<void> {
        const superAdminIds = await this.usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN);
        await this.notificationService.notify(
            superAdminIds.map((superAdminId) => ({
                userId: superAdminId,
                notificationKind: NotificationKind.GALLERY_SENT,
                entityType: AuditEntity.GALLERY,
                entityId: row.id,
                clientApp: ClientApp.MANAGE,
                ownerType: null,
                ownerId: null,
                title: row.title,
                excerpt: null,
                actorId,
                actorName: partner.businessName,
            })),
        );
    }
}
