export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const LOG_LEVELS: readonly LogLevel[] = ['error', 'warn', 'info', 'debug'];

/** The label written in a line, and the per-level file name. */
export const LEVEL_NAME: Record<LogLevel, string> = { error: 'error', warn: 'warning', info: 'info', debug: 'debug' };

/**
 * Where log calls go. Installed once per runtime on `globalThis`, because Next.js bundles
 * instrumentation, server components and client components separately: a module-level variable
 * would not be shared between them.
 *   - server: the file writer (src/lib/logger/server/install.ts, from src/instrumentation.ts)
 *   - browser: the queue that sends to /client-logs (src/lib/logger/browser/start.ts)
 */
export type LogSink = (entry: SinkEntry) => void;

export type SinkEntry = {
    readonly level: LogLevel;
    readonly category: string;
    readonly message: string;
    /** Context object, or an Error, or `{ error, ...context }`. */
    readonly meta?: unknown;
    /** `new Error().stack` captured at the call site: turned into the `in src/…:line` trace. */
    readonly callStack?: string;
    /** True when the original console has already printed it (console capture). */
    readonly alreadyPrinted?: boolean;
    /** When it happened, if logged later than that (ISO). */
    readonly time?: string;
};

/** One browser entry as POSTed to /client-logs. */
export type ClientLogEntry = {
    readonly id: string;
    readonly time: string;
    readonly level: LogLevel;
    readonly category: string;
    readonly message: string;
    readonly context?: Record<string, unknown>;
    /** Stack of the logged error (errors only). */
    readonly errorStack?: string;
    /** Stack at the call site (non-error lines): becomes the trace. */
    readonly callStack?: string;
    readonly page: string;
    readonly sessionId: string;
};

declare global {
    var __appLogSink: LogSink | undefined;
    var __appOriginalConsole: Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'> | undefined;
}
