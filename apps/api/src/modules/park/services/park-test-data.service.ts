import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IParkTestDataService } from '../contracts/park-test-data-service.contract';
import type { ParkTestData, ParkTestDataMarker, ParkTestDataTable } from '../dto/park-test-data.dto';
import type { ParkReferences, ParkTestDataRepository } from '../repositories/park-test-data.repository';
import { FEATURE_IMAGE_FOLDER } from '../types/park.types';

const referenceTables = (references: readonly ParkReferences[]): ParkTestDataTable[] =>
    references.map((reference) => ({
        table: reference.table,
        rows: reference.rows.map((row) => ({ id: row.id, label: `park ${row.master_park_id}` })),
    }));

export class ParkTestDataService implements IParkTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: ParkTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async find(marker: ParkTestDataMarker): Promise<ParkTestData> {
        this.refuseInProduction();
        const parks = await this.repository.marked(this.db, marker.textPrefix, marker.slugPrefix);
        const parkIds = parks.map((row) => row.id);
        return {
            parkIds,
            tables: [
                {
                    table: 'master_park',
                    rows: parks.map((row) => ({ id: row.id, label: `${row.name} (${row.slug}, status ${row.status})` })),
                },
            ],
            references: referenceTables(await this.repository.referencesTo(this.db, parkIds)),
            folders: parkIds.map((id) => `${FEATURE_IMAGE_FOLDER.PARENT}/${id}`),
        };
    }

    async remove(found: ParkTestData): Promise<number> {
        this.refuseInProduction();
        if (found.parkIds.length === 0) return 0;
        const event = { action: AuditAction.PARK_TEST_DATA_REMOVED, entityType: AuditEntity.PARK } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const references = await this.repository.referencesTo(this.db, found.parkIds);
                const used = references.filter((reference) => reference.rows.length > 0);
                if (used.length > 0) {
                    throw new ConflictException(
                        `Test parks still used by ${used.map((reference) => `${reference.table} (${reference.rows.length})`).join(', ')}.`,
                        'TEST_DATA_BLOCKED',
                    );
                }
                const count = await this.repository.deleteParks(this.db, found.parkIds);
                await this.auditService.record({ ...event, details: { removed: found.tables, folders: found.folders } });
                return count;
            });
            for (const folder of found.folders) await this.fileStorage.removeFolder(folder);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARK_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
