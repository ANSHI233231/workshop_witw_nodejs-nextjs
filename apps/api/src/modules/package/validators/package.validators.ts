import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import {
    COLOR_PATTERN,
    CONSOLE_WEBSITE_STATUSES,
    DEFAULT_TAG_COLORS,
    DELETE_REASON_STATUSES,
    FILE_NAME_PATTERN,
    INCLUSIONS,
    LISTED_WEBSITE_STATUSES,
    PACKAGE_FEATURES,
    PACKAGE_LIMITS,
    PACKAGE_THEMES,
    PackageImageKind,
    PackageWebsiteStatus,
    PLACE_PATTERN,
    SAFARI_TYPES,
    STAYS,
    VEHICLES,
    WEBSITE_SORTS,
    WebsiteSort,
} from '../types/package.types';

export const PACKAGE_MESSAGES = {
    NAME_EMPTY: 'Enter the package name.',
    TOO_LONG_215: 'Use up to 215 characters.',
    TOO_LONG_255: 'Use up to 255 characters.',
    TOO_LONG_500: 'Use up to 500 characters.',
    TOO_LONG_512: 'Use up to 512 characters.',
    TOO_LONG_1000: 'Use up to 1,000 characters.',
    TOO_LONG_2000: 'Use up to 2,000 characters.',
    PARKS_EMPTY: 'Choose at least one park.',
    PARK_TWICE: 'Choose each park only once.',
    PARK_NOT_AVAILABLE: 'This park is not available. Choose another park.',
    PARK_NO_LONGER_AVAILABLE: 'Untick the park marked Not available and choose one of your active parks.',
    PARK_TO_REPLACE_BEFORE_SEND: 'A park in Basic is no longer one of your active parks. Replace it in Basic, then send.',
    DAYS_EMPTY: 'Enter the number of days.',
    DAYS_RANGE: 'Enter 1 to 15 days.',
    SAFARIS_EMPTY: 'Enter the number of safaris.',
    SAFARIS_RANGE: 'Enter 1 to 99 safaris.',
    SAFARI_TYPE: 'Choose the safari type.',
    VEHICLE: 'Choose the vehicle.',
    THEME: 'Choose the theme.',
    STAY: 'Choose the stay.',
    FEATURE: 'Choose features from the list.',
    PLACE: 'Use letters, spaces and hyphens only.',
    PRICE_PER_PERSON_EMPTY: 'Enter the price per person.',
    TOTAL_PRICE_EMPTY: 'Enter the total price.',
    PRICE_RANGE: 'Enter whole rupees from 1,000 to 99,99,999.',
    TOTAL_BELOW_PER_PERSON: "The total price can't be less than the price per person.",
    BEFORE_NOT_HIGHER: 'The price before discount must be higher than the price per person.',
    COLOR: 'Choose a colour.',
    GALLERY_NOT_AVAILABLE: 'Choose one of your approved galleries.',
    IMAGE_TYPE: 'Choose a JPG, JPEG or PNG file.',
    IMAGE_SIZE: 'Choose a file up to 250 KB.',
    DAY_IMAGE_SIZE: 'Choose a file up to 20 MB.',
    IMAGE_MISSING: 'Choose an image to upload.',
    DAY_TITLE_EMPTY: 'Enter the day title.',
    DESCRIPTION_EMPTY: 'Enter the description.',
    DAYS_MISMATCH: 'Fill in one block for each day set in Basic.',
    DAY_NOT_FOUND: 'Save the itinerary for this day first.',
    INCLUSIONS_ALL: 'Choose Included or Not included for each item.',
    QUESTION_EMPTY: 'Enter the question.',
    ANSWER_EMPTY: 'Enter the answer.',
    FAQS_TOO_MANY: 'Save up to 200 FAQs.',
    REASON_EMPTY: 'Enter the reason.',
    DELETE_REASON_EMPTY: 'Choose a reason.',
    DELETE_DETAILS_EMPTY: 'Enter the details.',
    REASON_NAME_TOO_LONG: 'Use up to 100 characters.',
    REASON_EXISTS: 'This reason already exists.',
    REASON_NOT_FOUND: 'This reason was not found.',
    REASON_NOT_AVAILABLE: 'Choose a reason.',
    REASON_STATUS: 'Choose Active or Inactive.',
    WEBSITE_STATUS: 'Choose a valid website status.',
    SEARCH_TOO_LONG: 'Search can be at most 100 characters.',
    SORT: 'Choose a valid sort.',
    NOT_FOUND: 'This package was not found.',
    VERSION_NOT_FOUND: 'This version was not found.',
    FILE_NOT_FOUND: 'This image was not found.',
    NOT_ACTIVE_PARTNER: 'Only an active partner can manage packages.',
    BASIC_FIRST: 'Save the Basic section first.',
    NOT_EDITABLE: "This version can't be changed.",
    NOT_SENDABLE: 'Only a draft or a rejected version can be sent.',
    NOT_DELETABLE: 'Only a draft or a rejected version can be deleted.',
    NOT_WAITING: 'This version is not waiting for approval.',
    NO_LIVE: 'This package has no live version.',
    WORKING_EXISTS: 'This package already has a version being worked on.',
    PACKAGE_DELETED: 'This package was deleted by the Super Admin.',
    NOT_LIVE_PACKAGE: 'Only a live package that is not deleted can be changed this way.',
    WEBSITE_STATUS_SAME: 'The package already has this website status.',
} as const;

