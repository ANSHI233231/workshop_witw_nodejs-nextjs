// Every environment variable the API reads, validated once at boot. `.env.example` mirrors this
// file row for row: a new variable lands in both in the same change.

import { z } from 'zod';

// An empty value (`LOG_LEVELS=`, as left in .env) means "not set": use the default.
const optional = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const booleanString = optional(z.enum(['true', 'false']).transform((value) => value === 'true'));

const port = z.coerce.number().int().min(1).max(65535);

// A token lifetime: a number and a unit, s m h d (e.g. 15m, 1d, 30d).
const DURATION_UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 } as const;
const duration = z
    .string()
    .regex(/^\d+[smhd]$/, 'Use a number and a unit: s, m, h or d (e.g. 1d, 30d)')
    .transform(
        (value) =>
            Number(value.slice(0, -1)) * DURATION_UNIT_SECONDS[value.slice(-1) as keyof typeof DURATION_UNIT_SECONDS],
    );

const LOG_VIEWER_APPS = ['api', 'manage', 'web'] as const;
const TRANSLATION_APPS = ['manage', 'web'] as const;
const appFolders = <App extends string>(apps: readonly App[]) =>
    z.string().transform((value, context) => {
        const entries = value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => entry.split('=').map((part) => part.trim()));
        const wrong = entries.filter(([app, dir]) => !dir || !apps.includes(app as App));
        if (wrong.length > 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Use app=folder pairs, app one of ${apps.join(', ')}`,
            });
            return z.NEVER;
        }
        return Object.fromEntries(entries.map(([app, dir]) => [app, dir])) as Partial<Record<App, string>>;
    });
const logViewerDirs = appFolders(LOG_VIEWER_APPS);
const translationDirs = appFolders(TRANSLATION_APPS);

const tokenSecret = z.string().min(32, 'Use at least 32 random characters');

// LOG_LEVELS=error,warning,info → ['error', 'warn', 'info']. `warning` and `warn` both accepted.
const LOG_LEVEL_NAMES = { error: 'error', warning: 'warn', warn: 'warn', info: 'info', debug: 'debug' } as const;
const logLevels = z.string().transform((value, context) => {
    const names = value
        .split(',')
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean);
    const unknown = names.filter((name) => !(name in LOG_LEVEL_NAMES));
    if (unknown.length > 0 || names.length === 0) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Use a comma-separated list of: error, warning, info, debug (got "${value}")`,
        });
        return z.NEVER;
    }
    return [...new Set(names.map((name) => LOG_LEVEL_NAMES[name as keyof typeof LOG_LEVEL_NAMES]))];
});

export const environmentSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        PORT: port.default(4000),
        // Interface to listen on. Empty = all interfaces; 127.0.0.1 = only this machine (e.g. behind nginx).
        HOST: optional(z.string().min(1)),

        DB_HOST: z.string().min(1),
        DB_PORT: port.default(3306),
        DB_USER: z.string().min(1),
        // May be empty on a local MySQL; never given a non-empty fallback.
        DB_PASSWORD: z.string().default(''),
        DB_NAME: z.string().min(1),
        DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).default(10),

        // Which proxies may set X-Forwarded-For (Express 'trust proxy'): the client IP in logs comes from
        // it. 'loopback' = only a proxy on this machine (nginx locally); 'false' = never; or a list of
        // IPs/CIDRs. Never 'true' on a server reachable directly: callers could fake their IP.
        TRUST_PROXY: optional(z.string().min(1)),

        // Comma-separated frontend origins (manage, web).
        CORS_ORIGIN: z.string().min(1),

        // Sign-in tokens (JWT). The two secrets are required, different, never given a fallback.
        JWT_SECRET: tokenSecret,
        JWT_EXPIRES_IN: duration.default('1d'),
        JWT_REFRESH_SECRET: tokenSecret,
        JWT_REFRESH_EXPIRES_IN: duration.default('30d'),
        // Domain of the sign-in cookies, shared by the API and the apps (e.g. .starter.local).
        // Empty = the API's own host only.
        AUTH_COOKIE_DOMAIN: optional(z.string().min(1)),
        AUTH_COOKIE_PREFIX: z
            .string()
            .max(20)
            .regex(/^[a-z0-9_]*$/, 'Use lowercase letters, digits and _ only.')
            .default(''),

        // Mail. EMAIL_DRIVER=capture: nothing is sent, every mail is recorded in mail_log as captured.
        EMAIL_DRIVER: z.enum(['capture']).default('capture'),
        // Sender of every mail, e.g. "Starter <no-reply@example.com>".
        MAIL_FROM: z.string().min(1),

        // Uploaded files. STORAGE_DRIVER=local: files kept on this server's disk under STORAGE_LOCAL_ROOT
        // (an absolute folder, or relative to the API folder). Required: no fallback folder.
        STORAGE_DRIVER: z.enum(['local']).default('local'),
        STORAGE_LOCAL_ROOT: z.string().trim().min(1),

        // Background jobs: the worker the API starts (Console › Background Jobs). Off unless WORKER_ENABLED=true.
        WORKER_ENABLED: booleanString,
        WORKER_POLL_SECONDS: z.coerce.number().int().min(1).max(60).default(5),
        WORKER_MAX_PARALLEL: z.coerce.number().int().min(1).max(10).default(2),

        // Public address of each app, used in links inside mails (e.g. the password reset link).
        APP_URL_MANAGE: z.string().url(),
        APP_URL_WEB: z.string().url(),

        // Logging: the two everyday settings (see .env.example).
        LOG_ENABLED: booleanString,
        LOG_LEVELS: optional(logLevels),
        LOG_DB_LEVELS: optional(logLevels),
        LOG_INGEST_KEY: optional(z.string().min(32, 'LOG_INGEST_KEY must be at least 32 characters.')),

        // Advanced overrides, normally left out of .env: the defaults in config.ts are the
        // recommended setup (documented in docs/how-it-works/platform/logging.md).
        LOG_TRACE_LEVEL: optional(z.coerce.number().int().min(0).max(20)),
        LOG_SQL: booleanString,
        LOG_REQUEST_CONTEXT: booleanString,
        LOG_TO_CONSOLE: booleanString,
        ACCESS_LOG_ENABLED: booleanString,

        LOG_VIEWER_DIRS: optional(logViewerDirs),
        TRANSLATION_DIRS: optional(translationDirs),
    })
    .refine((env) => env.JWT_SECRET !== env.JWT_REFRESH_SECRET, {
        message: 'JWT_REFRESH_SECRET must be different from JWT_SECRET',
        path: ['JWT_REFRESH_SECRET'],
    });

export type Environment = z.infer<typeof environmentSchema>;
