// Builds the Express application and never listens: binding the port is server.ts's job.
//
// DO NOT IMPORT `config/` HERE. Importing it validates the environment and exits on a missing
// variable; configuration enters at the entry points and is passed in.
//
// THE MIDDLEWARE ORDER IS LOAD-BEARING:
//   • `attachRequestId` first: it opens the request context every log line reads its prefix from.
//   • `enterRequestContext` right after the body parsers, which lose that context.
//   • `recordRequestLog` before the body parsers, so their rejections are logged and timed too.
//   • The 404 fall-through after every router, then `errorHandler` LAST: Express consults an
//     error handler only if it is registered after the route that threw.

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { attachRequestId, enterRequestContext } from './core/context';
import { errorHandler, notFoundHandler } from './core/errors';
import { keepRawBody } from './core/http';
import { recordRequestLog } from './core/logger';
import { registerRoutes, type RouteDependencies } from './routes';

export type AppDependencies = {
    readonly corsOrigins: readonly string[];
    /** Express 'trust proxy': which proxies may set X-Forwarded-For (the client IP). */
    readonly trustProxy: string | false;
    readonly routes: RouteDependencies;
};

export const createApp = (dependencies: AppDependencies): Express => {
    const app = express();

    app.disable('x-powered-by');
    app.set('trust proxy', dependencies.trustProxy);
    app.use(attachRequestId);
    app.use(recordRequestLog);

    app.use(
        helmet({
            // The frontends are separate origins and must be able to embed API responses
            // (e.g. <img src> for uploaded media); CORS below already trusts them.
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        }),
    );
    app.use(
        cors({
            origin: [...dependencies.corsOrigins],
            credentials: true,
            exposedHeaders: ['X-Request-Id'],
            maxAge: 86400,
        }),
    );
    app.use(express.json({ verify: keepRawBody }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    // The parsers resume in stream callbacks that lose the request context: re-enter it so every
    // log line from the routes on carries the request's prefix.
    app.use(enterRequestContext);

    registerRoutes(app, dependencies.routes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};