const textWithin = (empty: string, max: number, tooLong: string) =>
    z
        .string({ required_error: empty, invalid_type_error: empty })
        .trim()
        .superRefine((value, context) => {
            const problem = value.length === 0 ? empty : value.length > max ? tooLong : undefined;
            if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        });

const optionalText = (max: number, tooLong: string) =>
    z
        .string({ invalid_type_error: tooLong })
        .trim()
        .max(max, tooLong)
        .nullable()
        .optional()
        .transform((value) => (value ? value : null));

const optionalPlace = optionalText(PACKAGE_LIMITS.PLACE_MAX, PACKAGE_MESSAGES.TOO_LONG_215).refine(
    (value) => value === null || PLACE_PATTERN.test(value),
    PACKAGE_MESSAGES.PLACE,
);

const wholeNumber = (empty: string, min: number, max: number, range: string) =>
    z
        .number({ required_error: empty, invalid_type_error: empty })
        .int(range)
        .min(min, range)
        .max(max, range);

const codeOf = <T extends number>(codes: readonly T[], message: string) =>
    z
        .number({ required_error: message, invalid_type_error: message })
        .refine((value): value is T => (codes as readonly number[]).includes(value), message);

const positiveId = (message: string) =>
    z.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const coercedId = (message: string) =>
    z.coerce.number({ invalid_type_error: message }).int(message).positive(message);

const price = (empty: string) =>
    wholeNumber(empty, PACKAGE_LIMITS.PRICE_MIN, PACKAGE_LIMITS.PRICE_MAX, PACKAGE_MESSAGES.PRICE_RANGE);

const color = (fallback: string) =>
    z
        .string({ invalid_type_error: PACKAGE_MESSAGES.COLOR })
        .trim()
        .regex(COLOR_PATTERN, PACKAGE_MESSAGES.COLOR)
        .optional()
        .transform((value) => (value ?? fallback).toUpperCase());

const uniqueList = <T extends z.ZodTypeAny>(item: T, message: string, missing: string = message) =>
    z
        .array(item, { invalid_type_error: missing, required_error: missing })
        .superRefine((values, context) => {
            if (new Set(values).size !== values.length) context.addIssue({ code: z.ZodIssueCode.custom, message });
        });

const packageParams = z.object({ id: coercedId(PACKAGE_MESSAGES.NOT_FOUND) });

const versionParams = packageParams.extend({ versionId: coercedId(PACKAGE_MESSAGES.VERSION_NOT_FOUND) });

