import type { Response } from 'express';

import type { FieldError } from '../exceptions';

import type { ErrorEnvelope, PaginationMeta, SuccessEnvelope } from './response-envelope.types';

export const DEFAULT_SUCCESS_MESSAGE = 'Request completed successfully.';

export const ok = <T>(res: Response, data: T, message = DEFAULT_SUCCESS_MESSAGE): void => {
    const envelope: SuccessEnvelope<T> = { success: true, message, data };
    res.status(200).json(envelope);
};

export const created = <T>(res: Response, data: T, message = 'Created successfully.'): void => {
    const envelope: SuccessEnvelope<T> = { success: true, message, data };
    res.status(201).json(envelope);
};

export const noContent = (res: Response): void => {
    res.status(204).end();
};

export type PaginationResult = {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
};

export const paginated = <T>(
    res: Response,
    data: ReadonlyArray<T>,
    pagination: PaginationResult,
    message = DEFAULT_SUCCESS_MESSAGE,
): void => {
    const meta: PaginationMeta = {
        ...pagination,
        totalPages: pagination.limit > 0 ? Math.ceil(pagination.total / pagination.limit) : 0,
    };
    const envelope: SuccessEnvelope<ReadonlyArray<T>> = { success: true, message, data, meta };
    res.status(200).json(envelope);
};

/** Used only by the error handler and the 404 fall-through. Controllers throw instead. */
export const failed = (
    res: Response,
    httpStatus: number,
    message: string,
    code: string,
    extra: { readonly requestId?: string; readonly errors?: ReadonlyArray<FieldError> } = {},
): void => {
    const envelope: ErrorEnvelope = {
        success: false,
        message,
        code,
        ...(extra.requestId !== undefined ? { requestId: extra.requestId } : {}),
        ...(extra.errors !== undefined ? { errors: extra.errors } : {}),
    };
    res.status(httpStatus).json(envelope);
};
