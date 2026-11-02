const DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

export const isDuplicateEntryError = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: unknown }).code === DUPLICATE_ENTRY;
