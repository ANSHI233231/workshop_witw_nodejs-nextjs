# Partner (`apps/partner`)

The Partner portal: safari operators sign in with their website account and manage their packages, galleries, quote requests and business profile. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Talks to `apps/api` over HTTP only. How it works: [docs/how-it-works/platform/partner-portal.md](../../docs/how-it-works/platform/partner-portal.md).

## Setup

```bash
cd apps/partner
npm ci
cp .env.example .env      # NEXT_PUBLIC_API_URL=http://localhost:8030/api, NEXT_PUBLIC_WEBSITE_URL=http://localhost:3040
npm run dev               # http://localhost:3042
```

The API must list `http://localhost:3042` in its `CORS_ORIGIN` and have `APP_URL_PARTNER=http://localhost:3042` (password reset links).

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 3042 |
| `npm run build` / `npm start` | Production build / serve it on port 3042 |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint, including this app's layer rules |
| `npm run verify` | type-check + lint |

## Routes

| Route group | URL | For |
|---|---|---|
| `(public)` | `/login`, `/forgot-password` | Anyone: sign in with the website account, reset the password (no Sign Up) |
| `(portal)` | `/partner-request` | Any signed-in user: the partner request and its state |
| `(portal)` | `/` … | Active partners only (`requireActivePartner()`); everyone else is sent to `/partner-request` |

## Logs

Browser `console.*`, crashes, server errors and `logger` calls are saved to `apps/partner/logs/` (`error.log`, `warning.log`, `info.log`, `debug.log`, `app.log`), switched by `LOG_ENABLED` / `LOG_LEVELS` in `.env`. See [docs/how-it-works/platform/frontend-logging.md](../../docs/how-it-works/platform/frontend-logging.md).

## Structure

See [docs/how-it-works/platform/frontend-apps.md](../../docs/how-it-works/platform/frontend-apps.md): the same in every app.

`AGENTS.md` / `CLAUDE.md` in this folder are written by `next dev`: they point agents at the Next.js 16 docs in `node_modules/next/dist/docs/`. Keep them committed.
