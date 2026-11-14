import type { Translate } from '@/lib/i18n/locale';
import type { ApiError } from '@/services/api-error';
import {
    BUSINESS_EMAIL_PATTERN,
    BUSINESS_PHONE_PATTERN,
    LOGO_CONTENT_TYPES,
    PARTNER_LIMITS,
    type PartnerBusinessInput,
} from '@/types/partner.types';

export type BusinessField =
    | 'businessName'
    | 'ownerName'
    | 'businessPhone'
    | 'businessEmail'
    | 'masterParkIds'
    | 'about'
    | 'logo';

export type BusinessErrors = Partial<Readonly<Record<BusinessField, string>>>;

export type BusinessValues = {
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string;
    readonly parkIds: readonly number[];
};

export type LogoChoice = { readonly file: File | null; readonly removed: boolean };

export const NO_LOGO_CHOICE: LogoChoice = { file: null, removed: false };

const BUSINESS_FIELDS: readonly BusinessField[] = [
    'businessName',
    'ownerName',
    'businessPhone',
    'businessEmail',
    'masterParkIds',
    'about',
    'logo',
];

const LOGO_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

export const initialsOf = (businessName: string): string => {
    const words = businessName.split(/\s+/).filter(Boolean);
    return ((words[0] ?? '').charAt(0) + (words.length > 1 ? (words[1] ?? '').charAt(0) : '')).toUpperCase();
};

export const checkLogoFile = (t: Translate, file: File): string | null => {
    const typeOk = LOGO_CONTENT_TYPES.includes(file.type) || (file.type === '' && LOGO_EXTENSIONS.test(file.name));
    if (!typeOk || !LOGO_EXTENSIONS.test(file.name)) return t('Choose a JPG, JPEG, PNG or WEBP file.');
    if (file.size > PARTNER_LIMITS.LOGO_MAX_BYTES) return t('Choose a file up to 1 MB.');
    return null;
};

export const checkBusiness = (t: Translate, values: BusinessValues): BusinessErrors => {
    const errors: Partial<Record<BusinessField, string>> = {};
    const businessName = values.businessName.trim();
    const ownerName = values.ownerName.trim();
    const phone = values.businessPhone.trim();
    const email = values.businessEmail.trim();
    const tooLong = (max: number) => t('Use up to {max} characters.', { max });
    if (!businessName) errors.businessName = t('Enter the business name.');
    else if (businessName.length > PARTNER_LIMITS.BUSINESS_NAME_MAX)
        errors.businessName = tooLong(PARTNER_LIMITS.BUSINESS_NAME_MAX);
    if (!ownerName) errors.ownerName = t('Enter the owner name.');
    else if (ownerName.length > PARTNER_LIMITS.OWNER_NAME_MAX) errors.ownerName = tooLong(PARTNER_LIMITS.OWNER_NAME_MAX);
    if (!phone) errors.businessPhone = t('Enter the business phone.');
    else if (!BUSINESS_PHONE_PATTERN.test(phone))
        errors.businessPhone = t('Enter a 10-digit number starting with 6, 7, 8 or 9.');
    if (!email) errors.businessEmail = t('Enter the business email.');
    else if (email.length > PARTNER_LIMITS.BUSINESS_EMAIL_MAX)
        errors.businessEmail = tooLong(PARTNER_LIMITS.BUSINESS_EMAIL_MAX);
    else if (!BUSINESS_EMAIL_PATTERN.test(email)) errors.businessEmail = t('Enter a valid email address.');
    if (values.parkIds.length === 0) errors.masterParkIds = t('Choose at least one park.');
    if (values.about.trim().length > PARTNER_LIMITS.ABOUT_MAX)
        errors.about = t('Use up to 2,000 characters.');
    return errors;
};

export const businessInputOf = (values: BusinessValues): PartnerBusinessInput => ({
    businessName: values.businessName.trim(),
    ownerName: values.ownerName.trim(),
    businessPhone: values.businessPhone.trim(),
    businessEmail: values.businessEmail.trim(),
    about: values.about.trim() === '' ? null : values.about.trim(),
    masterParkIds: values.parkIds,
});

export const hasBusinessErrors = (errors: BusinessErrors): boolean =>
    BUSINESS_FIELDS.some((field) => errors[field] !== undefined);

const CODE_FIELD: Readonly<Record<string, BusinessField>> = {
    PARTNER_PARK_NOT_AVAILABLE: 'masterParkIds',
    PARTNER_PARKS_REQUIRED: 'masterParkIds',
    PARTNER_LOGO_TYPE: 'logo',
    UPLOAD_REJECTED: 'logo',
};

const fieldMessage = (error: ApiError, field: string): string | undefined =>
    error.errors.find((item) => item.field === field || item.field.startsWith(`${field}.`))?.message;

export const businessErrorsOf = (t: Translate, error: ApiError): BusinessErrors => {
    const coded = CODE_FIELD[error.code];
    if (coded) return { [coded]: t(error.message) };
    return Object.fromEntries(
        BUSINESS_FIELDS.flatMap((field) => {
            const message = fieldMessage(error, field);
            return message === undefined ? [] : [[field, t(message)]];
        }),
    );
};
