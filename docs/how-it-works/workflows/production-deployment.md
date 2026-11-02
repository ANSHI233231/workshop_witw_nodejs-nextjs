# Production deployment

**What it is.** How the production (live) copy is set up on a server, how it goes live on the real names, and how to update it. Production runs from the **`main` branch**; staging runs from `staging` and may share the server ([staging deployment](staging-deployment.md)).

**Who uses it.** Whoever deploys or maintains the live server.

**No secrets and no server addresses in this doc.** Passwords, tokens and generated secrets live only in the server's `.env` files.

## At a glance

| | |
|---|---|
| Server | an Ubuntu server with nginx, pm2, Node.js 20.9 or newer, npm and MySQL 8 |
| Code | `~/prod_<project>` (clone of the repository, branch **`main`**) |
| Database | `<project>_prod_db` |
| Process manager | pm2, `environments/ecosystem.prod.config.js` (in the repository) |
| Web server | nginx, `/etc/nginx/sites-available/prod_<project>` |
| Certificate | Let's Encrypt, certificate name `prod-<project>` |

| Address | App | Port (local only) | pm2 name |
|---|---|---|---|
| `https://<domain>` | web | 4200 | `prod-web` |
| `https://manage.<domain>` | manage | 4201 | `prod-manage` |
| `https://api.<domain>` | api | 4210 | `prod-api` |

Every process listens on `127.0.0.1` only.

## Going live: the order

1. **Prepare production fully** on its ports only (`node init.js --env=production` writes the `.env` files for the real names and new secrets): code, `.env` files, database, build, pm2 (the staging guide's steps 2 and 4–6, with `prod` names, ports 4200–4210, branch `main`, no cookie prefix). Nothing is reachable from outside yet; check it on the server with `curl http://127.0.0.1:4210/api/health`.
2. **Free the real names:** no other nginx site on the server may still list them (`sudo nginx -T 2>/dev/null | grep server_name`).
3. **Enable production's nginx site and certificate**, as in the staging guide's step 3 with the real names and `prod_port` / `prod-<project>`.
4. **Copy any old data** a feature needs (every copy command is safe to run again), then publish the translations from the console.
5. **Check** (below).

## Settings that differ from staging

- **`apps/api/.env`:** `PORT=4210`, the `<project>_prod_db` database, `CORS_ORIGIN=https://<domain>,https://manage.<domain>`, **new** JWT secrets and `LOG_INGEST_KEY` (never staging's), `AUTH_COOKIE_PREFIX` empty, `LOG_LEVELS=error,warning`.
- **The apps' `.env`:** `NEXT_PUBLIC_API_URL=https://api.<domain>/api`, `NEXT_PUBLIC_AUTH_COOKIE_PREFIX` empty.
- **Mail:** the starter's email driver is `capture` (mails are recorded, not sent). A live mail driver is its own feature before go-live.

## Updating production

As staging, in `~/prod_<project>` with `git pull origin main` and the `prod-*` process names: note the new migrations, `package-lock.json` and `.env.example` changes; back up, apply new migrations in date order, update `.env` files, `npm ci` where the lockfile changed, build and restart the apps whose code changed, run new data commands (dry run first), and check.

## Checks

- `pm2 ls`: `prod-api`, `prod-manage`, `prod-web` online.
- `https://api.<domain>/api/health` answers 200 with the database up.
- Signing in to `https://manage.<domain>` works; a staging sign-in in the same browser stays separate (different cookie names).

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
