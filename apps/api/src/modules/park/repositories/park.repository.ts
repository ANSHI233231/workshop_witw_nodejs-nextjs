import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { IParkRepository } from '../contracts/park-repository.contract';
import type { ParkFilters, ParkInput, ParkUpdate } from '../dto/park.dto';
import { MasterParkSQL } from '../sql/master-park.sql';
import {
    type CountRow,
    type ParkDetailRow,
    type ParkOptionRow,
    type ParkRow,
    type ParkStateRow,
    ParkStatus,
    type ParkStatusCode,
    type UpcomingSafariRow,
    UpcomingSafariStatus,
} from '../types/park.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: ParkFilters) => ({
    search: filters.search !== undefined,
    region: filters.region !== undefined,
    status: filters.status !== undefined,
});

const filterValues = (filters: ParkFilters): unknown[] => [
    ...(filters.search !== undefined ? [likeAnywhere(filters.search)] : []),
    ...(filters.region !== undefined ? [filters.region] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
];

const upcomingValues = (today: string): unknown[] => [
    UpcomingSafariStatus.ACTIVE,
    UpcomingSafariStatus.SEAT_FULL,
    today,
];

export class ParkRepository implements IParkRepository {
    async list(db: DbExecutor, filters: ParkFilters, pagination: PaginationQuery, today: string): Promise<ParkRow[]> {
        return db.query<ParkRow>(MasterParkSQL.list(shapeOf(filters)), [
            ...upcomingValues(today),
            ...filterValues(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, filters: ParkFilters): Promise<number> {
        const rows = await db.query<CountRow>(MasterParkSQL.count(shapeOf(filters)), filterValues(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async listActive(db: DbExecutor): Promise<ParkOptionRow[]> {
        return db.query<ParkOptionRow>(MasterParkSQL.listActive, [ParkStatus.ACTIVE]);
    }

    async findState(db: DbExecutor, id: number): Promise<ParkStateRow | undefined> {
        return (await db.query<ParkStateRow>(MasterParkSQL.findState, [id]))[0];
    }

    async findById(db: DbExecutor, id: number, today: string): Promise<ParkDetailRow | undefined> {
        return (await db.query<ParkDetailRow>(MasterParkSQL.findById, [...upcomingValues(today), id]))[0];
    }

    async upcomingSafaris(db: DbExecutor, id: number, today: string): Promise<UpcomingSafariRow[]> {
        return db.query<UpcomingSafariRow>(MasterParkSQL.upcomingSafaris, [id, ...upcomingValues(today)]);
    }

    async findOtherByName(db: DbExecutor, name: string, exceptId: number): Promise<ParkStateRow | undefined> {
        return (await db.query<ParkStateRow>(MasterParkSQL.findOtherByName, [name, exceptId]))[0];
    }

    async slugTaken(db: DbExecutor, slug: string): Promise<boolean> {
        return (await db.query<RowDataPacket>(MasterParkSQL.findBySlug, [slug])).length > 0;
    }

    async insert(db: DbExecutor, input: ParkInput, slug: string, actorId: number): Promise<number> {
        const result = await db.execute(MasterParkSQL.insert, [
            input.name,
            slug,
            input.region,
            input.avgSafariPriceMin,
            input.avgSafariPriceMax,
            ParkStatus.ACTIVE,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async update(db: DbExecutor, id: number, input: ParkUpdate, actorId: number): Promise<void> {
        await db.execute(MasterParkSQL.update, [
            input.name,
            input.region,
            input.avgSafariPriceMin,
            input.avgSafariPriceMax,
            input.status,
            actorId,
            id,
        ]);
    }

    async updateStatus(db: DbExecutor, id: number, status: ParkStatusCode, actorId: number): Promise<void> {
        await db.execute(MasterParkSQL.updateStatus, [status, actorId, id]);
    }
}
