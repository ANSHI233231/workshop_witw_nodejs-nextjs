import type { PaginationQuery } from '../../../core/validation';
import type { AppLogDetailDto, AppLogFilters, AppLogPage, AppLogPruneResult, IngestedLog } from '../dto/app-log.dto';
import type { AppLogSourceCode } from '../types/app-log.types';

export interface IAppLogService {
    list(filters: AppLogFilters, pagination: PaginationQuery): Promise<AppLogPage>;
    detail(id: number): Promise<AppLogDetailDto>;
    ingest(sourceApp: AppLogSourceCode, entries: readonly IngestedLog[]): number;
    prune(days: number, confirm: boolean): Promise<AppLogPruneResult>;
}
