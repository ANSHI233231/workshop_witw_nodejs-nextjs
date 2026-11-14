import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { partnerAccountSchema } from '../contracts/partner-account.contract';
import {
    BUSINESS_EMAIL_PATTERN,
    BUSINESS_PHONE_PATTERN,
    PARTNER_LIMITS,
    PARTNER_STATUSES,
    PartnerStatus,
    type PartnerStatusCode,
    REQUEST_STATUSES,
} from '../types/partner.types';

export const PARTNER_MESSAGES = {
    BUSINESS_NAME_EMPTY: 'Enter the business name.',
    OWNER_NAME_EMPTY: 'Enter the owner name.',
    NAME_TOO_LONG: `Use up to ${PARTNER_LIMITS.BUSINESS_NAME_MAX} characters.`,
    PHONE_EMPTY: 'Enter the business phone.',
    PHONE_INVALID: 'Enter a 10-digit number starting with 6, 7, 8 or 9.',
    EMAIL_EMPTY: 'Enter the business email.',
    EMAIL_INVALID: 'Enter a valid email address.',
    EMAIL_TOO_LONG: `Use up to ${PARTNER_LIMITS.BUSINESS_EMAIL_MAX} characters.`,
    PARKS_EMPTY: 'Choose at least one park.',
    PARK_NOT_AVAILABLE: 'This park is not available. Choose another park.',
    ABOUT_TOO_LONG: 'Use up to 2,000 characters.',
    LOGO_TYPE: 'Choose a JPG, JPEG, PNG or WEBP file.',
    LOGO_SIZE: 'Choose a file up to 1 MB.',
    REASON_EMPTY: 'Enter the reason.',
    REASON_TOO_LONG: `Use up to ${PARTNER_LIMITS.REJECT_REASON_MAX} characters.`,
    STATUS: 'Choose a valid status.',
    SEARCH_TOO_LONG: `Search can be at most ${PARTNER_LIMITS.SEARCH} characters.`,
    NOT_FOUND: 'This partner was not found.',
    REQUEST_NOT_FOUND: 'You have not sent a partner request.',
    REQUEST_EXISTS: 'You have already sent a partner request.',
    REQUEST_NOT_REJECTED: 'Only a request that was not approved can be sent again.',
    REQUEST_LOCKED: 'Your partner request can no longer be changed here.',
    NOT_PENDING: 'This request has already been decided.',
    STATUS_UNCHANGED: 'This partner already has this status.',
} as const;

const requiredText = (empty: string, max: number, tooLong: string) =>
    z
        .string({ required_error: empty, invalid_type_error: empty })
        .trim()
        .superRefine((value, context) => {
            const problem = value.length === 0 ? empty : value.length > max ? tooLong : undefined;
            if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        });

const businessPhone = z
    .string({ required_error: PARTNER_MESSAGES.PHONE_EMPTY, invalid_type_error: PARTNER_MESSAGES.PHONE_EMPTY })
    .trim()
    .superRefine((value, context) => {
        const problem =
            value.length === 0
                ? PARTNER_MESSAGES.PHONE_EMPTY
                : BUSINESS_PHONE_PATTERN.test(value)
                  ? undefined
                  : PARTNER_MESSAGES.PHONE_INVALID;
        if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    });

const businessEmail = z
    .string({ required_error: PARTNER_MESSAGES.EMAIL_EMPTY, invalid_type_error: PARTNER_MESSAGES.EMAIL_EMPTY })
    .trim()
    .superRefine((value, context) => {
        const problem =
            value.length === 0
                ? PARTNER_MESSAGES.EMAIL_EMPTY
                : value.length > PARTNER_LIMITS.BUSINESS_EMAIL_MAX
                  ? PARTNER_MESSAGES.EMAIL_TOO_LONG
                  : BUSINESS_EMAIL_PATTERN.test(value)
                    ? undefined
                    : PARTNER_MESSAGES.EMAIL_INVALID;
        if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    });

