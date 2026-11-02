// The ONLY place this app calls the API (lint-enforced: only src/services/ may import this file).
// It adds the base URL, sends and parses JSON, unwraps the success envelope and turns every
// failure into an ApiError. Works in Server Components, Server Actions and the browser.

import { config } from '@/lib/config';
import { LOCALE_COOKIE } from '@/lib/i18n/locale';
import type { ErrorEnvelope, Paginated, SuccessEnvelope } from '@/types/api.types';

import { ApiError } from './api-error';
import { leaveForLogin, sessionUser } from './session-user';

const CLIENT_APP = 'web';

const CLIENT_APP_QUERY = 'app';

const SESSION_USER_HEADER = 'X-Session-User';

const LANGUAGE_HEADER = 'X-Language';

const UNAUTHENTICATED = 'UNAUTHENTICATED';

const SESSION_ERROR_CODES: ReadonlySet<string> = new Set([UNAUTHENTICATED, 'SESSION_CHANGED', 'CONSOLE_ACCESS_DENIED']);

const REFRESH_PATH = '/auth/refresh';

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
    readonly query?: Readonly<Record<string, QueryValue>>;
    readonly body?: unknown;
    readonly headers?: Readonly<Record<string, string>>;
    readonly signal?: AbortSignal;
    /** Next.js fetch caching. Defaults to 'no-store': API data is live unless a caller opts in. */
    readonly cache?: RequestCache;
    readonly next?: { revalidate?: number | false; tags?: string[] };
    readonly language?: string;
};

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
    const url = new URL(`${config.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    return url.toString();
};

const isErrorEnvelope = (value: unknown): value is ErrorEnvelope =>
    typeof value === 'object' && value !== null && (value as { success?: unknown }).success === false;

const isSuccessEnvelope = (value: unknown): value is SuccessEnvelope<unknown> =>
    typeof value === 'object' && value !== null && (value as { success?: unknown }).success === true;

const sessionHeaders = (): Record<string, string> => {
    const userId = sessionUser();
    return userId === null ? {} : { [SESSION_USER_HEADER]: String(userId) };
};

const browserLanguage = (): string | undefined =>
    typeof document === 'undefined'
        ? undefined
        : document.cookie
              .split('; ')
              .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE}=`))
              ?.slice(LOCALE_COOKIE.length + 1);

const languageHeaders = (language: string | undefined): Record<string, string> => {
    const chosen = language ?? browserLanguage();
    return chosen ? { [LANGUAGE_HEADER]: chosen } : {};
};

const isFormData = (body: unknown): body is FormData => typeof FormData !== 'undefined' && body instanceof FormData;

const encodedBody = (body: unknown): BodyInit | undefined => {
    if (body === undefined) return undefined;
    return isFormData(body) ? body : JSON.stringify(body);
};

async function send<T>(method: string, path: string, options: RequestOptions = {}): Promise<SuccessEnvelope<T>> {
    const hasJsonBody = options.body !== undefined && !isFormData(options.body);
    let response: Response;

    try {
        response = await fetch(buildUrl(path, options.query), {
            method,
            headers: {
                Accept: 'application/json',
                'X-Client-App': CLIENT_APP,
                ...sessionHeaders(),
                ...languageHeaders(options.language),
                ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
                ...options.headers,
            },
            body: encodedBody(options.body),
            credentials: 'include',
            signal: options.signal,
            cache: options.next ? options.cache : (options.cache ?? 'no-store'),
            next: options.next,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        throw new ApiError('The API could not be reached.', 0, ApiError.NETWORK_ERROR);
    }

    if (response.status === 204) {
        return { success: true, message: '', data: undefined as T };
    }

    const payload: unknown = await response.json().catch(() => undefined);

    if (isErrorEnvelope(payload)) {
        throw new ApiError(payload.message, response.status, payload.code, payload.requestId, payload.errors);
    }
    if (!response.ok || !isSuccessEnvelope(payload)) {
        throw new ApiError(
            `Unexpected response from the API (HTTP ${response.status}).`,
            response.status,
            ApiError.INVALID_RESPONSE,
            response.headers.get('x-request-id') ?? undefined,
        );
    }
    return payload as SuccessEnvelope<T>;
}

const isSessionError = (error: unknown): error is ApiError =>
    error instanceof ApiError && SESSION_ERROR_CODES.has(error.code);

let renewalInFlight: Promise<boolean> | null = null;

const renewSession = (): Promise<boolean> => {
    renewalInFlight ??= send('POST', REFRESH_PATH)
        .then(
            () => true,
            () => false,
        )
        .finally(() => {
            renewalInFlight = null;
        });
    return renewalInFlight;
};

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<SuccessEnvelope<T>> {
    try {
        return await send<T>(method, path, options);
    } catch (error) {
        if (sessionUser() === null || !isSessionError(error)) throw error;
        if (error.code !== UNAUTHENTICATED || !(await renewSession())) {
            leaveForLogin();
            throw error;
        }
    }
    try {
        return await send<T>(method, path, options);
    } catch (error) {
        if (isSessionError(error)) leaveForLogin();
        throw error;
    }
}

export const apiClient = {
    url: (path: string, query?: RequestOptions['query']): string => buildUrl(path, query),
    fileUrl: (path: string, query?: RequestOptions['query']): string =>
        buildUrl(path, { [CLIENT_APP_QUERY]: CLIENT_APP, ...query }),
    get: async <T>(path: string, options?: RequestOptions): Promise<T> => (await request<T>('GET', path, options)).data,
    post: async <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
        (await request<T>('POST', path, { ...options, body })).data,
    put: async <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
        (await request<T>('PUT', path, { ...options, body })).data,
    patch: async <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
        (await request<T>('PATCH', path, { ...options, body })).data,
    delete: async <T = void>(path: string, options?: RequestOptions): Promise<T> =>
        (await request<T>('DELETE', path, options)).data,
    /** For list endpoints that answer with `meta` (page, limit, total, totalPages). */
    paginated: async <T>(path: string, options?: RequestOptions): Promise<Paginated<T>> => {
        const envelope = await request<ReadonlyArray<T>>('GET', path, options);
        if (!envelope.meta) {
            throw new ApiError('The API returned a list without pagination.', 200, ApiError.INVALID_RESPONSE);
        }
        return { items: envelope.data, meta: envelope.meta };
    },
};
