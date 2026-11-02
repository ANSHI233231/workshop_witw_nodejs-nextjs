export const JobScheduleStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type JobScheduleStatusCode = (typeof JobScheduleStatus)[keyof typeof JobScheduleStatus];

export const JobRunTrigger = { SCHEDULE: 1, APP: 2, RUN_NOW: 3, PLANNED: 4, RETRY: 5 } as const;

export type JobRunTriggerCode = (typeof JobRunTrigger)[keyof typeof JobRunTrigger];

export const JobRunStatus = {
    WAITING: 1,
    RUNNING: 2,
    DONE: 3,
    FAILED: 4,
    CANCELLED: 5,
    TERMINATED: 6,
    SKIPPED: 7,
} as const;

export type JobRunStatusCode = (typeof JobRunStatus)[keyof typeof JobRunStatus];

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
    SEARCH: 100,
} as const;

export const JOB_COMMAND_PATTERN = /^[a-z0-9-]+(\/[a-z0-9-]+)?$/;

export const JobTab = { SCHEDULED: 'scheduled', ONE_TIME: 'one-time', LOGS: 'logs' } as const;

export type JobTabKey = (typeof JobTab)[keyof typeof JobTab];

export type JobCommand = {
    readonly command: string;
    readonly arguments: readonly { readonly name: string; readonly optional: boolean }[];
    readonly description: string;
};

export type JobLastRun = {
    readonly id: number;
    readonly status: JobRunStatusCode;
    readonly runAt: string;
    readonly durationSeconds: number | null;
};

export type JobSchedule = {
    readonly id: number;
    readonly name: string;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly cronExpression: string;
    readonly timeoutMinutes: number;
    readonly description: string | null;
    readonly status: JobScheduleStatusCode;
    readonly lastRun: JobLastRun | null;
    readonly nextRunAt: string | null;
};

export type JobRun = {
    readonly id: number;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly title: string | null;
    readonly scheduleId: number | null;
    readonly scheduleName: string | null;
    readonly trigger: JobRunTriggerCode;
    readonly runAt: string;
    readonly status: JobRunStatusCode;
    readonly timeoutMinutes: number;
    readonly progressPercent: number | null;
    readonly startedAt: string | null;
    readonly finishedAt: string | null;
    readonly durationSeconds: number | null;
    readonly exitCode: number | null;
    readonly retryOfRunId: number | null;
    readonly createdByName: string | null;
};

export type JobRunDetail = JobRun & { readonly output: string | null; readonly error: string | null };

export type JobScheduleBody = {
    readonly name: string;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly cronExpression: string;
    readonly timeoutMinutes: number;
    readonly description: string | null;
    readonly status: JobScheduleStatusCode;
};

export type JobRunBody = {
    readonly title: string | null;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly runAt: string | null;
    readonly timeoutMinutes: number;
};

export type JobScheduleFilters = {
    readonly tab: typeof JobTab.SCHEDULED;
    readonly search: string;
    readonly status: JobScheduleStatusCode | undefined;
    readonly page: number;
};

export type JobRunFilters = {
    readonly tab: typeof JobTab.ONE_TIME | typeof JobTab.LOGS;
    readonly search: string;
    readonly status: JobRunStatusCode | undefined;
    readonly scheduleId: number | undefined;
    readonly trigger: JobRunTriggerCode | undefined;
    readonly from: string | undefined;
    readonly to: string | undefined;
    readonly errorsOnly: boolean;
    readonly page: number;
};

export type JobFilters = JobScheduleFilters | JobRunFilters;

export type JobScheduleOption = { readonly id: number; readonly name: string };
