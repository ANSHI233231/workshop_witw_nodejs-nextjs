// The app's logger: the same import works in server code and in the browser.
//
//   import { logger } from '@/lib/logger';
//   const log = logger.category('bookings');
//   log.info('Booking created', { bookingId });
//   log.error('Payment failed', { error, bookingId });
//
// Server: written to this app's logs/ folder. Browser: queued and sent to this app's own
// /client-logs (never to the API), kept in localStorage until delivered.
// Plain console.* calls are captured too (see instrumentation*.ts).

import type { LogLevel } from './types';

export type CategoryLogger = {
    error(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    debug(message: string, meta?: unknown): void;
};

function write(level: LogLevel, category: string, message: string, meta?: unknown): void {
    // Captured here, at the call site, so the trace points at the code that logged.
    const callStack = new Error().stack;
    const sink = globalThis.__appLogSink;
    if (sink) {
        sink({ level, category, message, meta, callStack });
        return;
    }
    // Not installed (e.g. edge runtime, or before instrumentation ran): print only.
    const out = globalThis.__appOriginalConsole ?? console;
    out[level === 'warn' ? 'warn' : level](`[${category}] ${message}`, meta ?? '');
}

const forCategory = (category: string): CategoryLogger => ({
    error: (message, meta) => write('error', category, message, meta),
    warn: (message, meta) => write('warn', category, message, meta),
    info: (message, meta) => write('info', category, message, meta),
    debug: (message, meta) => write('debug', category, message, meta),
});

export const logger: CategoryLogger & { category(category: string): CategoryLogger } = {
    ...forCategory('app'),
    category: forCategory,
};
