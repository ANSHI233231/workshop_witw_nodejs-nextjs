import { AsyncLocalStorage } from 'node:async_hooks';

import type { PoolConnection as CallbackPoolConnection, QueryError } from 'mysql2';
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';

import { logger } from '../../core/logger';
import { withTransaction } from '../transactions/with-transaction';

import { timedQuery } from './query-log';

import type { Database, DatabaseConfig, DbExecutor } from './types';

const RETRIES = 2;

const CONNECTION_ERROR_CODES = new Set([
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET',
    'EADDRNOTAVAIL',
    'ETIMEDOUT',
    'ENOTFOUND',
]);

const isConnectionError = (error: unknown): boolean => {
    const { code, message } = (error ?? {}) as { code?: string; message?: string };
    return (
        (code !== undefined && CONNECTION_ERROR_CODES.has(code)) ||
        !!message?.includes('read EADDRNOTAVAIL') ||
        !!message?.includes('Connection lost')
    );
};

const createPool = (config: DatabaseConfig): Pool => {
    const pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        // Every timestamp is DATETIME in UTC (AGENTS.md "Database conventions"). `timezone: "Z"`
        // makes mysql2 read/write JS Dates as UTC; the session time_zone below makes MySQL's own
        // CURRENT_TIMESTAMP / NOW() UTC too. Both are needed.
        timezone: 'Z',
    });
    // mysql2 hands this listener its CALLBACK-style connection even on a promise pool (its promise
    // typings say otherwise). Calling .then/.catch on that query throws inside the pool and stalls
    // every getConnection(), so the callback form is required here.
    pool.on('connection', (connection) => {
        if (logger.isSqlEnabled()) {
            logger
                .category('db.connection')
                .info(`Opening DB connection: mysql:host=${config.host};port=${config.port};dbname=${config.database}`);
        }
        (connection as unknown as CallbackPoolConnection).query("SET time_zone = '+00:00'", (error: QueryError | null) => {
            if (error) logger.error('Failed to set the session time zone to UTC', error);
        });
    });
    return pool;
};

/**
 * Opens the process's one connection pool to an EXISTING database (the one named in `DB_NAME`).
 * It never creates a database or a table: the database is provisioned outside the app, and the
 * schema is applied by hand from `src/database/schema.sql` + `migrations/`.
 *
 * Uses the text protocol (`.query()`), not prepared statements
 * (`.execute()`): many unique SQL strings would exhaust MySQL's max_prepared_stmt_count, and
 * prepared statements don't reliably support parameterized LIMIT/OFFSET.
 *
 * A pool-level call that fails on a lost connection is retried with backoff after the pool is
 * rebuilt. Calls inside a transaction are never retried: a half-applied transaction must fail.
 *
 * AMBIENT SQL TRANSACTIONS (docs/how-it-works/platform/sql-transactions.md): `transaction(work)`
 * stores the transaction's connection in AsyncLocalStorage for everything `work` awaits. Every
 * `query`/`execute` on this object checks it first, so any repository in any module called inside
 * `work` joins the transaction without being passed anything. A `transaction()` opened while one is
 * already active joins the outer one: there is exactly one BEGIN and one COMMIT/ROLLBACK.
 */
export const createConnectionPool = (config: DatabaseConfig): Database => {
    let pool = createPool(config);
    const activeTransaction = new AsyncLocalStorage<DbExecutor>();
    let reconnecting: Promise<void> | null = null;

    const reconnect = (): Promise<void> => {
        reconnecting ??= (async () => {
            logger.warn('Attempting to reconnect to the database...');
            const stale = pool;
            pool = createPool(config);
            await stale.end().catch(() => undefined);
        })().finally(() => {
            reconnecting = null;
        });
        return reconnecting;
    };

    const run = async <T>(sql: string, params: readonly unknown[], label: string): Promise<T> => {
        // Captured before the first await below (waiting for a free connection), while the
        // caller's whole chain is still on the stack. See query-log.ts.
        const trace = logger.isSqlEnabled() ? logger.captureTrace() : undefined;
        for (let attempt = 0; ; attempt++) {
            let connection: PoolConnection | null = null;
            try {
                const active = await pool.getConnection();
                connection = active;
                return await timedQuery(
                    sql,
                    params,
                    async () => {
                        const [result] = await active.query(sql, [...params]);
                        return result as T;
                    },
                    trace,
                );
            } catch (error) {
                if (isConnectionError(error) && attempt < RETRIES) {
                    logger.warn(`Database ${label} failed (attempt ${attempt + 1}/${RETRIES + 1}), retrying...`, {
                        error: error instanceof Error ? error.message : String(error),
                    });
                    await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 5000)));
                    await reconnect().catch((reconnectError: unknown) => {
                        logger.error(`Failed to reconnect during ${label} retry`, reconnectError);
                    });
                    continue;
                }
                throw error;
            } finally {
                connection?.release();
            }
        }
    };

    return {
        query: <T extends RowDataPacket>(sql: string, params: readonly unknown[] = []) => {
            const tx = activeTransaction.getStore();
            return tx ? tx.query<T>(sql, params) : run<T[]>(sql, params, 'query');
        },
        execute: (sql, params = []) => {
            const tx = activeTransaction.getStore();
            return tx ? tx.execute(sql, params) : run<ResultSetHeader>(sql, params, 'execute');
        },
        transaction: <T>(work: () => Promise<T>): Promise<T> => {
            if (activeTransaction.getStore()) return work();
            return withTransaction(pool, (tx) => activeTransaction.run(tx, work));
        },
        isInTransaction: () => activeTransaction.getStore() !== undefined,
        ping: async () => {
            await run<RowDataPacket[]>('SELECT 1', [], 'ping');
        },
        close: () => pool.end(),
    };
};
