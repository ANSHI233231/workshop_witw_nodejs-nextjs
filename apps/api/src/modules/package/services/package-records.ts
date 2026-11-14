import { randomBytes } from 'node:crypto';

import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import { logger } from '../../../core/logger';
import { detectImageType, imageContentTypeOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { type IFileStorage, StoredFileNotFoundError } from '../../../infrastructure/storage';
import { type AuditActionCode, AuditEntity, type AuditEntityCode, type IAuditService } from '../../audit';
import type { IncomingImage, PackageFile, PackageSummaryDto, VersionDetailDto } from '../dto/package.dto';
import { type MainParks, toMainParks, toSummary, toVersionDetail, type VersionChildren } from '../mappers/package.mapper';
import type { PackageRepository } from '../repositories/package.repository';
import {
    IMAGE_CONTENT_TYPES,
    PACKAGE_FOLDER,
    PackageRowStatus,
    type PackageRow,
    PackageWebsiteStatus,
    type PortalActionKey,
    type VersionRow,
} from '../types/package.types';
import { PACKAGE_MESSAGES } from '../validators/package.validators';
import { partnerIsActive } from './package-rules';

const RANDOM_BYTES = 8;

const log = logger.category('package');

export type Done<T> = {
    readonly result: T;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

export const fieldError = (field: string, message: string, code: string): ValidationException =>
    new ValidationException(message, [{ field, message }], code);

export const packageNotFound = (): NotFoundException => new NotFoundException(PACKAGE_MESSAGES.NOT_FOUND, 'PACKAGE_NOT_FOUND');

export const versionNotFound = (): NotFoundException =>
    new NotFoundException(PACKAGE_MESSAGES.VERSION_NOT_FOUND, 'PACKAGE_VERSION_NOT_FOUND');

export const fileNotFound = (): NotFoundException => new NotFoundException(PACKAGE_MESSAGES.FILE_NOT_FOUND, 'PACKAGE_FILE_NOT_FOUND');

export const notEditable = (): ConflictException =>
    new ConflictException(PACKAGE_MESSAGES.NOT_EDITABLE, 'PACKAGE_VERSION_NOT_EDITABLE');

export const packageDeleted = (): ConflictException =>
    new ConflictException(PACKAGE_MESSAGES.PACKAGE_DELETED, 'PACKAGE_DELETED');

export const filePath = (packageId: number, versionNumber: number, fileName: string): string =>
    `${PACKAGE_FOLDER}/${packageId}/${versionNumber}/${fileName}`;

export const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

export const filesOfVersion = (row: VersionRow, children: VersionChildren): Set<string> => {
    const names = new Set<string>();
    if (row.package_image) names.add(row.package_image);
    if (row.banner_image) names.add(row.banner_image);
    for (const day of children.days) if (day.day_image) names.add(day.day_image);
    for (const photo of children.photos) if (photo.status === PackageRowStatus.ACTIVE) names.add(photo.file_name);
    return names;
};

export class PackageRecords {
    constructor(
        readonly db: Database,
        readonly repository: PackageRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
    ) {}

    async audited<T>(
        actions: AuditPair,
        id: number | undefined,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<Done<T>>,
        afterFailure: () => Promise<void> = () => Promise.resolve(),
        entityType: AuditEntityCode = AuditEntity.PACKAGE,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({ action: actions.done, entityType, entityId: done.id, changes: done.changes });
                return done.result;
            });
        } catch (error) {
            await afterFailure();
            await this.auditService.recordFailure(
                { action: actions.failed, entityType, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }

    async packageRow(id: number): Promise<PackageRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row || row.website_status === PackageWebsiteStatus.DISCARDED) throw packageNotFound();
        return row;
    }

    async versionRow(packageId: number, versionId: number): Promise<VersionRow> {
        const row = await this.repository.findVersion(this.db, packageId, versionId);
        if (!row) throw versionNotFound();
        return row;
    }

    async children(versionId: number): Promise<VersionChildren> {
        const [parks, features, inclusions, days, faqs, photos] = await Promise.all([
            this.repository.parksOf(this.db, [versionId]),
            this.repository.featuresOf(this.db, [versionId]),
            this.repository.inclusionsOf(this.db, [versionId]),
            this.repository.daysOf(this.db, versionId),
            this.repository.faqsOf(this.db, versionId),
            this.repository.photosOf(this.db, versionId),
        ]);
        return { parks, features, inclusions, days, faqs, photos };
    }

    async mainParksOf(versionIds: readonly (number | null)[]): Promise<MainParks> {
        const ids = [...new Set(versionIds.filter((id): id is number => id !== null))];
        return toMainParks(await this.repository.parksOf(this.db, ids));
    }

    async versionDetail(row: VersionRow, canEdit: boolean): Promise<VersionDetailDto> {
        return toVersionDetail(row, await this.children(row.id), canEdit);
    }

    async summary(row: PackageRow, actions: readonly PortalActionKey[]): Promise<PackageSummaryDto> {
        return toSummary(row, await this.repository.versionsOf(this.db, row.id), actions, partnerIsActive(row));
    }

    checkImage(image: IncomingImage, field: string): string {
        const type = detectImageType(image.content);
        if (!type || !IMAGE_CONTENT_TYPES.includes(type.contentType)) {
            throw fieldError(field, PACKAGE_MESSAGES.IMAGE_TYPE, 'PACKAGE_IMAGE_TYPE');
        }
        return type.extension;
    }

    async storeImage(packageId: number, versionNumber: number, image: IncomingImage, field: string): Promise<string> {
        const fileName = newFileName(this.checkImage(image, field));
        await this.fileStorage.save(filePath(packageId, versionNumber, fileName), image.content);
        return fileName;
    }

    async saveFile(packageId: number, versionNumber: number, fileName: string, content: Buffer): Promise<void> {
        await this.fileStorage.save(filePath(packageId, versionNumber, fileName), content);
    }

    async copyFiles(packageId: number, fromNumber: number, toNumber: number, fileNames: Iterable<string>): Promise<string[]> {
        const copied: string[] = [];
        try {
            for (const fileName of fileNames) {
                const content = await this.fileStorage.read(filePath(packageId, fromNumber, fileName));
                await this.fileStorage.save(filePath(packageId, toNumber, fileName), content);
                copied.push(fileName);
            }
            return copied;
        } catch (error) {
            await this.discardCopiedVersion(packageId, toNumber, copied);
            throw error;
        }
    }

    async discardFiles(packageId: number, versionNumber: number, fileNames: readonly string[]): Promise<void> {
        await Promise.all(
            fileNames.map((fileName) =>
                this.fileStorage.remove(filePath(packageId, versionNumber, fileName)).catch((error: unknown) => {
                    log.warn('An unused package file could not be removed', { packageId, versionNumber, fileName, error });
                }),
            ),
        );
    }

    async discardUnusedFiles(row: VersionRow, fileNames: readonly string[]): Promise<void> {
        if (fileNames.length === 0) return;
        try {
            const fresh = await this.repository.findVersion(this.db, row.package_id, row.id);
            const used = fresh ? filesOfVersion(fresh, await this.children(fresh.id)) : new Set<string>();
            await this.discardFiles(
                row.package_id,
                row.version_number,
                fileNames.filter((fileName) => !used.has(fileName)),
            );
        } catch (error) {
            log.warn('Package files kept after a failed save', { packageId: row.package_id, versionId: row.id, error });
        }
    }

    async discardCopiedVersion(packageId: number, versionNumber: number, fileNames: readonly string[]): Promise<void> {
        try {
            if ((await this.repository.nextVersionNumber(this.db, packageId)) > versionNumber) return;
            await this.discardFiles(packageId, versionNumber, fileNames);
        } catch (error) {
            log.warn('Package files kept after a failed edit start', { packageId, versionNumber, error });
        }
    }

    async readVersionFile(row: VersionRow, fileName: string): Promise<PackageFile> {
        const children = await this.children(row.id);
        if (!filesOfVersion(row, children).has(fileName)) throw fileNotFound();
        try {
            const content = await this.fileStorage.read(filePath(row.package_id, row.version_number, fileName));
            return { content, contentType: imageContentTypeOf(fileName) ?? 'application/octet-stream' };
        } catch (error) {
            if (error instanceof StoredFileNotFoundError) throw fileNotFound();
            throw error;
        }
    }
}