export type PackageParams = z.infer<typeof packageParams>;

export type VersionParams = z.infer<typeof versionParams>;

const basicBody = z
    .object({
        name: textWithin(PACKAGE_MESSAGES.NAME_EMPTY, PACKAGE_LIMITS.NAME_MAX, PACKAGE_MESSAGES.TOO_LONG_215),
        masterParkIds: uniqueList(positiveId(PACKAGE_MESSAGES.PARKS_EMPTY), PACKAGE_MESSAGES.PARK_TWICE, PACKAGE_MESSAGES.PARKS_EMPTY)
            .refine((ids) => ids.length > 0, PACKAGE_MESSAGES.PARKS_EMPTY)
            .refine((ids) => ids.length <= PACKAGE_LIMITS.PARKS_MAX, PACKAGE_MESSAGES.PARK_TWICE),
        dayCount: wholeNumber(
            PACKAGE_MESSAGES.DAYS_EMPTY,
            PACKAGE_LIMITS.DAYS_MIN,
            PACKAGE_LIMITS.DAYS_MAX,
            PACKAGE_MESSAGES.DAYS_RANGE,
        ),
        safariCount: wholeNumber(
            PACKAGE_MESSAGES.SAFARIS_EMPTY,
            PACKAGE_LIMITS.SAFARIS_MIN,
            PACKAGE_LIMITS.SAFARIS_MAX,
            PACKAGE_MESSAGES.SAFARIS_RANGE,
        ),
        safariType: codeOf(SAFARI_TYPES, PACKAGE_MESSAGES.SAFARI_TYPE),
        vehicle: codeOf(VEHICLES, PACKAGE_MESSAGES.VEHICLE),
        theme: codeOf(PACKAGE_THEMES, PACKAGE_MESSAGES.THEME),
        stay: codeOf(STAYS, PACKAGE_MESSAGES.STAY),
        features: uniqueList(codeOf(PACKAGE_FEATURES, PACKAGE_MESSAGES.FEATURE), PACKAGE_MESSAGES.FEATURE).default([]),
        startPlace: optionalPlace,
        endPlace: optionalPlace,
        pricePerPerson: price(PACKAGE_MESSAGES.PRICE_PER_PERSON_EMPTY),
        totalPrice: price(PACKAGE_MESSAGES.TOTAL_PRICE_EMPTY),
        priceBeforeDiscount: price(PACKAGE_MESSAGES.PRICE_RANGE).nullable().optional().default(null),
        activityMessage: optionalText(PACKAGE_LIMITS.MESSAGE_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        priceMessage: optionalText(PACKAGE_LIMITS.MESSAGE_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        tagText: optionalText(PACKAGE_LIMITS.MESSAGE_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        tagBackgroundColor: color(DEFAULT_TAG_COLORS.BACKGROUND),
        tagTextColor: color(DEFAULT_TAG_COLORS.TEXT),
        galleryId: positiveId(PACKAGE_MESSAGES.GALLERY_NOT_AVAILABLE).nullable().optional().default(null),
        overview: optionalText(PACKAGE_LIMITS.OVERVIEW_MAX, PACKAGE_MESSAGES.TOO_LONG_2000),
        confirmDayRemoval: z.boolean().optional().default(false),
    })
    .strict()
    .superRefine((basic, context) => {
        if (basic.totalPrice < basic.pricePerPerson) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['totalPrice'],
                message: PACKAGE_MESSAGES.TOTAL_BELOW_PER_PERSON,
            });
        }
        if (basic.priceBeforeDiscount !== null && basic.priceBeforeDiscount <= basic.pricePerPerson) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['priceBeforeDiscount'],
                message: PACKAGE_MESSAGES.BEFORE_NOT_HIGHER,
            });
        }
    });

export const createPackageSchema = z.object({ body: basicBody });

export const basicSchema = z.object({ params: versionParams, body: basicBody });

