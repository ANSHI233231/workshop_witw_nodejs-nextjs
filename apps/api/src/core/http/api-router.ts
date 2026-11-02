import { type Express, type RequestHandler, Router } from 'express';

import type { AccessGuard } from './access';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type RouteEntry = {
    readonly method: HttpMethod;
    readonly path: string;
    readonly access: AccessGuard;
};

const joinPath = (prefix: string, path: string): string => (path === '/' ? prefix : `${prefix}${path}`);

export class ApiRouter {
    readonly #router = Router();
    readonly #routes: RouteEntry[] = [];

    static mount(app: Express, prefix: string, apiRouter: ApiRouter): RouteEntry[] {
        app.use(prefix, apiRouter.#router);
        return apiRouter.#routes.map((route) => ({ ...route, path: joinPath(prefix, route.path) }));
    }

    readonly get = (path: string, access: AccessGuard, ...handlers: RequestHandler[]): void => {
        this.#record('get', path, access);
        this.#router.get(path, access.middleware, ...handlers);
    };

    readonly post = (path: string, access: AccessGuard, ...handlers: RequestHandler[]): void => {
        this.#record('post', path, access);
        this.#router.post(path, access.middleware, ...handlers);
    };

    readonly put = (path: string, access: AccessGuard, ...handlers: RequestHandler[]): void => {
        this.#record('put', path, access);
        this.#router.put(path, access.middleware, ...handlers);
    };

    readonly patch = (path: string, access: AccessGuard, ...handlers: RequestHandler[]): void => {
        this.#record('patch', path, access);
        this.#router.patch(path, access.middleware, ...handlers);
    };

    readonly delete = (path: string, access: AccessGuard, ...handlers: RequestHandler[]): void => {
        this.#record('delete', path, access);
        this.#router.delete(path, access.middleware, ...handlers);
    };

    #record(method: HttpMethod, path: string, access: AccessGuard): void {
        this.#routes.push({ method, path, access });
    }
}

export const apiRouter = (): ApiRouter => new ApiRouter();

export const mountApi = (app: Express, prefix: string, router: ApiRouter): RouteEntry[] =>
    ApiRouter.mount(app, prefix, router);
