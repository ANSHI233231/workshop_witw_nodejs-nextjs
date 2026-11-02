import type { Translate } from '@/lib/i18n/locale';
import {
    JobRunStatus,
    type JobRunStatusCode,
    JobRunTrigger,
    type JobRunTriggerCode,
    JobScheduleStatus,
    type JobScheduleStatusCode,
} from '@/types/job.types';

type Badge = { readonly label: string; readonly className: string };

export const RUN_STATUS_BADGES: Readonly<Record<JobRunStatusCode, Badge>> = {
    [JobRunStatus.WAITING]: { label: 'Waiting', className: 'badge badge-neutral' },
    [JobRunStatus.RUNNING]: { label: 'Running', className: 'badge badge-info' },
    [JobRunStatus.DONE]: { label: 'Done', className: 'badge badge-success' },
    [JobRunStatus.FAILED]: { label: 'Failed', className: 'badge badge-danger' },
    [JobRunStatus.CANCELLED]: { label: 'Cancelled', className: 'badge badge-neutral' },
    [JobRunStatus.TERMINATED]: { label: 'Terminated', className: 'badge badge-warning' },
    [JobRunStatus.SKIPPED]: { label: 'Skipped', className: 'badge badge-neutral' },
};

export const RUN_STATUS_OPTIONS: readonly { readonly value: JobRunStatusCode; readonly label: string }[] =
    Object.entries(RUN_STATUS_BADGES).map(([value, badge]) => ({
        value: Number(value) as JobRunStatusCode,
        label: badge.label,
    }));

export const TRIGGER_LABELS: Readonly<Record<JobRunTriggerCode, string>> = {
    [JobRunTrigger.SCHEDULE]: 'Schedule',
    [JobRunTrigger.APP]: 'App',
    [JobRunTrigger.RUN_NOW]: 'Run now',
    [JobRunTrigger.PLANNED]: 'Planned',
    [JobRunTrigger.RETRY]: 'Retry',
};

export const TRIGGER_OPTIONS: readonly { readonly value: JobRunTriggerCode; readonly label: string }[] = Object.entries(
    TRIGGER_LABELS,
).map(([value, label]) => ({ value: Number(value) as JobRunTriggerCode, label }));

export const SCHEDULE_STATUS_BADGES: Readonly<Record<JobScheduleStatusCode, Badge>> = {
    [JobScheduleStatus.ACTIVE]: { label: 'Active', className: 'badge badge-success' },
    [JobScheduleStatus.INACTIVE]: { label: 'Inactive', className: 'badge badge-neutral' },
};

export const SCHEDULE_STATUS_OPTIONS: readonly { readonly value: JobScheduleStatusCode; readonly label: string }[] = [
    { value: JobScheduleStatus.ACTIVE, label: 'Active' },
    { value: JobScheduleStatus.INACTIVE, label: 'Inactive' },
];

export const isActiveRun = (status: JobRunStatusCode): boolean =>
    status === JobRunStatus.WAITING || status === JobRunStatus.RUNNING;

export const canRetry = (status: JobRunStatusCode): boolean =>
    status === JobRunStatus.FAILED || status === JobRunStatus.TERMINATED;

const SECONDS_IN_MINUTE = 60;

const SECONDS_IN_HOUR = 3600;

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return '—';
    const whole = Math.max(0, Math.round(seconds));
    if (whole < SECONDS_IN_MINUTE) return `${whole}s`;
    if (whole < SECONDS_IN_HOUR)
        return `${Math.floor(whole / SECONDS_IN_MINUTE)}m ${twoDigits(whole % SECONDS_IN_MINUTE)}s`;
    return `${Math.floor(whole / SECONDS_IN_HOUR)}h ${twoDigits(Math.floor((whole % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE))}m`;
};

export const commandLine = (command: string, args: readonly string[]): string =>
    [command, ...args.map((arg) => (arg === '' || /\s/.test(arg) ? `"${arg}"` : arg))].join(' ');

export const runTriggerText = (
    t: Translate,
    run: {
        readonly trigger: JobRunTriggerCode;
        readonly scheduleName: string | null;
        readonly createdByName: string | null;
    },
): string => {
    if (run.trigger === JobRunTrigger.SCHEDULE && run.scheduleName) return run.scheduleName;
    const label = t(TRIGGER_LABELS[run.trigger]);
    return run.createdByName ? `${label} · ${run.createdByName}` : label;
};
