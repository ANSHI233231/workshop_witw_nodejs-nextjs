import { ConflictException, NotFoundException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import { isDuplicateEntryError } from '../../../database/connection';
import { AuditAction, AuditEntity } from '../../audit';
import type { IDeleteReasonService } from '../contracts/delete-reason-service.contract';
import type { DeleteReasonDto, DeleteReasonFilters, DeleteReasonInput, Page } from '../dto/package.dto';
import { toDeleteReason } from '../mappers/package.mapper';
import type { DeleteReasonRepository } from '../repositories/delete-reason.repository';
import { type DeleteReasonRow, DeleteReasonStatus, type DeleteReasonStatusCode } from '../types/package.types';
import { PACKAGE_MESSAGES } from '../validators/package.validators';
import { fieldError, type PackageRecords } from './package-records';

const ACTIONS = {
    added: { done: AuditAction.PACKAGE_DELETE_REASON_ADDED, failed: AuditAction.PACKAGE_DELETE_REASON_ADD_FAILED },
    edited: { done: AuditAction.PACKAGE_DELETE_REASON_EDITED, failed: AuditAction.PACKAGE_DELETE_REASON_EDIT_FAILED },
    madeActive: {
        done: AuditAction.PACKAGE_DELETE_REASON_MADE_ACTIVE,
        failed: AuditAction.PACKAGE_DELETE_REASON_MAKE_ACTIVE_FAILED,
    },
    madeInactive: {
        done: AuditAction.PACKAGE_DELETE_REASON_MADE_INACTIVE,
        failed: AuditAction.PACKAGE_DELETE_REASON_MAKE_INACTIVE_FAILED,
    },
} as const;

const notFound = (): NotFoundException => new NotFoundException(PACKAGE_MESSAGES.REASON_NOT_FOUND, 'PACKAGE_DELETE_REASON_NOT_FOUND');

const exists = () => fieldError('name', PACKAGE_MESSAGES.REASON_EXISTS, 'PACKAGE_DELETE_REASON_EXISTS');

export class DeleteReasonService implements IDeleteReasonService {
    constructor(
        private readonly records: PackageRecords,
        private readonly repository: DeleteReasonRepository,
    ) {}

    async list(filters: DeleteReasonFilters, pagination: PaginationQuery): Promise<Page<DeleteReasonDto>> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.records.db, filters, pagination),
            this.repository.count(this.records.db, filters),
        ]);
        return { items: rows.map(toDeleteReason), total };
    }

    async active(): Promise<DeleteReasonDto[]> {
        return (await this.repository.active(this.records.db)).map(toDeleteReason);
    }

    async findActive(id: number): Promise<DeleteReasonRow | undefined> {
        const row = await this.repository.findById(this.records.db, id);
        return row?.status === DeleteReasonStatus.ACTIVE ? row : undefined;
    }

    async add(actorId: number, name: string): Promise<DeleteReasonDto> {
        return this.records.audited(
            ACTIONS.added,
            undefined,
            { name },
            async () => {
                if (await this.repository.findByName(this.records.db, name)) throw exists();
                const id = await this.insert(name, actorId);
                return { result: await this.dto(id), id, changes: { name, status: DeleteReasonStatus.ACTIVE } };
            },
            undefined,
            AuditEntity.PACKAGE_DELETE_REASON,
        );
    }

    async update(actorId: number, id: number, input: DeleteReasonInput): Promise<DeleteReasonDto> {
        return this.records.audited(
            ACTIONS.edited,
            id,
            { ...input },
            async () => {
                const before = await this.row(id);
                const same = await this.repository.findByName(this.records.db, input.name);
                if (same && same.id !== id) throw exists();
                try {
                    await this.repository.update(this.records.db, id, input, actorId);
                } catch (error) {
                    if (isDuplicateEntryError(error)) throw exists();
                    throw error;
                }
                return {
                    result: await this.dto(id),
                    id,
                    changes: {
                        name: { from: before.name, to: input.name },
                        status: { from: before.status, to: input.status },
                    },
                };
            },
            undefined,
            AuditEntity.PACKAGE_DELETE_REASON,
        );
    }

    async setStatus(actorId: number, id: number, status: DeleteReasonStatusCode): Promise<DeleteReasonDto> {
        const actions = status === DeleteReasonStatus.ACTIVE ? ACTIONS.madeActive : ACTIONS.madeInactive;
        return this.records.audited(
            actions,
            id,
            { status },
            async () => {
                const before = await this.row(id);
                if (before.status === status || !(await this.repository.setStatus(this.records.db, id, before.status, status, actorId))) {
                    throw new ConflictException('The reason already has this status.', 'PACKAGE_DELETE_REASON_STATUS_SAME');
                }
                return { result: await this.dto(id), id, changes: { status: { from: before.status, to: status } } };
            },
            undefined,
            AuditEntity.PACKAGE_DELETE_REASON,
        );
    }

    private async insert(name: string, actorId: number): Promise<number> {
        try {
            return await this.repository.insert(this.records.db, name, actorId);
        } catch (error) {
            if (isDuplicateEntryError(error)) throw exists();
            throw error;
        }
    }

    private async row(id: number): Promise<DeleteReasonRow> {
        const row = await this.repository.findById(this.records.db, id);
        if (!row) throw notFound();
        return row;
    }

    private async dto(id: number): Promise<DeleteReasonDto> {
        return toDeleteReason(await this.row(id));
    }
}
