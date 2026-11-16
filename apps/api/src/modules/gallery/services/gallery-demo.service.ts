import { randomBytes } from 'node:crypto';

import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IGalleryDemoService } from '../contracts/gallery-demo-service.contract';
import type { IGalleryRepository, NewPhotoRow } from '../contracts/gallery-repository.contract';
import type { DemoGallery, DemoGalleryOutcome, DemoGalleryPhoto, DemoGalleryRef } from '../dto/gallery-demo.dto';
import { GALLERY_FOLDER, GalleryPhotoSet } from '../types/gallery.types';
import { photoPath } from './gallery-records';

const RANDOM_BYTES = 8;

type PendingFile = { readonly galleryId: number; readonly fileName: string; readonly content: Buffer };

const fileNameOf = (picture: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${picture.slice(picture.lastIndexOf('.') + 1)}`;

export class GalleryDemoService implements IGalleryDemoService {
    constructor(
        private readonly db: Database,
        private readonly repository: IGalleryRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async existing(galleries: readonly DemoGallery[]): Promise<readonly string[]> {
        this.refuseInProduction();
        const found: string[] = [];
        for (const gallery of galleries) {
            if (await this.repository.findByPartnerAndTitle(this.db, gallery.partnerId, gallery.title)) found.push(gallery.title);
        }
        return found;
    }

    async add(
        galleries: readonly DemoGallery[],
        pictures: ReadonlyMap<string, Buffer>,
        adminId: number | null,
    ): Promise<DemoGalleryOutcome[]> {
        this.refuseInProduction();
        const event = { action: AuditAction.GALLERY_DEMO_ADDED, entityType: AuditEntity.GALLERY } as const;
        const pending: PendingFile[] = [];
        try {
            const outcomes = await this.db.transaction(async () => {
                const done: DemoGalleryOutcome[] = [];
                for (const gallery of galleries) done.push(await this.addGallery(gallery, pictures, adminId, pending));
                const created = done.filter((outcome) => outcome.created);
                if (created.length > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { created: created.map((outcome) => ({ id: outcome.galleryId, title: outcome.title })) },
                    });
                }
                return done;
            });
            for (const file of pending) await this.fileStorage.save(photoPath(file.galleryId, file.fileName), file.content);
            return outcomes;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.GALLERY_DEMO_ADD_FAILED }, error);
            throw error;
        }
    }

    async galleryIdsOf(partnerIds: readonly number[]): Promise<DemoGalleryRef[]> {
        this.refuseInProduction();
        const rows = await this.repository.galleriesOfPartners(this.db, partnerIds);
        return rows
            .filter((row) => row.has_approved_set === 1)
            .map((row) => ({ galleryId: row.id, partnerId: row.partner_id, title: row.approved_title ?? row.title }));
    }

    async remove(partnerIds: readonly number[], write: boolean): Promise<number> {
        this.refuseInProduction();
        const rows = await this.repository.galleriesOfPartners(this.db, partnerIds);
        if (!write || rows.length === 0) return rows.length;
        const galleryIds = rows.map((row) => row.id);
        const event = { action: AuditAction.GALLERY_DEMO_REMOVED, entityType: AuditEntity.GALLERY } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const count = await this.repository.deleteGalleries(this.db, galleryIds);
                await this.auditService.record({
                    ...event,
                    details: { removed: rows.map((row) => ({ id: row.id, partnerId: row.partner_id, title: row.title })) },
                });
                return count;
            });
            for (const id of galleryIds) await this.fileStorage.removeFolder(`${GALLERY_FOLDER}/${id}`);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.GALLERY_DEMO_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async addGallery(
        gallery: DemoGallery,
        pictures: ReadonlyMap<string, Buffer>,
        adminId: number | null,
        pending: PendingFile[],
    ): Promise<DemoGalleryOutcome> {
        const existing = await this.repository.findByPartnerAndTitle(this.db, gallery.partnerId, gallery.title);
        if (existing) return { title: gallery.title, galleryId: existing.id, created: false };
        const galleryId = await this.repository.insertDemo(this.db, gallery, adminId);
        const fileOf = new Map<string, string>();
        const rowsOf = (photos: readonly DemoGalleryPhoto[]): NewPhotoRow[] =>
            photos.flatMap((photo, index) => {
                const content = pictures.get(photo.picture);
                if (!content) return [];
                let fileName = fileOf.get(photo.picture);
                if (!fileName) {
                    fileName = fileNameOf(photo.picture);
                    fileOf.set(photo.picture, fileName);
                    pending.push({ galleryId, fileName, content });
                }
                return [{ fileName, title: photo.title, caption: photo.caption, sortOrder: index, isThumbnail: index === 0 }];
            });
        if (gallery.approvedPhotos) {
            await this.repository.insertPhotos(
                this.db,
                galleryId,
                GalleryPhotoSet.APPROVED,
                rowsOf(gallery.approvedPhotos),
                gallery.userId,
            );
        }
        if (gallery.draftPhotos) {
            await this.repository.insertPhotos(this.db, galleryId, GalleryPhotoSet.DRAFT, rowsOf(gallery.draftPhotos), gallery.userId);
        }
        return { title: gallery.title, galleryId, created: true };
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Demo data is never written in production.', 'DEMO_NOT_ALLOWED');
        }
    }
}
