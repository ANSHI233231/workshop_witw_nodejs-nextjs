import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { AppLogFilters, NewAppLog } from '../dto/app-log.dto';
import type { AppLogDetailRow, AppLogListRow } from '../types/app-log.types';

export interface IAppLogRepository {
    insertMany(db: DbExecutor, rows: readonly NewAppLog[]): Promise<void>;
    list(db: DbExecutor, filters: AppLogFilters, pagination: PaginationQuery): Promise<AppLogListRow[]>;
    count(db: DbExecutor, filters: AppLogFilters): Promise<number>;
    findById(db: DbExecutor, id: number): Promise<AppLogDetailRow | undefined>;
    countBefore(db: DbExecutor, before: Date): Promise<number>;
    deleteBefore(db: DbExecutor, before: Date): Promise<number>;
}
