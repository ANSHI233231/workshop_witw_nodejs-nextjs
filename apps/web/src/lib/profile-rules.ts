import type { Translate } from '@/lib/i18n/locale';
import { GENDER_OPTIONS, type GenderCode, PROFILE_LIMITS } from '@/types/profile.types';

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const WEB_ADDRESS = /^https?:\/\//i;

const IMAGE_NAME = /\.(jpe?g|png)$/i;

const IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export const todayInIndia = (): string => INDIA_DATE.format(new Date());

export const eighteenYearsAgo = (today: string): string => `${Number(today.slice(0, 4)) - PROFILE_LIMITS.MIN_AGE}${today.slice(4)}`;

export type PersonFieldInput = {
    readonly dateOfBirth: string;
    readonly gender: GenderCode | null;
};

export type PersonFieldRules = {
    readonly dateOfBirthRequired: boolean;
    readonly genderRequired: boolean;
};

export const checkDateOfBirth = (t: Translate, dateOfBirth: string, required: boolean): string | undefined => {
    if (dateOfBirth === '') return required ? t('Enter your date of birth.') : undefined;
    const today = todayInIndia();
    if (dateOfBirth > today) return t("The date of birth can't be in the future.");
    if (dateOfBirth > eighteenYearsAgo(today)) return t('You must be 18 or older.');
    return undefined;
};

export const checkGender = (t: Translate, gender: GenderCode | null, required: boolean): string | undefined => {
    if (gender === null) return required ? t('Select your gender.') : undefined;
    return GENDER_OPTIONS.some((option) => option.value === gender) ? undefined : t('Select your gender.');
};

export const checkSocialLink = (t: Translate, link: string): string | undefined => {
    const value = link.trim();
    if (value === '') return undefined;
    return value.length > PROFILE_LIMITS.LINK_MAX ? t('Use up to 1,000 characters.') : undefined;
};

export const isWebLink = (text: string): boolean => WEB_ADDRESS.test(text.trim());

export const checkProfileImage = (t: Translate, file: File, maxBytes: number): string | undefined => {
    if (!IMAGE_NAME.test(file.name) || (file.type !== '' && !IMAGE_TYPES.includes(file.type))) {
        return t('Choose a JPG, JPEG or PNG file.');
    }
    if (file.size > maxBytes) return t('Choose a file up to {kb} KB.', { kb: Math.round(maxBytes / 1024) });
    return undefined;
};
