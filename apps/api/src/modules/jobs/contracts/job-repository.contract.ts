import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { JobRunFilters, JobRunFinish, JobRunInsert, JobScheduleFilters, JobScheduleInput } from '../dto/job.dto';
import type { JobRunRow, JobScheduleRow } from '../types/job.types';

export interface IJobRepository {
    schedules(db: DbExecutor, filters: JobScheduleFilters, pagination: PaginationQuery): Promise<JobScheduleRow[]>;
    countSchedules(db: DbExecutor, filters: JobScheduleFilters): Promise<number>;
    schedule(db: DbExecutor, id: number): Promise<JobScheduleRow | undefined>;
    activeSchedules(db: DbExecutor): Promise<JobScheduleRow[]>;
    isScheduleNameTaken(db: DbExecutor, name: string, exceptId: number): Promise<boolean>;
    insertSchedule(db: DbExecutor, input: JobScheduleInput, actorId: number): Promise<number>;
    updateSchedule(db: DbExecutor, id: number, input: JobScheduleInput, actorId: number): Promise<void>;
    runs(db: DbExecutor, filters: JobRunFilters, pagination: PaginationQuery): Promise<JobRunRow[]>;
    countRuns(db: DbExecutor, filters: JobRunFilters): Promise<number>;
    run(db: DbExecutor, id: number): Promise<JobRunRow | undefined>;
    insertRun(db: DbExecutor, run: JobRunInsert): Promise<number | null>;
    hasOpenRunOfSchedule(db: DbExecutor, scheduleId: number): Promise<boolean>;
    dueRunIds(db: DbExecutor, limit: number): Promise<number[]>;
    markRunning(db: DbExecutor, id: number): Promise<void>;
    setPid(db: DbExecutor, id: number, pid: number): Promise<void>;
    heartbeat(db: DbExecutor, ids: readonly number[]): Promise<void>;
    finishRun(db: DbExecutor, id: number, finish: JobRunFinish): Promise<boolean>;
    recoverStaleRuns(db: DbExecutor, staleSeconds: number, message: string): Promise<number>;
    cancelRun(db: DbExecutor, id: number): Promise<boolean>;
    terminateRun(db: DbExecutor, id: number, message: string): Promise<boolean>;
}
