import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import type { DbExecutor } from '../connection/types';
import { timedQuery } from '../connection/query-log';
import { logger } from '../../core/logger';

const transactionLog = logger.category('db.transaction');

const executorFor = (connection: PoolConnection): DbExecutor => ({
    query: async <T extends RowDataPacket>(sql: string, params: readonly unknown[] = []) =>
        timedQuery(sql, params, async () => {
            const [rows] = await connection.query(sql, [...params]);
            return rows as T[];
        }),
    execute: async (sql, params = []) =>
        timedQuery(sql, params, async () => {
            const [result] = await connection.query<ResultSetHeader>(sql, [...params]);
            return result;
        }),
});

/**
 * The only place BEGIN / COMMIT / ROLLBACK are issued. Services never call this directly: they use
 * `db.transaction(...)`, which makes the executor below ambient for the whole call chain.
 */
export const withTransaction = async <T>(pool: Pool, work: (tx: DbExecutor) => Promise<T>): Promise<T> => {
    // Who opened the transaction, captured before the first await (see query-log.ts).
    const trace = logger.isSqlEnabled() ? logger.captureTrace() : [];
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        if (logger.isSqlEnabled()) transactionLog.info('BEGIN', undefined, { trace });
        const result = await work(executorFor(connection));
        await connection.commit();
        if (logger.isSqlEnabled()) transactionLog.info('COMMIT', undefined, { trace });
        return result;
    } catch (error) {
        // The original error is the one worth reporting; a failed rollback must not replace it.
        await connection.rollback().catch(() => undefined);
        if (logger.isSqlEnabled()) transactionLog.info(`ROLLBACK (${error instanceof Error ? error.message : String(error)})`, undefined, { trace });
        throw error;
    } finally {
        connection.release();
    }
};
