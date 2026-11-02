import type { RequestHandler } from 'express';

export type AccessKind = 'public' | 'session' | 'signed-in' | 'roles' | 'key';

export class AccessGuard {
    private constructor(
        readonly kind: AccessKind,
        readonly roleIds: readonly number[],
        private readonly guard: RequestHandler,
    ) {}

    static define(kind: AccessKind, guard: RequestHandler, roleIds: readonly number[] = []): AccessGuard {
        return new AccessGuard(kind, roleIds, guard);
    }

    get middleware(): RequestHandler {
        return this.guard;
    }
}

export const publicAccess = AccessGuard.define('public', (_req, _res, next) => next());
