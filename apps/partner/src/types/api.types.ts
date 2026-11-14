// The API's two response envelopes (apps/api/src/core/http/response-envelope.types.ts). Keep in
// sync with the API: an envelope change ships in the same change as every app that reads it.

export type FieldError = {
    readonly field: string;
    readonly message: string;
};

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

export type Paginated<T> = {
    readonly items: ReadonlyArray<T>;
    readonly meta: PaginationMeta;
};
