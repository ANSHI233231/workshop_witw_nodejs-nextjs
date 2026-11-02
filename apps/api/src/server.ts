// The HTTP entry point, and with the CLI the only place `config/` is imported. It configures the
// logger, creates the one database pool, builds the app and listens. No business logic here.

import 'dotenv/config';

import { type ChildProcess, fork } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

import { config } from './config';
import { createApp } from './app';
import { logger } from './core/logger';
import { createConnectionPool } from './database/connection';
import { createEmailSender } from './infrastructure/email';
import { createCommandRunner } from './infrastructure/process';
import { createFileStorage } from './infrastructure/storage';

logger.configure(config.log);

// Process-level failures must reach logs/error.log, not only the process manager's stdout.
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
});
process.on('uncaughtException', (error) => {
    // Process state is no longer trustworthy after an uncaught throw: exit non-zero and let the
    // process manager restart cleanly. The logger writes synchronously, so the line is on disk.
    logger.error('Uncaught exception - process will exit', error);
    process.exit(1);
});

const db = createConnectionPool(config.db);

db.ping()
    .then(() => logger.info('Database connected'))
    .catch((error: unknown) => logger.error('Database connection failed', error));

// `npm run dev -- -p 8030` / `--port=8030` overrides PORT for this process, so a process manager
// (pm2) can place the port at launch. A malformed value aborts instead of silently binding PORT.
const portFromArgv = (argv: readonly string[]): number | null => {
    const index = argv.findIndex((argument) => argument === '-p' || argument === '--port');
    const raw = index !== -1 ? argv[index + 1] : argv.find((argument) => argument.startsWith('--port='))?.slice(7);
    if (raw === undefined) return null;

    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        logger.error(`Invalid port on the command line: ${raw}`);
        process.exit(1);
    }
    return port;
};

const port = portFromArgv(process.argv.slice(2)) ?? config.port;

const emailSender = createEmailSender({ driver: config.mail.driver });
const fileStorage = createFileStorage(config.storage);
const fromSource = __filename.endsWith('.ts');
const apiRoot = path.resolve(__dirname, '..');
const commandRunner = createCommandRunner({ apiRoot, fromSource, environment: config.childProcessEnvironment });

const app = createApp({
    corsOrigins: config.corsOrigins,
    trustProxy: config.trustProxy,
    routes: {
        db,
        auth: config.auth,
        emailSender,
        fileStorage,
        commandRunner,
        mailFrom: config.mail.from,
        appUrls: config.appUrls,
        logDirectories: config.logViewerDirs,
        translationDirectories: config.translationDirs,
        logIngestKey: config.logIngestKey,
    },
});

/** What the server actually bound to, e.g. `0.0.0.0:8030 (all interfaces)` or `127.0.0.1:8030`. */
const describeAddress = (address: AddressInfo | string | null): string => {
    if (address === null) return `port ${port}`;
    if (typeof address === 'string') return address;
    const host = address.family === 'IPv6' ? `[${address.address}]` : address.address;
    const allInterfaces = address.address === '::' || address.address === '0.0.0.0';
    return `${host}:${address.port}${allInterfaces ? ' (all interfaces)' : ''}`;
};

const onListening = (): void => {
    logger.info(`API server listening on ${describeAddress(server.address())} (${config.nodeEnv})`);
};

const server = config.host === undefined ? app.listen(port, onListening) : app.listen(port, config.host, onListening);

const WORKER_RESTART_MS = 5_000;

let worker: ChildProcess | null = null;
let shuttingDown = false;

const startWorker = (): void => {
    const child = fork(path.join(__dirname, fromSource ? 'worker.ts' : 'worker.js'), [], {
        execArgv: fromSource ? ['-r', 'ts-node/register/transpile-only'] : ['--enable-source-maps'],
    });
    child.once('exit', (code, signal) => {
        worker = null;
        if (shuttingDown) return;
        logger.error('Background jobs worker stopped; starting it again', { code, signal });
        setTimeout(startWorker, WORKER_RESTART_MS).unref();
    });
    worker = child;
};

if (config.worker.enabled) startWorker();

// Stop accepting connections, let in-flight requests finish, then close the pool.
const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down`);
    shuttingDown = true;
    worker?.kill('SIGTERM');
    server.close(() => {
        db.close()
            .catch((error: unknown) => logger.error('Error closing the database pool', error))
            .finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
