import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import type { ICommandRunner } from '../../../infrastructure/process';
import { AuditAction, type AuditActionCode, AuditEntity, type AuditEntityCode, type IAuditService } from '../../audit';
import type { IJobRepository } from '../contracts/job-repository.contract';
import type { IJobService } from '../contracts/job-service.contract';
import type {
    JobCommandDto,
    JobEnqueueInput,
    JobPage,
    JobRunCommandInput,
    JobRunDetailDto,
    JobRunDto,
    JobRunFilters,
    JobRunInsert,
    JobScheduleDto,
    JobScheduleFilters,
    JobScheduleInput,
    JobSchedulePreviewDto,
    JobServerTimeDto,
} from '../dto/job.dto';
import { JOB_LIMITS, JOB_TIME_ZONE, JobRunStatus, JobRunTrigger, JobScheduleStatus } from '../types/job.types';

import { isCronExpression, nextRunsOf } from './job-cron';
import type { JobCommandService } from './job-command.service';
import { argumentsOf, runDetailOf, runOf, scheduleOf } from './job-mappers';

const PLANNED_GRACE_MS = 60_000;

const fieldProblem = (field: string, message: string, code: string): ValidationException =>
    new ValidationException(message, [{ field, message }], code);

const scheduleMissing = (): NotFoundException =>
    new NotFoundException('This scheduled job was not found.', 'JOB_SCHEDULE_NOT_FOUND');

const runMissing = (): NotFoundException => new NotFoundException('This job run was not found.', 'JOB_RUN_NOT_FOUND');

type Changes = Record<string, { from: unknown; to: unknown }>;

const changesOf = (before: Record<string, unknown>, after: Record<string, unknown>): Changes =>
    Object.fromEntries(
        Object.entries(after)
            .filter(([key, value]) => JSON.stringify(before[key]) !== JSON.stringify(value))
            .map(([key, value]) => [key, { from: before[key], to: value }]),
    );

const scheduleFields = (schedule: JobScheduleDto | JobScheduleInput): Record<string, unknown> => ({
    name: schedule.name,
    command: schedule.command,
    arguments: schedule.arguments,
    cronExpression: schedule.cronExpression,
    timeoutMinutes: schedule.timeoutMinutes,
    description: schedule.description,
    status: schedule.status,
});

export class JobService implements IJobService {
    constructor(
        private readonly db: Database,
        private readonly repository: IJobRepository,
        private readonly commandList: JobCommandService,
        private readonly runner: ICommandRunner,
        private readonly auditService: IAuditService,
    ) {}

    commands(): Promise<readonly JobCommandDto[]> {
        return this.commandList.commands();
    }

    serverTime(): JobServerTimeDto {
        return { now: new Date().toISOString(), timeZone: JOB_TIME_ZONE };
    }

    preview(cronExpression: string): JobSchedulePreviewDto {
        if (!isCronExpression(cronExpression)) {
            throw fieldProblem('cronExpression', 'Enter a valid cron expression.', 'JOB_CRON_INVALID');
        }
        return {
            nextRuns: nextRunsOf(cronExpression, new Date(), JOB_LIMITS.NEXT_RUNS).map((at) => at.toISOString()),
        };
    }

    async schedules(filters: JobScheduleFilters, pagination: PaginationQuery): Promise<JobPage<JobScheduleDto>> {
        const [rows, total] = await Promise.all([
            this.repository.schedules(this.db, filters, pagination),
            this.repository.countSchedules(this.db, filters),
        ]);
        return { items: rows.map(scheduleOf), total };
    }

    addSchedule(input: JobScheduleInput, actorId: number): Promise<JobScheduleDto> {
        return this.audited(
            AuditAction.JOB_SCHEDULE_ADDED,
            AuditAction.JOB_SCHEDULE_ADD_FAILED,
            AuditEntity.JOB_SCHEDULE,
            undefined,
            async () => {
                await this.checkSchedule(input, 0);
                const id = await this.repository.insertSchedule(this.db, input, actorId);
                return {
                    result: await this.foundSchedule(id),
                    entityId: id,
                    changes: changesOf({}, scheduleFields(input)),
                };
            },
        );
    }

