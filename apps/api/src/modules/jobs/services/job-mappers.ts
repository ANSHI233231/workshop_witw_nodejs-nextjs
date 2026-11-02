import type { JobRunDetailDto, JobRunDto, JobScheduleDto } from '../dto/job.dto';
import { JobScheduleStatus, type JobRunRow, type JobScheduleRow } from '../types/job.types';

import { nextRunsOf } from './job-cron';

const isoOf = (value: Date | string | null | undefined): string | null =>
    value === null || value === undefined ? null : new Date(value).toISOString();

const secondsBetween = (start: Date | string | null, end: Date | string | null): number | null =>
    start && end ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)) : null;

export const argumentsOf = (stored: unknown): string[] => {
    const parsed: unknown = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
};

const nextRunOf = (row: JobScheduleRow): string | null => {
    if (Number(row.status) !== JobScheduleStatus.ACTIVE) return null;
    try {
        return nextRunsOf(row.cronExpression, new Date(), 1)[0]?.toISOString() ?? null;
    } catch {
        return null;
    }
};

export const scheduleOf = (row: JobScheduleRow): JobScheduleDto => ({
    id: Number(row.id),
    name: row.name,
    command: row.command,
    arguments: argumentsOf(row.arguments),
    cronExpression: row.cronExpression,
    timeoutMinutes: Number(row.timeoutMinutes),
    description: row.description,
    status: Number(row.status),
    lastRun:
        row.lastRunId === null
            ? null
            : {
                  id: Number(row.lastRunId),
                  status: Number(row.lastRunStatus),
                  runAt: isoOf(row.lastRunAt) ?? '',
                  durationSeconds: secondsBetween(row.lastStartedAt, row.lastFinishedAt),
              },
    nextRunAt: nextRunOf(row),
});

export const runOf = (row: JobRunRow): JobRunDto => ({
    id: Number(row.id),
    command: row.command,
    arguments: argumentsOf(row.arguments),
    title: row.title,
    scheduleId: row.jobScheduleId === null ? null : Number(row.jobScheduleId),
    scheduleName: row.scheduleName,
    trigger: Number(row.runTrigger),
    runAt: isoOf(row.runAt) ?? '',
    status: Number(row.status),
    timeoutMinutes: Number(row.timeoutMinutes),
    progressPercent: row.progressPercent === null ? null : Number(row.progressPercent),
    startedAt: isoOf(row.startedAt),
    finishedAt: isoOf(row.finishedAt),
    durationSeconds: secondsBetween(row.startedAt, row.finishedAt),
    exitCode: row.exitCode === null ? null : Number(row.exitCode),
    retryOfRunId: row.retryOfJobRunId === null ? null : Number(row.retryOfJobRunId),
    createdByName: row.createdByName,
});

export const runDetailOf = (row: JobRunRow): JobRunDetailDto => ({
    ...runOf(row),
    output: row.output,
    error: row.error,
});
