const HOME = '/';

const CHECK_ORIGIN = 'http://return-path.invalid';

const UNSAFE_CHARACTERS = /[\u0000-\u001F\u007F\\]/;

export const safeReturnPath = (value: string | readonly string[] | undefined): string => {
    const path = Array.isArray(value) ? value[0] : value;
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || UNSAFE_CHARACTERS.test(path)) {
        return HOME;
    }
    try {
        const url = new URL(path, CHECK_ORIGIN);
        if (url.origin !== CHECK_ORIGIN || url.pathname.startsWith('//')) return HOME;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return HOME;
    }
};
