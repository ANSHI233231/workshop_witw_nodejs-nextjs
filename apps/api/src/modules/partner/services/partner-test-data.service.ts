import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IPartnerTestDataService } from '../contracts/partner-test-data-service.contract';
import type { PartnerTestData } from '../dto/partner-test-data.dto';
import type { PartnerTestDataRepository, TestPartnerRow } from '../repositories/partner-test-data.repository';
import { LOGO_FOLDER } from '../types/partner.types';

const partnerLabel = (row: TestPartnerRow): string => `${row.business_name} (user ${row.user_id}, status ${row.status})`;

export class PartnerTestDataService implements IPartnerTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: PartnerTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async find(userIds: readonly number[]): Promise<PartnerTestData> {
        this.refuseInProduction();
        const partners = await this.repository.partnersOf(this.db, userIds);
        const partnerIds = partners.map((row) => row.id);
        const parks = await this.repository.parksOf(this.db, partnerIds);
        const kept = await this.repository.partnersNotIn(this.db, partnerIds);
        return {
            partnerIds,
            partnerParkIds: parks.map((row) => row.id),
            tables: [
                { table: 'partner', rows: partners.map((row) => ({ id: row.id, label: partnerLabel(row) })) },
                {
                    table: 'partner_park',
                    rows: parks.map((row) => ({ id: row.id, label: `partner ${row.partner_id}, park ${row.master_park_id}` })),
                },
            ],
            folders: partnerIds.map((id) => `${LOGO_FOLDER.PARENT}/${id}`),
            kept: [{ table: 'partner', rows: kept.map((row) => ({ id: row.id, label: partnerLabel(row) })) }],
        };
    }

    async remove(found: PartnerTestData): Promise<number> {
        this.refuseInProduction();
        if (found.partnerIds.length === 0) return 0;
        const event = { action: AuditAction.PARTNER_TEST_DATA_REMOVED, entityType: AuditEntity.PARTNER } as const;
        try {
            const removed = await this.db.transaction(async () => {
                await this.repository.deleteParks(this.db, found.partnerParkIds);
                const count = await this.repository.deletePartners(this.db, found.partnerIds);
                await this.auditService.record({ ...event, details: { removed: found.tables, folders: found.folders } });
                return count;
            });
            for (const folder of found.folders) await this.fileStorage.removeFolder(folder);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARTNER_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
