import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IAuditLogRepository } from '../contracts/audit-log-repository.contract';
import type { AuditLogFilters } from '../dto/audit.dto';
import { AuditLogSQL } from '../sql/audit-log.sql';
import {
    AuditModule,
    AuditOutcome,
    type AuditCountRow,
    type AuditLogDetailRow,
    type AuditLogListRow,
    type AuditSummaryRow,
} from '../types/audit.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: AuditLogFilters) => ({
    search: filters.search !== undefined,
    module: filters.module !== undefined,
    action: filters.action !== undefined,
    outcome: filters.outcome !== undefined,
    clientApp: filters.clientApp !== undefined,
    from: filters.from !== undefined,
    to: filters.toBefore !== undefined,
});

const paramsOf = (filters: AuditLogFilters): unknown[] => {
    const search = filters.search;
    return [
        ...(search !== undefined
            ? [likeAnywhere(search), likeAnywhere(search), likeAnywhere(search), likeAnywhere(search), search]
            : []),
        ...(filters.module !== undefined ? [filters.module] : []),
        ...(filters.action !== undefined ? [filters.action] : []),
        ...(filters.outcome !== undefined ? [filters.outcome] : []),
        ...(filters.clientApp !== undefined ? [filters.clientApp] : []),
        ...(filters.from !== undefined ? [filters.from] : []),
        ...(filters.toBefore !== undefined ? [filters.toBefore] : []),
    ];
};

export class AuditLogRepository implements IAuditLogRepository {
    list(db: DbExecutor, filters: AuditLogFilters, pagination: PaginationQuery): Promise<AuditLogListRow[]> {
        return db.query<AuditLogListRow>(AuditLogSQL.list(shapeOf(filters)), [
            ...paramsOf(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, filters: AuditLogFilters): Promise<number> {
        const rows = await db.query<AuditCountRow>(AuditLogSQL.count(shapeOf(filters)), paramsOf(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async summary(db: DbExecutor, filters: AuditLogFilters, todayStart: Date): Promise<AuditSummaryRow | undefined> {
        const rows = await db.query<AuditSummaryRow>(AuditLogSQL.summary(shapeOf(filters)), [
            AuditOutcome.FAILURE,
            AuditModule.AUTH,
            todayStart,
            ...paramsOf(filters),
        ]);
        return rows[0];
    }

    async findById(db: DbExecutor, id: number): Promise<AuditLogDetailRow | undefined> {
        const rows = await db.query<AuditLogDetailRow>(AuditLogSQL.findById, [id]);
        return rows[0];
    }
}
