// Turns every failure into the error envelope. Registered LAST in app.ts: Express recognises an
// error handler only by its four-argument signature, and only consults handlers registered after
// the route that threw.

import type { NextFunction, Request, Response } from 'express';

import { withRequestContext } from '../context';
import { AppError, ValidationException } from '../exceptions';
import { failed } from '../http';
import { describeRequest, logger, markErrorLogged } from '../logger';

const errorLog = logger.category('http.error');

/** body-parser rejections arrive as plain errors with a `type`; each is a client fault, not a 500. */
const BODY_PARSER_FAILURES: Readonly<Record<string, { httpStatus: number; code: string; message: string }>> = {
    'entity.parse.failed': { httpStatus: 400, code: 'MALFORMED_REQUEST_BODY', message: 'The request body could not be parsed.' },
    'entity.too.large': { httpStatus: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' },
    'charset.unsupported': { httpStatus: 415, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'The request body character set is not supported.' },
    'encoding.unsupported': { httpStatus: 415, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'The request body encoding is not supported.' },
    'parameters.too.many': { httpStatus: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The request body has too many parameters.' },
};

const bodyParserFailureOf = (error: unknown) =>
    error instanceof Error && 'type' in error && typeof error.type === 'string'
        ? BODY_PARSER_FAILURES[error.type]
        : undefined;

export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction): void =>
    // Errors from the body parsers arrive in stream callbacks outside the request context.
    withRequestContext(req, () => handleError(error, req, res, next));

const handleError = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        markErrorLogged(res);
        errorLog.error(`${describeRequest(req)} -> failed after the response started`, error);
        next(error);
        return;
    }

    const requestId = req.requestId;

    if (error instanceof AppError) {
        // 4xx is ordinary traffic (validation, not-found) and would drown error.log; the access
        // log already records the status. 5xx is a server fault and must always be findable.
        if (error.httpStatus >= 500) {
            markErrorLogged(res);
            errorLog.error(`${describeRequest(req)} -> ${error.httpStatus} ${error.code}: ${error.message}`, error);
        } else {
            errorLog.debug(`${describeRequest(req)} -> ${error.httpStatus} ${error.code}`);
        }
        const errors = error instanceof ValidationException ? error.errors : undefined;
        failed(res, error.httpStatus, error.message, error.code, { requestId, errors });
        return;
    }

    const bodyParserFailure = bodyParserFailureOf(error);
    if (bodyParserFailure !== undefined) {
        errorLog.debug(`${describeRequest(req)} -> ${bodyParserFailure.httpStatus} ${bodyParserFailure.code}`);
        failed(res, bodyParserFailure.httpStatus, bodyParserFailure.message, bodyParserFailure.code, { requestId });
        return;
    }

    // Not an AppError: a bug or an outage. Logged with its full stack and cause chain (the request
    // context dump follows from the request log); the caller learns nothing.
    markErrorLogged(res);
    errorLog.error(`Unhandled error: ${describeRequest(req)} -> 500 INTERNAL_ERROR`, error);
    failed(res, 500, 'An unexpected error occurred.', 'INTERNAL_ERROR', { requestId });
};
