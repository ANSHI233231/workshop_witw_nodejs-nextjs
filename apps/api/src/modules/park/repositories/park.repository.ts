import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { IParkRepository } from '../contracts/park-repository.contract';
import type { ParkFilters, ParkInput, ParkUpdate, WebsiteParkQuery } from '../dto/park.dto';
import { MasterParkSQL } from '../sql/master-park.sql';
import {
    type CountRow,
    type FeatureImageRow,
    type ParkDetailRow,
    type ParkOptionRow,
    type ParkRow,
    type ParkStateRow,
    ParkStatus,
    type ParkStatusCode,
    type UpcomingSafariRow,
    UpcomingSafariStatus,
    type WebsiteParkPageRow,
    type WebsiteParkRow,
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

const websiteShapeOf = (query: WebsiteParkQuery) => ({
    search: query.search !== undefined,
    region: query.region !== undefined,
});

const websiteValues = (query: WebsiteParkQuery): unknown[] => [
    ParkStatus.ACTIVE,
    ...(query.search !== undefined ? [likeAnywhere(query.search)] : []),
    ...(query.region !== undefined ? [query.region] : []),
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
            input.shortDescription,
            input.latitude,
            input.longitude,
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
            input.shortDescription,
            input.latitude,
            input.longitude,
            input.status,
            actorId,
            id,
        ]);
    }

    async updateStatus(db: DbExecutor, id: number, status: ParkStatusCode, actorId: number): Promise<void> {
        await db.execute(MasterParkSQL.updateStatus, [status, actorId, id]);
    }

    async updateFeatureImage(db: DbExecutor, id: number, fileName: string, actorId: number): Promise<void> {
        await db.execute(MasterParkSQL.updateFeatureImage, [fileName, actorId, id]);
    }

    async featureImageById(db: DbExecutor, id: number): Promise<FeatureImageRow | undefined> {
        return (await db.query<FeatureImageRow>(MasterParkSQL.featureImageById, [id]))[0];
    }

    async featureImageOfActive(db: DbExecutor, slug: string): Promise<FeatureImageRow | undefined> {
        return (await db.query<FeatureImageRow>(MasterParkSQL.featureImageBySlug, [slug, ParkStatus.ACTIVE]))[0];
    }

    async websiteList(db: DbExecutor, query: WebsiteParkQuery, limit: number): Promise<WebsiteParkRow[]> {
        return db.query<WebsiteParkRow>(MasterParkSQL.websiteList(websiteShapeOf(query), query.sort), [
            ...websiteValues(query),
            limit,
            toOffset({ page: query.page, limit }),
        ]);
    }

    async websiteCount(db: DbExecutor, query: WebsiteParkQuery): Promise<number> {
        const rows = await db.query<CountRow>(MasterParkSQL.websiteCount(websiteShapeOf(query)), websiteValues(query));
        return Number(rows[0]?.total ?? 0);
    }

    async websiteCardsByIds(db: DbExecutor, ids: readonly number[]): Promise<WebsiteParkRow[]> {
        if (ids.length === 0) return [];
        return db.query<WebsiteParkRow>(MasterParkSQL.websiteCardsByIds(ids.length), [...ids, ParkStatus.ACTIVE]);
    }

    async websitePage(db: DbExecutor, slug: string): Promise<WebsiteParkPageRow | undefined> {
        return (await db.query<WebsiteParkPageRow>(MasterParkSQL.websitePage, [slug, ParkStatus.ACTIVE]))[0];
    }
}
