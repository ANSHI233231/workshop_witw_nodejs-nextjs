// The only writer of application output (`no-console` is enforced everywhere else).
//
// Every line:
//   2026-10-01 03:57:12.123Z [ip][userId][requestId][level][category] message
//       in src/modules/x/services/x.service.ts:42        ← up to `traceLevel` frames of our code
//
// Files in logs/ (each rotated at 10 MB, 5 generations kept):
//   error.log, warning.log, info.log, debug.log   one per level
//   app.log                                        every level, in order (one request's whole story)
//   access.log                                     one line per HTTP request
//
// Written only when enabled (LOG_ENABLED) and only for the chosen levels (LOG_LEVELS). The
// [ip][userId][requestId] prefix comes from the request context (AsyncLocalStorage), so any call
// anywhere in a request gets it. Configured by the entry point (`logger.configure(...)`), never
// from process.env directly. Under a pm2 cluster, workers send lines to the primary over IPC.

import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';
import path from 'node:path';
import cluster from 'node:cluster';
import type { Cluster } from 'node:cluster';

import { getRequestContext } from '../context/request-context';

import { redact, redactUrl } from './redact';
import { captureTrace } from './trace';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LoggerOptions = {
    /** Master switch: false = nothing is written anywhere. */
    readonly enabled?: boolean;
    /** The levels that are written, e.g. ['error', 'warn', 'info']. */
    readonly levels?: readonly LogLevel[];
    readonly toConsole?: boolean;
    /** False in scripts/tests: nothing is written under logs/. */
    readonly toFiles?: boolean;
    readonly directory?: string;
    readonly accessLogEnabled?: boolean;
    /** Frames of our code appended to every line. 0 = off. */
    readonly traceLevel?: number;
    /** Log every SQL statement (db.query / db.transaction / db.connection). */
    readonly sqlEnabled?: boolean;
    /** Log a context dump (request, query, body, headers) for every request. */
    readonly requestContextEnabled?: boolean;
    /** The levels handed to the record sink (the database), independent of `levels`. */
    readonly recordLevels?: readonly LogLevel[];
};

export type LogRecordError = { readonly name: string; readonly message: string; readonly stack: string };

export type LogRecordRequest = {
    readonly requestId: string;
    readonly ip: string;
    readonly userId: string | number | null;
    readonly method: string;
    readonly url: string;
    readonly clientApp: number;
    readonly userAgent: string | null;
};

export type LogRecord = {
    readonly level: LogLevel;
    readonly category: string;
    readonly message: string;
    readonly loggedAt: Date;
    readonly context: Readonly<Record<string, unknown>> | null;
    readonly error: LogRecordError | null;
    readonly request: LogRecordRequest | null;
};

export type LogRecordSink = (record: LogRecord) => void;

/**
 * `trace` lets a caller hand in frames it captured earlier with `logger.captureTrace()`: the
 * database layer captures them when a query is CALLED, because by the time the query finishes
 * and is logged, functions that returned its promise without awaiting are gone from the stack.
 */
export type LogOptions = { readonly trace?: readonly string[] };

export type CategoryLogger = {
    error(message: string, meta?: unknown, options?: LogOptions): void;
    warn(message: string, meta?: unknown, options?: LogOptions): void;
    info(message: string, meta?: unknown, options?: LogOptions): void;
    debug(message: string, meta?: unknown, options?: LogOptions): void;
};

type IpcMessage = { readonly type: 'log'; readonly line: string; readonly files: readonly string[] };

/** The label written in the line and the per-level file name. */
const LEVEL_NAME: Record<LogLevel, string> = { error: 'error', warn: 'warning', info: 'info', debug: 'debug' };
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const DEFAULT_CATEGORY = 'app';
const ROOT = process.cwd();
const recordsPaused = new AsyncLocalStorage<boolean>();

class Logger implements CategoryLogger {
    private enabled = true;
    private levels: ReadonlySet<LogLevel> = new Set<LogLevel>(['error', 'warn', 'info']);
    private toConsole = true;
    private toFiles = true;
    private directory = path.join(process.cwd(), 'logs');
    private accessLogEnabled = true;
    private traceLevel = 0;
    private sqlEnabled = false;
    private requestContextEnabled = false;
    private recordLevels: ReadonlySet<LogLevel> = new Set<LogLevel>(['error']);
    private recordSink: LogRecordSink | null = null;

