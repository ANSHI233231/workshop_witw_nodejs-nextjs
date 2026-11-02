# Logging

**What it is.** How the API records what happened, so a bug can be followed from where it started to where it surfaced. Every line says who (IP, user, request), what (level, category, message) and **where in our code** (a short trace). SQL, transactions and the request itself are logged too.

**Who uses it.** Anyone debugging the API; developers writing log calls. (The frontend apps log the same way into their own folders: [frontend-logging.md](frontend-logging.md).)

## What a line looks like

```
2026-10-01 04:02:44.732Z [127.0.0.1][-][9346eba9-…][info][db.query] INSERT INTO bookings (id) VALUES (7) (1.0 ms, 1 affected)
    in src/modules/bookings/repositories/booking.repository.ts:6
    in src/modules/bookings/services/booking.service.ts:8
    in src/modules/bookings/controllers/booking.controller.ts:6
```

- `[127.0.0.1]` client IP · `[-]` user id (`-` until auth exists) · `[9346eba9-…]` request id (also sent as `X-Request-Id`, and in every error response) · `[info]` level · `[db.query]` category.
- Times are UTC, like the database.
- `in …` lines: up to 3 frames of **our** code (`LOG_TRACE_LEVEL`). `node_modules`, Node internals, `core/` and `database/` are skipped, so a SQL line points at the repository that ran it.
- An error line carries the full stack instead, then every `Caused by:` in its chain: the first frame of the last cause is where the bug started.

## The flow of one request

1. The request gets an id and a **request context** (id, IP, user). Every log line during the request, from any module, gets the prefix automatically.
2. Each SQL statement is logged with its values, time and rows; transactions log `BEGIN` / `COMMIT` / `ROLLBACK (reason)`; a new pool connection logs `Opening DB connection: …` (never the password).
3. Your own lines: `logger.category('bookings').info('Booking created', { bookingId })`.
4. If something throws, the error handler logs it at `error` / `http.error` with its stack and causes, and the client gets `500 INTERNAL_ERROR` with the request id.
5. When the response is sent: one `access.log` line, and a **request context dump** (`$request`, `$query`, `$body`, `$headers`).

To follow a bug: take the `requestId` from the error response (or `error.log`) and `grep` it in `app.log`. You get the whole request in order.

## Files (`apps/api/logs/`)

| File | Contains |
|---|---|
| `error.log` | `error` lines only |
| `warning.log` | `warning` lines only |
| `info.log` | `info` lines only |
| `debug.log` | `debug` lines only (when `debug` is in `LOG_LEVELS`) |
| `app.log` | every level, in order: one request's whole story |
| `access.log` | one line per HTTP request: method, URL, status, time |

Nothing is written unless `LOG_ENABLED=true`, and only the levels in `LOG_LEVELS`. Each file rotates at 10 MB, keeping 5 old copies (`app.log.1` … `app.log.5`). A file appears when its first line is written.

All apps' files can be read in manage › **System Logs** (Super Admin; the API reads the folders listed in `LOG_VIEWER_DIRS`; [modules/system-log](../modules/system-log/README.md)).

## Saved in the database too (`app_log`)

Besides the files, entries of the levels in `LOG_DB_LEVELS` (by default **errors only**) are saved in the table `app_log` and shown on manage › Logs › **Error Logs** ([modules/system-log](../modules/system-log/README.md#error-logs-in-the-database)). This is independent of `LOG_LEVELS`: errors reach the database even when the files keep fewer levels; only `LOG_ENABLED=false` stops it. Each row keeps the app, level, category, message, the error's name, message and full stack with its causes, the line's other fields as JSON (secrets redacted), and the request: id, IP, user, method, URL (query secrets redacted), app, browser.

- Rows are written in batches once a second by a timer that runs outside any request, so a request never waits for them, and an error logged inside a transaction that rolls back is still saved.
- While the writer saves rows, whatever it logs itself (its SQL, its own failure) goes to the files only, never back to the database, so it cannot loop. If more than 1,000 rows wait (the database is down), the oldest are dropped and the count is written to the files.
- The manage and web servers send their **errors** here too ([frontend logging](frontend-logging.md#errors-saved-in-the-database)), to `POST /api/system-log/app-log` with the shared key `LOG_INGEST_KEY`.
- Old rows: `npm run cli app-log/prune <days>` counts the rows older than that; add `confirm` to delete them (audited).

## Settings (`apps/api/.env`)

Two everyday settings:

```
LOG_ENABLED=true                 # true = save logs; false or empty = save nothing at all
LOG_LEVELS=error,warning,info    # which levels to save: error, warning, info, debug (empty = error,warning,info)
LOG_DB_LEVELS=error              # which levels are also saved in the database (empty = error)
LOG_INGEST_KEY=…                 # secret the apps send with their errors (32+ characters; empty = the apps' errors are not accepted)
```

SQL lines and request dumps are `info` entries, so they're saved exactly when `info` is in `LOG_LEVELS`. For production, `LOG_LEVELS=error,warning` keeps errors and warnings without SQL or request bodies.

Everything else already has the recommended default and stays out of `.env`. Override only if you have a reason:

| Advanced setting | Default | Does |
|---|---|---|
| `LOG_TRACE_LEVEL` | `3` | Frames of our code under each line; `0` = no trace |
| `LOG_SQL` | `true` | SQL statements, transactions, new connections (when `info` is saved) |
| `LOG_REQUEST_CONTEXT` | `true` | Request dump per request (when `info` is saved; a failed request's dump goes to `error.log`) |
| `LOG_TO_CONSOLE` | on, except production | Also print to the terminal (pm2 logs). The CLI never prints logs |
| `ACCESS_LOG_ENABLED` | `true` | `access.log` (written whenever `LOG_ENABLED=true`, whatever the levels) |
| `TRUST_PROXY` | `loopback` | Which proxies may set the client IP (`X-Forwarded-For`) |

## Rules

- **Use the logger, never `console.*`** (lint-enforced). In a module, use a category named after it: `const log = logger.category('bookings')`.
- **Pass context as an object, errors as `error`:** `log.error('Payment failed', { error, bookingId })`. When re-throwing, keep the original as `cause`: `throw new Error('Could not load booking', { cause: error })`, so the log shows where it started.
- **Never log secrets.** Bodies, queries, headers and URLs are redacted for keys like `password`, `token`, `secret`, `authorization`, `cookie`, `api_key`, `card_number`, `cvv`, `otp`, `pin`; don't build messages that contain them yourself. Bound SQL values and request bodies are logged as-is (minus redacted keys): in production, save `error,warning` only.
- **Errors are always complete:** an error's full stack (source-mapped, also in production) and its `Caused by:` chain are written whatever the settings.
- **Don't turn `TRUST_PROXY` to `true`** on a server reachable directly: callers could fake their IP.

## Where it lives

- **Logger:** `apps/api/src/core/logger/` (`logger.ts` format and files, `trace.ts` trace, `redact.ts` redaction, `request-log.middleware.ts` access line and context dump)
- **Request context:** `apps/api/src/core/context/`
- **SQL logging:** `apps/api/src/database/connection/query-log.ts`, used by the pool and `database/transactions/with-transaction.ts`
- **Settings:** `apps/api/src/config/environment.schema.ts`, `config.ts`
- **Database writer:** `apps/api/src/modules/system-log/services/app-log-writer.ts`, handed to the logger in `routes/index.ts` (`logger.setRecordSink`)

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
