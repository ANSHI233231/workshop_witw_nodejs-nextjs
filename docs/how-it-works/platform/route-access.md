# Route access

**What it is.** Every API route states who may call it, as the second argument of the route. A route without it doesn't compile, so a new endpoint can't become public by forgetting a guard.

**Who uses it.** Developers and agents adding or changing API routes.

## How a route is written

```ts
export const createAuditRouter = (controller: AuditLogController, superAdmin: AccessGuard): ApiRouter => {
    const route = apiRouter();
    route.get('/logs', superAdmin, validate(listAuditLogsSchema), asyncHandler(controller.list));
    return route;
};
```

- `apiRouter()` from `core/http` gives `get`, `post`, `put`, `patch` and `delete`: the path, **the access**, then the handlers.
- The access is an `AccessGuard`. Only `AccessGuard.define(...)` makes one; a middleware, a validator or a hand-written object in its place is a type error, and so is leaving it out.
- `routes/index.ts` mounts each module with `mountApi(app, '/api/<module>', x.createRouter(...))` and passes the access the module needs (`createRouter(superAdmin)`). A module's `createRouter` takes `AccessGuard`s, never plain middlewares.

## The kinds of access

| Kind | Who may call | Made by | Used today |
|---|---|---|---|
| `public` | anyone, signed in or not | `publicAccess` from `core/http` | health, sign-in, refresh, sign-out, forgot and reset password, the active languages |
| `session` | any valid session, in any app | `auth.access.session` | `/api/auth/me`, `/change-password`, `/console-roles` |
| `signed-in` | signed in and allowed to use the app that calls (the console needs a console role) | `auth.access.signedIn` | none yet: the first signed-in page of a portal |
| `roles` | signed in with one of the given roles; refused with 403 `ACCESS_DENIED` | `auth.access.roles([MetaRole.SUPER_ADMIN])` | every console route |
| `key` | a caller with a shared key | `AccessGuard.define('key', middleware)` in the module | the apps' log ingest (`X-Log-Key`) |

Without a session every route except `public` and `key` answers 401 `UNAUTHENTICATED`. Access answers only "may this caller use this route?". A rule about one record ("a user may edit only their own profile") belongs in the service.

## What lint stops

Outside `core/http`, `npm run lint` fails on:

- `import { Router } from 'express'` and `express.Router()`;
- `app.get(...)`, `app.post(...)` … and `router.get(...)` … on an Express app or router (`app.use` stays allowed only in `app.ts`, for the global middleware).

So the only way to add a route is `apiRouter()`, and the only way to mount one is `mountApi()`.

## Listing every route

```bash
npm run cli route/list
```

prints every route with its method, full path and access (public ones in yellow) and a count per kind, e.g.:

```
GET    /api/health                       public
POST   /api/auth/sign-in                 public
GET    /api/auth/me                      session
GET    /api/audit/logs                   roles: Super Admin
POST   /api/system-log/app-log           key

64 routes: public 8, session 3, roles 52, key 1
```

It builds the routes exactly as the server does, without listening and without reading the database. Run it when reviewing a change: a new `public` line must be intended.

## Adding a public route

Write `publicAccess` on purpose and say why in the feature's planning file. Anything that changes data or shows anything about a user is never public.

## Where it lives

- **Access and router:** `apps/api/src/core/http/access.ts`, `api-router.ts`
- **Session, signed-in and role access:** `apps/api/src/modules/auth/index.ts`
- **Mount point:** `apps/api/src/routes/index.ts`
- **Lint rules:** `apps/api/eslint.config.mjs`
- **Route list:** `apps/api/src/cli/controllers/RouteController.ts`

## History

- Planning files: [2026-10-28-route-access](../../planning/features/2026-10-28-route-access.md)
