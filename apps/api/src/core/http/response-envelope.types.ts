// The two envelopes every endpoint answers with. Frontends parse exactly these shapes.

import type { FieldError } from '../exceptions';

export type PaginationMeta = {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
};

export type SuccessEnvelope<T> = {
    readonly success: true;
    readonly message: string;
    readonly data: T;
    readonly meta?: PaginationMeta;
};

export type ErrorEnvelope = {
    readonly success: false;
    readonly message: string;
    readonly code: string;
    readonly requestId?: string;
    readonly errors?: ReadonlyArray<FieldError>;
};
