# Local development

**What it is.** How the API and the apps run on a developer's machine.

**Who uses it.** Every developer.

## First run

**`node init.js`** at the repo root does all of it: it asks for the environment, the database connection and your repository (and, only when a project is created from the starter, its name), writes the three `.env` files with new secrets, creates the database with the migrations, installs the packages, creates the first Super Admin and sets up git. `--dry-run` shows what it would do. It runs once per machine: when this copy is already set up (`apps/api/.env` exists) it does nothing unless `--force` (new `.env` files with new secrets, which sign everyone out); a database with tables is never touched.

By hand, the same steps:

1. **Database:** MySQL 8. Create one and apply the base migrations ([migrations README](../../../apps/api/src/database/migrations/README.md)):

   ```bash
   mysql -u root -p -e "CREATE DATABASE <name> CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
   cd apps/api && for f in src/database/migrations/*.sql; do mysql -u root -p <name> < "$f"; done
   ```

2. **`.env` files:** in `apps/api`, `apps/manage` and `apps/web`, copy `.env.example` to `.env`. In the API's: `DB_*` (with the database password), two new secrets `JWT_SECRET` / `JWT_REFRESH_SECRET` (`openssl rand -hex 32`, different) and `LOG_INGEST_KEY` (the same value in all three files). `.env` files are never committed.
3. **Packages:** `npm ci` in each app.
4. **First Super Admin:** `npm run cli user/create-super-admin "<name>" <email> <10-digit mobile> confirm` in `apps/api`; it prints the password once.
5. **Run them:** with pm2 from your own copy of the local process file ([environments/README.md](../../../environments/README.md)), or one terminal each: `npm run dev` in `apps/api`, `apps/manage`, `apps/web`.

## Ports

| App | Port (the example's default) | pm2 name |
|---|---|---|
| api | 8030 | `api.workshop-witw` |
| web | 3040 | `web.workshop-witw` |
| manage | 3041 | `manage.workshop-witw` |

Change them in your own `environments/ecosystem.local.config.js` (git-ignored) when something else on your machine uses them, and set the API's `PORT`, `CORS_ORIGIN`, `APP_URL_*` and the apps' `NEXT_PUBLIC_API_URL` to match.

## Hostnames (optional)

Opening the apps through local hostnames (e.g. `manage.<project>.local`, `api.<project>.local`, via nginx) makes cookies behave as on a server:

- the API's `AUTH_COOKIE_DOMAIN` is the shared parent (`.<project>.local`), and `CORS_ORIGIN` lists every app's address;
- each app's `NEXT_PUBLIC_API_URL` points at the API's hostname, and `DEV_ALLOWED_ORIGINS` lists the app's own hostname;
- once an app's API URL uses a hostname, open the app by its hostname too: by its raw port every API call is cross-origin and fails.

## Rules

- **A `.env` change needs a restart** of that process; a `NEXT_PUBLIC_*` change needs a rebuild for production builds.
- **Deleting an app's `.next` folder needs a restart** of its dev server, else every route answers 500.
- **Server-side instrumentation loads once:** a logger change needs a dev-server restart.
- **Test data** is named `ct_*` and removed by that name after the test.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
