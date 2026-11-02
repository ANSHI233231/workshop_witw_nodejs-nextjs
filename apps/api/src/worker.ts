import 'dotenv/config';

import path from 'node:path';

import { config } from './config';
import { logger } from './core/logger';
import { createConnectionPool } from './database/connection';
import { createCommandRunner } from './infrastructure/process';
import { createJobsWorker } from './routes/jobs-worker';

const STALE_SECONDS = 120;

logger.configure({ ...config.log, toConsole: false, accessLogEnabled: false, requestContextEnabled: false });

const db = createConnectionPool(config.db);
const commandRunner = createCommandRunner({
    apiRoot: path.resolve(__dirname, '..'),
    fromSource: __filename.endsWith('.ts'),
    environment: config.childProcessEnvironment,
});
const worker = createJobsWorker(db, commandRunner, {
    pollSeconds: config.worker.pollSeconds,
    maxParallel: config.worker.maxParallel,
    staleSeconds: Math.max(STALE_SECONDS, config.worker.pollSeconds * 6),
});

let stopping = false;

const stop = (reason: string): void => {
    if (stopping) return;
    stopping = true;
    logger.info(`Worker stopping: ${reason}`);
    worker
        .stop()
        .then(() => db.close())
        .catch((error: unknown) => logger.error('Worker did not stop cleanly', error))
        .finally(() => process.exit(0));
    setTimeout(() => process.exit(1), 15_000).unref();
};

process.on('SIGTERM', () => stop('SIGTERM'));
process.on('SIGINT', () => stop('SIGINT'));
process.on('disconnect', () => stop('the API stopped'));
process.on('unhandledRejection', (reason) => logger.error('Worker: unhandled promise rejection', reason));

worker.start();