    configure(options: LoggerOptions): void {
        this.enabled = options.enabled ?? this.enabled;
        this.levels = options.levels ? new Set(options.levels) : this.levels;
        this.toConsole = options.toConsole ?? this.toConsole;
        this.toFiles = options.toFiles ?? this.toFiles;
        this.directory = options.directory ?? this.directory;
        this.accessLogEnabled = options.accessLogEnabled ?? this.accessLogEnabled;
        this.traceLevel = options.traceLevel ?? this.traceLevel;
        this.sqlEnabled = options.sqlEnabled ?? this.sqlEnabled;
        this.requestContextEnabled = options.requestContextEnabled ?? this.requestContextEnabled;
        this.recordLevels = options.recordLevels ? new Set(options.recordLevels) : this.recordLevels;
    }

    /** Where records of `recordLevels` go (the database writer). Set once by the entry point. */
    setRecordSink(sink: LogRecordSink | null): void {
        this.recordSink = sink;
    }

    /** Runs `work` with records switched off, so whatever the record writer itself logs stays in the files. */
    withoutRecords<T>(work: () => T): T {
        return recordsPaused.run(true, work);
    }

    isSqlEnabled(): boolean {
        return this.sqlEnabled && this.shouldLog('info');
    }

    /** Frames of our code at this point, to pass later as `{ trace }`. Empty when tracing is off. */
    captureTrace(): string[] {
        return this.enabled ? captureTrace(this.traceLevel) : [];
    }

    isRequestContextEnabled(): boolean {
        return this.enabled && this.requestContextEnabled;
    }

    /** A logger whose lines carry `category`, e.g. logger.category('bookings').info('Created'). */
    category(category: string): CategoryLogger {
        return {
            error: (message, meta, options) => this.log('error', category, message, meta, options),
            warn: (message, meta, options) => this.log('warn', category, message, meta, options),
            info: (message, meta, options) => this.log('info', category, message, meta, options),
            debug: (message, meta, options) => this.log('debug', category, message, meta, options),
        };
    }

    error(message: string, meta?: unknown): void {
        this.log('error', DEFAULT_CATEGORY, message, meta);
    }

    warn(message: string, meta?: unknown): void {
        this.log('warn', DEFAULT_CATEGORY, message, meta);
    }

    info(message: string, meta?: unknown): void {
        this.log('info', DEFAULT_CATEGORY, message, meta);
    }

    debug(message: string, meta?: unknown): void {
        this.log('debug', DEFAULT_CATEGORY, message, meta);
    }

    /** One access line. Goes to access.log only. */
    access(message: string): void {
        if (!this.enabled || !this.accessLogEnabled) return;
        this.deliver('info', this.format('info', 'http.access', message, undefined, false), ['access.log']);
    }

    /** Primary side of the cluster IPC: writes a line a worker sent. */
    handleWorkerLog(message: IpcMessage): void {
        this.writeFiles(message.line, message.files);
    }

    private log(level: LogLevel, category: string, message: string, meta?: unknown, options?: LogOptions): void {
        this.record(level, category, message, meta);
        if (!this.shouldLog(level)) return;
        const line = this.format(level, category, message, meta, true, options?.trace);
        this.deliver(level, line, [`${LEVEL_NAME[level]}.log`, 'app.log']);
    }

    private record(level: LogLevel, category: string, message: string, meta: unknown): void {
        const sink = this.recordSink;
        if (!sink || !this.enabled || !this.recordLevels.has(level) || recordsPaused.getStore()) return;
        try {
            sink(toRecord(level, category, message, meta));
        } catch (error) {
            process.stderr.write(`Failed to hand a log record over: ${String(error)}\n`);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return this.enabled && this.levels.has(level);
    }

    private format(
        level: LogLevel,
        category: string,
        message: string,
        meta: unknown,
        withTrace: boolean,
        givenTrace?: readonly string[],
    ): string {
        const context = getRequestContext();
        const prefix = `[${context?.ip ?? '-'}][${context?.userId ?? '-'}][${context?.requestId ?? '-'}][${LEVEL_NAME[level]}][${category}]`;
        const timestamp = new Date().toISOString().replace('T', ' ');

        const error = errorOf(meta);
        const metaText = error ? formatContext(meta) + formatError(error) : formatMeta(meta);
        // An error already carries its own full stack; anything else gets the trace.
        const frames = withTrace && !error ? (givenTrace ?? captureTrace(this.traceLevel)) : [];
        const trace = frames.map((frame) => `\n    in ${frame}`).join('');

        return `${timestamp} ${prefix} ${message}${metaText}${trace}\n`;
    }

