import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IJobRepository } from '../contracts/job-repository.contract';
import type { JobRunFilters, JobRunFinish, JobRunInsert, JobScheduleFilters, JobScheduleInput } from '../dto/job.dto';
import { JobRunSQL } from '../sql/job-run.sql';
import { JobScheduleSQL } from '../sql/job-schedule.sql';
import {
    type JobCountRow,
    type JobIdRow,
    type JobRunRow,
    JobRunStatus,
    type JobScheduleRow,
    JobScheduleStatus,
} from '../types/job.types';

const ERROR_STATUSES: readonly number[] = [JobRunStatus.FAILED, JobRunStatus.TERMINATED];

const OPEN_STATUSES = [JobRunStatus.WAITING, JobRunStatus.RUNNING] as const;

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const scheduleShape = (filters: JobScheduleFilters) => ({
    search: filters.search !== undefined,
    status: filters.status !== undefined,
});

const scheduleValues = (filters: JobScheduleFilters): unknown[] => [
    ...(filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
];

const runShape = (filters: JobRunFilters) => ({
    search: filters.search !== undefined,
    scheduleId: filters.scheduleId !== undefined,
    status: filters.status !== undefined,
    trigger: filters.trigger !== undefined,
    from: filters.from !== undefined,
    to: filters.to !== undefined,
    errorsOnly: filters.errorsOnly,
    oneTime: filters.oneTime,
});

const runValues = (filters: JobRunFilters): unknown[] => [
    ...(filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : []),
    ...(filters.scheduleId !== undefined ? [filters.scheduleId] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.trigger !== undefined ? [filters.trigger] : []),
    ...(filters.from !== undefined ? [filters.from] : []),
    ...(filters.to !== undefined ? [filters.to] : []),
    ...(filters.errorsOnly ? ERROR_STATUSES : []),
];

export class JobRepository implements IJobRepository {
    schedules(db: DbExecutor, filters: JobScheduleFilters, pagination: PaginationQuery): Promise<JobScheduleRow[]> {
        return db.query<JobScheduleRow>(JobScheduleSQL.list(scheduleShape(filters)), [
            ...scheduleValues(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countSchedules(db: DbExecutor, filters: JobScheduleFilters): Promise<number> {
        const [row] = await db.query<JobCountRow>(
            JobScheduleSQL.count(scheduleShape(filters)),
            scheduleValues(filters),
        );
        return Number(row?.total ?? 0);
    }

    async schedule(db: DbExecutor, id: number): Promise<JobScheduleRow | undefined> {
        const [row] = await db.query<JobScheduleRow>(JobScheduleSQL.find, [id]);
        return row;
    }

    activeSchedules(db: DbExecutor): Promise<JobScheduleRow[]> {
        return db.query<JobScheduleRow>(JobScheduleSQL.active, [JobScheduleStatus.ACTIVE]);
    }

    async isScheduleNameTaken(db: DbExecutor, name: string, exceptId: number): Promise<boolean> {
        return (await db.query<JobIdRow>(JobScheduleSQL.nameTaken, [name, exceptId])).length > 0;
    }

    async insertSchedule(db: DbExecutor, input: JobScheduleInput, actorId: number): Promise<number> {
        const result = await db.execute(JobScheduleSQL.insert, [
            input.name,
            input.command,
            JSON.stringify(input.arguments),
            input.cronExpression,
            input.timeoutMinutes,
            input.description,
            input.status,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async updateSchedule(db: DbExecutor, id: number, input: JobScheduleInput, actorId: number): Promise<void> {
        await db.execute(JobScheduleSQL.update, [
            input.name,
            input.command,
            JSON.stringify(input.arguments),
            input.cronExpression,
            input.timeoutMinutes,
            input.description,
            input.status,
            actorId,
            id,
        ]);
    }

    runs(db: DbExecutor, filters: JobRunFilters, pagination: PaginationQuery): Promise<JobRunRow[]> {
        return db.query<JobRunRow>(JobRunSQL.list(runShape(filters), ERROR_STATUSES.length), [
            ...runValues(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countRuns(db: DbExecutor, filters: JobRunFilters): Promise<number> {
        const [row] = await db.query<JobCountRow>(
            JobRunSQL.count(runShape(filters), ERROR_STATUSES.length),
            runValues(filters),
        );
        return Number(row?.total ?? 0);
    }

    async run(db: DbExecutor, id: number): Promise<JobRunRow | undefined> {
        const [row] = await db.query<JobRunRow>(JobRunSQL.find, [id]);
        return row;
    }

    async insertRun(db: DbExecutor, run: JobRunInsert): Promise<number | null> {
        const finished = run.status === JobRunStatus.SKIPPED ? new Date() : null;
        const result = await db.execute(JobRunSQL.insert, [
            run.command,
            JSON.stringify(run.arguments),
            run.title,
            run.scheduleId,
            run.trigger,
            run.runKey,
            run.runAt,
            run.status,
            run.timeoutMinutes,
            run.retryOfRunId,
            run.error,
            finished,
            run.createdBy,
        ]);
        return result.affectedRows > 0 ? result.insertId : null;
    }

    async hasOpenRunOfSchedule(db: DbExecutor, scheduleId: number): Promise<boolean> {
        return (await db.query<JobIdRow>(JobRunSQL.openRunOfSchedule, [scheduleId, ...OPEN_STATUSES])).length > 0;
    }

    async dueRunIds(db: DbExecutor, limit: number): Promise<number[]> {
        const rows = await db.query<JobIdRow>(JobRunSQL.dueIds, [JobRunStatus.WAITING, limit]);
        return rows.map((row) => Number(row.id));
    }

    async markRunning(db: DbExecutor, id: number): Promise<void> {
        await db.execute(JobRunSQL.markRunning, [JobRunStatus.RUNNING, id]);
    }

    async setPid(db: DbExecutor, id: number, pid: number): Promise<void> {
        await db.execute(JobRunSQL.setPid, [pid, id]);
    }

    async heartbeat(db: DbExecutor, ids: readonly number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.execute(JobRunSQL.heartbeat(ids.length), [JobRunStatus.RUNNING, ...ids]);
    }

    async finishRun(db: DbExecutor, id: number, finish: JobRunFinish): Promise<boolean> {
        const result = await db.execute(JobRunSQL.finish, [
            finish.status,
            finish.exitCode,
            finish.output,
            finish.error,
            id,
            JobRunStatus.RUNNING,
        ]);
        return result.affectedRows > 0;
    }

    async recoverStaleRuns(db: DbExecutor, staleSeconds: number, message: string): Promise<number> {
        const result = await db.execute(JobRunSQL.recoverStale, [
            JobRunStatus.FAILED,
            message,
            JobRunStatus.RUNNING,
            staleSeconds,
        ]);
        return result.affectedRows;
    }

    async cancelRun(db: DbExecutor, id: number): Promise<boolean> {
        const result = await db.execute(JobRunSQL.cancel, [JobRunStatus.CANCELLED, id, JobRunStatus.WAITING]);
        return result.affectedRows > 0;
    }

    async terminateRun(db: DbExecutor, id: number, message: string): Promise<boolean> {
        const result = await db.execute(JobRunSQL.terminate, [
            JobRunStatus.TERMINATED,
            message,
            id,
            JobRunStatus.RUNNING,
        ]);
        return result.affectedRows > 0;
    }
}
