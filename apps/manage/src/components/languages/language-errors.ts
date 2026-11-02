import { ApiError } from '@/services/api-error';

const FIELD_OF_CODE: Readonly<Record<string, string>> = {
    LANGUAGE_CODE_TAKEN: 'code',
    LANGUAGE_NAME_TAKEN: 'name',
    TRANSLATION_ENGLISH_TAKEN: 'enText',
};

export type FieldErrors = Readonly<Record<string, string>>;

export const saveErrorsOf = (
    error: unknown,
    fields: readonly string[],
    t: (text: string) => string,
): { readonly fields: FieldErrors; readonly form: string | null } => {
    if (!(error instanceof ApiError) || error.code === ApiError.NETWORK_ERROR) {
        return { fields: {}, form: t('It could not be saved. Please try again.') };
    }
    const byCode = FIELD_OF_CODE[error.code];
    if (byCode) return { fields: { [byCode]: t(error.message) }, form: null };
    const found = Object.fromEntries(
        fields.flatMap((field) => {
            const message = error.fieldError(field);
            return message ? [[field, t(message)]] : [];
        }),
    );
    return Object.keys(found).length > 0 ? { fields: found, form: null } : { fields: {}, form: t(error.message) };
};

export const clearField = (errors: FieldErrors, field: string): FieldErrors =>
    Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field));