    private deliver(level: LogLevel, line: string, files: readonly string[]): void {
        if (this.toConsole) (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(line);

        if (cluster.isWorker) {
            process.send?.({ type: 'log', line, files } satisfies IpcMessage);
            return;
        }
        this.writeFiles(line, files);
    }

    private writeFiles(line: string, files: readonly string[]): void {
        if (!this.toFiles) return;
        for (const file of files) this.writeToFile(file, line);
    }

    private writeToFile(fileName: string, content: string): void {
        const filePath = path.join(this.directory, fileName);
        try {
            // Created on demand, not only at startup: if logs/ is removed while the process runs,
            // every later write would otherwise fail and the log would silently stop.
            if (!fs.existsSync(this.directory)) fs.mkdirSync(this.directory, { recursive: true });
            rotateIfNeeded(filePath);
            fs.appendFileSync(filePath, content);
        } catch (error) {
            process.stderr.write(`Failed to write log: ${String(error)}\n`);
        }
    }
}

function toRecord(level: LogLevel, category: string, message: string, meta: unknown): LogRecord {
    const context = getRequestContext();
    const error = errorOf(meta);
    return {
        level,
        category,
        message,
        loggedAt: new Date(),
        context: recordContextOf(meta),
        error: error
            ? {
                  name: error.name,
                  message: error.message,
                  stack: formatError(error).replace(/^\n/, '').replace(/^ {4}/gm, ''),
              }
            : null,
        request: context
            ? {
                  requestId: context.requestId,
                  ip: context.ip,
                  userId: context.userId,
                  method: context.method,
                  url: redactUrl(context.url),
                  clientApp: context.clientApp,
                  userAgent: context.userAgent,
              }
            : null,
    };
}

function recordContextOf(meta: unknown): Readonly<Record<string, unknown>> | null {
    if (meta === undefined || meta === null || meta instanceof Error) return null;
    if (typeof meta !== 'object') return { detail: meta };
    const { error: _error, ...rest } = meta as Record<string, unknown>;
    return Object.keys(rest).length > 0 ? (redact(rest) as Record<string, unknown>) : null;
}

function errorOf(meta: unknown): Error | undefined {
    if (meta instanceof Error) return meta;
    if (meta && typeof meta === 'object' && 'error' in meta && meta.error instanceof Error) return meta.error;
    return undefined;
}

/** The non-error fields of a `{ error, ...context }` meta, as JSON. */
function formatContext(meta: unknown): string {
    if (meta instanceof Error || !meta || typeof meta !== 'object') return '';
    const { error: _error, ...rest } = meta as Record<string, unknown>;
    return Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
}

/** Full stack, then every `cause` in the chain (where the bug actually started). */
function formatError(error: Error): string {
    const parts: string[] = [];
    let current: unknown = error;
    for (let depth = 0; current instanceof Error && depth < 5; depth++) {
        const stack = current.stack ?? `${current.name}: ${current.message}`;
        parts.push(`${depth === 0 ? '' : 'Caused by: '}${stack}`);
        current = (current as Error & { cause?: unknown }).cause;
    }
    if (current !== undefined && !(current instanceof Error))
        parts.push(`Caused by: ${JSON.stringify(current) ?? typeof current}`);
    // Paths relative to apps/api, like the trace lines: src/modules/x/…ts:12:5
    return `\n${parts.join('\n').replaceAll(`${ROOT}/`, '').replace(/^/gm, '    ')}`;
}

function formatMeta(meta: unknown): string {
    if (meta === undefined) return '';
    return typeof meta === 'string' ? `\n${meta}` : ` ${JSON.stringify(meta)}`;
}

function rotateIfNeeded(filePath: string): void {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size < MAX_FILE_BYTES) return;

    for (let i = MAX_FILES; i >= 1; i--) {
        const previous = i === 1 ? filePath : `${filePath}.${i - 1}`;
        if (fs.existsSync(previous)) fs.renameSync(previous, `${filePath}.${i}`);
    }
}

export const logger = new Logger();

/** Call once in the cluster primary so worker log lines reach the files. */
export function initClusterLogWriter(clusterModule: Cluster): void {
    if (!clusterModule.isPrimary) return;

    clusterModule.on('message', (_worker, message: Partial<IpcMessage> | undefined) => {
        if (message?.type !== 'log' || typeof message.line !== 'string' || !Array.isArray(message.files)) return;
        logger.handleWorkerLog({ type: 'log', line: message.line, files: message.files });
    });
}
