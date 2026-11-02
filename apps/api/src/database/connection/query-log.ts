// SQL logging: every statement at info / db.query, with values bound in, duration and
// row count; the line's trace points at the repository that ran it. Enabled by LOG_SQL.

import mysql from 'mysql2/promise';

import { logger } from '../../core/logger';

const queryLog = logger.category('db.query');

const rowCount = (result: unknown): string => {
    if (Array.isArray(result)) return `${result.length} row${result.length === 1 ? '' : 's'}`;
    const header = result as { affectedRows?: number; insertId?: number };
    if (typeof header?.affectedRows === 'number') {
        return `${header.affectedRows} affected${header.insertId ? `, insertId ${header.insertId}` : ''}`;
    }
    return 'ok';
};

/**
 * Runs `run`, then logs the statement (or its failure) when SQL logging is on.
 *
 * The trace must be captured when the query is CALLED, while the caller's whole chain
 * (repository → service → controller) is still on the stack: after an await, only functions that
 * themselves awaited remain. Callers that await before reaching here pass the trace they captured.
 */
export async function timedQuery<T>(
    sql: string,
    params: readonly unknown[],
    run: () => Promise<T>,
    capturedTrace?: readonly string[],
): Promise<T> {
    if (!logger.isSqlEnabled()) return run();

    const trace = capturedTrace ?? logger.captureTrace();
    const start = process.hrtime.bigint();
    const statement = mysql.format(sql.trim(), [...params] as Parameters<typeof mysql.format>[1]);
    try {
        const result = await run();
        const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(1);
        queryLog.info(`${statement} (${ms} ms, ${rowCount(result)})`, undefined, { trace });
        return result;
    } catch (error) {
        const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(1);
        queryLog.error(`${statement} (failed after ${ms} ms: ${error instanceof Error ? error.message : String(error)})`, undefined, { trace });
        throw error;
    }
}
