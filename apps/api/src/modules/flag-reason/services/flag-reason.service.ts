import { ConflictException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IFlagReasonRepository } from '../contracts/flag-reason-repository.contract';
import type { IFlagReasonService } from '../contracts/flag-reason-service.contract';
import type {
    ActiveFlagReasonDto,
    FlagReasonDto,
    FlagReasonFilters,
    FlagReasonInput,
    FlagReasonListItemDto,
    NewFlagReason,
} from '../dto/flag-reason.dto';
import { toActiveFlagReason, toFlagReason, toFlagReasonListItem } from '../mappers/flag-reason.mapper';
import { FlagReasonStatus, type FlagReasonStatusCode } from '../types/flag-reason.types';

const notFound = (): NotFoundException =>
    new NotFoundException('This reason was not found.', 'FLAG_REASON_NOT_FOUND');

const nameTaken = (): ConflictException =>
    new ConflictException('This reason already exists.', 'FLAG_REASON_NAME_TAKEN');

const NO_REASON_YET = 0;

type Done = {
    readonly result: FlagReasonDto;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

const changesOf = (before: FlagReasonDto, after: FlagReasonInput): Record<string, unknown> => {
    const changes: Record<string, unknown> = {};
    if (before.name !== after.name) changes['name'] = { from: before.name, to: after.name };
    if (before.status !== after.status) changes['status'] = { from: before.status, to: after.status };
    return changes;
};

export class FlagReasonService implements IFlagReasonService {
    constructor(
        private readonly db: Database,
        private readonly repository: IFlagReasonRepository,
        private readonly auditService: IAuditService,
    ) {}

    async listActive(): Promise<ActiveFlagReasonDto[]> {
        return (await this.repository.listActive(this.db)).map(toActiveFlagReason);
    }

    async findActiveById(id: number): Promise<ActiveFlagReasonDto | null> {
        const row = await this.repository.findActiveById(this.db, id);
        return row ? toActiveFlagReason(row) : null;
    }

    async list(filters: FlagReasonFilters): Promise<FlagReasonListItemDto[]> {
        return (await this.repository.list(this.db, filters)).map(toFlagReasonListItem);
    }

    async create(reason: NewFlagReason, actorId: number): Promise<FlagReasonDto> {
        return this.audited(
            AuditAction.FLAG_REASON_ADDED,
            AuditAction.FLAG_REASON_ADD_FAILED,
            { name: reason.name },
            async () => {
                await this.refuseNameTaken(reason.name, NO_REASON_YET);
                const id = await this.repository.insert(this.db, reason, actorId);
                return {
                    result: { id, name: reason.name, status: FlagReasonStatus.ACTIVE },
                    id,
                    changes: {
                        name: { from: null, to: reason.name },
                        status: { from: null, to: FlagReasonStatus.ACTIVE },
                    },
                };
            },
        );
    }

    async update(id: number, input: FlagReasonInput, actorId: number): Promise<FlagReasonDto> {
        return this.audited(AuditAction.FLAG_REASON_UPDATED, AuditAction.FLAG_REASON_UPDATE_FAILED, { id }, async () => {
            const before = await this.existing(id);
            await this.refuseNameTaken(input.name, id);
            await this.repository.update(this.db, id, input, actorId);
            return { result: { ...before, ...input }, id, changes: changesOf(before, input) };
        });
    }

    async setStatus(id: number, status: FlagReasonStatusCode, actorId: number): Promise<FlagReasonDto> {
        return this.audited(
            AuditAction.FLAG_REASON_STATUS_CHANGED,
            AuditAction.FLAG_REASON_STATUS_CHANGE_FAILED,
            { id },
            async () => {
                const before = await this.existing(id);
                await this.repository.updateStatus(this.db, id, status, actorId);
                return {
                    result: { ...before, status },
                    id,
                    changes: { status: { from: before.status, to: status } },
                };
            },
        );
    }

    private async existing(id: number): Promise<FlagReasonDto> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw notFound();
        return toFlagReason(row);
    }

    private async refuseNameTaken(name: string, exceptId: number): Promise<void> {
        if (await this.repository.findOtherByName(this.db, name, exceptId)) throw nameTaken();
    }

    private async audited(
        action: AuditActionCode,
        failure: AuditActionCode,
        attempted: Readonly<Record<string, unknown>>,
        work: () => Promise<Done>,
    ): Promise<FlagReasonDto> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.FLAG_REASON,
                    entityId: done.id,
                    changes: done.changes,
                    details: { name: done.result.name },
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: failure,
                    entityType: AuditEntity.FLAG_REASON,
                    ...(typeof attempted['id'] === 'number' ? { entityId: attempted['id'] } : {}),
                    details: attempted,
                },
                error,
            );
            throw error;
        }
    }
}
