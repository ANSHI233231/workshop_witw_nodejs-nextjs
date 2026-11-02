import { NotFoundException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IAppLogRepository } from '../contracts/app-log-repository.contract';
import type { IAppLogService } from '../contracts/app-log-service.contract';
import type {
    AppLogDetailDto,
    AppLogFilters,
    AppLogItemDto,
    AppLogPage,
    AppLogPruneResult,
    IngestedLog,
} from '../dto/app-log.dto';
import type { AppLogDetailRow, AppLogListRow, AppLogSourceCode } from '../types/app-log.types';

import { type AppLogWriter, fromIngested } from './app-log-writer';

const DAY_MS = 24 * 60 * 60 * 1000;

const notFound = (): NotFoundException => new NotFoundException('This log entry was not found.', 'APP_LOG_NOT_FOUND');

const toItem = (row: AppLogListRow): AppLogItemDto => ({
    id: Number(row.id),
    sourceApp: row.sourceApp,
    logLevel: row.logLevel,
    category: row.category,
    message: row.message,
    errorName: row.errorName,
    requestId: row.requestId,
    userId: row.userId,
    userName: row.userName,
    ipAddress: row.ipAddress,
    httpMethod: row.httpMethod,
    requestUrl: row.requestUrl,
    loggedAt: new Date(row.loggedAt).toISOString(),
});

const toDetail = (row: AppLogDetailRow): AppLogDetailDto => ({
    ...toItem(row),
    message: row.fullMessage,
    errorMessage: row.errorMessage,
    errorStack: row.errorStack,
    logContext: row.logContext,
    clientApp: row.clientApp,
    userAgent: row.userAgent,
});

export class AppLogService implements IAppLogService {
    constructor(
        private readonly db: Database,
        private readonly repository: IAppLogRepository,
        private readonly writer: AppLogWriter,
        private readonly auditService: IAuditService,
    ) {}

    async list(filters: AppLogFilters, pagination: PaginationQuery): Promise<AppLogPage> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, filters, pagination),
            this.repository.count(this.db, filters),
        ]);
        return { items: rows.map(toItem), total };
    }

    async detail(id: number): Promise<AppLogDetailDto> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw notFound();
        return toDetail(row);
    }

    ingest(sourceApp: AppLogSourceCode, entries: readonly IngestedLog[]): number {
        this.writer.add(entries.map((entry) => fromIngested(sourceApp, entry)));
        return entries.length;
    }

    async prune(days: number, confirm: boolean): Promise<AppLogPruneResult> {
        const before = new Date(Date.now() - days * DAY_MS);
        const matching = await this.repository.countBefore(this.db, before);
        if (!confirm || matching === 0) return { days, before: before.toISOString(), matching, deleted: 0 };
        const details = { days, before: before.toISOString(), matching };
        try {
            const deleted = await this.db.transaction(async () => {
                const count = await this.repository.deleteBefore(this.db, before);
                await this.auditService.record({
                    action: AuditAction.APP_LOG_PRUNED,
                    entityType: AuditEntity.APP_LOG,
                    changes: { rows: { from: matching, to: matching - count } },
                    details: { ...details, deleted: count },
                });
                return count;
            });
            return { days, before: before.toISOString(), matching, deleted };
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.APP_LOG_PRUNE_FAILED, entityType: AuditEntity.APP_LOG, details },
                error,
            );
            throw error;
        }
    }
}
