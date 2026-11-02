export const LANGUAGE_HEADER = 'x-language';

export const BASE_LANGUAGE = 'en';

const LANGUAGE_CODE = /^[a-z]{2,3}$/;

export const languageFromHeader = (value: string | undefined): string => {
    const code = value?.trim().toLowerCase();
    return code && LANGUAGE_CODE.test(code) ? code : BASE_LANGUAGE;
};
