# Frontend logging

**What it is.** How `manage` and `web` record what happened, in the browser and on their own server, into **each app's own** `logs/` folder (`apps/manage/logs/`, `apps/web/logs/`), in the same line format as the API. Nothing is sent to any third party; only errors also go to the API's database (see "Errors saved in the database" below).

**Who uses it.** Anyone debugging a frontend app; developers writing log calls in it.

## What a line looks like

```
2026-10-01 04:41:03.423Z [127.0.0.1][-][tab-mup1qmdg-45afc473b5][error][browser.console] Payment form failed {"orderId":42,"password":"[REDACTED]"} {"page":"/checkout"}
    Error: Network down
        at submitPayment (src/components/checkout/payment-form.tsx:42:17)
        … 12 framework frames
```

- `[127.0.0.1]` client IP · `[-]` user (until auth exists) · `[tab-…]` **tab session id** for browser lines (every line from one browser tab shares it), or the request id for server errors · level · category.
- Ordinary lines get up to 3 `in src/…:line` frames of our code; errors get their mapped stack plus every `Caused by:`, with Next.js / React internals folded into `… N framework frames`.

| Category | Comes from |
|---|---|
| `browser.console` | any `console.log/info/warn/error/debug` in the browser (ours or a library's) |
| `browser.error` | uncaught errors and unhandled promise rejections in the browser |
| `browser.render` | a page that crashed while rendering (`error.tsx`) |
| `browser.navigation` | page navigations (`debug` level) |
| `server.error` | every server error Next.js catches (Server Components, Route Handlers, Server Actions), with route and request id |
| `server.console` | `console.*` in server code |
| your own, e.g. `bookings` | `logger.category('bookings').info(…)` |

## The flow

**Server side** (pages rendered on the server, route handlers, server actions):

1. When the app starts, `src/instrumentation.ts` installs the file writer and starts capturing server `console.*`.
2. Our `logger` calls and server `console.*` are written straight to `logs/`.
3. When something throws, Next.js calls `onRequestError` → one `server.error` line with the route, the request and the full stack. (Next.js also prints the same error to the console; that copy is skipped, so it's saved once.)

**Browser:**

1. Before the page becomes interactive, `src/instrumentation-client.ts` starts capturing `console.*`, uncaught errors, rejected promises and navigations. Our `logger` calls go the same way.
2. Each entry is **stored in the tab's localStorage first**, then sent in batches to **this app's own** `POST /client-logs` every 5 seconds (or at once when 20 are waiting).
3. The server checks it (same origin, size, rate), maps the browser stack back to `src/…tsx:line` with the build's source maps, redacts secrets and writes it.

**If the app's server is down** (or the network drops, or it is restarting): the entries stay stored in the browser and are retried with backoff, when the browser comes back online, and on the next page load. When the tab closes, the rest go out with `sendBeacon`. Every entry has an id and the server skips ids it has already written, so retries never create duplicates. At most 500 entries are kept per browser; the oldest are dropped first. Logs are lost only if the user clears site data or never opens the app again in that browser.

## Using it

```ts
import { logger } from '@/lib/logger';          // same import in server and client code

const log = logger.category('bookings');
log.info('Booking created', { bookingId });
log.warn('Slot almost full', { slotId, left: 2 });
log.error('Payment failed', { error, bookingId }); // pass the error as `error`
```

`console.*` is captured too, so nothing is lost if someone uses it, but the logger gives a category and structured context.

## Settings (each app's `.env`, server-only)

```
LOG_ENABLED=true                 # true = save logs; false or empty = save nothing (browser posts are accepted and dropped)
LOG_LEVELS=error,warning,info    # which levels to save: error, warning, info, debug (empty = error,warning,info)
LOG_INGEST_KEY=…                 # the same secret as LOG_INGEST_KEY in apps/api/.env; empty = errors stay in the files only
```

They are read when the server starts, not baked into the build: change them in `.env` and restart the app.

## Errors saved in the database

Every **error** entry of the app (its server's own and the ones its browsers send to `/client-logs`) is also sent by the app's server to the API, which saves it in `app_log` (manage › Logs › Error Logs; [logging](logging.md#saved-in-the-database-too-app_log)). Only errors, whatever `LOG_LEVELS` says; nothing when `LOG_ENABLED=false` or `LOG_INGEST_KEY` is empty.

- The server keeps them in memory and posts them once a second (`POST /api/system-log/app-log`, header `X-Log-Key`, at most 50 entries or about 80 KB per post), from a timer started with the logger, never from the browser. Each entry: category, message, time, the error's name, message and source-mapped stack, the context (redacted), the request or tab id, IP and user. A server error (`server.error`) also carries its request: method, path (credential-like query values redacted, as in the files) and browser (`user-agent`), cut to 10 / 500 / 255 characters, and in the context the name asked for (`host`) and the `referer` (redacted the same way). Requests from scanners for files that don't exist (`/.env`, `/key.json` …) are kept like any other error, so the console shows who asked for what.
- If the API cannot be reached the entries are dropped and a warning (`log.forward`) is written to the app's files; more than 500 waiting entries → the oldest are dropped.
- Code: `src/lib/logger/server/db-forwarder.ts`, `src/services/log-forward.service.ts` (the same in every app apart from the app name).

## Rules

- **Never log secrets.** Keys like `password`, `token`, `secret`, `authorization`, `cookie`, `api_key`, `card_number`, `cvv`, `otp`, `pin` are redacted, including inside objects passed to `console.*` (in the browser, before they are stored). Don't put secrets into message text yourself.
- **Browser logs go only to the app's own server** (`/client-logs`), never the API.
- **`/client-logs` is public by nature**, so it accepts only same-origin JSON up to 256 KB and 100 entries per batch, about 600 entries per minute per IP, and answers nothing useful to anyone else.
- **Errors from scripts on another origin** (CDN widgets, injected scripts) show only `Script error.`: browsers hide their details. Our own code always has full detail.
- **Production:** browser source maps are not built yet (open decision), so production browser stacks show bundled chunk names (`/_next/static/chunks/…js:1:2345`); server stacks and everything in development show `src/…` paths.

## Files (`apps/<app>/logs/`)

`error.log`, `warning.log`, `info.log`, `debug.log` (one per level) and `app.log` (every saved level, in order). Each rotates at 10 MB, keeping 5 old copies. To follow one browser tab: `grep tab-<id> logs/app.log`.

## Where it lives (same in every app)

- **Logger:** `src/lib/logger/` (`logger.ts` API; `browser/` queue and capture; `server/` file writer, source maps, stack mapping, console capture, request errors)
- **Settings:** `src/lib/server-config.ts`
- **Hooks:** `src/instrumentation.ts` (server), `src/instrumentation-client.ts` (browser)
- **Endpoint:** `src/app/client-logs/route.ts`

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
