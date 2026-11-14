import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { DemoQuoteInsert, IQuoteRequestRepository } from '../contracts/quote-request-repository.contract';
import type { ConsoleQuoteFilters, QuoteRequestInsert } from '../dto/quote-request.dto';
import { type ConsoleWhereShape, QuoteRequestSQL } from '../sql/quote-request.sql';
import {
    type CountRow,
    type DemoVersionRow,
    type IdRow,
    type QuoteMarkCode,
    type QuoteRequestRow,
    QuoteRequestStatus,
    type QuoteRequestStatusCode,
} from '../types/quote-request.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: ConsoleQuoteFilters): ConsoleWhereShape => ({
    search: filters.search !== undefined,
    status: filters.status !== undefined,
});

const filterValues = (filters: ConsoleQuoteFilters): unknown[] => [
    ...(filters.status === undefined ? [] : [filters.status]),
    ...(filters.search === undefined
        ? []
        : [likeAnywhere(filters.search), likeAnywhere(filters.search), likeAnywhere(filters.search)]),
];

const insertValues = (quote: QuoteRequestInsert): unknown[] => [
    quote.userId,
    quote.partnerId,
    quote.packageId,
    quote.packageVersionId,
    quote.travellerCount,
    quote.startDate,
    quote.notes,
    quote.userName,
    quote.userEmail,
    quote.userMobile,
];

export class QuoteRequestRepository implements IQuoteRequestRepository {
    async insert(db: DbExecutor, quote: QuoteRequestInsert): Promise<number> {
        const result = await db.execute(QuoteRequestSQL.insert, [
            ...insertValues(quote),
            QuoteRequestStatus.ACTIVE,
            quote.userId,
            quote.userId,
        ]);
        return result.insertId;
    }

    async findById(db: DbExecutor, id: number): Promise<QuoteRequestRow | undefined> {
        return (await db.query<QuoteRequestRow>(QuoteRequestSQL.findById, [id]))[0];
    }

    async listOfUser(db: DbExecutor, userId: number): Promise<QuoteRequestRow[]> {
        return db.query<QuoteRequestRow>(QuoteRequestSQL.listOfUser, [userId, QuoteRequestStatus.ACTIVE]);
    }

    async listOfPartner(db: DbExecutor, partnerId: number): Promise<QuoteRequestRow[]> {
        return db.query<QuoteRequestRow>(QuoteRequestSQL.listOfPartner, [partnerId, QuoteRequestStatus.ACTIVE]);
    }

    async countOfPartner(db: DbExecutor, partnerId: number): Promise<number> {
        const rows = await db.query<CountRow>(QuoteRequestSQL.countOfPartner, [partnerId, QuoteRequestStatus.ACTIVE]);
        return Number(rows[0]?.total ?? 0);
    }

    async listForConsole(
        db: DbExecutor,
        filters: ConsoleQuoteFilters,
        pagination: PaginationQuery,
    ): Promise<QuoteRequestRow[]> {
        return db.query<QuoteRequestRow>(QuoteRequestSQL.listForConsole(shapeOf(filters)), [
            ...filterValues(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countForConsole(db: DbExecutor, filters: ConsoleQuoteFilters): Promise<number> {
        const rows = await db.query<CountRow>(QuoteRequestSQL.countForConsole(shapeOf(filters)), filterValues(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async mark(db: DbExecutor, id: number, partnerId: number, mark: QuoteMarkCode, actorId: number): Promise<boolean> {
        const result = await db.execute(QuoteRequestSQL.mark, [mark, actorId, id, partnerId, QuoteRequestStatus.ACTIVE]);
        return result.affectedRows > 0;
    }

    async setStatus(
        db: DbExecutor,
        id: number,
        from: QuoteRequestStatusCode,
        to: QuoteRequestStatusCode,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(QuoteRequestSQL.setStatus, [to, actorId, id, from]);
        return result.affectedRows > 0;
    }

    async demoVersions(db: DbExecutor, slugs: readonly string[]): Promise<DemoVersionRow[]> {
        if (slugs.length === 0) return [];
        return db.query<DemoVersionRow>(QuoteRequestSQL.demoVersions(slugs.length), [...slugs]);
    }

    async demoExisting(db: DbExecutor, userId: number, packageId: number, createdAt: Date): Promise<number | null> {
        return (await db.query<IdRow>(QuoteRequestSQL.demoExisting, [userId, packageId, createdAt]))[0]?.id ?? null;
    }

    async demoInsert(db: DbExecutor, quote: DemoQuoteInsert): Promise<number> {
        const result = await db.execute(QuoteRequestSQL.demoInsert, [
            ...insertValues(quote),
            quote.mark,
            quote.mark === null ? null : quote.createdAt,
            quote.status,
            quote.createdAt,
            quote.createdAt,
            quote.userId,
            quote.userId,
        ]);
        return result.insertId;
    }

    async demoIdsOf(db: DbExecutor, partnerIds: readonly number[], userIds: readonly number[]): Promise<number[]> {
        const rows = await db.query<IdRow>(QuoteRequestSQL.demoIdsOf(partnerIds.length, userIds.length), [
            ...partnerIds,
            ...userIds,
        ]);
        return rows.map((row) => row.id);
    }

    async demoDelete(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(QuoteRequestSQL.demoDelete(ids.length), [...ids])).affectedRows;
    }
}
