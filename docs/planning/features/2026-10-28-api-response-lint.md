# API responses only through core/http

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-28 |
| Shipped | 2026-10-28 |
| Apps | api |
| Test cases | TC-RESP-01..04 |
| How it works | [docs/how-it-works/platform/adding-a-module.md](../../how-it-works/platform/adding-a-module.md) |

## 1. Requirement (as given)

> "how did we ensure that everytime we use the same correct pattern of response of api, we alredy open this scope for ai agents to write any pattern of response?"
>
> "should we do this? if we don't do this what can posiblly happend after writien feature for next 6 months by a junior developer or by a senior devlopers"
>
> "first do this on the starter we will think on the sunai after it"

## 2. Plan

Today every error goes through the error handler, but a success response is kept to the envelope only by the written rule: a controller can call `res.json(...)` with any shape (or a raw database row) and `tsc` and `lint` both pass.

- **Lint rule** in `apps/api/eslint.config.mjs`: everywhere under `src/` except `src/core/`, a call on `res` / `response` that writes the body or the status (`json`, `jsonp`, `send`, `sendStatus`, `sendFile`, `status`, `end`, `write`, `writeHead`, `redirect`, `download`, `attachment`, `render`, `type`, `format`) or `….pipe(res)` is an error, with a message naming the helpers. Headers and cookies (`res.cookie`, `res.clearCookie`, `res.set`) stay allowed: they don't shape the body.
- **`sendDownload(res, file)`** in `core/http` for a file sent as an attachment (name, path, size; `no-store`). The log file download in `system-log` uses it instead of writing to `res`.
- **Docs:** `AGENTS.md` (the errors rule), `adding-a-module.md` (rules list), the modules README's controller line.
- The rule matches the parameter names `res` and `response`, the names every controller uses; a controller that renames the parameter is caught in review.
- Sunai: not in this change (user: starter first).

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-RESP-01 | Lint passes on the starter | the change applied | `npm run verify` in `apps/api` | no errors | H |
| TC-RESP-02 | Lint catches a made-up response | a scratch controller line `res.json({ items: [] })`, then `res.status(404).send('x')`, then `stream.pipe(res)` | `npm run lint` | each fails with the rule's message; scratch lines removed after | H |
| TC-RESP-03 | Log file download still works | API running, Super Admin signed in | download a log file from System Logs (`GET /api/system-log/:app/:name/download`) | 200, `text/plain`, `attachment; filename=…`, `no-store`, the file's content | H |
| TC-RESP-04 | Envelopes unchanged | API running | `GET /api/health`, a list (`GET /api/users`), an unknown route | `{ success: true, message, data }`, `meta` on the list, `{ success: false, code: … }` on the 404 | M |

## 4. Decisions

- 2026-10-28 (user): do it, starter first; Sunai to be decided after.

## 5. Execution log

- 2026-10-28 — `core/http/download.ts` (`sendDownload`, exported from `core/http`); the System Logs download uses it; `no-restricted-syntax` rule in `eslint.config.mjs` for `src/**` outside `src/core/**`; docs: `AGENTS.md`, `adding-a-module.md`, the modules README.
- TC-RESP-01 PASS: `npm run verify` exit 0 (the `boundaries` deprecation warning about `mode` was there before).
- TC-RESP-02 PASS: scratch lines in the health controller, `res.json({ items: [] })`, `response.status(404).send('x')`, `stream.pipe(res)`: three errors with the rule's message; the file restored.
- TC-RESP-03 PASS: `GET /api/system-log/api/error.log/download` as a Super Admin: 200, `text/plain`, `attachment; filename="api-error.log"`, `private, no-store`, `Content-Length` 2283, content identical to `logs/error.log`.
- TC-RESP-04 PASS: health `{ success, message, data }`; `GET /api/users?page=1&limit=2` with `meta` `{ page, limit, total, totalPages }`; `GET /api/nope` 404 `{ success: false, code: "ENDPOINT_NOT_FOUND", requestId }`.
- Test data: a temporary Super Admin `ct_resp@example.test` (user 2) made with the CLI; removed with its role, refresh token and its two audit rows (26, 27).

## 6. Post-deploy
