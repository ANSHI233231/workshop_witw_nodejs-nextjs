# Audit

**What it is.** One append-only record of who did what, from every app: every write (create, update, delete) and key events (failed writes, CLI runs that write; sign-in events once sign-in exists). Rows are never changed or deleted.

**Who uses it.** Every API module records into it through the audit service. Super Admins read it in manage on the **Audit Log** page ([manage-console](../../platform/manage-console.md)).

## The flow

1. **Which app.** Each frontend's `api-client.ts` sends `X-Client-App: manage | web` on every call. The first API middleware puts it in the request context with the IP, the user-agent and the request id; a missing or unknown value is "system". A CLI command runs in a context of its own (app = CLI).
2. **A service writes and records.** Inside the same operation (and transaction) as the write, the service calls `auditService.record({ action, entityType, entityId, changes, details, actorLabel })`. If the operation rolls back, its audit row rolls back with it: the log never shows something that did not happen.
3. **A write fails.** In its `catch`, after the transaction has ended, the service calls `auditService.recordFailure({ action, … }, error)`: a failure row with the error's code and message in `details`, then re-throws.
4. **The audit service fills the rest** from the request context: app, signed-in user (when sign-in exists), request id, IP and the raw user-agent. Browser, platform, device … are not stored: a screen that shows them parses `user_agent` with `core/agent` (`new Agent(userAgent).getDetails()`), which keeps the table narrow.
5. **An audit write that fails** is logged (`logs/error.log`, category `audit`) and never fails the user's action.

## Reading it (Super Admin only)

- `GET /api/audit/logs`: newest first, pages of 20.
  - Filters:
    - `search`: the user's name or username, the typed identifier (`actor_label`), the IP, or the exact request id;
    - `module`, `action`, `outcome`, `clientApp`;
    - `from` / `to`: whole UTC days, `to` included; `to` before `from` → 422.
  - Each row carries its codes and their names (`moduleName`, `actionName`, `entityName`, `clientAppName`), the user's name and username (joined from `user`), the entity and the IP.
- `GET /api/audit/logs/export`: every event matching the same filters (no paging, at most 10,000), for the console's CSV Export.
- `GET /api/audit/logs/:id`: the row plus `changes` and `details` (parsed JSON), `requestId` and `userAgent`; unknown id → 404 `AUDIT_LOG_NOT_FOUND`.
- `GET /api/audit/summary`: for the same filters: `total`, `failed`, `signIn` (module auth), `today` (since UTC midnight).
- `GET /api/audit/options`: the modules, the actions (each with its module) and the apps, for the filters.
- The read side has its own parts: `AuditLogService`, `AuditLogRepository`, `AuditLogController`, `routes/audit.routes.ts`, `validators/audit.validators.ts`, `mappers/audit.mapper.ts`. `IAuditService` (record / recordFailure) is unchanged.

## Rules

- **Every write records an event**, with what changed in `changes` (for a create: the saved fields; for an update: `{ field: { from, to } }`). Request validation errors (422 before any service runs) change nothing and are not recorded.
- **Codes are numbers**, listed once in `apps/api/src/modules/audit/types/audit.types.ts` (`AuditModule`, `AuditAction`, `AuditEntity`, `AuditOutcome`) and `ClientApp` in `core/context`. Codes are append-only: never renumbered, never reused.
- **A module's actions are numbered in its hundred**: module N owns actions N00–N99 (contact = 1 → 101, 102 …). The module column is derived from the action, so the two can never disagree.
- A CLI command that writes records one row per run, with counts in `details`, not one per row it touched.
- `request_id` is the same id as in the log files and the `X-Request-Id` response header: from an audit row you can find the request's log lines.

| Code list | Values |
|---|---|
| `client_app` | 1 manage, 2 web, 3 CLI, 4 system |
| `module` | 1 users, 2 auth, 3 system-log, 4 language, 5 jobs, 6 notification, 7 mail |
| `action` | in each module's hundred, e.g. 101 contact query created, 102 contact query create failed, 201 location masters copied, 202 location masters copy failed; the full list in `AuditAction` |
| `entity_type` | the full list in `AuditEntity` |
| `outcome` | 1 success, 2 failure |

**Adding an event:** add the action (in its module's hundred; a new module also gets a new `AuditModule` code and its hundred) and, if needed, the entity to the lists; add the codes to the header of a new migration only if a column changes (the code lists themselves need no migration); call `record` / `recordFailure` in the service; the module gets `auditService` through `createXModule(deps)` in `src/routes/index.ts`.

## Where it lives

- **Module:** `apps/api/src/modules/audit/` (the record service, and the read side above, mounted at `/api/audit`)
- **Parser:** `apps/api/src/core/agent/` (`Agent`, on `ua-parser-js` v2, AGPL-3.0), for reading `user_agent` when needed
- **Context:** `apps/api/src/core/context/` (`ClientApp`, `X-Client-App` read in `attach-request-id`), CLI context in `src/cli/index.ts`
- **Table:** `audit_log` (migration `2026-10-28-audit-log.sql`)
- **Frontends:** `src/services/api-client.ts` in manage and web (the header)

## History

- Planning files: [2026-10-28-starter-core](../../../planning/features/2026-10-28-starter-core.md)
