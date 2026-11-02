import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    JOB_COMMAND_PATTERN,
    JOB_LIMITS as LIMITS,
    JOB_RUN_STATUSES,
    JOB_RUN_TRIGGERS,
    JOB_SCHEDULE_STATUSES,
    JobScheduleStatus,
} from '../types/job.types';

const TIMEOUT_MESSAGE = `Enter a whole number from ${LIMITS.TIMEOUT_MIN} to ${LIMITS.TIMEOUT_MAX}.`;

const recordId = (message: string) =>
    z.coerce.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const optionalText = (max: number) =>
    z
        .string({ invalid_type_error: 'Enter text.' })
        .trim()
        .max(max, `Use ${max} characters or fewer.`)
        .nullish()
        .transform((value) => (value ? value : null));

const command = z
    .string({ required_error: 'Enter the command.', invalid_type_error: 'Enter the command.' })
    .trim()
    .min(1, 'Enter the command.')
    .max(LIMITS.COMMAND_MAX, `Use ${LIMITS.COMMAND_MAX} characters or fewer.`)
    .refine(
        (value) => value.length === 0 || JOB_COMMAND_PATTERN.test(value),
        'Enter the command as controller/action, e.g. app-log/prune.',
    );

const commandArguments = z
    .array(
        z
            .string({ invalid_type_error: 'Enter text.' })
            .max(LIMITS.ARGUMENT_MAX, `Use ${LIMITS.ARGUMENT_MAX} characters or fewer.`),
        { invalid_type_error: 'Enter the arguments.' },
    )
    .max(LIMITS.ARGUMENTS_MAX, `Use at most ${LIMITS.ARGUMENTS_MAX} arguments.`)
    .default([]);

const timeoutMinutes = z
    .number({ invalid_type_error: TIMEOUT_MESSAGE })
    .int(TIMEOUT_MESSAGE)
    .min(LIMITS.TIMEOUT_MIN, TIMEOUT_MESSAGE)
    .max(LIMITS.TIMEOUT_MAX, TIMEOUT_MESSAGE)
    .default(LIMITS.TIMEOUT_DEFAULT);

const cronExpression = z
    .string({ required_error: 'Enter the schedule.', invalid_type_error: 'Enter the schedule.' })
    .trim()
    .min(1, 'Enter the schedule.')
    .max(LIMITS.CRON_MAX, `Use ${LIMITS.CRON_MAX} characters or fewer.`);

const scheduleStatus = z
    .number({ invalid_type_error: 'Choose a valid status.' })
    .int('Choose a valid status.')
    .refine((value) => JOB_SCHEDULE_STATUSES.includes(value), 'Choose a valid status.');

const scheduleBody = z
    .object({
        name: z
            .string({ required_error: 'Enter the name.', invalid_type_error: 'Enter the name.' })
            .trim()
            .min(1, 'Enter the name.')
            .refine(
                (value) => value.length === 0 || value.length >= LIMITS.NAME_MIN,
                `Use ${LIMITS.NAME_MIN} to ${LIMITS.NAME_MAX} characters.`,
            )
            .refine(
                (value) => value.length <= LIMITS.NAME_MAX,
                `Use ${LIMITS.NAME_MIN} to ${LIMITS.NAME_MAX} characters.`,
            ),
        command,
        arguments: commandArguments,
        cronExpression,
        timeoutMinutes,
        description: optionalText(LIMITS.DESCRIPTION_MAX),
        status: scheduleStatus.default(JobScheduleStatus.ACTIVE),
    })
    .strict();

const idParams = (message: string) => z.object({ id: recordId(message) });

const isoDate = (message: string) =>
    z
        .string({ invalid_type_error: message })
        .trim()
        .refine((value) => value.length > 0 && !Number.isNaN(new Date(value).getTime()), message);

const search = z
    .string()
    .trim()
    .max(LIMITS.SEARCH_MAX, `Search can be at most ${LIMITS.SEARCH_MAX} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined));

const codeFilter = (allowed: readonly number[], message: string) =>
    z.coerce
        .number()
        .int()
        .refine((value) => allowed.includes(value), message)
        .optional();

const flag = z
    .enum(['1', '0', 'true', 'false'])
    .optional()
    .transform((value) => value === '1' || value === 'true');

export const listJobSchedulesSchema = z.object({
    query: paginationQuerySchema.extend({
        search,
        status: codeFilter(JOB_SCHEDULE_STATUSES, 'Choose a valid status.'),
    }),
});

export const addJobScheduleSchema = z.object({ body: scheduleBody });

export const updateJobScheduleSchema = z.object({
    params: idParams('This scheduled job was not found.'),
    body: scheduleBody,
});

export const setJobScheduleStatusSchema = z.object({
    params: idParams('This scheduled job was not found.'),
    body: z.object({ status: scheduleStatus }).strict(),
});

export const jobScheduleIdSchema = z.object({ params: idParams('This scheduled job was not found.') });

export const previewJobScheduleSchema = z.object({ body: z.object({ cronExpression }).strict() });

export const listJobRunsSchema = z.object({
    query: paginationQuerySchema.extend({
        search,
        scheduleId: recordId('Choose a valid scheduled job.').optional(),
        status: codeFilter(JOB_RUN_STATUSES, 'Choose a valid status.'),
        trigger: codeFilter(JOB_RUN_TRIGGERS, 'Choose a valid trigger.'),
        from: isoDate('Enter a valid date.').optional(),
        to: isoDate('Enter a valid date.').optional(),
        errorsOnly: flag,
        oneTime: flag,
    }),
});

export const jobRunIdSchema = z.object({ params: idParams('This job run was not found.') });

export const runJobCommandSchema = z.object({
    body: z
        .object({
            title: optionalText(LIMITS.TITLE_MAX),
            command,
            arguments: commandArguments,
            runAt: isoDate('Enter a valid date and time.')
                .nullish()
                .transform((value) => value ?? null),
            timeoutMinutes,
        })
        .strict(),
});

export type ListJobSchedulesQuery = z.infer<typeof listJobSchedulesSchema>['query'];
export type JobScheduleBody = z.infer<typeof scheduleBody>;
export type JobScheduleStatusBody = z.infer<typeof setJobScheduleStatusSchema>['body'];
export type PreviewJobScheduleBody = z.infer<typeof previewJobScheduleSchema>['body'];
export type ListJobRunsQuery = z.infer<typeof listJobRunsSchema>['query'];
export type RunJobCommandBody = z.infer<typeof runJobCommandSchema>['body'];
export type JobIdParams = { readonly id: number };
