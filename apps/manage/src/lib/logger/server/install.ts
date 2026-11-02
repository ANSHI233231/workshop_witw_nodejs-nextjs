// Server side, called once from src/instrumentation.ts (Node.js runtime): installs the file
// writer as the logger's sink and captures server console.* into the same files.

import 'server-only';

import { serverConfig } from '../../server-config';
import { fromConsoleArgs, fromMeta } from '../serialize';
import type { LogLevel, SinkEntry } from '../types';

import { startErrorForwarding } from './db-forwarder';
import { writeRecord } from './file-writer';
import { wasReportedAsRequestError } from './request-error';

// Next.js prints a request error with console.error (`⨯ Error: …`) a moment BEFORE it calls
// onRequestError, which reports the same error with the route and request id. A captured
// console.error carrying an Error waits this long; if onRequestError reported it, it's dropped.
const REQUEST_ERROR_WAIT_MS = 200;

const CONSOLE_LEVEL: Record<'log' | 'info' | 'warn' | 'error' | 'debug', LogLevel> = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
};

let writing = false;

function sink(entry: SinkEntry): void {
    if (writing) return; // never log our own logging
    writing = true;
    try {
        const { message, context, error } = fromMeta(entry.message, entry.meta);
        const line = writeRecord({
            level: entry.level,
            category: entry.category,
            message,
            context,
            errorStack: error?.stack,
            callStack: entry.callStack,
            time: entry.time,
        });
        if (line && !entry.alreadyPrinted && serverConfig.log.printToTerminal) {
            const out = globalThis.__appOriginalConsole ?? console;
            out[entry.level === 'warn' ? 'warn' : entry.level](line.trimEnd());
        }
    } finally {
        writing = false;
    }
}

export function installServerLogging(): void {
    if (globalThis.__appLogSink) return;

    const original = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
    };
    globalThis.__appOriginalConsole = original;
    globalThis.__appLogSink = sink;
    startErrorForwarding((message) => writeRecord({ level: 'warn', category: 'log.forward', message }));

    for (const method of Object.keys(CONSOLE_LEVEL) as (keyof typeof CONSOLE_LEVEL)[]) {
        console[method] = (...args: unknown[]) => {
            original[method](...args);
            if (writing) return;
            const { message, error } = fromConsoleArgs(args);
            if (message === '') return; // Next.js prints blank spacer lines
            // `next dev` forwards browser console output to the terminal as `[browser] …`; it
            // already reaches the logs from the browser itself, with the page and tab id.
            if (message.startsWith('[browser] ')) return;
            const capture = () =>
                sink({
                    level: CONSOLE_LEVEL[method],
                    category: 'server.console',
                    message,
                    meta: error ? Object.assign(new Error(error.message), { stack: error.stack }) : undefined,
                    callStack,
                    alreadyPrinted: true,
                    time,
                });
            const callStack = new Error().stack;
            const time = new Date().toISOString();
            const thrown = args.find((arg): arg is Error => arg instanceof Error);
            if (thrown) {
                setTimeout(() => {
                    if (!wasReportedAsRequestError(thrown)) capture();
                }, REQUEST_ERROR_WAIT_MS);
            } else {
                capture();
            }
        };
    }
}