const dayBody = z
    .object({
        dayNumber: wholeNumber(
            PACKAGE_MESSAGES.DAYS_MISMATCH,
            PACKAGE_LIMITS.DAYS_MIN,
            PACKAGE_LIMITS.DAYS_MAX,
            PACKAGE_MESSAGES.DAYS_MISMATCH,
        ),
        title: textWithin(PACKAGE_MESSAGES.DAY_TITLE_EMPTY, PACKAGE_LIMITS.DAY_TITLE_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        description: textWithin(
            PACKAGE_MESSAGES.DESCRIPTION_EMPTY,
            PACKAGE_LIMITS.DAY_DESCRIPTION_MAX,
            PACKAGE_MESSAGES.TOO_LONG_2000,
        ),
        startLocation: optionalText(PACKAGE_LIMITS.DAY_TEXT_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        endLocation: optionalText(PACKAGE_LIMITS.DAY_TEXT_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        hotelName: optionalText(PACKAGE_LIMITS.DAY_TEXT_MAX, PACKAGE_MESSAGES.TOO_LONG_255),
        hasBreakfast: z.boolean().optional().default(false),
        hasLunch: z.boolean().optional().default(false),
        hasDinner: z.boolean().optional().default(false),
        activity: optionalText(PACKAGE_LIMITS.DAY_NOTE_MAX, PACKAGE_MESSAGES.TOO_LONG_500),
        accommodation: optionalText(PACKAGE_LIMITS.DAY_NOTE_MAX, PACKAGE_MESSAGES.TOO_LONG_500),
        note: optionalText(PACKAGE_LIMITS.DAY_NOTE_MAX, PACKAGE_MESSAGES.TOO_LONG_500),
        galleryId: positiveId(PACKAGE_MESSAGES.GALLERY_NOT_AVAILABLE).nullable().optional().default(null),
    })
    .strict();

export const itinerarySchema = z.object({
    params: versionParams,
    body: z
        .object({
            days: z
                .array(dayBody, { required_error: PACKAGE_MESSAGES.DAYS_MISMATCH })
                .min(1, PACKAGE_MESSAGES.DAYS_MISMATCH)
                .max(PACKAGE_LIMITS.DAYS_MAX, PACKAGE_MESSAGES.DAYS_MISMATCH)
                .superRefine((days, context) => {
                    const sequential = days.every((day, index) => day.dayNumber === index + 1);
                    if (!sequential) context.addIssue({ code: z.ZodIssueCode.custom, message: PACKAGE_MESSAGES.DAYS_MISMATCH });
                }),
        })
        .strict(),
});

export const inclusionsSchema = z.object({
    params: versionParams,
    body: z
        .object({
            inclusions: z
                .array(
                    z
                        .object({
                            inclusion: codeOf(INCLUSIONS, PACKAGE_MESSAGES.INCLUSIONS_ALL),
                            isIncluded: z.boolean({ required_error: PACKAGE_MESSAGES.INCLUSIONS_ALL }),
                        })
                        .strict(),
                    { required_error: PACKAGE_MESSAGES.INCLUSIONS_ALL },
                )
                .superRefine((choices, context) => {
                    const codes = new Set(choices.map((choice) => choice.inclusion));
                    if (codes.size !== choices.length || codes.size !== INCLUSIONS.length) {
                        context.addIssue({ code: z.ZodIssueCode.custom, message: PACKAGE_MESSAGES.INCLUSIONS_ALL });
                    }
                }),
            moreInclusions: optionalText(PACKAGE_LIMITS.INCLUSION_TEXT_MAX, PACKAGE_MESSAGES.TOO_LONG_512),
            exclusions: optionalText(PACKAGE_LIMITS.INCLUSION_TEXT_MAX, PACKAGE_MESSAGES.TOO_LONG_512),
        })
        .strict(),
});

export const gettingThereSchema = z.object({
    params: versionParams,
    body: z
        .object({ gettingThere: optionalText(PACKAGE_LIMITS.GETTING_THERE_MAX, PACKAGE_MESSAGES.TOO_LONG_2000) })
        .strict(),
});

export const faqsSchema = z.object({
    params: versionParams,
    body: z
        .object({
            faqs: z
                .array(
                    z
                        .object({
                            question: textWithin(
                                PACKAGE_MESSAGES.QUESTION_EMPTY,
                                PACKAGE_LIMITS.QUESTION_MAX,
                                PACKAGE_MESSAGES.TOO_LONG_512,
                            ),
                            answer: textWithin(
                                PACKAGE_MESSAGES.ANSWER_EMPTY,
                                PACKAGE_LIMITS.ANSWER_MAX,
                                PACKAGE_MESSAGES.ANSWER_EMPTY,
                            ),
                        })
                        .strict(),
                )
                .max(PACKAGE_LIMITS.FAQS_MAX, PACKAGE_MESSAGES.FAQS_TOO_MANY)
                .default([]),
        })
        .strict(),
});

export const packageIdSchema = z.object({ params: packageParams });

export const versionIdSchema = z.object({ params: versionParams });

export const imageSchema = z.object({
    params: versionParams.extend({
        kind: z.enum([PackageImageKind.PACKAGE, PackageImageKind.BANNER], {
            errorMap: () => ({ message: PACKAGE_MESSAGES.FILE_NOT_FOUND }),
        }),
    }),
});

export const dayImageSchema = z.object({
    params: versionParams.extend({
        dayNumber: z.coerce
            .number({ invalid_type_error: PACKAGE_MESSAGES.DAY_NOT_FOUND })
            .int(PACKAGE_MESSAGES.DAY_NOT_FOUND)
            .min(PACKAGE_LIMITS.DAYS_MIN, PACKAGE_MESSAGES.DAY_NOT_FOUND)
            .max(PACKAGE_LIMITS.DAYS_MAX, PACKAGE_MESSAGES.DAY_NOT_FOUND),
    }),
});

const fileName = z.string().regex(FILE_NAME_PATTERN, PACKAGE_MESSAGES.FILE_NOT_FOUND);

export const versionFileSchema = z.object({ params: versionParams.extend({ fileName }) });

export const websiteFileSchema = z.object({
    params: z.object({ slug: z.string().trim().min(1).max(PACKAGE_LIMITS.SLUG_MAX), fileName }),
});

const searchText = z
    .string()
    .trim()
    .max(PACKAGE_LIMITS.SEARCH, PACKAGE_MESSAGES.SEARCH_TOO_LONG)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalCode = <T extends number>(codes: readonly T[], message: string) =>
    z.coerce
        .number({ invalid_type_error: message })
        .refine((value): value is T => (codes as readonly number[]).includes(value), message)
        .optional();

export const portalListSchema = z.object({
    query: z.object({
        search: searchText,
        websiteStatus: optionalCode(LISTED_WEBSITE_STATUSES, PACKAGE_MESSAGES.WEBSITE_STATUS),
    }),
});

export const consoleListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: searchText,
        websiteStatus: optionalCode(CONSOLE_WEBSITE_STATUSES, PACKAGE_MESSAGES.WEBSITE_STATUS),
        partnerId: coercedId(PACKAGE_MESSAGES.NOT_FOUND).optional(),
    }),
});

