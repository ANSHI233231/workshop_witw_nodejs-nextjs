import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IGalleryTestDataService } from '../contracts/gallery-test-data-service.contract';
import type { GalleryTestData, GalleryTestDataScope } from '../dto/gallery-test-data.dto';
import type { GalleryTestDataRepository, TestGalleryRow } from '../repositories/gallery-test-data.repository';
import { GALLERY_FOLDER } from '../types/gallery.types';

const galleryLabel = (row: TestGalleryRow): string => `${row.title} (partner ${row.partner_id}, status ${row.status})`;

export class GalleryTestDataService implements IGalleryTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: GalleryTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: GalleryTestDataScope): Promise<GalleryTestData> {
        this.refuseInProduction();
        const galleries = await this.repository.marked(this.db, scope.partnerIds, scope.textPrefix);
        const galleryIds = galleries.map((row) => row.id);
        const photos = await this.repository.photosOf(this.db, galleryIds);
        const uses = await this.repository.usedByOtherPackages(this.db, galleryIds, scope.removedPackageIds);
        const kept = await this.repository.galleriesNotIn(this.db, galleryIds);
        return {
            galleryIds,
            photoIds: photos.map((row) => row.id),
            tables: [
                { table: 'gallery', rows: galleries.map((row) => ({ id: row.id, label: galleryLabel(row) })) },
                {
                    table: 'gallery_photo',
                    rows: photos.map((row) => ({ id: row.id, label: `gallery ${row.gallery_id}, ${row.file_name}` })),
                },
            ],
            folders: galleryIds.map((id) => `${GALLERY_FOLDER}/${id}`),
            kept: [{ table: 'gallery', rows: kept.map((row) => ({ id: row.id, label: galleryLabel(row) })) }],
            blockers: uses.map((row) => `gallery ${row.gallery_id} is used by package ${row.package_id}, which stays`),
        };
    }

    async remove(found: GalleryTestData): Promise<number> {
        this.refuseInProduction();
        if (found.blockers.length > 0) {
            throw new ConflictException(`Test galleries not removed: ${found.blockers.join('; ')}.`, 'TEST_DATA_BLOCKED');
        }
        if (found.galleryIds.length === 0) return 0;
        const event = { action: AuditAction.GALLERY_TEST_DATA_REMOVED, entityType: AuditEntity.GALLERY } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const count = await this.repository.deleteGalleries(this.db, found.galleryIds, found.photoIds);
                await this.auditService.record({ ...event, details: { removed: found.tables, folders: found.folders } });
                return count;
            });
            for (const folder of found.folders) await this.fileStorage.removeFolder(folder);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.GALLERY_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
