import type { DbExecutor } from '../../../database/connection';
import type { FlagReasonFilters, FlagReasonInput, NewFlagReason } from '../dto/flag-reason.dto';
import type { FlagReasonListRow, FlagReasonRow } from '../types/flag-reason.types';

export interface IFlagReasonRepository {
    list(db: DbExecutor, filters: FlagReasonFilters): Promise<FlagReasonListRow[]>;
    listActive(db: DbExecutor): Promise<FlagReasonRow[]>;
    findById(db: DbExecutor, id: number): Promise<FlagReasonRow | undefined>;
    findActiveById(db: DbExecutor, id: number): Promise<FlagReasonRow | undefined>;
    findOtherByName(db: DbExecutor, name: string, exceptId: number): Promise<FlagReasonRow | undefined>;
    insert(db: DbExecutor, reason: NewFlagReason, actorId: number): Promise<number>;
    update(db: DbExecutor, id: number, input: FlagReasonInput, actorId: number): Promise<void>;
    updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void>;
}
