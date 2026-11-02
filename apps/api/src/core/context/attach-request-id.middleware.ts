import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { CLIENT_APP_HEADER, CLIENT_APP_QUERY, clientAppOf } from './client-app';
import { runWithRequestContext, type RequestContext } from './request-context';
import { LANGUAGE_HEADER, languageFromHeader } from './request-language';

const INBOUND_HEADER = 'x-request-id';
// An inbound id is reused only when it looks like one, so a caller cannot inject arbitrary text
// into every log line of the request.
const ACCEPTABLE_INBOUND = /^[A-Za-z0-9-]{1,64}$/;

/** First middleware in the chain: gives the request its id and opens its request context. */
export const attachRequestId = (req: Request, res: Response, next: NextFunction): void => {
    const inbound = req.get(INBOUND_HEADER);
    req.requestId = inbound !== undefined && ACCEPTABLE_INBOUND.test(inbound) ? inbound : randomUUID();
    res.setHeader('X-Request-Id', req.requestId);

    const context: RequestContext = {
        requestId: req.requestId,
        // `::ffff:1.2.3.4` is an IPv4 client on a dual-stack socket: log it as `1.2.3.4`.
        ip: (req.ip ?? req.socket.remoteAddress ?? '-').replace(/^::ffff:/, ''),
        method: req.method,
        url: req.originalUrl,
        clientApp: clientAppOf(req.method, req.get(CLIENT_APP_HEADER), req.query[CLIENT_APP_QUERY]),
        userAgent: req.get('user-agent') ?? null,
        language: languageFromHeader(req.get(LANGUAGE_HEADER)),
        userId: null,
    };
    req.requestContext = context;
    runWithRequestContext(context, next);
};

/**
 * Re-enters the request context. The body parsers continue in stream callbacks that lose
 * AsyncLocalStorage, so this runs again right after them: every route, service, repository and
 * SQL log line then carries the request's prefix.
 */
export const enterRequestContext = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.requestContext) runWithRequestContext(req.requestContext, next);
    else next();
};

/** Runs `work` inside the request's context; used by callbacks (res 'finish', errors) that lose it. */
export const withRequestContext = <T>(req: Request, work: () => T): T =>
    req.requestContext ? runWithRequestContext(req.requestContext, work) : work();
