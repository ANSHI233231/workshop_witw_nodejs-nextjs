import type { RowDataPacket } from '../../../database/connection';

export const JobScheduleStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export const JOB_SCHEDULE_STATUSES: readonly number[] = Object.values(JobScheduleStatus);

export const JobRunTrigger = { SCHEDULE: 1, APP: 2, RUN_NOW: 3, PLANNED: 4, RETRY: 5 } as const;

export const JOB_RUN_TRIGGERS: readonly number[] = Object.values(JobRunTrigger);

export const JobRunStatus = {
    WAITING: 1,
    RUNNING: 2,
    DONE: 3,
    FAILED: 4,
    CANCELLED: 5,
    TERMINATED: 6,
    SKIPPED: 7,
} as const;

export const JOB_RUN_STATUSES: readonly number[] = Object.values(JobRunStatus);

export const JOB_RUN_FINISHED_STATUSES: readonly number[] = [
    JobRunStatus.DONE,
    JobRunStatus.FAILED,
    JobRunStatus.CANCELLED,
    JobRunStatus.TERMINATED,
    JobRunStatus.SKIPPED,
];

export const JOB_TIME_ZONE = 'Asia/Kolkata';

export const JOB_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 100,
    COMMAND_MAX: 150,
    ARGUMENT_MAX: 500,
    ARGUMENTS_MAX: 20,
    TIMEOUT_MIN: 1,
    TIMEOUT_MAX: 1440,
    TIMEOUT_DEFAULT: 60,
    DESCRIPTION_MAX: 500,
    TITLE_MAX: 100,
    CRON_MAX: 100,
    SEARCH_MAX: 100,
    OUTPUT_MAX: 65535,
    NEXT_RUNS: 3,
} as const;

export const JOB_COMMAND_PATTERN = /^[a-z0-9-]+(\/[a-z0-9-]+)?$/;

export const JOB_CATALOG_COMMAND = 'job/commands';

export interface JobScheduleRow extends RowDataPacket {
    id: number;
    name: string;
    command: string;
    arguments: unknown;
    cronExpression: string;
    timeoutMinutes: number;
    description: string | null;
    status: number;
    lastRunId: number | null;
    lastRunStatus: number | null;
    lastRunAt: Date | string | null;
    lastStartedAt: Date | string | null;
    lastFinishedAt: Date | string | null;
}

export interface JobRunRow extends RowDataPacket {
    id: number;
    command: string;
    arguments: unknown;
    title: string | null;
    jobScheduleId: number | null;
    scheduleName: string | null;
    runTrigger: number;
    runAt: Date | string;
    status: number;
    timeoutMinutes: number;
    pid: number | null;
    progressPercent: number | null;
    startedAt: Date | string | null;
    finishedAt: Date | string | null;
    exitCode: number | null;
    output: string | null;
    error: string | null;
    retryOfJobRunId: number | null;
    createdBy: number | null;
    createdByName: string | null;
    createdAt: Date | string;
}

export interface JobIdRow extends RowDataPacket {
    id: number;
}

export interface JobCountRow extends RowDataPacket {
    total: number;
}
