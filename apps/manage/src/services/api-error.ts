import type { FieldError } from '@/types/api.types';

export const API_DIGEST_PREFIX = 'API: ';

/**
 * Every failed API call becomes one of these. Screens branch on `code` (the API's
 * SCREAMING_SNAKE code, or one of the client-side codes below), never on `message`.
 */
export class ApiError extends Error {
    /** No response at all: the API is down, or the network/CORS blocked the call. */
    static readonly NETWORK_ERROR = 'NETWORK_ERROR';
    /** A response that is not the API's JSON envelope (e.g. a proxy's HTML error page). */
    static readonly INVALID_RESPONSE = 'INVALID_RESPONSE';

    readonly digest: string;

    constructor(
        message: string,
        public readonly status: number,
        public readonly code: string,
        public readonly requestId?: string,
        public readonly errors: ReadonlyArray<FieldError> = [],
    ) {
        super(message);
        this.name = 'ApiError';
        this.digest = `${API_DIGEST_PREFIX}${message} [${[code, requestId].filter(Boolean).join(' · ')}]`;
    }

    /** The message for one form field, from a VALIDATION_FAILED response. */
    fieldError(field: string): string | undefined {
        return this.errors.find((error) => error.field === field)?.message;
    }
}
