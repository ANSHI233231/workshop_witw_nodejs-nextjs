# Every API route states who may call it

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-28 |
| Shipped | 2026-10-28 |
| Apps | api |
| Test cases | TC-ACCESS-01..07 |
| How it works | [docs/how-it-works/platform/route-access.md](../../how-it-works/platform/route-access.md) |

## 1. Requirement (as given)

> "one mor ething you said earlier other than this that is new routes will be public"
>
> "so give me more details on the Plan B"
>
> "let's do, yes also include the route/list"

## 2. Plan

Today a route's guard is just one of its middlewares (`router.get('/logs', requireSuperAdmin, …)`). A route written without it is open to anyone, and `tsc`, lint and the screens all stay green.

- **`core/http/access.ts`:** `AccessGuard`, a class with a private constructor, made only by `AccessGuard.define(kind, middleware, roleIds?)`. Kinds: `public`, `session` (any valid session, any app), `signed-in` (signed in and allowed to use this app), `roles` (one of the given roles), `key` (a shared key, e.g. the log ingest). `publicAccess` lets everyone through, written out on purpose.
- **`core/http/api-router.ts`:** `apiRouter()` returns an `ApiRouter` whose `get` / `post` / `put` / `patch` / `delete` take the path, **an `AccessGuard`**, then the handlers. Leaving the access out, or putting a middleware in its place, is a type error. The Express router inside is private; `mountApi(app, prefix, router)` mounts it and returns its routes (method, full path, access).
- **auth module:** `access.session`, `access.signedIn`, `access.roles(roleIds)` replace `requireSignedIn` / `requireRoles`. The auth routes `/me`, `/change-password`, `/console-roles` use `session`; sign-in, refresh, sign-out, forgot and reset password are `publicAccess`.
- **Every module's routes** move to `apiRouter()`; each `createRouter` takes `AccessGuard`s, not middlewares. Jobs' `router.use(superAdmin)` becomes the access of each route. The log ingest is `key` access.
- **`routes/index.ts`:** mounts with `mountApi` and `registerRoutes` returns the route list.
- **Lint:** outside `core/http`, no `Router` from `express` (import or `express.Router`), and no `app.get(…)` / `app.post(…)` …: a route can only be added through `apiRouter()`.
- **CLI `route/list`:** builds the routes as the server does (without listening) and prints method, path and access for every route, with a count per access kind.
- **Docs:** new `platform/route-access.md`; `AGENTS.md`, `adding-a-module.md`, the auth module doc, the CLI README.
- Unchanged: every URL, response and status (signed out 401, wrong role 403); the frontends.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-ACCESS-01 | A route without access doesn't compile | the change applied | scratch lines in a route file: `route.get('/x', asyncHandler(…))`, `route.get('/x', validate(schema), …)`, `route.get('/x', { kind: 'public', … })`; `npm run type-check` | each is a type error; scratch lines removed | H | CLI |
| TC-ACCESS-02 | No way around `apiRouter()` | the change applied | scratch: `import { Router } from 'express'` in a module, `express.Router()`, `app.get('/api/x', …)` in `routes/index.ts`; `npm run lint` | each fails with the rule's message; scratch removed | H | CLI |
| TC-ACCESS-03 | `route/list` | the change applied | `npm run cli route/list` | every route with method, full path and access; public: health, sign-in, refresh, sign-out, forgot and reset password (GET and POST), languages active; key: log ingest; everything else session or Super Admin | H | CLI |
| TC-ACCESS-04 | Signed out is refused everywhere but the public routes | API running | call every route from `route/list` without a session | public ones answer (200 or a validation 422), key route 401 without the key, every other route 401 | H | API |
| TC-ACCESS-05 | Wrong role is refused | API running, a `ct_` user without Super Admin in the web app | call a Super Admin route with that user's session | 403 `ACCESS_DENIED` | M | API |
| TC-ACCESS-06 | Console works | API and manage running, `ct_` Super Admin | sign in; open Users, Roles, Audit Log, Error Logs, System Logs (download a file), Background Jobs, Languages, App Translations, Email Templates, Sent Email Log; open Change Password from the user menu; log out | every page loads its data; no console errors or failed calls; 1366 and 390 px | H | browser |
| TC-ACCESS-07 | Web works | API and web running, `ct_` Super Admin | welcome page signed out; sign in; dashboard; sign out | as before; no console errors or failed calls; 1366 and 390 px | H | browser |

