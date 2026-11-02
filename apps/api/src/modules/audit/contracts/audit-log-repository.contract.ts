import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { AuditLogFilters } from '../dto/audit.dto';
import type { AuditLogDetailRow, AuditLogListRow, AuditSummaryRow } from '../types/audit.types';

export interface IAuditLogRepository {
    list(db: DbExecutor, filters: AuditLogFilters, pagination: PaginationQuery): Promise<AuditLogListRow[]>;
    count(db: DbExecutor, filters: AuditLogFilters): Promise<number>;
    summary(db: DbExecutor, filters: AuditLogFilters, todayStart: Date): Promise<AuditSummaryRow | undefined>;
    findById(db: DbExecutor, id: number): Promise<AuditLogDetailRow | undefined>;
}