export const approvalsListSchema = z.object({ query: paginationQuerySchema.extend({ search: searchText }) });

export const websiteStatusSchema = z.object({
    params: packageParams,
    body: z
        .object({
            websiteStatus: codeOf(
                [PackageWebsiteStatus.ACTIVE, PackageWebsiteStatus.INACTIVE] as const,
                PACKAGE_MESSAGES.WEBSITE_STATUS,
            ),
        })
        .strict(),
});

export const rejectSchema = z.object({
    params: versionParams,
    body: z
        .object({
            reason: textWithin(PACKAGE_MESSAGES.REASON_EMPTY, PACKAGE_LIMITS.REASON_MAX, PACKAGE_MESSAGES.TOO_LONG_512),
        })
        .strict(),
});

export const adminDeleteSchema = z.object({
    params: packageParams,
    body: z
        .object({
            masterPackageDeleteReasonId: positiveId(PACKAGE_MESSAGES.DELETE_REASON_EMPTY),
            details: textWithin(
                PACKAGE_MESSAGES.DELETE_DETAILS_EMPTY,
                PACKAGE_LIMITS.DELETE_DETAILS_MAX,
                PACKAGE_MESSAGES.TOO_LONG_1000,
            ),
        })
        .strict(),
});

export const switchSchema = z.object({
    params: packageParams,
    body: z.object({ on: z.boolean({ required_error: 'Choose on or off.', invalid_type_error: 'Choose on or off.' }) }).strict(),
});

