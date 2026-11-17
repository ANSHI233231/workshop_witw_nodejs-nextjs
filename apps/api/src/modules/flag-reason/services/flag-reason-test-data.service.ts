import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IFlagReasonTestDataService } from '../contracts/flag-reason-test-data-service.contract';
import type {
    FlagReasonTestData,
    FlagReasonTestDataMarker,
    FlagReasonTestDataTable,
} from '../dto/flag-reason-test-data.dto';
import type { FlagReasonTestDataRepository } from '../repositories/flag-reason-test-data.repository';

export class FlagReasonTestDataService implements IFlagReasonTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: FlagReasonTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(marker: FlagReasonTestDataMarker): Promise<FlagReasonTestData> {
        this.refuseInProduction();
        const reasons = await this.repository.marked(this.db, marker.textPrefix);
        const flagReasonIds = reasons.map((row) => row.id);
        const flags = await this.repository.commentFlagsOf(this.db, flagReasonIds);
        const references: FlagReasonTestDataTable[] = [
            {
                table: 'shared_safari_comment_flag',
                rows: flags.map((row) => ({ id: row.id, label: `flag reason ${row.master_flag_reason_id}` })),
            },
        ];
        return {
            flagReasonIds,
            tables: [
                {
                    table: 'master_flag_reason',
                    rows: reasons.map((row) => ({ id: row.id, label: `${row.name} (status ${row.status})` })),
                },
            ],
            references,
        };
    }

    async remove(found: FlagReasonTestData): Promise<number> {
        this.refuseInProduction();
        if (found.flagReasonIds.length === 0) return 0;
        const event = { action: AuditAction.FLAG_REASON_TEST_DATA_REMOVED, entityType: AuditEntity.FLAG_REASON } as const;
        try {
            return await this.db.transaction(async () => {
                const flags = await this.repository.commentFlagsOf(this.db, found.flagReasonIds);
                if (flags.length > 0) {
                    throw new ConflictException(
                        `Test flag reasons still used by shared_safari_comment_flag (${flags.length}).`,
                        'TEST_DATA_BLOCKED',
                    );
                }
                const count = await this.repository.deleteReasons(this.db, found.flagReasonIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return count;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { ...event, action: AuditAction.FLAG_REASON_TEST_DATA_REMOVE_FAILED },
                error,
            );
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
