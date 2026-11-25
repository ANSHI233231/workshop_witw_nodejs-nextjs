import { z } from 'zod';

export const Gender = { MALE: 1, FEMALE: 2, OTHER: 3 } as const;

export type GenderCode = (typeof Gender)[keyof typeof Gender];

export const GENDERS: readonly GenderCode[] = [Gender.MALE, Gender.FEMALE, Gender.OTHER];

export const ADULT_AGE_YEARS = 18;

export const PERSON_TIME_ZONE = 'Asia/Kolkata';

export const PERSON_MESSAGES = {
    DATE_OF_BIRTH_EMPTY: 'Enter your date of birth.',
    DATE_OF_BIRTH_FUTURE: "The date of birth can't be in the future.",
    DATE_OF_BIRTH_UNDER_AGE: 'You must be 18 or older.',
    GENDER_EMPTY: 'Select your gender.',
} as const;

const LOCAL_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: PERSON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const YEAR_LENGTH = 4;

export const personToday = (now: Date = new Date()): string => LOCAL_DATE.format(now);

export const isCalendarDate = (value: string): boolean => {
    if (!ISO_DATE.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const latestAdultBirthDate = (today: string): string =>
    `${String(Number(today.slice(0, YEAR_LENGTH)) - ADULT_AGE_YEARS).padStart(YEAR_LENGTH, '0')}${today.slice(YEAR_LENGTH)}`;

export const dateOfBirthProblem = (value: string, today: string = personToday()): string | undefined => {
    if (!isCalendarDate(value)) return PERSON_MESSAGES.DATE_OF_BIRTH_EMPTY;
    if (value > today) return PERSON_MESSAGES.DATE_OF_BIRTH_FUTURE;
    if (value > latestAdultBirthDate(today)) return PERSON_MESSAGES.DATE_OF_BIRTH_UNDER_AGE;
    return undefined;
};

export const dateOfBirthField = z.unknown().transform((value, context): string => {
    const text = typeof value === 'string' ? value.trim() : '';
    const problem = dateOfBirthProblem(text);
    if (problem) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        return z.NEVER;
    }
    return text;
});

export const genderField = z.unknown().transform((value, context): GenderCode => {
    const code = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    if (!(GENDERS as readonly number[]).includes(code)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: PERSON_MESSAGES.GENDER_EMPTY });
        return z.NEVER;
    }
    return code as GenderCode;
});

const isEmpty = (value: unknown): boolean =>
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

export const optionalDateOfBirthField = z.unknown().transform((value, context): string | null => {
    if (isEmpty(value)) return null;
    const text = typeof value === 'string' ? value.trim() : '';
    const problem = dateOfBirthProblem(text);
    if (problem) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        return z.NEVER;
    }
    return text;
});

export const optionalGenderField = z.unknown().transform((value, context): GenderCode | null => {
    if (isEmpty(value)) return null;
    const code = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (!(GENDERS as readonly number[]).includes(code)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: PERSON_MESSAGES.GENDER_EMPTY });
        return z.NEVER;
    }
    return code as GenderCode;
});
