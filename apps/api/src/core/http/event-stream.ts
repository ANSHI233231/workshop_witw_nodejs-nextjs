import type { Response } from 'express';

import { markEventStream } from '../logger';

export type EventStream = {
    readonly send: (event: string, data: unknown) => void;
    readonly onClose: (listener: () => void) => void;
    readonly close: () => void;
};

export type EventStreamOptions = {
    readonly heartbeatMs: number;
    readonly retryMs: number;
};

const DEFAULT_OPTIONS: EventStreamOptions = { heartbeatMs: 25_000, retryMs: 5_000 };

const EVENT_NAME = /^[a-z][a-z0-9-]*$/;

const openStreams = new Set<EventStream>();

const frameOf = (event: string, data: unknown): string => {
    if (!EVENT_NAME.test(event)) throw new Error(`Invalid event stream event name: ${event}`);
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
};

export const openEventStream = (res: Response, options: EventStreamOptions = DEFAULT_OPTIONS): EventStream => {
    const listeners: Array<() => void> = [];
    let isOpen = true;

    markEventStream(res);
    res.status(200).set({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    res.write(`retry: ${options.retryMs}\n\n`);

    const heartbeat = setInterval(() => {
        if (isOpen) res.write(': heartbeat\n\n');
    }, options.heartbeatMs);
    heartbeat.unref();

    const stream: EventStream = {
        send: (event, data) => {
            if (isOpen) res.write(frameOf(event, data));
        },
        onClose: (listener) => {
            listeners.push(listener);
        },
        close: () => {
            if (isOpen) res.end();
        },
    };

    res.on('close', () => {
        if (!isOpen) return;
        isOpen = false;
        clearInterval(heartbeat);
        openStreams.delete(stream);
        for (const listener of listeners) listener();
    });

    openStreams.add(stream);
    return stream;
};

export const closeEventStreams = (): number => {
    const streams = [...openStreams];
    for (const stream of streams) stream.close();
    return streams.length;
};
