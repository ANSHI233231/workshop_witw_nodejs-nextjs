import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type { ResultSetHeader, RowDataPacket };

/**
 * What every repository method takes as its FIRST argument: the injected `Database`. Inside a
 * `db.transaction(...)` it transparently runs on the transaction's connection.
 */
export interface DbExecutor {
    /** SELECT: resolves to the row array. */
    query<T extends RowDataPacket>(sql: string, params?: readonly unknown[]): Promise<T[]>;
    /** INSERT / UPDATE / DELETE: resolves to the result header (`insertId`, `affectedRows`). */
    execute(sql: string, params?: readonly unknown[]): Promise<ResultSetHeader>;
}

export type DatabaseConfig = {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly password: string;
    readonly database: string;
    readonly connectionLimit: number;
};

/** The pool-backed executor, created once per process by an entry point and injected inward. */
export interface Database extends DbExecutor {
    /**
     * Runs `work` in one SQL transaction: COMMIT when it resolves, ROLLBACK when it throws. Every
     * query made on this Database while `work` runs, from any module, joins the transaction.
     * Called while a transaction is already active, it joins that one instead of opening another.
     */
    transaction<T>(work: () => Promise<T>): Promise<T>;
    /** True while the current async call chain is inside `transaction()`. */
    isInTransaction(): boolean;
    ping(): Promise<void>;
    close(): Promise<void>;
}