    updateSchedule(id: number, input: JobScheduleInput, actorId: number): Promise<JobScheduleDto> {
        return this.audited(
            AuditAction.JOB_SCHEDULE_UPDATED,
            AuditAction.JOB_SCHEDULE_UPDATE_FAILED,
            AuditEntity.JOB_SCHEDULE,
            id,
            async () => {
                const before = await this.foundSchedule(id);
                await this.checkSchedule(input, id);
                await this.repository.updateSchedule(this.db, id, input, actorId);
                return {
                    result: await this.foundSchedule(id),
                    entityId: id,
                    changes: changesOf(scheduleFields(before), scheduleFields(input)),
                };
            },
        );
    }

    async setScheduleStatus(id: number, status: number, actorId: number): Promise<JobScheduleDto> {
        const schedule = await this.foundSchedule(id);
        return this.updateSchedule(id, { ...schedule, status }, actorId);
    }

    async runScheduleNow(id: number, actorId: number): Promise<JobRunDetailDto> {
        const schedule = await this.foundSchedule(id);
        return this.queueFromConsole(
            {
                command: schedule.command,
                arguments: schedule.arguments,
                title: schedule.name,
                scheduleId: schedule.id,
                trigger: JobRunTrigger.RUN_NOW,
                runKey: null,
                runAt: new Date(),
                status: JobRunStatus.WAITING,
                timeoutMinutes: schedule.timeoutMinutes,
                retryOfRunId: null,
                error: null,
                createdBy: actorId,
            },
            actorId,
        );
    }

    async runs(filters: JobRunFilters, pagination: PaginationQuery): Promise<JobPage<JobRunDto>> {
        const [rows, total] = await Promise.all([
            this.repository.runs(this.db, filters, pagination),
            this.repository.countRuns(this.db, filters),
        ]);
        return { items: rows.map(runOf), total };
    }

    async run(id: number): Promise<JobRunDetailDto> {
        const row = await this.repository.run(this.db, id);
        if (!row) throw runMissing();
        return runDetailOf(row);
    }

    async runCommand(input: JobRunCommandInput, actorId: number): Promise<JobRunDetailDto> {
        await this.checkCommand(input.command);
        const runAt = input.runAt === null ? new Date() : new Date(input.runAt);
        if (input.runAt !== null && runAt.getTime() < Date.now() - PLANNED_GRACE_MS) {
            throw fieldProblem('runAt', 'Pick a time in the future.', 'JOB_RUN_AT_PAST');
        }
        return this.queueFromConsole(
            {
                command: input.command,
                arguments: input.arguments,
                title: input.title,
                scheduleId: null,
                trigger: input.runAt === null ? JobRunTrigger.RUN_NOW : JobRunTrigger.PLANNED,
                runKey: null,
                runAt,
                status: JobRunStatus.WAITING,
                timeoutMinutes: input.timeoutMinutes,
                retryOfRunId: null,
                error: null,
                createdBy: actorId,
            },
            actorId,
        );
    }

    async cancelRun(id: number, actorId: number): Promise<JobRunDetailDto> {
        const run = await this.run(id);
        await this.audited(
            AuditAction.JOB_RUN_CANCELLED,
            AuditAction.JOB_RUN_STOP_FAILED,
            AuditEntity.JOB_RUN,
            id,
            async () => {
                if (!(await this.repository.cancelRun(this.db, id))) {
                    throw new ConflictException('Only a waiting run can be cancelled.', 'JOB_RUN_NOT_WAITING');
                }
                return { result: null, entityId: id, details: { command: run.command, actorId } };
            },
        );
        return this.run(id);
    }

    async terminateRun(id: number, actorId: number): Promise<JobRunDetailDto> {
        const row = await this.repository.run(this.db, id);
        if (!row) throw runMissing();
        const pid = row.pid === null ? null : Number(row.pid);
        await this.audited(
            AuditAction.JOB_RUN_TERMINATED,
            AuditAction.JOB_RUN_STOP_FAILED,
            AuditEntity.JOB_RUN,
            id,
            async () => {
                if (!(await this.repository.terminateRun(this.db, id, 'Terminated from the console.'))) {
                    throw new ConflictException('Only a running run can be terminated.', 'JOB_RUN_NOT_RUNNING');
                }
                return { result: null, entityId: id, details: { command: row.command, pid, actorId } };
            },
        );
        if (pid !== null) this.runner.stopProcess(pid);
        return this.run(id);
    }

