import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IQuoteRequestTestDataService } from '../contracts/quote-request-test-data-service.contract';
import type { QuoteRequestTestData, QuoteRequestTestDataScope } from '../dto/quote-request-test-data.dto';
import type {
    QuoteRequestTestDataRepository,
    TestQuoteRequestRow,
} from '../repositories/quote-request-test-data.repository';

const quoteLabel = (row: TestQuoteRequestRow): string =>
    `user ${row.user_id} to partner ${row.partner_id}, package ${row.package_id}: ${row.notes_start ?? ''}`;

export class QuoteRequestTestDataService implements IQuoteRequestTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: QuoteRequestTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: QuoteRequestTestDataScope): Promise<QuoteRequestTestData> {
        this.refuseInProduction();
        const rows = await this.repository.marked(this.db, scope.userIds, scope.partnerIds, scope.packageIds, scope.textPrefix);
        const quoteRequestIds = rows.map((row) => row.id);
        const kept = await this.repository.quoteRequestsNotIn(this.db, quoteRequestIds);
        return {
            quoteRequestIds,
            tables: [{ table: 'quote_request', rows: rows.map((row) => ({ id: row.id, label: quoteLabel(row) })) }],
            kept: [{ table: 'quote_request', rows: kept.map((row) => ({ id: row.id, label: quoteLabel(row) })) }],
        };
    }

    async remove(found: QuoteRequestTestData): Promise<number> {
        this.refuseInProduction();
        if (found.quoteRequestIds.length === 0) return 0;
        const event = { action: AuditAction.QUOTE_REQUEST_TEST_DATA_REMOVED, entityType: AuditEntity.QUOTE_REQUEST } as const;
        try {
            return await this.db.transaction(async () => {
                const removed = await this.repository.deleteQuoteRequests(this.db, found.quoteRequestIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.QUOTE_REQUEST_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
