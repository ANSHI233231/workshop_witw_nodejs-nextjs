import type { RequestContext } from './request-context';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            /** Set by `attachRequestId`, the first middleware. */
            requestId?: string;
            /** Set by `attachRequestId`; re-entered by `enterRequestContext` after the body parsers. */
            requestContext?: RequestContext;
        }
    }
}

export {};
