# Manage (`apps/manage`)

The superadmin console: users and roles, logs, background jobs, languages and the technical documentation. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Talks to `apps/api` over HTTP only.

## Setup

```bash
cd apps/manage
npm install
cp .env.example .env      # NEXT_PUBLIC_API_URL=http://localhost:8030/api
npm run dev               # http://localhost:3041
```

The API must list `http://localhost:3041` in its `CORS_ORIGIN` for browser calls.

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 3041 |
| `npm run build` / `npm start` | Production build / serve it on port 3041 |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint, including this app's layer rules |
| `npm run verify` | type-check + lint |

## Routes

| Route group | URL | For |
|---|---|---|
| `(public)` | `/login` … | Every page anyone can open without signing in (login, forgot password, invitations …) |
| `(dashboard)` | `/` … | The superadmin area (restricted once auth exists) |

## Logs

Browser `console.*`, crashes, server errors and `logger` calls are saved to `apps/manage/logs/` (`error.log`, `warning.log`, `info.log`, `debug.log`, `app.log`), switched by `LOG_ENABLED` / `LOG_LEVELS` in `.env`. See [docs/how-it-works/platform/frontend-logging.md](../../docs/how-it-works/platform/frontend-logging.md).

## Structure

See [docs/how-it-works/platform/frontend-apps.md](../../docs/how-it-works/platform/frontend-apps.md): the same in every app.

`AGENTS.md` / `CLAUDE.md` in this folder are written by `next dev`: they point agents at the Next.js 16 docs in `node_modules/next/dist/docs/`. Keep them committed.
