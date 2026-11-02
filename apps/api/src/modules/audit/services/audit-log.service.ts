import { ClientApp } from '../../../core/context';
import { NotFoundException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import type { IAuditLogRepository } from '../contracts/audit-log-repository.contract';
import type { IAuditLogService } from '../contracts/audit-log-service.contract';
import type {
    AuditLogDetailDto,
    AuditLogFilters,
    AuditLogPage,
    AuditOptionsDto,
    AuditSummaryDto,
} from '../dto/audit.dto';
import { toAuditLogDetail, toAuditLogListItem } from '../mappers/audit.mapper';
import {
    ACTIONS_PER_MODULE,
    AUDIT_ACTION_NAMES,
    AUDIT_MODULE_NAMES,
    AuditAction,
    AuditModule,
} from '../types/audit.types';

const CLIENT_APP_NAMES: ReadonlyMap<number, string> = new Map(
    Object.entries(ClientApp).map(([name, code]) => [code, name]),
);

const startOfUtcDay = (moment: Date): Date =>
    new Date(Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth(), moment.getUTCDate()));

export class AuditLogService implements IAuditLogService {
    constructor(
        private readonly db: Database,
        private readonly repository: IAuditLogRepository,
    ) {}

    async list(filters: AuditLogFilters, pagination: PaginationQuery): Promise<AuditLogPage> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, filters, pagination),
            this.repository.count(this.db, filters),
        ]);
        return { items: rows.map((row) => toAuditLogListItem(row, CLIENT_APP_NAMES)), total };
    }

    async summary(filters: AuditLogFilters): Promise<AuditSummaryDto> {
        const row = await this.repository.summary(this.db, filters, startOfUtcDay(new Date()));
        return {
            total: Number(row?.total ?? 0),
            failed: Number(row?.failed ?? 0),
            signIn: Number(row?.sign_in ?? 0),
            today: Number(row?.today ?? 0),
        };
    }

    async detail(id: number): Promise<AuditLogDetailDto> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw new NotFoundException('This audit event was not found.', 'AUDIT_LOG_NOT_FOUND');
        return toAuditLogDetail(row, CLIENT_APP_NAMES);
    }

    options(): AuditOptionsDto {
        return {
            modules: Object.values(AuditModule).map((code) => ({ code, name: AUDIT_MODULE_NAMES.get(code) ?? '' })),
            actions: Object.values(AuditAction).map((code) => ({
                code,
                name: AUDIT_ACTION_NAMES.get(code) ?? '',
                module: Math.floor(code / ACTIONS_PER_MODULE),
            })),
            clientApps: [...CLIENT_APP_NAMES].map(([code, name]) => ({ code, name })),
        };
    }
}
