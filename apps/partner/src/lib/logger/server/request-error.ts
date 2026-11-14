// Every server error Next.js catches (Server Components, Route Handlers, Server Actions, proxy),
// from instrumentation.ts `onRequestError`.

import 'server-only';

import { redactUrl } from '../redact';
import { errorStack } from '../serialize';

import { writeRecord } from './file-writer';

type RequestInfo = {
    readonly path: string;
    readonly method: string;
    readonly headers: Readonly<Record<string, string | string[] | undefined>>;
};
type RequestContext = {
    readonly routePath: string;
    readonly routeType: string;
    readonly renderSource?: string;
    readonly routerKind?: string;
};

const header = (headers: RequestInfo['headers'], name: string): string | undefined => {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
};

export function clientIp(headers: RequestInfo['headers']): string {
    // Set by nginx in front of the app. Without a proxy these headers are absent.
    const forwarded = header(headers, 'x-forwarded-for')?.split(',')[0]?.trim();
    return (header(headers, 'x-real-ip') ?? forwarded ?? '-').replace(/^::ffff:/, '');
}

const refererOf = (headers: RequestInfo['headers']): string | undefined => {
    const referer = header(headers, 'referer');
    return referer ? redactUrl(referer) : undefined;
};

// Errors onRequestError has reported, so the console capture doesn't save them a second time.
// Next.js may hand onRequestError a processed copy of the error, so the message is matched too.
const reported = new WeakSet<object>();
const reportedMessages = new Map<string, number>();
const MESSAGE_MATCH_MS = 2_000;

export const wasReportedAsRequestError = (error: Error): boolean => {
    const at = reportedMessages.get(error.message);
    return reported.has(error) || (at !== undefined && Date.now() - at < MESSAGE_MATCH_MS);
};

export function logRequestError(error: unknown, request: RequestInfo, context: RequestContext): void {
    if (typeof error === 'object' && error !== null) reported.add(error);
    if (error instanceof Error) {
        reportedMessages.set(error.message, Date.now());
        if (reportedMessages.size > 200) reportedMessages.delete(reportedMessages.keys().next().value!);
    }
    const digest = typeof error === 'object' && error !== null && 'digest' in error ? String(error.digest) : undefined;
    const stack = error instanceof Error ? errorStack(error) : `Error: ${String(error)}`;
    writeRecord({
        level: 'error',
        category: 'server.error',
        message: `${request.method} ${redactUrl(request.path)} -> ${context.routeType} error in ${context.routePath}`,
        context: {
            routePath: context.routePath,
            routeType: context.routeType,
            renderSource: context.renderSource,
            digest,
            host: header(request.headers, 'host'),
            referer: refererOf(request.headers),
        },
        errorStack: stack,
        ip: clientIp(request.headers),
        id: header(request.headers, 'x-request-id'),
        request: {
            method: request.method,
            url: redactUrl(request.path),
            userAgent: header(request.headers, 'user-agent'),
        },
    });
}
