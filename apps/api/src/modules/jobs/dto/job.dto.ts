export type JobScheduleInput = {
    readonly name: string;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly cronExpression: string;
    readonly timeoutMinutes: number;
    readonly description: string | null;
    readonly status: number;
};

export type JobScheduleFilters = { readonly search: string | undefined; readonly status: number | undefined };

export type JobScheduleDto = {
    readonly id: number;
    readonly name: string;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly cronExpression: string;
    readonly timeoutMinutes: number;
    readonly description: string | null;
    readonly status: number;
    readonly lastRun: {
        readonly id: number;
        readonly status: number;
        readonly runAt: string;
        readonly durationSeconds: number | null;
    } | null;
    readonly nextRunAt: string | null;
};

export type JobRunFilters = {
    readonly search: string | undefined;
    readonly scheduleId: number | undefined;
    readonly status: number | undefined;
    readonly trigger: number | undefined;
    readonly from: string | undefined;
    readonly to: string | undefined;
    readonly errorsOnly: boolean;
    readonly oneTime: boolean;
};

export type JobRunDto = {
    readonly id: number;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly title: string | null;
    readonly scheduleId: number | null;
    readonly scheduleName: string | null;
    readonly trigger: number;
    readonly runAt: string;
    readonly status: number;
    readonly timeoutMinutes: number;
    readonly progressPercent: number | null;
    readonly startedAt: string | null;
    readonly finishedAt: string | null;
    readonly durationSeconds: number | null;
    readonly exitCode: number | null;
    readonly retryOfRunId: number | null;
    readonly createdByName: string | null;
};

export type JobRunDetailDto = JobRunDto & { readonly output: string | null; readonly error: string | null };

export type JobRunCommandInput = {
    readonly title: string | null;
    readonly command: string;
    readonly arguments: readonly string[];
    readonly runAt: string | null;
    readonly timeoutMinutes: number;
};

export type JobEnqueueInput = {
    readonly command: string;
    readonly arguments: readonly string[];
    readonly title?: string;
    readonly runAt?: Date;
    readonly runKey?: string;
    readonly timeoutMinutes?: number;
};

export type JobRunInsert = {
    readonly command: string;
    readonly arguments: readonly string[];
    readonly title: string | null;
    readonly scheduleId: number | null;
    readonly trigger: number;
    readonly runKey: string | null;
    readonly runAt: Date;
    readonly status: number;
    readonly timeoutMinutes: number;
    readonly retryOfRunId: number | null;
    readonly error: string | null;
    readonly createdBy: number | null;
};

export type JobRunFinish = {
    readonly status: number;
    readonly exitCode: number | null;
    readonly output: string | null;
    readonly error: string | null;
};

export type JobCommandDto = {
    readonly command: string;
    readonly arguments: readonly { readonly name: string; readonly optional: boolean }[];
    readonly description: string;
};

export type JobSchedulePreviewDto = { readonly nextRuns: readonly string[] };

export type JobServerTimeDto = { readonly now: string; readonly timeZone: string };

export type JobPage<T> = { readonly items: readonly T[]; readonly total: number };
