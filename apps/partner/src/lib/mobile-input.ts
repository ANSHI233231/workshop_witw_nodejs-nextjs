export const MOBILE_INPUT_LENGTH = 10;

const INDIA_PREFIXES = ['91', '0'] as const;

export const mobileInput = (text: string): string => {
    const digits = text.replace(/\D/g, '');
    const prefix = INDIA_PREFIXES.find(
        (candidate) => digits.length === MOBILE_INPUT_LENGTH + candidate.length && digits.startsWith(candidate),
    );
    return (prefix ? digits.slice(prefix.length) : digits).slice(0, MOBILE_INPUT_LENGTH);
};
