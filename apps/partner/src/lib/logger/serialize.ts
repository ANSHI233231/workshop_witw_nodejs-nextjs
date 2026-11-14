// Turns console arguments / log meta into a message, a context object and an error. Runs in the
// browser and on the server.

import { redact } from './redact';

const MAX_MESSAGE = 4000;

export type Serialized = {
    readonly message: string;
    readonly context?: Record<string, unknown>;
    readonly error?: { readonly message: string; readonly stack?: string };
};

const describe = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    try {
        // Objects are redacted BEFORE they become text: once inside a message string, a password
        // can no longer be recognised by its key. This also keeps it out of the browser's queue.
        return JSON.stringify(redact(value)) ?? String(value);
    } catch {
        return Object.prototype.toString.call(value);
    }
};

const errorOf = (value: unknown): Error | undefined => {
    if (value instanceof Error) return value;
    if (value && typeof value === 'object' && 'error' in value && value.error instanceof Error) return value.error;
    return undefined;
};

/** Full stack plus every `cause` in the chain. */
export function errorStack(error: Error): string {
    const parts: string[] = [];
    let current: unknown = error;
    for (let depth = 0; current instanceof Error && depth < 5; depth++) {
        parts.push(`${depth === 0 ? '' : 'Caused by: '}${current.stack ?? `${current.name}: ${current.message}`}`);
        current = (current as Error & { cause?: unknown }).cause;
    }
    return parts.join('\n');
}

/**
 * Applies console format codes like the browser does: %s %d %i %f %o %O take the next argument,
 * %c (CSS) consumes one and prints nothing, %% is a literal %.
 */
function applyFormat(args: readonly unknown[]): unknown[] {
    const [first, ...rest] = args;
    if (typeof first !== 'string' || !first.includes('%')) return [...args];
    let index = 0;
    const text = first.replace(/%([sdifoOc%])/g, (match, code: string) => {
        if (code === '%') return '%';
        if (index >= rest.length) return match;
        const value = rest[index++];
        if (code === 'c') return '';
        if (code === 'd' || code === 'i') return String(Math.trunc(Number(value)));
        if (code === 'f') return String(Number(value));
        return describe(value);
    });
    return [text, ...rest.slice(index)];
}

/** console.log('a', obj, err) → message 'a {…} Error: …', error = err. */
export function fromConsoleArgs(args: readonly unknown[]): Serialized {
    const error = args.map(errorOf).find(Boolean);
    const message = applyFormat(args).map(describe).join(' ').trim().slice(0, MAX_MESSAGE);
    return error ? { message, error: { message: error.message, stack: errorStack(error) } } : { message };
}

/** logger.info('msg', meta): meta is a context object, an Error, or `{ error, ...context }`. */
export function fromMeta(message: string, meta: unknown): Serialized {
    const error = errorOf(meta);
    let context: Record<string, unknown> | undefined;
    if (meta && typeof meta === 'object' && !(meta instanceof Error)) {
        const rest: Record<string, unknown> = { ...(meta as Record<string, unknown>) };
        delete rest.error;
        if (Object.keys(rest).length > 0) context = rest;
    } else if (meta !== undefined && !(meta instanceof Error)) {
        context = { value: meta };
    }
    return {
        message: message.slice(0, MAX_MESSAGE),
        ...(context ? { context } : {}),
        ...(error ? { error: { message: error.message, stack: errorStack(error) } } : {}),
    };
}
