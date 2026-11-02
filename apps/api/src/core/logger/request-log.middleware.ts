import type { NextFunction, Request, Response } from 'express';

import { withRequestContext } from '../context';

import { logger } from './logger';
import { redactUrl, toLogJson } from './redact';

const requestLog = logger.category('http.request');

/** `METHOD /url`: the request's id, ip and user are already in every line's prefix. */
export const describeRequest = (req: Request): string => `${req.method} ${redactUrl(req.originalUrl)}`;

/**
 * Marks a response whose failure the error handler already wrote to error.log, so the
 * last-resort net below does not log the same failure twice.
 */
export const markErrorLogged = (res: Response): void => {
    res.locals['errorLogged'] = true;
};

/** The request context dump: what the request was. Values of credential-like keys are redacted. */
const contextDump = (req: Request, res: Response, durationMs: number): string => {
    const route = req.route ? `${req.baseUrl}${(req.route as { path?: string }).path ?? ''}` : null;
    return [
        `$request = ${toLogJson({
            method: req.method,
            url: redactUrl(req.originalUrl),
            route,
            ip: req.ip,
            status: res.statusCode,
            durationMs: Number(durationMs.toFixed(1)),
            contentLength: res.getHeader('content-length') ?? null,
        })}`,
        `$query = ${toLogJson(req.query)}`,
        `$body = ${toLogJson(req.body ?? null)}`,
        `$headers = ${toLogJson(req.headers)}`,
    ].join('\n');
};

/**
 * One access-log line per request, the request context dump (when LOG_REQUEST_CONTEXT is on),
 * and a last-resort net: any 5xx, or a connection that closes before the response
 * completes, reaches error.log even if it never went through the error handler.
 */
export const recordRequestLog = (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    res.on('finish', () =>
        withRequestContext(req, () => {
            const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
            logger.access(`${describeRequest(req)} ${res.statusCode} ${durationMs.toFixed(1)}ms`);

            const isServerError = res.statusCode >= 500;
            if (isServerError && res.locals['errorLogged'] !== true) {
                logger.category('http.error').error(`${describeRequest(req)} -> ${res.statusCode}`);
            }
            if (logger.isRequestContextEnabled()) {
                const dump = contextDump(req, res, durationMs);
                // A failed request's dump goes to error.log, next to its error.
                if (isServerError) requestLog.error('Request context', dump);
                else requestLog.info('Request context', dump);
            }
        }),
    );

    res.on('close', () =>
        withRequestContext(req, () => {
            if (res.writableFinished || !res.headersSent) return;
            logger.category('http.error').error(`${describeRequest(req)} -> connection closed before the response completed`);
        }),
    );

    next();
};
