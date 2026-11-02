import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    ROLE_LIST_LIMITS,
    SYSTEM_ROLE_IDS,
    USER_EDIT_LIMITS,
    USER_LIST_LIMITS,
    USERNAME_PATTERN,
    UserStatus,
} from '../types/users.types';

const LISTED_STATUSES: readonly number[] = [UserStatus.ACTIVE, UserStatus.INACTIVE];

const optionalSearch = (maximum: number) =>
    z
        .string()
        .trim()
        .max(maximum, `Search can be at most ${maximum} characters.`)
        .optional()
        .transform((value) => (value ? value : undefined));

export const listUsersSchema = z.object({
    query: paginationQuerySchema.extend({
        search: optionalSearch(USER_LIST_LIMITS.SEARCH),
        status: z.coerce
            .number()
            .int()
            .refine((value) => LISTED_STATUSES.includes(value), 'Choose a valid status.')
            .optional(),
        metaRoleId: z.coerce
            .number({ invalid_type_error: 'Choose a valid role.' })
            .int('Choose a valid role.')
            .positive('Choose a valid role.')
            .optional(),
    }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];

export const pickUsersSchema = z.object({
    query: paginationQuerySchema.extend({ search: optionalSearch(USER_LIST_LIMITS.SEARCH) }),
});

export type PickUsersQuery = z.infer<typeof pickUsersSchema>['query'];

export const listRolesSchema = z.object({
    query: paginationQuerySchema.extend({ search: optionalSearch(ROLE_LIST_LIMITS.SEARCH) }),
});

export type ListRolesQuery = z.infer<typeof listRolesSchema>['query'];

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const userIdParamsSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ invalid_type_error: 'This user was not found.' })
            .int('This user was not found.')
            .positive('This user was not found.'),
    }),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>['params'];

const passwordRule = z
    .string()
    .min(USER_EDIT_LIMITS.PASSWORD_MIN, `Password must be at least ${USER_EDIT_LIMITS.PASSWORD_MIN} characters.`)
    .max(USER_EDIT_LIMITS.PASSWORD_MAX, `Password can be at most ${USER_EDIT_LIMITS.PASSWORD_MAX} characters.`);

const accountFields = {
    name: z
        .string({ required_error: 'Enter a name.' })
        .trim()
        .min(1, 'Enter a name.')
        .min(USER_EDIT_LIMITS.NAME_MIN, `Name must be at least ${USER_EDIT_LIMITS.NAME_MIN} characters.`)
        .max(USER_EDIT_LIMITS.NAME_MAX, `Name can be at most ${USER_EDIT_LIMITS.NAME_MAX} characters.`),
    username: z
        .string()
        .trim()
        .nullable()
        .optional()
        .transform((value) => (value ? value : null))
        .refine(
            (value) => value === null || value.length >= USER_EDIT_LIMITS.USERNAME_MIN,
            `Username must be at least ${USER_EDIT_LIMITS.USERNAME_MIN} characters.`,
        )
        .refine(
            (value) => value === null || value.length <= USER_EDIT_LIMITS.USERNAME_MAX,
            `Username can be at most ${USER_EDIT_LIMITS.USERNAME_MAX} characters.`,
        )
        .refine(
            (value) => value === null || USERNAME_PATTERN.test(value),
            'Username can use letters, digits, dot, underscore and hyphen only.',
        ),
    mobile: z
        .string({ required_error: 'Enter a 10-digit mobile number.' })
        .trim()
        .regex(INDIAN_MOBILE_PATTERN, 'Enter a 10-digit mobile number.'),
    email: z
        .string({ required_error: 'Enter a valid email address.' })
        .trim()
        .toLowerCase()
        .refine(
            (value) => value.length <= USER_EDIT_LIMITS.EMAIL_MAX && z.string().email().safeParse(value).success,
            'Enter a valid email address.',
        ),
    systemRoleIds: z
        .array(
            z
                .number()
                .int()
                .refine((value) => SYSTEM_ROLE_IDS.includes(value), 'Choose a valid role.'),
        )
        .max(SYSTEM_ROLE_IDS.length)
        .refine((ids) => new Set(ids).size === ids.length, 'Choose each role once.')
        .default([]),
};

export const updateUserSchema = userIdParamsSchema.extend({
    body: z.object(accountFields).strict(),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>['body'];

export const createUserSchema = z.object({
    body: z
        .object({
            ...accountFields,
            password: z.string({ required_error: 'Enter a password.' }).min(1, 'Enter a password.').pipe(passwordRule),
            confirmPassword: z.string({ required_error: 'Re-enter the password.' }).min(1, 'Re-enter the password.'),
        })
        .strict()
        .superRefine((body, context) => {
            if (body.confirmPassword && body.confirmPassword !== body.password) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['confirmPassword'],
                    message: 'Passwords do not match.',
                });
            }
        }),
});

export type CreateUserBody = z.infer<typeof createUserSchema>['body'];

export const setUserStatusSchema = userIdParamsSchema.extend({
    body: z
        .object({
            status: z
                .number({ required_error: 'Choose a status.' })
                .int()
                .refine((value) => LISTED_STATUSES.includes(value), 'Choose a status.'),
        })
        .strict(),
});

export type SetUserStatusBody = z.infer<typeof setUserStatusSchema>['body'];

const BOTH_PASSWORDS = 'Enter the new password in both fields.';

export const setUserPasswordSchema = userIdParamsSchema.extend({
    body: z
        .object({
            password: z
                .string({ required_error: BOTH_PASSWORDS })
                .min(1, BOTH_PASSWORDS)
                .min(
                    USER_EDIT_LIMITS.PASSWORD_MIN,
                    `Password must be at least ${USER_EDIT_LIMITS.PASSWORD_MIN} characters.`,
                )
                .max(
                    USER_EDIT_LIMITS.PASSWORD_MAX,
                    `Password can be at most ${USER_EDIT_LIMITS.PASSWORD_MAX} characters.`,
                ),
            confirmPassword: z.string({ required_error: BOTH_PASSWORDS }).min(1, BOTH_PASSWORDS),
        })
        .strict()
        .superRefine((body, context) => {
            if (body.password && body.confirmPassword && body.confirmPassword !== body.password) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['confirmPassword'],
                    message: 'Passwords do not match.',
                });
            }
        }),
});

export type SetUserPasswordBody = z.infer<typeof setUserPasswordSchema>['body'];
