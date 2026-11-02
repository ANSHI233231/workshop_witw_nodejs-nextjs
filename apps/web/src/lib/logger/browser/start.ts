// Browser side, started from src/instrumentation-client.ts before React hydrates: installs the
// logger's sink, captures every console.* call, uncaught errors and unhandled promise rejections,
// and queues them for this app's own /client-logs.

import { fromConsoleArgs, fromMeta } from '../serialize';
import type { ClientLogEntry, LogLevel, SinkEntry } from '../types';

import { enqueue, startQueue } from './queue';

const CONSOLE_LEVEL: Record<'log' | 'info' | 'warn' | 'error' | 'debug', LogLevel> = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
};
const MAX_STACK = 16_000;
const SESSION_KEY = 'app-log-session';

let capturing = false;

// crypto.randomUUID exists only on HTTPS / localhost; local dev hostnames are plain HTTP.
const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/** One id per browser tab: every entry from this tab shares it, so a session can be followed. */
function sessionId(): string {
    try {
        let id = window.sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = `tab-${newId()}`;
            window.sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return 'tab-unknown';
    }
}

function toEntry(level: LogLevel, category: string, message: string, context: Record<string, unknown> | undefined, errorStack: string | undefined, callStack: string | undefined): ClientLogEntry {
    return {
        id: newId(),
        time: new Date().toISOString(),
        level,
        category,
        message,
        ...(context ? { context } : {}),
        ...(errorStack ? { errorStack: errorStack.slice(0, MAX_STACK) } : {}),
        ...(!errorStack && callStack ? { callStack: callStack.slice(0, MAX_STACK) } : {}),
        page: window.location.pathname + window.location.search,
        sessionId: sessionId(),
    };
}

function sink(entry: SinkEntry): void {
    if (capturing) return;
    capturing = true;
    try {
        const { message, context, error } = fromMeta(entry.message, entry.meta);
        enqueue(toEntry(entry.level, entry.category, message, context, error?.stack, entry.callStack));
    } finally {
        capturing = false;
    }
}

export function startBrowserLogging(): void {
    if (typeof window === 'undefined' || globalThis.__appLogSink) return;

    const original = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
    };
    globalThis.__appOriginalConsole = original;
    globalThis.__appLogSink = sink;

    for (const method of Object.keys(CONSOLE_LEVEL) as (keyof typeof CONSOLE_LEVEL)[]) {
        console[method] = (...args: unknown[]) => {
            original[method](...args);
            if (capturing) return;
            capturing = true;
            try {
                const { message, error } = fromConsoleArgs(args);
                if (message === '') return;
                enqueue(toEntry(CONSOLE_LEVEL[method], 'browser.console', message, undefined, error?.stack, new Error().stack));
            } finally {
                capturing = false;
            }
        };
    }

    window.addEventListener('error', (event) => {
        const error = event.error instanceof Error ? event.error : null;
        sink({
            level: 'error',
            category: 'browser.error',
            message: error ? `Uncaught ${error.name}: ${error.message}` : `Uncaught error: ${event.message}`,
            meta: error ?? { source: event.filename, line: event.lineno, column: event.colno },
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason: unknown = event.reason;
        sink({
            level: 'error',
            category: 'browser.error',
            message: `Unhandled promise rejection: ${reason instanceof Error ? reason.message : String(reason)}`,
            meta: reason instanceof Error ? reason : { reason },
        });
    });

    startQueue();
}

export function logNavigation(url: string, navigationType: string): void {
    sink({ level: 'debug', category: 'browser.navigation', message: `${navigationType} ${url}` });
}
