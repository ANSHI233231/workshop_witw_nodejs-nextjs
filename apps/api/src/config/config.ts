// The ONLY reader of `process.env`. Importing this file validates the whole environment and exits
// the process on a bad or missing variable, so only entry points (server.ts, the CLI) import it;
// everything else is handed the values it needs.

import path from 'node:path';

import { environmentSchema } from './environment.schema';

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    process.stderr.write(
        `Invalid environment configuration. The process cannot start.\n${problems}\n` +
            'See apps/api/.env.example for the full variable list.\n',
    );
    process.exit(1);
}

const env = parsed.data;

const isProduction = env.NODE_ENV === 'production';

export const config = Object.freeze({
    nodeEnv: env.NODE_ENV,
    isProduction,
    port: env.PORT,
    /** `undefined` = all interfaces. */
    host: env.HOST,
    db: Object.freeze({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        connectionLimit: env.DB_CONNECTION_LIMIT,
    }),
    trustProxy: env.TRUST_PROXY === undefined ? 'loopback' : env.TRUST_PROXY === 'false' ? false : env.TRUST_PROXY,
    corsOrigins: Object.freeze(
        env.CORS_ORIGIN.split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    ),
    auth: Object.freeze({
        accessTokenSecret: env.JWT_SECRET,
        accessTokenLifetimeSeconds: env.JWT_EXPIRES_IN,
        refreshTokenSecret: env.JWT_REFRESH_SECRET,
        refreshTokenLifetimeSeconds: env.JWT_REFRESH_EXPIRES_IN,
        cookieDomain: env.AUTH_COOKIE_DOMAIN,
        cookiePrefix: env.AUTH_COOKIE_PREFIX,
        cookieSecure: isProduction,
    }),
    mail: Object.freeze({
        driver: env.EMAIL_DRIVER,
        from: env.MAIL_FROM,
    }),
    storage: Object.freeze({
        driver: env.STORAGE_DRIVER,
        localRoot: env.STORAGE_LOCAL_ROOT,
    }),
    childProcessEnvironment: Object.freeze({ ...process.env }),
    worker: Object.freeze({
        enabled: env.WORKER_ENABLED ?? false,
        pollSeconds: env.WORKER_POLL_SECONDS,
        maxParallel: env.WORKER_MAX_PARALLEL,
    }),
    appUrls: Object.freeze({
        manage: env.APP_URL_MANAGE.replace(/\/+$/, ''),
        web: env.APP_URL_WEB.replace(/\/+$/, ''),
    }),
    log: Object.freeze({
        // Nothing is written until LOG_ENABLED=true.
        enabled: env.LOG_ENABLED ?? false,
        // Which levels are saved. SQL lines and request dumps are `info`, so they follow it.
        levels: env.LOG_LEVELS ?? (['error', 'warn', 'info'] as const),
        recordLevels: env.LOG_DB_LEVELS ?? (['error'] as const),
        // Advanced overrides; these defaults are the recommended setup.
        traceLevel: env.LOG_TRACE_LEVEL ?? 3,
        sqlEnabled: env.LOG_SQL ?? true,
        requestContextEnabled: env.LOG_REQUEST_CONTEXT ?? true,
        toConsole: env.LOG_TO_CONSOLE ?? !isProduction,
        accessLogEnabled: env.ACCESS_LOG_ENABLED ?? true,
    }),
    logIngestKey: env.LOG_INGEST_KEY ?? null,
    logViewerDirs: Object.freeze(
        Object.fromEntries(
            Object.entries(env.LOG_VIEWER_DIRS ?? { api: 'logs' }).map(([app, dir]) => [
                app,
                path.resolve(process.cwd(), dir),
            ]),
        ),
    ),
    translationDirs: Object.freeze(
        Object.fromEntries(
            Object.entries(env.TRANSLATION_DIRS ?? {}).map(([app, dir]) => [app, path.resolve(process.cwd(), dir)]),
        ),
    ),
});

export type Config = typeof config;
