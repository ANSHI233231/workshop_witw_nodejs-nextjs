# API

Express + TypeScript **modular monolith** over MySQL. One API serves every frontend app (`manage`, `web`) under `/api` (no version prefix).

## Setup

Node.js 20+ (tested on 22), npm 10+, MySQL 8+.

```bash
cd apps/api
npm install
cp .env.example .env   # fill in DB_* and CORS_ORIGIN
npm run dev            # http://localhost:8030/api/health
```

Every variable is listed in [.env.example](.env.example) and validated at boot by [src/config/environment.schema.ts](src/config/environment.schema.ts). The API refuses to start and lists every bad variable.

**Database:** there is no migration runner. Create the database (`CREATE DATABASE starter_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`), then apply every file in [src/database/migrations/](src/database/migrations/README.md) in date order, then create the first Super Admin with `npm run cli user/create-super-admin`.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server; restarts on source change (not on `.env` change) |
| `npm run build` / `npm start` | Compile to `dist/` / run it |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint, including the architecture boundaries |
| `npm run verify` | type-check + lint |
| `npm run cli <controller>/<action> [args]` | CLI, see [src/cli/README.md](src/cli/README.md) (`cli:dist` for the build) |

## Structure

```
src/
├── server.ts        Entry point: config → logger → database → createApp → listen, graceful shutdown
├── app.ts           createApp(): middleware chain + routes. Never listens, never reads config
├── config/          The only reader of process.env; zod-validated, imported only by entry points
├── core/            App-wide capabilities; never imports modules
│   ├── context/       request id + request context (AsyncLocalStorage)
│   ├── exceptions/    AppError + NotFound/Validation/Conflict/Forbidden/… (each with a code)
│   ├── errors/        error handler, 404 fall-through
│   ├── http/          asyncHandler, ok/created/noContent/paginated
│   ├── logger/        file logger: per-level files, trace, redaction, request dump
│   └── validation/    validate(zod schema), pagination schema, image type, slug, translations
├── database/
│   ├── connection/    createConnectionPool(): the pool, DbExecutor, retry on lost connection
│   ├── transactions/  withTransaction (used through db.transaction)
│   └── migrations/    dated .sql files, applied by hand
├── infrastructure/  Adapters to outside services: email, sms, payment, storage, queue, cache
│                    (contract + factory + providers/ each; built: email, payment, storage, process; see its README)
├── modules/         Business modules, see src/modules/README.md
├── routes/index.ts  The single place modules are built and mounted
└── cli/             Controller/action console framework
```

## Conventions

- **Responses:** `{ success: true, message, data, meta? }`. **Errors:** `{ success: false, message, code, requestId, errors? }`. Frontends branch on `code`, never on `message`.
- Throw an exception from `core/exceptions`; never build an error response by hand.
- Every response carries `X-Request-Id`, which also appears in every log line for that request.
- **Logs:** every line `[ip][userId][requestId][level][category]` plus a trace of our code; with `info` saved, every SQL statement and a request dump. Two settings: `LOG_ENABLED` (save or not) and `LOG_LEVELS` (`error,warning,info`). Files in `logs/`: `error.log`, `warning.log`, `info.log`, `debug.log`, `app.log` (all), `access.log`. See [docs/how-it-works/platform/logging.md](../../docs/how-it-works/platform/logging.md).
- All timestamps are `DATETIME` in UTC; the pool is set to UTC on both the mysql2 and MySQL side.
