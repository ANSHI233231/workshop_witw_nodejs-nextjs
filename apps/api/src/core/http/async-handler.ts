import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 does not await a handler: a rejected promise from an async handler never reaches the
 * error middleware and the request hangs. Every async handler is wrapped in this where its route
 * is declared, so controllers contain no try/catch.
 */
export const asyncHandler =
    (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        handler(req, res, next).catch(next);
    };
