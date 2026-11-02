import { JOB_COMMAND_PATTERN, JOB_LIMITS as LIMITS, type JobCommand } from '@/types/job.types';

const WHOLE = /^\d+$/;

export const jobNameProblem = (name: string): string | undefined => {
    if (!name) return 'Enter the name.';
    return name.length < LIMITS.NAME_MIN || name.length > LIMITS.NAME_MAX ? 'Use 2 to 100 characters.' : undefined;
};

export const commandProblem = (command: string, commands: readonly JobCommand[]): string | undefined => {
    if (!command) return 'Enter the command.';
    if (command.length > LIMITS.COMMAND_MAX) return `Use ${LIMITS.COMMAND_MAX} characters or fewer.`;
    if (!JOB_COMMAND_PATTERN.test(command)) return 'Enter the command as controller/action, e.g. app-log/prune.';
    if (commands.length && !commands.some((item) => item.command === command)) return "This command doesn't exist.";
    return undefined;
};

export const timeoutProblem = (text: string): string | undefined => {
    const value = text.trim();
    const minutes = Number(value);
    return !WHOLE.test(value) || minutes < LIMITS.TIMEOUT_MIN || minutes > LIMITS.TIMEOUT_MAX
        ? 'Enter a whole number from 1 to 1440.'
        : undefined;
};

export const cronProblem = (expression: string): string | undefined =>
    expression.trim() ? undefined : 'Enter the schedule.';

export const argumentProblem = (value: string): string | undefined =>
    value.length > LIMITS.ARGUMENT_MAX ? `Use ${LIMITS.ARGUMENT_MAX} characters or fewer.` : undefined;

export const optionalTextProblem = (value: string, max: number): string | undefined =>
    value.length > max ? `Use ${max} characters or fewer.` : undefined;
