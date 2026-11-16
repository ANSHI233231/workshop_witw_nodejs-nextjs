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

2. **`.env` files:** in `apps/api`, `apps/manage`, `apps/web` and `apps/partner`, copy `.env.example` to `.env`. In the API's: `DB_*` (with the database password), two new secrets `JWT_SECRET` / `JWT_REFRESH_SECRET` (`openssl rand -hex 32`, different) and `LOG_INGEST_KEY` (the same value in every file). `.env` files are never committed.
3. **Packages:** `npm ci` in each app.
4. **First Super Admin:** `npm run cli user/create-super-admin "<name>" <email> <10-digit mobile> confirm` in `apps/api`; it prints the password once.
5. **Run them:** with pm2 from your own copy of the local process file ([environments/README.md](../../../environments/README.md)), or one terminal each: `npm run dev` in `apps/api`, `apps/manage`, `apps/web`, `apps/partner`.

## Ports

| App | Port (the example's default) | pm2 name |
|---|---|---|
| api | 8030 | `api.workshop-witw` |
| web | 3040 | `web.workshop-witw` |
| manage | 3041 | `manage.workshop-witw` |
| partner | 3042 | `partner.workshop-witw` |

Change them in your own `environments/ecosystem.local.config.js` (git-ignored) when something else on your machine uses them, and set the API's `PORT`, `CORS_ORIGIN`, `APP_URL_*` and the apps' `NEXT_PUBLIC_API_URL` to match (also web's `NEXT_PUBLIC_PARTNER_PORTAL_URL` and partner's `NEXT_PUBLIC_WEBSITE_URL`, which point at each other).

## Hostnames (optional)

Opening the apps through local hostnames (e.g. `manage.<project>.local`, `api.<project>.local`, via nginx) makes cookies behave as on a server:

- the API's `AUTH_COOKIE_DOMAIN` is the shared parent (`.<project>.local`), and `CORS_ORIGIN` lists every app's address;
- each app's `NEXT_PUBLIC_API_URL` points at the API's hostname, and `DEV_ALLOWED_ORIGINS` lists the app's own hostname;
- once an app's API URL uses a hostname, open the app by its hostname too: by its raw port every API call is cross-origin and fails.

## Local test accounts

Accounts to sign in with on a local database, all with one password that you choose and give only on the command line (it is never written in code, docs or git):

```bash
cd apps/api
npm run cli local-accounts/add <password>          # dry run: lists what it would create
npm run cli local-accounts/add <password> confirm   # creates them
npm run cli local-accounts/remove confirm           # removes them and only their rows
```

| Account | Email | What it is | Signs in to |
|---|---|---|---|
| Super Admin | `anshika@example.in` | Super Admin role | Console |
| Partner | `partner@example.in` | Active partner "Tiger Song Safaris": logo, Kanha, Bandhavgarh and Tadoba-Andhari, one approved gallery, two live packages | Partner portal and website |
| User | `user@example.in` | website user with one quote request to the partner's Kanha Escape | Website |

- Safe to run again: whatever is there is kept (its password too), nothing is duplicated. Refused in production. The data is in `apps/api/src/cli/controllers/local-accounts/`, the logo in `apps/api/seed/local-accounts/`.
- `remove` takes only these three accounts, their partner, logo, gallery, packages and quote requests. The Shared Safari sample users (`@example.test`), the Packages demo (`@packages-demo.test`) and every other account are never touched. Their storage folders (`storage/partner/<id>/`, `storage/gallery/<id>/`, `storage/package/<id>/`) go with them.
- A guest has no account: browse `/packages` and `/parks` signed out.
- Sign-in failing with "The mobile number, email, username or password is not correct." (`INVALID_CREDENTIALS`, audit action 202) means the password is wrong for that account, not a cookie or CORS problem.

## Rules

- **A `.env` change needs a restart** of that process; a `NEXT_PUBLIC_*` change needs a rebuild for production builds.
- **Deleting an app's `.next` folder needs a restart** of its dev server, else every route answers 500.
- **Server-side instrumentation loads once:** a logger change needs a dev-server restart.
- **Test data** is named `ct_*` and removed by that name after the test.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md), [2026-11-16-local-accounts-and-logo-field](../../planning/features/2026-11-16-local-accounts-and-logo-field.md)
