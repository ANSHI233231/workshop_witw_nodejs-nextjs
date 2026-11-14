import { ConflictException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction } from '../../audit';
import type { IGalleryConsoleService } from '../contracts/gallery-console-service.contract';
import type { ConsoleListScope, IGalleryRepository } from '../contracts/gallery-repository.contract';
import type { GalleryConsoleFilters, GalleryConsolePage, GalleryDetailDto, GalleryPhotoFile } from '../dto/gallery.dto';
import { toConsoleItem } from '../mappers/gallery.mapper';
import { GalleryPhotoSet, type GalleryRow, GalleryStatus, IN_USE_STATUSES } from '../types/gallery.types';
import { GALLERY_MESSAGES } from '../validators/gallery.validators';
import { galleryNotFound, type GalleryRecords, notWaiting } from './gallery-records';

const notInUse = (): ConflictException => new ConflictException(GALLERY_MESSAGES.NOT_IN_USE, 'GALLERY_NOT_APPROVED');

const ACTIONS = {
    approved: { done: AuditAction.GALLERY_APPROVED, failed: AuditAction.GALLERY_APPROVE_FAILED },
    rejected: { done: AuditAction.GALLERY_REJECTED, failed: AuditAction.GALLERY_REJECT_FAILED },
    deleted: { done: AuditAction.GALLERY_DELETED_BY_ADMIN, failed: AuditAction.GALLERY_DELETE_BY_ADMIN_FAILED },
} as const;

export class GalleryConsoleService implements IGalleryConsoleService {
    constructor(
        private readonly db: Database,
        private readonly repository: IGalleryRepository,
        private readonly records: GalleryRecords,
    ) {}

    listWaiting(filters: GalleryConsoleFilters, pagination: PaginationQuery): Promise<GalleryConsolePage> {
        return this.page({ list: 'waiting', search: filters.search }, pagination);
    }

    listApproved(filters: GalleryConsoleFilters, pagination: PaginationQuery): Promise<GalleryConsolePage> {
        return this.page({ list: 'approved', search: filters.search }, pagination);
    }

    async detail(id: number): Promise<GalleryDetailDto> {
        await this.liveRow(id);
        return this.records.detail(id);
    }

    async approve(id: number, actorId: number): Promise<GalleryDetailDto> {
        return this.records.audited(ACTIONS.approved, id, {}, async () => {
            const before = await this.liveRow(id);
            if (before.status !== GalleryStatus.WAITING || !(await this.repository.approve(this.db, id, actorId))) {
                throw notWaiting();
            }
            await this.repository.removeSet(this.db, id, GalleryPhotoSet.APPROVED, actorId);
            await this.repository.promoteDraftSet(this.db, id, actorId);
            return {
                result: await this.records.detail(id),
                id,
                changes: {
                    status: { from: GalleryStatus.WAITING, to: GalleryStatus.APPROVED },
                    approvedTitle: { from: before.approved_title, to: before.title },
                    editOfApproved: before.has_approved_set === 1,
                },
            };
        });
    }

    async reject(id: number, reason: string, actorId: number): Promise<GalleryDetailDto> {
        return this.records.audited(ACTIONS.rejected, id, { reason }, async () => {
            const before = await this.liveRow(id);
            if (before.status !== GalleryStatus.WAITING || !(await this.repository.reject(this.db, id, reason, actorId))) {
                throw notWaiting();
            }
            return {
                result: await this.records.detail(id),
                id,
                changes: {
                    status: { from: GalleryStatus.WAITING, to: GalleryStatus.DRAFT },
                    rejectReason: { from: before.reject_reason, to: reason },
                },
            };
        });
    }

    async remove(id: number, reason: string, actorId: number): Promise<GalleryDetailDto> {
        return this.records.audited(ACTIONS.deleted, id, { reason }, async () => {
            const before = await this.liveRow(id);
            if (before.has_approved_set !== 1 || !(await this.repository.deleteByAdmin(this.db, id, reason, actorId))) {
                throw notInUse();
            }
            return {
                result: await this.records.detail(id),
                id,
                changes: { status: { from: before.status, to: GalleryStatus.DELETED_BY_ADMIN }, deleteReason: reason },
            };
        });
    }

    async photoFile(id: number, photoId: number): Promise<GalleryPhotoFile> {
        const photo = await this.records.photoOf(await this.liveRow(id), photoId);
        return this.records.readPhoto(id, photo.file_name);
    }

    private async page(scope: ConsoleListScope, pagination: PaginationQuery): Promise<GalleryConsolePage> {
        const [rows, total] = await Promise.all([
            this.repository.listForConsole(this.db, scope, pagination),
            this.repository.countForConsole(this.db, scope),
        ]);
        return { items: rows.map(toConsoleItem), total };
    }

    private async liveRow(id: number): Promise<GalleryRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row || !IN_USE_STATUSES.includes(row.status)) throw galleryNotFound();
        return row;
    }
}