const about = z
    .string({ invalid_type_error: PARTNER_MESSAGES.ABOUT_TOO_LONG })
    .trim()
    .max(PARTNER_LIMITS.ABOUT_MAX, PARTNER_MESSAGES.ABOUT_TOO_LONG)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null));

const parkId = z
    .number({ invalid_type_error: PARTNER_MESSAGES.PARK_NOT_AVAILABLE })
    .int(PARTNER_MESSAGES.PARK_NOT_AVAILABLE)
    .positive(PARTNER_MESSAGES.PARK_NOT_AVAILABLE);

const masterParkIds = z
    .array(parkId, { required_error: PARTNER_MESSAGES.PARKS_EMPTY, invalid_type_error: PARTNER_MESSAGES.PARKS_EMPTY })
    .min(1, PARTNER_MESSAGES.PARKS_EMPTY)
    .max(PARTNER_LIMITS.PARKS_MAX, PARTNER_MESSAGES.PARK_NOT_AVAILABLE)
    .transform((ids) => [...new Set(ids)]);

const businessFields = {
    businessName: requiredText(
        PARTNER_MESSAGES.BUSINESS_NAME_EMPTY,
        PARTNER_LIMITS.BUSINESS_NAME_MAX,
        PARTNER_MESSAGES.NAME_TOO_LONG,
    ),
    ownerName: requiredText(PARTNER_MESSAGES.OWNER_NAME_EMPTY, PARTNER_LIMITS.OWNER_NAME_MAX, PARTNER_MESSAGES.NAME_TOO_LONG),
    businessPhone,
    businessEmail,
    about,
    masterParkIds,
};

const businessBody = z.object(businessFields).strict();

const idParam = z.object({
    id: z.coerce
        .number({ invalid_type_error: PARTNER_MESSAGES.NOT_FOUND })
        .int(PARTNER_MESSAGES.NOT_FOUND)
        .positive(PARTNER_MESSAGES.NOT_FOUND),
});

export type PartnerParams = z.infer<typeof idParam>;

const searchText = z
    .string()
    .trim()
    .max(PARTNER_LIMITS.SEARCH, PARTNER_MESSAGES.SEARCH_TOO_LONG)
    .optional()
    .transform((value) => (value ? value : undefined));

const statusAmong = (allowed: readonly PartnerStatusCode[]) =>
    z.coerce
        .number({ invalid_type_error: PARTNER_MESSAGES.STATUS })
        .int(PARTNER_MESSAGES.STATUS)
        .refine((value): value is PartnerStatusCode => (allowed as readonly number[]).includes(value), PARTNER_MESSAGES.STATUS);

const listQuery = (allowed: readonly PartnerStatusCode[]) =>
    paginationQuerySchema.extend({ search: searchText, status: statusAmong(allowed).optional() });

export const sendRequestSchema = z.object({ body: businessBody });

export const sendWithAccountSchema = z.object({ body: partnerAccountSchema.merge(businessBody) });

export type SendWithAccountBody = z.infer<typeof sendWithAccountSchema>['body'];

export const listRequestsSchema = z.object({ query: listQuery(REQUEST_STATUSES) });

export const listPartnersSchema = z.object({ query: listQuery(PARTNER_STATUSES) });

export type PartnerListQuery = z.infer<typeof listPartnersSchema>['query'];

export const partnerIdSchema = z.object({ params: idParam });

export const rejectSchema = z.object({
    params: idParam,
    body: z
        .object({
            reason: requiredText(
                PARTNER_MESSAGES.REASON_EMPTY,
                PARTNER_LIMITS.REJECT_REASON_MAX,
                PARTNER_MESSAGES.REASON_TOO_LONG,
            ),
        })
        .strict(),
});

export const editPartnerSchema = z.object({ params: idParam, body: businessBody });

export const phoneNumbersSchema = z.object({
    params: idParam,
    body: z.object({ isPhoneShown: z.boolean({ required_error: PARTNER_MESSAGES.STATUS }) }).strict(),
});

export const partnerStatusSchema = z.object({
    params: idParam,
    body: z.object({ status: statusAmong([PartnerStatus.ACTIVE, PartnerStatus.INACTIVE]) }).strict(),
});
