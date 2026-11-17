import { createHash } from 'node:crypto';

import { ForbiddenException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IParkDemoService } from '../contracts/park-demo-service.contract';
import type { DemoParkImage, ParkImageOutcome, ParkImageState } from '../dto/park-demo.dto';
import type { ParkDemoRepository } from '../repositories/park-demo.repository';

import type { ParkImages } from './park-images';

const digestOf = (content: Buffer): string => createHash('sha256').update(content).digest('hex');

export class ParkDemoService implements IParkDemoService {
    constructor(
        private readonly db: Database,
        private readonly repository: ParkDemoRepository,
        private readonly files: ParkImages,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async images(): Promise<ParkImageState[]> {
        this.refuseInProduction();
        const rows = await this.repository.images(this.db);
        return rows.map((row) => ({ id: row.id, name: row.name, featureImage: row.feature_image }));
    }

    async addImages(images: readonly DemoParkImage[], actorId: number | null): Promise<ParkImageOutcome[]> {
        this.refuseInProduction();
        const event = { action: AuditAction.PARK_DEMO_IMAGES_ADDED, entityType: AuditEntity.PARK } as const;
        const names = new Map((await this.repository.images(this.db)).map((row) => [row.id, row]));
        const added: ParkImageOutcome[] = [];
        try {
            for (const image of images) {
                const park = names.get(image.parkId);
                if (!park || park.feature_image !== null) continue;
                const fileName = await this.files.store(image.parkId, image.content);
                const filled = await this.db.transaction(async () => {
                    if (!(await this.repository.fillImage(this.db, image.parkId, fileName, actorId))) return false;
                    await this.auditService.record({
                        ...event,
                        entityId: image.parkId,
                        details: { demo: true, changes: { featureImage: { from: null, to: fileName } } },
                    });
                    return true;
                });
                if (filled) added.push({ parkId: image.parkId, name: park.name, fileName });
                else await this.files.discard(image.parkId, fileName);
            }
            return added;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARK_DEMO_IMAGES_ADD_FAILED, details: { added } }, error);
            throw error;
        }
    }

    async sampleImages(samples: readonly Buffer[]): Promise<ParkImageOutcome[]> {
        this.refuseInProduction();
        const digests = new Set(samples.map(digestOf));
        const found: ParkImageOutcome[] = [];
        for (const row of await this.repository.images(this.db)) {
            if (row.feature_image === null) continue;
            const content = await this.contentOf(row.id, row.feature_image);
            if (content && digests.has(digestOf(content))) found.push({ parkId: row.id, name: row.name, fileName: row.feature_image });
        }
        return found;
    }

    async removeImages(images: readonly ParkImageOutcome[], actorId: number | null): Promise<number> {
        this.refuseInProduction();
        const event = { action: AuditAction.PARK_DEMO_IMAGES_REMOVED, entityType: AuditEntity.PARK } as const;
        let removed = 0;
        try {
            for (const image of images) {
                const cleared = await this.db.transaction(async () => {
                    if (!(await this.repository.clearImage(this.db, image.parkId, image.fileName, actorId))) return false;
                    await this.auditService.record({
                        ...event,
                        entityId: image.parkId,
                        details: { demo: true, changes: { featureImage: { from: image.fileName, to: null } } },
                    });
                    return true;
                });
                if (!cleared) continue;
                await this.files.discard(image.parkId, image.fileName);
                removed += 1;
            }
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARK_DEMO_IMAGES_REMOVE_FAILED, details: { removed } }, error);
            throw error;
        }
    }

    private async contentOf(parkId: number, fileName: string): Promise<Buffer | null> {
        try {
            return (await this.files.read(parkId, fileName)).content;
        } catch (error) {
            if (error instanceof NotFoundException) return null;
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Demo data is never written in production.', 'DEMO_NOT_ALLOWED');
        }
    }
}
