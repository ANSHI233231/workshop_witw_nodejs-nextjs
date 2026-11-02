import { logger } from '../../../core/logger';
import type { Database } from '../../../database/connection';
import type { ICommandRunner, RunningCommand } from '../../../infrastructure/process';
import type { IJobRepository } from '../contracts/job-repository.contract';
import { JOB_LIMITS, JobRunStatus, JobRunTrigger, type JobScheduleRow } from '../types/job.types';

import { isDueAt, minuteOf } from './job-cron';
import type { JobFailureNotifier } from './job-failure-notifier';
import { argumentsOf } from './job-mappers';

const log = logger.category('jobs');

const SCHEDULE_CHECK_MS = 15_000;

const MINUTE_MS = 60_000;

const STOPPED_BEFORE_FINISHING = 'Stopped before it finished.';

export type JobWorkerSettings = {
    readonly pollSeconds: number;
    readonly maxParallel: number;
    readonly staleSeconds: number;
};

type ActiveRun = { readonly command: RunningCommand; timedOut: boolean; readonly timer: NodeJS.Timeout };

const capped = (text: string): string | null =>
    text.length === 0 ? null : text.length > JOB_LIMITS.OUTPUT_MAX ? text.slice(0, JOB_LIMITS.OUTPUT_MAX) : text;

export class JobWorker {
    private readonly active = new Map<number, ActiveRun>();
    private readonly intervals: NodeJS.Timeout[] = [];
    private lastScheduledMinute = 0;
    private polling = false;

    constructor(
        private readonly db: Database,
        private readonly repository: IJobRepository,
        private readonly runner: ICommandRunner,
        private readonly settings: JobWorkerSettings,
        private readonly failureNotifier: JobFailureNotifier,
    ) {}

    start(): void {
        log.info('Worker started', { ...this.settings });
        this.intervals.push(
            setInterval(() => void this.scheduleTick(), SCHEDULE_CHECK_MS),
            setInterval(() => void this.pollTick(), this.settings.pollSeconds * 1000),
        );
        void this.scheduleTick();
        void this.pollTick();
    }

    async stop(): Promise<void> {
        this.intervals.forEach((interval) => clearInterval(interval));
        for (const [id, run] of this.active) {
            clearTimeout(run.timer);
            run.command.stop();
            await this.repository
                .finishRun(this.db, id, {
                    status: JobRunStatus.FAILED,
                    exitCode: null,
                    output: null,
                    error: STOPPED_BEFORE_FINISHING,
                })
                .catch((error: unknown) => log.error('Could not close a run on stop', { id, error }));
        }
        log.info('Worker stopped');
    }

    private async scheduleTick(): Promise<void> {
        const minute = minuteOf(new Date());
        if (minute.getTime() === this.lastScheduledMinute) return;
        this.lastScheduledMinute = minute.getTime();
        try {
            const schedules = await this.repository.activeSchedules(this.db);
            for (const schedule of schedules.filter((due) => isDueAt(due.cronExpression, minute))) {
                await this.queueScheduled(schedule, minute);
            }
        } catch (error) {
            log.error('Schedule check failed', { error });
        }
    }

    private async queueScheduled(schedule: JobScheduleRow, minute: Date): Promise<void> {
        const scheduleId = Number(schedule.id);
        const overlapping = await this.repository.hasOpenRunOfSchedule(this.db, scheduleId);
        await this.repository.insertRun(this.db, {
            command: schedule.command,
            arguments: argumentsOf(schedule.arguments),
            title: schedule.name,
            scheduleId,
            trigger: JobRunTrigger.SCHEDULE,
            runKey: `schedule:${scheduleId}@${minute.toISOString()}`,
            runAt: minute,
            status: overlapping ? JobRunStatus.SKIPPED : JobRunStatus.WAITING,
            timeoutMinutes: Number(schedule.timeoutMinutes),
            retryOfRunId: null,
            error: overlapping ? 'Previous run still running.' : null,
            createdBy: null,
        });
    }

    private async pollTick(): Promise<void> {
        if (this.polling) return;
        this.polling = true;
        try {
            await this.repository.heartbeat(this.db, [...this.active.keys()]);
            const recovered = await this.repository.recoverStaleRuns(
                this.db,
                this.settings.staleSeconds,
                STOPPED_BEFORE_FINISHING,
            );
            if (recovered > 0) log.warn('Runs whose worker stopped were marked failed', { recovered });
            const free = this.settings.maxParallel - this.active.size;
            if (free <= 0) return;
            const ids = await this.db.transaction(async () => {
                const due = await this.repository.dueRunIds(this.db, free);
                for (const id of due) await this.repository.markRunning(this.db, id);
                return due;
            });
            for (const id of ids) await this.startRun(id);
        } catch (error) {
            log.error('Worker poll failed', { error });
        } finally {
            this.polling = false;
        }
    }

    private async startRun(id: number): Promise<void> {
        const row = await this.repository.run(this.db, id);
        if (!row) return;
        const command = this.runner.startCli(row.command, argumentsOf(row.arguments), { JOB_RUN_ID: String(id) });
        const timeoutMinutes = Number(row.timeoutMinutes);
        const active: ActiveRun = {
            command,
            timedOut: false,
            timer: setTimeout(() => {
                active.timedOut = true;
                command.stop();
            }, timeoutMinutes * MINUTE_MS),
        };
        this.active.set(id, active);
        if (command.pid !== null) await this.repository.setPid(this.db, id, command.pid);
        log.info('Run started', { id, command: row.command, pid: command.pid });
        let output = '';
        let error = '';
        command.onStdout((text) => {
            if (output.length <= JOB_LIMITS.OUTPUT_MAX) output += text;
        });
        command.onStderr((text) => {
            if (error.length <= JOB_LIMITS.OUTPUT_MAX) error += text;
        });
        void command.finished.then(async (exit) => {
            clearTimeout(active.timer);
            this.active.delete(id);
            const succeeded =
                !active.timedOut && exit.startError === null && exit.signal === null && exit.exitCode === 0;
            const reason = active.timedOut
                ? `Timed out after ${timeoutMinutes} minute${timeoutMinutes === 1 ? '' : 's'}.`
                : (exit.startError ??
                  (exit.signal ? `Stopped by signal ${exit.signal}.` : `Exit code ${exit.exitCode}.`));
            await this.repository
                .finishRun(this.db, id, {
                    status: succeeded ? JobRunStatus.DONE : JobRunStatus.FAILED,
                    exitCode: exit.exitCode,
                    output: capped(output),
                    error: succeeded ? capped(error) : capped(error ? `${reason}\n${error}` : reason),
                })
                .catch((failure: unknown) => log.error('Could not record a run result', { id, error: failure }));
            log.info('Run finished', { id, command: row.command, exit, succeeded });
            if (!succeeded) {
                await this.failureNotifier
                    .runFailed({ id, command: row.command, title: row.title }, reason)
                    .catch((failure: unknown) => log.error('Could not notify a failed run', { id, error: failure }));
            }
        });
    }
}
