// The current request, available anywhere in its async call chain without being passed around:
// the logger reads it to prefix every line with [ip][userId][requestId].

import { AsyncLocalStorage } from 'node:async_hooks';

import type { ClientAppCode } from './client-app';

export type RequestContext = {
    readonly requestId: string;
    readonly ip: string;
    readonly method: string;
    readonly url: string;
    readonly clientApp: ClientAppCode;
    readonly userAgent: string | null;
    readonly language: string;
    /** Set once authentication exists; `null` means not signed in (logged as `-`). */
    userId: string | number | null;
};

const storage = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext | undefined => storage.getStore();

export const runWithRequestContext = <T>(context: RequestContext, work: () => T): T => storage.run(context, work);
