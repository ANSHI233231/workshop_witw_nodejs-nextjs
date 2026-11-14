import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { DeleteReasonFilters, DeleteReasonInput } from '../dto/package.dto';
import { DeleteReasonSQL } from '../sql/delete-reason.sql';
import {
    type CountRow,
    type DeleteReasonRow,
    DeleteReasonStatus,
    type DeleteReasonStatusCode,
    PackageWebsiteStatus,
} from '../types/package.types';

import { likeAnywhere } from './package.repository';

const USED = PackageWebsiteStatus.DELETED_BY_ADMIN;

const filterValues = (filters: DeleteReasonFilters): unknown[] => [
    ...(filters.search === undefined ? [] : [likeAnywhere(filters.search)]),
    ...(filters.status === undefined ? [] : [filters.status]),
];

export class DeleteReasonRepository {
    async list(db: DbExecutor, filters: DeleteReasonFilters, pagination: PaginationQuery): Promise<DeleteReasonRow[]> {
        return db.query<DeleteReasonRow>(
            DeleteReasonSQL.list(filters.search !== undefined, filters.status !== undefined),
            [USED, ...filterValues(filters), pagination.limit, toOffset(pagination)],
        );
    }

    async count(db: DbExecutor, filters: DeleteReasonFilters): Promise<number> {
        const rows = await db.query<CountRow>(
            DeleteReasonSQL.count(filters.search !== undefined, filters.status !== undefined),
            filterValues(filters),
        );
        return Number(rows[0]?.total ?? 0);
    }

    async active(db: DbExecutor): Promise<DeleteReasonRow[]> {
        return db.query<DeleteReasonRow>(DeleteReasonSQL.active, [USED, DeleteReasonStatus.ACTIVE]);
    }

    async findById(db: DbExecutor, id: number): Promise<DeleteReasonRow | undefined> {
        return (await db.query<DeleteReasonRow>(DeleteReasonSQL.findById, [USED, id]))[0];
    }

    async findByName(db: DbExecutor, name: string): Promise<DeleteReasonRow | undefined> {
        return (await db.query<DeleteReasonRow>(DeleteReasonSQL.findByName, [USED, name]))[0];
    }

    async insert(db: DbExecutor, name: string, actorId: number): Promise<number> {
        const result = await db.execute(DeleteReasonSQL.insert, [name, DeleteReasonStatus.ACTIVE, actorId, actorId]);
        return result.insertId;
    }

    async update(db: DbExecutor, id: number, input: DeleteReasonInput, actorId: number): Promise<boolean> {
        const result = await db.execute(DeleteReasonSQL.update, [input.name, input.status, actorId, id]);
        return result.affectedRows > 0;
    }

    async setStatus(
        db: DbExecutor,
        id: number,
        from: DeleteReasonStatusCode,
        to: DeleteReasonStatusCode,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(DeleteReasonSQL.setStatus, [to, actorId, id, from]);
        return result.affectedRows > 0;
    }
}
