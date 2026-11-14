import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { ConsoleQuoteFilters, QuoteRequestInsert } from '../dto/quote-request.dto';
import type {
    DemoVersionRow,
    QuoteMarkCode,
    QuoteRequestRow,
    QuoteRequestStatusCode,
} from '../types/quote-request.types';

export type DemoQuoteInsert = QuoteRequestInsert & {
    readonly mark: QuoteMarkCode | null;
    readonly status: QuoteRequestStatusCode;
    readonly createdAt: Date;
};

export interface IQuoteRequestRepository {
    insert(db: DbExecutor, quote: QuoteRequestInsert): Promise<number>;
    findById(db: DbExecutor, id: number): Promise<QuoteRequestRow | undefined>;
    listOfUser(db: DbExecutor, userId: number): Promise<QuoteRequestRow[]>;
    listOfPartner(db: DbExecutor, partnerId: number): Promise<QuoteRequestRow[]>;
    countOfPartner(db: DbExecutor, partnerId: number): Promise<number>;
    listForConsole(db: DbExecutor, filters: ConsoleQuoteFilters, pagination: PaginationQuery): Promise<QuoteRequestRow[]>;
    countForConsole(db: DbExecutor, filters: ConsoleQuoteFilters): Promise<number>;
    mark(db: DbExecutor, id: number, partnerId: number, mark: QuoteMarkCode, actorId: number): Promise<boolean>;
    setStatus(
        db: DbExecutor,
        id: number,
        from: QuoteRequestStatusCode,
        to: QuoteRequestStatusCode,
        actorId: number,
    ): Promise<boolean>;
    demoVersions(db: DbExecutor, slugs: readonly string[]): Promise<DemoVersionRow[]>;
    demoExisting(db: DbExecutor, userId: number, packageId: number, createdAt: Date): Promise<number | null>;
    demoInsert(db: DbExecutor, quote: DemoQuoteInsert): Promise<number>;
    demoIdsOf(db: DbExecutor, partnerIds: readonly number[], userIds: readonly number[]): Promise<number[]>;
    demoDelete(db: DbExecutor, ids: readonly number[]): Promise<number>;
}
