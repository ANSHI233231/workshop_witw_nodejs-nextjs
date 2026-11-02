// Server-only settings (never NEXT_PUBLIC_: these stay on the server). With src/lib/config.ts, the
// only readers of process.env in this app.

import 'server-only';

import { z } from 'zod';

import type { LogLevel } from './logger/types';

const LEVEL_NAMES: Record<string, LogLevel> = { error: 'error', warning: 'warn', warn: 'warn', info: 'info', debug: 'debug' };

const empty = (value: unknown) => (value === '' ? undefined : value);

const schema = z.object({
    // true = save logs to this app's logs/ folder. false or empty = save nothing.
    LOG_ENABLED: z.preprocess(empty, z.enum(['true', 'false']).optional()).transform((value) => value === 'true'),
    // Comma-separated: error, warning, info, debug. Empty = error,warning,info.
    LOG_LEVELS: z.preprocess(
        empty,
        z
            .string()
            .optional()
            .transform((value, context) => {
                if (value === undefined) return ['error', 'warn', 'info'] as LogLevel[];
                const names = value.split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
                const unknown = names.filter((name) => !(name in LEVEL_NAMES));
                if (unknown.length > 0 || names.length === 0) {
                    context.addIssue({ code: z.ZodIssueCode.custom, message: `Use a comma-separated list of: error, warning, info, debug (got "${value}")` });
                    return z.NEVER;
                }
                return [...new Set(names.map((name) => LEVEL_NAMES[name]!))];
            }),
    ),
    LOG_INGEST_KEY: z.preprocess(empty, z.string().min(32, 'LOG_INGEST_KEY must be at least 32 characters.').optional()),
    NODE_ENV: z.string().optional(),
});

const parsed = schema.safeParse({
    LOG_ENABLED: process.env.LOG_ENABLED,
    LOG_LEVELS: process.env.LOG_LEVELS,
    LOG_INGEST_KEY: process.env.LOG_INGEST_KEY,
    NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}\nSee .env.example for the full variable list.`);
}

export const serverConfig = Object.freeze({
    log: Object.freeze({
        enabled: parsed.data.LOG_ENABLED,
        levels: Object.freeze(parsed.data.LOG_LEVELS),
        /** Our own logger calls are also printed to the terminal (pm2 logs) outside production. */
        printToTerminal: parsed.data.NODE_ENV !== 'production',
        ingestKey: parsed.data.LOG_INGEST_KEY ?? null,
    }),
});