    async retryRun(id: number, actorId: number): Promise<JobRunDetailDto> {
        const row = await this.repository.run(this.db, id);
        if (!row) throw runMissing();
        const status = Number(row.status);
        if (status !== JobRunStatus.FAILED && status !== JobRunStatus.TERMINATED) {
            throw new ConflictException('Only a failed or terminated run can be retried.', 'JOB_RUN_NOT_RETRYABLE');
        }
        return this.queueFromConsole(
            {
                command: row.command,
                arguments: argumentsOf(row.arguments),
                title: row.title,
                scheduleId: row.jobScheduleId === null ? null : Number(row.jobScheduleId),
                trigger: JobRunTrigger.RETRY,
                runKey: null,
                runAt: new Date(),
                status: JobRunStatus.WAITING,
                timeoutMinutes: Number(row.timeoutMinutes),
                retryOfRunId: Number(row.id),
                error: null,
                createdBy: actorId,
            },
            actorId,
        );
    }

    enqueue(input: JobEnqueueInput): Promise<number | null> {
        return this.repository.insertRun(this.db, {
            command: input.command,
            arguments: input.arguments,
            title: input.title ?? null,
            scheduleId: null,
            trigger: JobRunTrigger.APP,
            runKey: input.runKey ?? null,
            runAt: input.runAt ?? new Date(),
            status: JobRunStatus.WAITING,
            timeoutMinutes: input.timeoutMinutes ?? JOB_LIMITS.TIMEOUT_DEFAULT,
            retryOfRunId: null,
            error: null,
            createdBy: null,
        });
    }

    private async queueFromConsole(insert: JobRunInsert, actorId: number): Promise<JobRunDetailDto> {
        const id = await this.audited(
            AuditAction.JOB_RUN_QUEUED,
            AuditAction.JOB_RUN_QUEUE_FAILED,
            AuditEntity.JOB_RUN,
            undefined,
            async () => {
                const runId = await this.repository.insertRun(this.db, insert);
                if (runId === null) throw new ConflictException('This run is already queued.', 'JOB_RUN_DUPLICATE');
                return {
                    result: runId,
                    entityId: runId,
                    details: {
                        command: insert.command,
                        arguments: insert.arguments,
                        trigger: insert.trigger,
                        runAt: insert.runAt.toISOString(),
                        actorId,
                    },
                };
            },
        );
        return this.run(id);
    }

    private async checkSchedule(input: JobScheduleInput, exceptId: number): Promise<void> {
        if (await this.repository.isScheduleNameTaken(this.db, input.name, exceptId)) {
            throw fieldProblem('name', 'This name already exists.', 'JOB_SCHEDULE_NAME_TAKEN');
        }
        await this.checkCommand(input.command);
        if (!isCronExpression(input.cronExpression)) {
            throw fieldProblem('cronExpression', 'Enter a valid cron expression.', 'JOB_CRON_INVALID');
        }
        if (!Object.values<number>(JobScheduleStatus).includes(input.status)) {
            throw fieldProblem('status', 'Choose a valid status.', 'JOB_SCHEDULE_STATUS_INVALID');
        }
    }

    private async checkCommand(command: string): Promise<void> {
        if (!(await this.commandList.isKnown(command))) {
            throw fieldProblem('command', "This command doesn't exist.", 'JOB_COMMAND_UNKNOWN');
        }
    }

    private async foundSchedule(id: number): Promise<JobScheduleDto> {
        const row = await this.repository.schedule(this.db, id);
        if (!row) throw scheduleMissing();
        return scheduleOf(row);
    }

    private async audited<T>(
        action: AuditActionCode,
        failedAction: AuditActionCode,
        entityType: AuditEntityCode,
        entityId: number | undefined,
        work: () => Promise<{
            readonly result: T;
            readonly entityId: number;
            readonly changes?: Changes;
            readonly details?: Record<string, unknown>;
        }>,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType,
                    entityId: done.entityId,
                    ...(done.changes ? { changes: done.changes } : {}),
                    ...(done.details ? { details: done.details } : {}),
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: failedAction, entityType, ...(entityId === undefined ? {} : { entityId }) },
                error,
            );
            throw error;
        }
    }
}
