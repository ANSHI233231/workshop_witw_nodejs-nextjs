import type { Translate } from '@/lib/i18n/locale';
import type { ApiError } from '@/services/api-error';
import { PASSWORD_LIMITS, SIGN_UP_LIMITS } from '@/types/auth.types';

export type AccountField = 'name' | 'email' | 'mobile' | 'password';

export type AccountErrors = Partial<Readonly<Record<AccountField, string>>>;

export type AccountValues = Readonly<Record<AccountField, string>>;

const ACCOUNT_FIELDS: readonly AccountField[] = ['name', 'email', 'mobile', 'password'];

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_OF_CODE: Readonly<Record<string, AccountField>> = { EMAIL_TAKEN: 'email', MOBILE_TAKEN: 'mobile' };

export const checkAccount = (t: Translate, values: AccountValues): AccountErrors => {
    const errors: Partial<Record<AccountField, string>> = {};
    const name = values.name.trim();
    const email = values.email.trim();
    if (name.length < SIGN_UP_LIMITS.NAME_MIN) errors.name = t('Enter your full name.');
    else if (name.length > SIGN_UP_LIMITS.NAME_MAX)
        errors.name = t('Name can be at most {max} characters.', { max: SIGN_UP_LIMITS.NAME_MAX });
    if (!EMAIL_SHAPE.test(email) || email.length > SIGN_UP_LIMITS.EMAIL) errors.email = t('Enter a valid email address.');
    if (!INDIAN_MOBILE.test(values.mobile)) errors.mobile = t('Enter a 10-digit mobile number.');
    if (values.password.length < PASSWORD_LIMITS.MIN)
        errors.password = t('Use at least {min} characters.', { min: PASSWORD_LIMITS.MIN });
    else if (values.password.length > PASSWORD_LIMITS.MAX)
        errors.password = t('Password can be at most {max} characters.', { max: PASSWORD_LIMITS.MAX });
    return errors;
};

export const hasAccountErrors = (errors: AccountErrors): boolean =>
    ACCOUNT_FIELDS.some((field) => errors[field] !== undefined);

export const accountErrorsOf = (t: Translate, error: ApiError): AccountErrors => {
    const taken = FIELD_OF_CODE[error.code];
    if (taken) return { [taken]: t(error.message) };
    return Object.fromEntries(
        ACCOUNT_FIELDS.flatMap((field) => {
            const message = error.fieldError(field);
            return message === undefined ? [] : [[field, t(message)]];
        }),
    );
};