## 4. Decisions

- 2026-10-28 (user): Plan B (every route states its access, checked by the compiler), with the `route/list` CLI command. Starter first.

## 5. Execution log

- 2026-10-28 — `core/http/access.ts` (`AccessGuard`, `publicAccess`), `core/http/api-router.ts` (`apiRouter`, `mountApi`, `RouteEntry`); auth module `access.session` / `.signedIn` / `.roles` (replacing `requireSignedIn` / `requireRoles`); all eight modules' routes on `apiRouter()` (jobs: `router.use(superAdmin)` became each route's access; `requireSuperAdmin` parameters renamed `superAdmin`); `routes/index.ts` mounts with `mountApi` and returns the routes; lint: no express `Router`, no `app.*` / `router.*` route calls outside `core/http` (`app.use` allowed in `app.ts` only), selectors kept in named constants because a later flat-config block for the same rule replaces the earlier one; the CLI may import `routes/`; `RouteController` (`route/list`); docs: new `platform/route-access.md`, `AGENTS.md`, `adding-a-module.md`, the platform and modules READMEs, the auth and system-log module docs, the CLI README (also lists `UserController`, missing before). `npm run verify` and `npm run build` pass; `cli:dist route/list` gives the same list.
- TC-ACCESS-01 PASS (CLI): scratch routes in `audit.routes.ts` with only a handler, with a validator in the access place, and with a hand-written `{ kind: 'public', … }`: three type errors; file restored.
- TC-ACCESS-02 PASS (CLI): scratch `import { Router } from 'express'`, `express.Router()` in a module and `app.get('/api/x', …)` in `routes/index.ts`: three lint errors with the rule's message (a `raw.get(...)` on the scratch Router is not flagged itself, but that Router can't be made without the import error); files restored.
- TC-ACCESS-03 PASS (CLI): `route/list` printed 64 routes, "public 8, session 3, roles 52, key 1"; public: health, sign-in, refresh, sign-out, forgot password, reset password GET and POST, languages active; key: the log ingest; session: me, change-password, console-roles; every other route Super Admin.
- TC-ACCESS-04 PASS (API): every route from `route/list` called with no session (`:id` 1, `:app` api, `:name` error.log, `:code` hi; POST bodies `{}`): health and languages active 200, sign-out 204, sign-in / forgot / reset 422 `VALIDATION_FAILED` (empty body), refresh 401 `UNAUTHENTICATED` from its own check (no refresh cookie; the access let it through), the ingest 401 `LOG_INGEST_DENIED`, all 3 session and all 52 Super Admin routes 401 `UNAUTHENTICATED`.
- TC-ACCESS-05 PASS (API): `ct_access_plain` (no role, made by the `ct_` Super Admin through `POST /api/users`) signed in to web: `/api/auth/me` 200; `/api/users`, `/api/audit/logs`, `/api/jobs/runs`, `/api/language/master`, `/api/mail/logs` 403 `ACCESS_DENIED`; the Super Admin's `/api/users` 200.
- TC-ACCESS-06 PASS (browser, 1366 + 390 px): signed in through the console's form as `ct_access_admin`; Dashboard, Users (both test users listed), Roles, Audit Log, Error Logs, System Logs, Background Jobs, Language Master, App Translations, Email Templates, Sent Email Log loaded, no error page, no sideways scroll; the log download from the signed-in page 200; Change Password opened from the user menu; Log Out → `/login`, then `/users` → `/login`. Screenshots of Language Master (1366) and Users (390) opened and looked right; the first check expected "Hindi" on Language Master, but this database has only English. Failed calls: only `401 /api/auth/refresh` on the sign-in page and after logging out (signed-out session checks).
- TC-ACCESS-07 PASS (browser, 1366 + 390 px): welcome page signed out shows Sign in; sign-in → `/dashboard` "Welcome, ct Access Admin" (screenshot at 1366 opened); welcome page signed in shows Sign out; Sign out → Sign in again; no sideways scroll; only failed call `401 /api/auth/refresh` before signing in.
- Test data: `ct_access_admin` (user 4, CLI) and `ct_access_plain` (user 5) removed with their roles, 6 refresh tokens and audit rows 34–45; no `app_log` rows written; the scratch Playwright folder, screenshots, password and route files deleted; servers stopped.

## 6. Post-deploy
