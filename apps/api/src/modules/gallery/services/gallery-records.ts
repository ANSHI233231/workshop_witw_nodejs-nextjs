import { randomBytes } from 'node:crypto';

import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import { logger } from '../../../core/logger';
import { detectImageType, imageContentTypeOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { type IFileStorage, StoredFileNotFoundError } from '../../../infrastructure/storage';
import { type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IGalleryRepository } from '../contracts/gallery-repository.contract';
import type { GalleryDetailDto, GalleryPhotoFile, IncomingPhoto } from '../dto/gallery.dto';
import { toDetail } from '../mappers/gallery.mapper';
import { GALLERY_FOLDER, type GalleryPhotoRow, type GalleryRow, PHOTO_CONTENT_TYPES } from '../types/gallery.types';
import { GALLERY_MESSAGES } from '../validators/gallery.validators';

const RANDOM_BYTES = 8;

const log = logger.category('gallery');

export type Done<T> = {
    readonly result: T;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

export type StoredPhoto = { readonly fileName: string; readonly originalName: string };

export const fieldError = (field: string, message: string, code: string): ValidationException =>
    new ValidationException(message, [{ field, message }], code);

export const galleryNotFound = (): NotFoundException => new NotFoundException(GALLERY_MESSAGES.NOT_FOUND, 'GALLERY_NOT_FOUND');

export const photoNotFound = (): NotFoundException =>
    new NotFoundException(GALLERY_MESSAGES.PHOTO_NOT_FOUND, 'GALLERY_PHOTO_NOT_FOUND');

export const notDraft = (): ConflictException => new ConflictException(GALLERY_MESSAGES.NOT_DRAFT, 'GALLERY_NOT_DRAFT');

export const notWaiting = (): ConflictException => new ConflictException(GALLERY_MESSAGES.NOT_WAITING, 'GALLERY_NOT_WAITING');

export const photoPath = (galleryId: number, fileName: string): string => `${GALLERY_FOLDER}/${galleryId}/${fileName}`;

const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

export class GalleryRecords {
    constructor(
        private readonly db: Database,
        private readonly repository: IGalleryRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
    ) {}

    async detail(id: number): Promise<GalleryDetailDto> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw galleryNotFound();
        return toDetail(row, await this.repository.photosOf(this.db, id));
    }

    async audited<T>(
        actions: AuditPair,
        id: number | undefined,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<Done<T>>,
        afterFailure: () => Promise<void> = () => Promise.resolve(),
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action: actions.done,
                    entityType: AuditEntity.GALLERY,
                    entityId: done.id,
                    changes: done.changes,
                });
                return done.result;
            });
        } catch (error) {
            await afterFailure();
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.GALLERY, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }

    async refusalAudited<T>(
        actions: AuditPair,
        id: number,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<T>,
    ): Promise<T> {
        try {
            return await work();
        } catch (error) {
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.GALLERY, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }

    checkPhotoTypes(photos: readonly IncomingPhoto[], field: string): void {
        if (photos.length === 0) throw fieldError(field, GALLERY_MESSAGES.PHOTO_MISSING, 'GALLERY_PHOTO_MISSING');
        const wrong = photos.some((photo) => {
            const type = detectImageType(photo.content);
            return !type || !PHOTO_CONTENT_TYPES.includes(type.contentType);
        });
        if (wrong) throw fieldError(field, GALLERY_MESSAGES.PHOTO_TYPE, 'GALLERY_PHOTO_TYPE');
    }

    async storePhotos(galleryId: number, photos: readonly IncomingPhoto[], field: string): Promise<StoredPhoto[]> {
        this.checkPhotoTypes(photos, field);
        const stored: StoredPhoto[] = [];
        try {
            for (const photo of photos) {
                const type = detectImageType(photo.content);
                const fileName = newFileName(type?.extension ?? 'jpg');
                await this.fileStorage.save(photoPath(galleryId, fileName), photo.content);
                stored.push({ fileName, originalName: photo.originalName });
            }
            return stored;
        } catch (error) {
            await this.discardFiles(
                galleryId,
                stored.map((photo) => photo.fileName),
            );
            throw error;
        }
    }

    async discardFiles(galleryId: number, fileNames: readonly string[]): Promise<void> {
        await Promise.all(
            fileNames.map((fileName) =>
                this.fileStorage.remove(photoPath(galleryId, fileName)).catch((error: unknown) => {
                    log.warn('An unused gallery photo file could not be removed', { galleryId, fileName, error });
                }),
            ),
        );
    }

    async readPhoto(galleryId: number, fileName: string): Promise<GalleryPhotoFile> {
        try {
            const content = await this.fileStorage.read(photoPath(galleryId, fileName));
            return { content, contentType: imageContentTypeOf(fileName) ?? 'application/octet-stream' };
        } catch (error) {
            if (error instanceof StoredFileNotFoundError) throw photoNotFound();
            throw error;
        }
    }

    async photoOf(row: GalleryRow, photoId: number): Promise<GalleryPhotoRow> {
        const photo = (await this.repository.photosOf(this.db, row.id)).find((candidate) => candidate.id === photoId);
        if (!photo) throw photoNotFound();
        return photo;
    }
}
