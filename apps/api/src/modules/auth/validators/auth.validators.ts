import { z } from 'zod';

import { AUTH_LIMITS, INDIAN_MOBILE_PATTERN, PASSWORD_LIMITS, SIGN_UP_LIMITS } from '../types/auth.types';

export const signInSchema = z.object({
    body: z
        .object({
            identifier: z
                .string({ required_error: 'Enter your mobile number, email or username.' })
                .trim()
                .min(1, 'Enter your mobile number, email or username.')
                .max(AUTH_LIMITS.IDENTIFIER, `This can be at most ${AUTH_LIMITS.IDENTIFIER} characters.`),
            password: z
                .string({ required_error: 'Enter your password.' })
                .min(1, 'Enter your password.')
                .max(AUTH_LIMITS.PASSWORD, `Password can be at most ${AUTH_LIMITS.PASSWORD} characters.`),
            remember: z.boolean().optional().default(false),
        })
        .strict(),
});

export type SignInBody = z.infer<typeof signInSchema>['body'];

const FULL_NAME_MISSING = 'Enter your full name.';
const EMAIL_INVALID = 'Enter a valid email address.';
const MOBILE_INVALID = 'Enter a 10-digit mobile number.';
const PASSWORD_SHORT = `Use at least ${PASSWORD_LIMITS.MIN} characters.`;

export const signUpSchema = z.object({
    body: z
        .object({
            name: z
                .string({ required_error: FULL_NAME_MISSING, invalid_type_error: FULL_NAME_MISSING })
                .trim()
                .min(SIGN_UP_LIMITS.NAME_MIN, FULL_NAME_MISSING)
                .max(SIGN_UP_LIMITS.NAME_MAX, `Name can be at most ${SIGN_UP_LIMITS.NAME_MAX} characters.`),
            email: z
                .string({ required_error: EMAIL_INVALID, invalid_type_error: EMAIL_INVALID })
                .trim()
                .toLowerCase()
                .max(SIGN_UP_LIMITS.EMAIL, EMAIL_INVALID)
                .email(EMAIL_INVALID),
            mobile: z
                .string({ required_error: MOBILE_INVALID, invalid_type_error: MOBILE_INVALID })
                .trim()
                .regex(INDIAN_MOBILE_PATTERN, MOBILE_INVALID),
            password: z
                .string({ required_error: PASSWORD_SHORT, invalid_type_error: PASSWORD_SHORT })
                .min(PASSWORD_LIMITS.MIN, PASSWORD_SHORT)
                .max(PASSWORD_LIMITS.MAX, `Password can be at most ${PASSWORD_LIMITS.MAX} characters.`),
        })
        .strict(),
});

export type SignUpBody = z.infer<typeof signUpSchema>['body'];

const passwordFields = {
    password: z
        .string({ required_error: 'Enter a password.' })
        .min(PASSWORD_LIMITS.MIN, `Password must be at least ${PASSWORD_LIMITS.MIN} characters.`)
        .max(PASSWORD_LIMITS.MAX, `Password can be at most ${PASSWORD_LIMITS.MAX} characters.`),
    confirmPassword: z.string({ required_error: 'Re-enter your password.' }),
};

const passwordsMatch = (body: { password: string; confirmPassword: string }, context: z.RefinementCtx): void => {
    if (body.confirmPassword !== body.password) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'Passwords do not match.',
        });
    }
};

export const changePasswordSchema = z.object({
    body: z
        .object({
            currentPassword: z
                .string({ required_error: 'Enter your current password.' })
                .min(1, 'Enter your current password.')
                .max(AUTH_LIMITS.PASSWORD, `Password can be at most ${AUTH_LIMITS.PASSWORD} characters.`),
            password: passwordFields.password,
            confirmPassword: passwordFields.confirmPassword,
        })
        .strict()
        .superRefine(passwordsMatch),
});

export type ChangePasswordBody = z.infer<typeof changePasswordSchema>['body'];

export const forgotPasswordSchema = z.object({
    body: z
        .object({
            email: z
                .string({ required_error: 'Enter your registered email.' })
                .trim()
                .min(1, 'Enter your registered email.')
                .max(AUTH_LIMITS.EMAIL, 'Enter a valid email address.')
                .email('Enter a valid email address.'),
        })
        .strict(),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>['body'];

const resetToken = z
    .string({ required_error: 'This password reset link is not valid any more. Please ask for a new one.' })
    .min(1, 'This password reset link is not valid any more. Please ask for a new one.')
    .max(200, 'This password reset link is not valid any more. Please ask for a new one.');

export const checkResetPasswordSchema = z.object({
    query: z.object({ token: resetToken }),
});

export type CheckResetPasswordQuery = z.infer<typeof checkResetPasswordSchema>['query'];

export const resetPasswordSchema = z.object({
    body: z
        .object({ token: resetToken, password: passwordFields.password, confirmPassword: passwordFields.confirmPassword })
        .strict()
        .superRefine(passwordsMatch),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>['body'];
