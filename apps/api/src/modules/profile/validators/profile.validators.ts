import { z } from 'zod';

import { optionalDateOfBirthField, optionalGenderField } from '../../../core/validation';
import { PROFILE_LIMITS } from '../types/profile.types';

export const PROFILE_MESSAGES = {
    NAME_EMPTY: 'Enter your name.',
    NAME_TOO_LONG: 'Use up to 100 characters.',
    LINK_TOO_LONG: 'Use up to 1,000 characters.',
    IMAGE_TYPE: 'Choose a JPG, JPEG or PNG file.',
    PHOTO_SIZE: 'Choose a file up to 250 KB.',
    COVER_PHOTO_SIZE: 'Choose a file up to 500 KB.',
    PROFILE_SAVED: 'Your profile is saved.',
    PHOTO_SAVED: 'Your profile photo is saved.',
    COVER_PHOTO_SAVED: 'Your cover photo is saved.',
    USER_NOT_FOUND: 'This profile is not available.',
    PARTNER_NOT_FOUND: 'This partner is not available.',
    NO_PHOTO: 'This profile has no picture.',
    ACCOUNT_NOT_FOUND: 'Your account was not found.',
} as const;

const socialLink = z.unknown().transform((value, context): string | null => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text === '') return null;
    if (text.length > PROFILE_LIMITS.URL_MAX) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: PROFILE_MESSAGES.LINK_TOO_LONG });
        return z.NEVER;
    }
    return text;
});

const freeText = z.unknown().transform((value): string | null => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text === '' ? null : text;
});

const name = z.unknown().transform((value, context): string => {
    const text = typeof value === 'string' ? value.trim() : '';
    const problem =
        text.length === 0
            ? PROFILE_MESSAGES.NAME_EMPTY
            : text.length > PROFILE_LIMITS.NAME_MAX
              ? PROFILE_MESSAGES.NAME_TOO_LONG
              : undefined;
    if (problem) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        return z.NEVER;
    }
    return text;
});

export const generalSchema = z.object({
    body: z
        .object({
            name,
            dateOfBirth: optionalDateOfBirthField,
            gender: optionalGenderField,
            bio: freeText,
            about: freeText,
            facebookUrl: socialLink,
            xUrl: socialLink,
            instagramUrl: socialLink,
            youtubeUrl: socialLink,
        })
        .strict(),
});

export type GeneralBody = z.infer<typeof generalSchema>['body'];

const positiveId = (message: string) =>
    z.coerce.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const pageQuery = z.object({ page: z.coerce.number().int().positive().optional().default(1) });

export type PageQuery = z.infer<typeof pageQuery>;

export type IdParams = { readonly id: number };

export const userIdSchema = z.object({ params: z.object({ id: positiveId(PROFILE_MESSAGES.USER_NOT_FOUND) }) });

export const userImageSchema = z.object({
    params: z.object({ id: positiveId(PROFILE_MESSAGES.NO_PHOTO) }),
    query: z.object({ v: z.string().max(PROFILE_LIMITS.URL_MAX).optional() }),
});

export const userPageSchema = z.object({
    params: z.object({ id: positiveId(PROFILE_MESSAGES.USER_NOT_FOUND) }),
    query: pageQuery,
});

export const partnerIdSchema = z.object({ params: z.object({ id: positiveId(PROFILE_MESSAGES.PARTNER_NOT_FOUND) }) });

export const partnerPageSchema = z.object({
    params: z.object({ id: positiveId(PROFILE_MESSAGES.PARTNER_NOT_FOUND) }),
    query: pageQuery,
});
