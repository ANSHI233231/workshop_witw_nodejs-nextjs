import 'server-only';

import { type ErrorLogEntry, sendErrorLogs } from '@/services/log-forward.service';

import { serverConfig } from '../../server-config';
import { redact } from '../redact';

import { mapErrorStack } from './stack';

const FLUSH_EVERY_MS = 1000;
const BATCH_ENTRIES = 50;
const BATCH_CHARS = 80_000;
const BUFFER_ENTRIES = 500;
const LIMITS = {
    category: 100,
    message: 4000,
    errorName: 150,
    errorMessage: 4000,
    stack: 16_000,
    context: 8000,
    id: 64,
    ip: 45,
    method: 10,
    url: 500,
    userAgent: 255,
};

export type ForwardedRecord = {
    readonly category: string;
    readonly message: string;
    readonly time?: string;
    readonly context?: Record<string, unknown>;
    readonly errorStack?: string;
    readonly ip?: string;
    readonly userId?: string | number | null;
    readonly id?: string;
    readonly request?: { readonly method?: string; readonly url?: string; readonly userAgent?: string };
};

type Forwarder = { buffer: ErrorLogEntry[]; dropped: number; sending: boolean; started: boolean };

declare global {
    var __appErrorForwarder: Forwarder | undefined;
}

const state: Forwarder = (globalThis.__appErrorForwarder ??= {
    buffer: [],
    dropped: 0,
    sending: false,
    started: false,
});

const cut = (text: string | undefined, max: number): string | undefined =>
    text === undefined ? undefined : text.length > max ? text.slice(0, max) : text;

const contextOf = (context: Record<string, unknown> | undefined): Record<string, unknown> | undefined => {
    if (!context || Object.keys(context).length === 0) return undefined;
    const safe = redact(context) as Record<string, unknown>;
    const json = JSON.stringify(safe);
    return json.length > LIMITS.context ? { truncated: json.slice(0, LIMITS.context) } : safe;
};

const firstLine = (stack: string): { name?: string; message?: string } => {
    const line = stack.split('\n')[0] ?? '';
    const colon = line.indexOf(':');
    return colon > 0 ? { name: line.slice(0, colon), message: line.slice(colon + 1).trim() } : {};
};

const userIdOf = (value: string | number | null | undefined): number | undefined => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
};

const toEntry = (record: ForwardedRecord): ErrorLogEntry => {
    const stack = record.errorStack ? mapErrorStack(record.errorStack) : undefined;
    const head = stack ? firstLine(stack) : {};
    return {
        level: 'error',
        category: cut(record.category, LIMITS.category) || 'app',
        message: cut(record.message, LIMITS.message) || '(no message)',
        loggedAt: record.time ?? new Date().toISOString(),
        errorName: cut(head.name, LIMITS.errorName),
        errorMessage: cut(head.message, LIMITS.errorMessage),
        errorStack: cut(stack, LIMITS.stack),
        context: contextOf(record.context),
        requestId: cut(record.id, LIMITS.id),
        ipAddress: cut(record.ip, LIMITS.ip),
        userId: userIdOf(record.userId),
        httpMethod: cut(record.request?.method, LIMITS.method),
        requestUrl: cut(record.request?.url, LIMITS.url),
        userAgent: cut(record.request?.userAgent, LIMITS.userAgent),
    };
};

const takeBatch = (): ErrorLogEntry[] => {
    const batch: ErrorLogEntry[] = [];
    let chars = 0;
    for (const entry of state.buffer) {
        const size = JSON.stringify(entry).length;
        if (batch.length >= BATCH_ENTRIES || (batch.length > 0 && chars + size > BATCH_CHARS)) break;
        batch.push(entry);
        chars += size;
    }
    return batch;
};

async function flush(onFailure: (message: string) => void): Promise<void> {
    const key = serverConfig.log.ingestKey;
    if (state.sending || !key || state.buffer.length === 0) return;
    state.sending = true;
    try {
        if (state.dropped > 0) {
            onFailure(`${state.dropped} error log entries were dropped before reaching the API (buffer full).`);
            state.dropped = 0;
        }
        while (state.buffer.length > 0) {
            const batch = takeBatch();
            state.buffer.splice(0, batch.length);
            await sendErrorLogs(batch, key);
        }
    } catch (error) {
        onFailure(
            `Error log entries could not be sent to the API: ${error instanceof Error ? error.message : String(error)}`,
        );
    } finally {
        state.sending = false;
    }
}

export function forwardError(record: ForwardedRecord): void {
    if (!serverConfig.log.enabled || !serverConfig.log.ingestKey) return;
    state.buffer.push(toEntry(record));
    const overflow = state.buffer.length - BUFFER_ENTRIES;
    if (overflow > 0) {
        state.buffer.splice(0, overflow);
        state.dropped += overflow;
    }
}

export function startErrorForwarding(onFailure: (message: string) => void): void {
    if (state.started || !serverConfig.log.enabled || !serverConfig.log.ingestKey) return;
    state.started = true;
    setInterval(() => void flush(onFailure), FLUSH_EVERY_MS).unref();
}
