import type { PaginationQuery } from '../../../core/validation';
import type {
    AuditLogDetailDto,
    AuditLogFilters,
    AuditLogPage,
    AuditOptionsDto,
    AuditSummaryDto,
} from '../dto/audit.dto';

export interface IAuditLogService {
    list(filters: AuditLogFilters, pagination: PaginationQuery): Promise<AuditLogPage>;
    summary(filters: AuditLogFilters): Promise<AuditSummaryDto>;
    detail(id: number): Promise<AuditLogDetailDto>;
    options(): AuditOptionsDto;
}
