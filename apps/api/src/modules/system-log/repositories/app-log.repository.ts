import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IAppLogRepository } from '../contracts/app-log-repository.contract';
import type { AppLogFilters, NewAppLog } from '../dto/app-log.dto';
import { type AppLogListShape, AppLogSQL } from '../sql/app-log.sql';
import type { AppLogDetailRow, AppLogListRow, AppLogTotalRow } from '../types/app-log.types';

const SEARCH_COLUMNS = 6;

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: AppLogFilters): AppLogListShape => ({
    search: filters.search !== undefined,
    sourceApp: filters.sourceApp !== undefined,
    logLevel: filters.logLevel !== undefined,
    from: filters.from !== undefined,
    to: filters.to !== undefined,
});

const valuesOf = (filters: AppLogFilters): unknown[] => [
    ...(filters.search !== undefined
        ? Array.from({ length: SEARCH_COLUMNS }, () => likeAnywhere(filters.search ?? ''))
        : []),
    ...(filters.sourceApp !== undefined ? [filters.sourceApp] : []),
    ...(filters.logLevel !== undefined ? [filters.logLevel] : []),
    ...(filters.from !== undefined ? [filters.from] : []),
    ...(filters.to !== undefined ? [filters.to] : []),
];

const rowValues = (row: NewAppLog): unknown[] => [
    row.sourceApp,
    row.logLevel,
    row.category,
    row.message,
    row.errorName,
    row.errorMessage,
    row.errorStack,
    row.logContext,
    row.requestId,
    row.ipAddress,
    row.userId,
    row.httpMethod,
    row.requestUrl,
    row.clientApp,
    row.userAgent,
    row.loggedAt,
];

export class AppLogRepository implements IAppLogRepository {
    async insertMany(db: DbExecutor, rows: readonly NewAppLog[]): Promise<void> {
        if (rows.length === 0) return;
        await db.execute(AppLogSQL.insert(rows.length), rows.flatMap(rowValues));
    }

    list(db: DbExecutor, filters: AppLogFilters, pagination: PaginationQuery): Promise<AppLogListRow[]> {
        return db.query<AppLogListRow>(AppLogSQL.list(shapeOf(filters)), [
            ...valuesOf(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, filters: AppLogFilters): Promise<number> {
        const rows = await db.query<AppLogTotalRow>(AppLogSQL.count(shapeOf(filters)), valuesOf(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async findById(db: DbExecutor, id: number): Promise<AppLogDetailRow | undefined> {
        const rows = await db.query<AppLogDetailRow>(AppLogSQL.findById, [id]);
        return rows[0];
    }

    async countBefore(db: DbExecutor, before: Date): Promise<number> {
        const rows = await db.query<AppLogTotalRow>(AppLogSQL.countBefore, [before]);
        return Number(rows[0]?.total ?? 0);
    }

    async deleteBefore(db: DbExecutor, before: Date): Promise<number> {
        return (await db.execute(AppLogSQL.deleteBefore, [before])).affectedRows;
    }
}
