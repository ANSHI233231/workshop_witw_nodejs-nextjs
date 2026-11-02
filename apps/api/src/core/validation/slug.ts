const SLUG_GAPS = /[^\p{L}\p{M}\p{N}]+/gu;
const SLUG_EDGES = /^-+|-+$/g;

export const SLUG_SEPARATOR = '-';

export const slugOf = (name: string, maxLength: number, fallback: string): string =>
    name
        .normalize('NFC')
        .toLowerCase()
        .replace(SLUG_GAPS, SLUG_SEPARATOR)
        .slice(0, maxLength)
        .replace(SLUG_EDGES, '') || fallback;

export const freeSlug = async (base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> => {
    let candidate = base;
    for (let suffix = 2; await isTaken(candidate); suffix += 1) {
        candidate = `${base}${SLUG_SEPARATOR}${suffix}`;
    }
    return candidate;
};