const reasonName = textWithin(
    PACKAGE_MESSAGES.REASON_EMPTY,
    PACKAGE_LIMITS.DELETE_REASON_NAME_MAX,
    PACKAGE_MESSAGES.REASON_NAME_TOO_LONG,
);

const reasonStatus = codeOf(DELETE_REASON_STATUSES, PACKAGE_MESSAGES.REASON_STATUS);

const reasonParams = z.object({ id: coercedId(PACKAGE_MESSAGES.REASON_NOT_FOUND) });

export const reasonListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: searchText,
        status: optionalCode(DELETE_REASON_STATUSES, PACKAGE_MESSAGES.REASON_STATUS),
    }),
});

export const reasonCreateSchema = z.object({ body: z.object({ name: reasonName }).strict() });

export const reasonUpdateSchema = z.object({
    params: reasonParams,
    body: z.object({ name: reasonName, status: reasonStatus }).strict(),
});

export const reasonStatusSchema = z.object({
    params: reasonParams,
    body: z.object({ status: reasonStatus }).strict(),
});

export type ReasonParams = z.infer<typeof reasonParams>;

const listOf = <T extends number>(codes: readonly T[], message: string) =>
    z
        .union([z.string(), z.array(z.string())])
        .optional()
        .transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : value.split(',')))
        .transform((values) => values.filter((value) => value.trim() !== '').map(Number))
        .refine((values) => values.every((value) => (codes as readonly number[]).includes(value)), message)
        .transform((values) => [...new Set(values)] as T[]);

const optionalWhole = (message: string) => z.coerce.number({ invalid_type_error: message }).int(message).min(0, message).optional();

export const websiteListSchema = z.object({
    query: z.object({
        search: searchText,
        masterParkId: coercedId(PACKAGE_MESSAGES.PARK_NOT_AVAILABLE).optional(),
        priceMin: optionalWhole(PACKAGE_MESSAGES.PRICE_RANGE),
        priceMax: optionalWhole(PACKAGE_MESSAGES.PRICE_RANGE),
        nightsMin: optionalWhole(PACKAGE_MESSAGES.DAYS_RANGE),
        nightsMax: optionalWhole(PACKAGE_MESSAGES.DAYS_RANGE),
        safarisMin: optionalWhole(PACKAGE_MESSAGES.SAFARIS_RANGE),
        safarisMax: optionalWhole(PACKAGE_MESSAGES.SAFARIS_RANGE),
        stays: listOf(STAYS, PACKAGE_MESSAGES.STAY),
        features: listOf(PACKAGE_FEATURES, PACKAGE_MESSAGES.FEATURE),
        inclusions: listOf(INCLUSIONS, PACKAGE_MESSAGES.INCLUSIONS_ALL),
        sort: z
            .string()
            .optional()
            .default(WebsiteSort.POPULAR)
            .refine((value) => (WEBSITE_SORTS as readonly string[]).includes(value), PACKAGE_MESSAGES.SORT),
        page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
    }),
});

export const websiteSlugSchema = z.object({
    params: z.object({ slug: z.string().trim().min(1).max(PACKAGE_LIMITS.SLUG_MAX) }),
});
