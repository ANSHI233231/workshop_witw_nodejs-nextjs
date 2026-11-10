import type { DbExecutor } from '../../../database/connection';
import type { IFlagReasonRepository } from '../contracts/flag-reason-repository.contract';
import type { FlagReasonFilters, FlagReasonInput, NewFlagReason } from '../dto/flag-reason.dto';
import { MasterFlagReasonSQL } from '../sql/master-flag-reason.sql';
import { FlagReasonStatus, type FlagReasonListRow, type FlagReasonRow } from '../types/flag-reason.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export class FlagReasonRepository implements IFlagReasonRepository {
    async list(db: DbExecutor, filters: FlagReasonFilters): Promise<FlagReasonListRow[]> {
        return db.query<FlagReasonListRow>(
            MasterFlagReasonSQL.list({ status: filters.status !== undefined, search: filters.search !== undefined }),
            [
                ...(filters.status !== undefined ? [filters.status] : []),
                ...(filters.search !== undefined ? [likeAnywhere(filters.search)] : []),
            ],
        );
    }

    async listActive(db: DbExecutor): Promise<FlagReasonRow[]> {
        return db.query<FlagReasonRow>(MasterFlagReasonSQL.listActive, [FlagReasonStatus.ACTIVE]);
    }

    async findById(db: DbExecutor, id: number): Promise<FlagReasonRow | undefined> {
        return (await db.query<FlagReasonRow>(MasterFlagReasonSQL.findById, [id]))[0];
    }

    async findActiveById(db: DbExecutor, id: number): Promise<FlagReasonRow | undefined> {
        return (await db.query<FlagReasonRow>(MasterFlagReasonSQL.findActiveById, [id, FlagReasonStatus.ACTIVE]))[0];
    }

    async findOtherByName(db: DbExecutor, name: string, exceptId: number): Promise<FlagReasonRow | undefined> {
        return (await db.query<FlagReasonRow>(MasterFlagReasonSQL.findOtherByName, [name, exceptId]))[0];
    }

    async insert(db: DbExecutor, reason: NewFlagReason, actorId: number): Promise<number> {
        const result = await db.execute(MasterFlagReasonSQL.insert, [
            reason.name,
            FlagReasonStatus.ACTIVE,
            actorId,
            actorId,
        ]);
        return Number(result.insertId);
    }

    async update(db: DbExecutor, id: number, input: FlagReasonInput, actorId: number): Promise<void> {
        await db.execute(MasterFlagReasonSQL.update, [input.name, input.status, actorId, id]);
    }

    async updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void> {
        await db.execute(MasterFlagReasonSQL.updateStatus, [status, actorId, id]);
    }
}
