#!/usr/bin/env node

// The CLI entry point. Like server.ts it is allowed to import `config/`, and it configures the
// logger before any command runs.

import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { config } from '../config';
import { BASE_LANGUAGE, ClientApp, runWithRequestContext } from '../core/context';
import { logger } from '../core/logger';
import { createConnectionPool } from '../database/connection';

import { Application } from './lib/Application';

// Logs (including SQL) go to logs/ only: the terminal shows just the command's own output.
// No access log or request dumps: there are no HTTP requests.
logger.configure({ ...config.log, toConsole: false, accessLogEnabled: false, requestContextEnabled: false });

// The pool is created only when a command first uses `this.db`, so a command that never touches
// the database never opens a connection.
const app = new Application(() => createConnectionPool(config.db));

runWithRequestContext(
    {
        requestId: randomUUID(),
        ip: '-',
        method: 'CLI',
        url: process.argv.slice(2).join(' '),
        clientApp: ClientApp.CLI,
        userAgent: null,
        language: BASE_LANGUAGE,
        userId: null,
    },
    () => app.run(),
)
    .then(() => app.close())
    .then(() => process.exit())
    .catch((error: unknown) => {
        logger.error('CLI command failed', error);
        process.stderr.write(`CLI command failed: ${error instanceof Error ? error.message : String(error)} (details in logs/error.log)\n`);
        process.exit(1);
    });
