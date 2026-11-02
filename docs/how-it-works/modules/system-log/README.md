# System log

**What it is.** (1) Reading the log files every app writes (the API and the manage and web apps), for the manage **System Logs** page, straight from disk; (2) the **error logs saved in the database** (`app_log`) and the **Error Logs** page.

**Who uses it.** The Super Admin only (Super Admin access on every route except the ingest, which takes the log key; the manage page needs the platform area).

## Where the files come from

- Each app writes its own `logs/` folder ([logging](../../platform/logging.md), [frontend logging](../../platform/frontend-logging.md)). The API reads them from the folders set in its `.env`: `LOG_VIEWER_DIRS=api=logs,manage=../manage/logs,web=../web/logs` (app=folder, relative to `apps/api`; apps `api`, `manage`, `web`). Not set: only the API's own `logs` folder. This works while the apps run on the same server (as with pm2); a restart is needed after changing it.
- Only a fixed list of names is read: `app.log`, `error.log`, `warning.log`, `info.log`, `debug.log`, `access.log` and their rotated copies `.1` … `.5`. The app and the name are checked against that list before anything is opened, the resolved path must stay inside the app's folder, and nothing taken from the request is used as a path.

## The API

- `GET /api/system-log/apps` → per app `{ app, isConfigured, files }`; each file `{ file, name, sizeBytes, updatedAt, copies: [{ name, copy, sizeBytes, updatedAt }] }`, only files that exist (the current one or a copy), in the order app, error, warning, info, debug, access.
- `GET /api/system-log/:app/:name?endLine=&limit=` → `{ lines, totalLines, startLine, endLine, hasMore }`: the `limit` lines (100 by default, at most 500) ending at `endLine` (default: the last line). The file is streamed line by line, never loaded whole (a 10 MB file answers in about 0.1 s).
- `GET /api/system-log/:app/:name/download` → the whole file, `text/plain`, named `<app>-<name>`.
- Errors: a name or app outside the list → 422; a listed name that does not exist → 404 `LOG_FILE_NOT_FOUND`; not a Super Admin → 403; signed out → 401.

## The page

Manage › **System Logs** (`/system-logs`, `?app=api|manage|web`; sidebar group **Logs**, with Audit Log; breadcrumb "Logs › System Logs"): tabs API / Manage / Webtram; one card per file ("API app.log 5.1 MiB") with a select of its older copies, Refresh, Download, Expand (full-screen; Escape closes); a dark panel with the last 100 lines, newest at the bottom; scrolling to the top loads 100 older lines above, keeping the place; "Showing lines a–b of n", "Scroll up to load older lines" / "Start of file". **Refresh Log Files** reloads every card and the sizes. Code: `apps/manage/src/components/system-log/`, `services/system-log.service.ts`; styles `sl-*` in `console-extras.css`.

## Error logs in the database

- **Table `app_log`** (migration `2026-10-28-app-log.sql`): `source_app` (1 api, 2 manage, 3 web), `log_level` (1 error, 2 warning, 3 info, 4 debug), `category`, `message`, `error_name`, `error_message`, `error_stack`, `log_context` (JSON), `request_id`, `ip_address`, `user_id`, `http_method`, `request_url`, `client_app`, `user_agent`, `logged_at` (UTC, milliseconds). Writing a row is not audited (it would loop); deleting old rows is.
- **Writer** (`AppLogWriter`): the API logger hands it the records of `LOG_DB_LEVELS` ([logging](../../platform/logging.md#saved-in-the-database-too-app_log)); it batches them (100 per insert, once a second).
- **From the apps:** `POST /api/system-log/app-log` with header `X-Log-Key` = `LOG_INGEST_KEY` (compared in constant time). Body `{ app: manage|web, entries: [1–50] }`; each entry level `error` only, category ≤ 100, message ≤ 10,000, stack ≤ 100,000 characters, an ISO time, optional error name / message, context (redacted again here), request id, IP, user id, method, URL, browser. No key set in the API → 404; missing or wrong key → 401 `LOG_INGEST_DENIED`; anything else → 422. Answers `{ accepted }`.
- **List:** `GET /api/system-log/app-log?search=&app=&level=&from=&to=&page=&limit=` (Super Admin; search: message, category, request id, URL, error message, and the error page's **Reference** (the Next.js digest in the context); days in UTC; newest first) and `GET /api/system-log/app-log/:id` (404 `APP_LOG_NOT_FOUND`). Each list item has the IP (`ipAddress`); the detail adds the error, stack, context, app and browser.
- **Cleanup:** `npm run cli app-log/prune <days> [confirm]` (1–3,650 days): the count of older rows; with `confirm` deletes them, audit 901 (902 when it fails), entity 19.

The page: manage › Logs › **Error Logs** (`/error-logs`, Super Admin; breadcrumb "Logs › Error Logs"; no prototype board, built from the console's list pieces): search, App, Level, date range, Reset; columns S.No, Date & Time, App, Level, Category, Message (one line), Request ID, User, IP, View; 20 a page. View: date, app, level, category, user, IP, the full message, the error, the stack (scrollable), the request (method and URL), request id, browser and the context as JSON. Code: `apps/manage/src/components/app-log/`, `services/app-log.service.ts`.

## Where it lives

- `apps/api/src/modules/system-log/` (`system-log.service.ts` reads the files; `app-log.service.ts`, `app-log-writer.ts`, `app-log.repository.ts`, `routes/ingest-key.guard.ts` for the database logs); CLI `src/cli/controllers/AppLogController.ts`
