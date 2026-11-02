import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z, ZodError } from 'zod';

import { ValidationException, type FieldError } from '../exceptions';

/**
 * A request schema is `z.object({ body?, params?, query? })`. Each part that is present is parsed
 * and REPLACES the raw value, so a controller only ever sees validated, typed input.
 */
export type RequestSchema = z.ZodType<{ body?: unknown; params?: unknown; query?: unknown }>;

const toFieldErrors = (error: ZodError): ReadonlyArray<FieldError> =>
    error.issues.map((issue) => ({
        // Drop the leading `body` / `query` / `params` segment: the frontend knows its own form.
        field: issue.path.slice(1).join('.') || issue.path.join('.'),
        message: issue.message,
    }));

export const validate =
    (schema: RequestSchema): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse({ body: req.body as unknown, params: req.params, query: req.query });

        if (!result.success) {
            next(new ValidationException('Validation failed.', toFieldErrors(result.error)));
            return;
        }

        if (result.data.body !== undefined) req.body = result.data.body;
        if (result.data.params !== undefined) req.params = result.data.params as Request['params'];
        if (result.data.query !== undefined) req.query = result.data.query as Request['query'];
        next();
    };
