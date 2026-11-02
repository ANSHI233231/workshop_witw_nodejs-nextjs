import { ClientApp, getRequestContext } from '../../../core/context';
import { AppError } from '../../../core/exceptions';
import { logger } from '../../../core/logger';
import type { Database } from '../../../database/connection';
import type { IAuditRepository } from '../contracts/audit-repository.contract';
import type { IAuditService } from '../contracts/audit-service.contract';
import type { AuditEvent, AuditLogRecord } from '../dto/audit.dto';
import { AUDIT_LIMITS, AuditOutcome, type AuditOutcomeCode, moduleOfAction } from '../types/audit.types';

const log = logger.category('audit');

const cut = (value: string | null | undefined, max: number): string | null => {
    const text = value?.trim();
    return text ? text.slice(0, max) : null;
};

const json = (value: unknown): string | null => (value === undefined ? null : JSON.stringify(value));

const numericUserId = (userId: string | number | null | undefined): number | null => {
    const id = Number(userId);
    return userId !== null && userId !== undefined && Number.isInteger(id) && id > 0 ? id : null;
};

const describeError = (error: unknown) =>
    error instanceof AppError
        ? { errorCode: error.code, errorMessage: error.message }
        : { errorCode: 'UNEXPECTED_ERROR', errorMessage: error instanceof Error ? error.message : String(error) };

export class AuditService implements IAuditService {
    constructor(
        private readonly db: Database,
        private readonly auditRepository: IAuditRepository,
    ) {}

    async record(event: AuditEvent): Promise<void> {
        await this.write(event, AuditOutcome.SUCCESS, event.details);
    }

    async recordFailure(event: AuditEvent, error: unknown): Promise<void> {
        await this.write(event, AuditOutcome.FAILURE, { ...event.details, ...describeError(error) });
    }

    private async write(event: AuditEvent, outcome: AuditOutcomeCode, details: AuditEvent['details']): Promise<void> {
        try {
            await this.auditRepository.insert(this.db, this.toRecord(event, outcome, details));
        } catch (error) {
            log.error('Audit event could not be saved', { action: event.action, outcome, error });
        }
    }

    private toRecord(event: AuditEvent, outcome: AuditOutcomeCode, details: AuditEvent['details']): AuditLogRecord {
        const context = getRequestContext();
        const ip = context?.ip && context.ip !== '-' ? context.ip : null;

        return {
            clientApp: context?.clientApp ?? ClientApp.SYSTEM,
            module: moduleOfAction(event.action),
            action: event.action,
            outcome,
            userId: numericUserId(context?.userId),
            actorLabel: cut(event.actorLabel, AUDIT_LIMITS.ACTOR_LABEL),
            entityType: event.entityType ?? null,
            entityId: event.entityId ?? null,
            changes: json(event.changes),
            details: json(details),
            requestId: context?.requestId ?? null,
            ipAddress: ip,
            userAgent: cut(context?.userAgent, AUDIT_LIMITS.USER_AGENT),
        };
    }
}
