# Staging deployment

**What it is.** How the staging copy (the API and the apps) is set up on a server, and how to update it. Staging runs from the **`staging` branch**; production runs from `main` and may share the server ([production deployment](production-deployment.md)) without either touching the other. Ports of both: [environments/README.md](../../../environments/README.md).

**Who uses it.** Whoever deploys or maintains the staging server.

**No secrets and no server addresses in this doc.** Passwords, tokens and generated secrets live only in the server's `.env` files.

## At a glance

| | |
|---|---|
| Server | an Ubuntu server with nginx, pm2, Node.js 20.9 or newer, npm and MySQL 8 |
| Code | `~/stag_<project>` (clone of the repository, branch **`staging`**) |
| Database | `<project>_stag_db` |
| Process manager | pm2, `environments/ecosystem.stag.config.js` (in the repository) |
| Web server | nginx, `/etc/nginx/sites-available/stag_<project>` |
| Certificate | Let's Encrypt, certificate name `stag-<project>` |

| Address | App | Port (local only) | pm2 name |
|---|---|---|---|
| `https://stag.<domain>` | web | 4100 | `stag-web` |
| `https://stag-manage.<domain>` | manage | 4101 | `stag-manage` |
| `https://stag-api.<domain>` | api | 4110 | `stag-api` |

Every process listens on `127.0.0.1` only; the outside world reaches them through nginx.

## Updating staging

The usual task. Run in `~/stag_<project>`:

1. **Pull**, and note what came in:

   ```bash
   cd ~/stag_<project> && git pull origin staging
   git diff --name-only HEAD@{1} HEAD -- apps/api/src/database/migrations/ 'apps/*/package-lock.json' 'apps/*/.env.example'
   ```

2. **New migration files:** back up the database (below), then apply each new file once, in date order (`mysql -u <user> -p <project>_stag_db < <file>.sql`). Never re-run a file that was already applied.
3. **A changed `.env.example`:** add the new settings to that app's `.env`.
4. **Build and restart the apps whose code changed.** Run `npm ci` first only when that app's `package-lock.json` changed:

   ```bash
   cd ~/stag_<project>/apps/<app> && npm run build && pm2 restart stag-<app>
   ```

5. **New data commands** a feature's plan names: run them as a dry run, read the counts, then with `confirm`.
6. **Check:** `pm2 ls` (every `stag-*` online) and `curl -s https://stag-api.<domain>/api/health`.

`NEXT_PUBLIC_*` settings are built into an app: after changing one, rebuild that app. Any other `.env` change needs only a restart.

## Setting up from scratch

### 1. Domain names

Point `stag.<domain>`, `stag-manage.<domain>` and `stag-api.<domain>` at the server (a wildcard record works). Check with `dig +short stag-api.<domain>`.

### 2. Code

```bash
cd ~ && git clone --branch staging <repository URL> stag_<project>
```

`docs/prototype` is not needed on the server.

### 3. nginx and HTTPS

`/etc/nginx/sites-available/stag_<project>` serves all the names; a `map` picks the port:

```nginx
map $host $stag_port {
    stag.<domain>          4100;
    stag-manage.<domain>   4101;
    stag-api.<domain>      4110;
}

server {
    listen 80;
    server_name stag.<domain> stag-manage.<domain> stag-api.<domain>;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:$stag_port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stag_<project> /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx --cert-name stag-<project> -d stag.<domain> -d stag-manage.<domain> -d stag-api.<domain>
```

### 4. The `.env` files

`node init.js --env=staging` (in `~/stag_<project>`) asks for the domain and the database and writes all three files below, with new secrets; or write them by hand:

Each app's `.env` is copied from its `.env.example` and written on the server only, never committed. Generate **new** secrets with `openssl rand -hex 32`: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `LOG_INGEST_KEY` (the same key in all three files).

- **`apps/api/.env`:** `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=4110`, the `DB_*` of `<project>_stag_db`, `CORS_ORIGIN=https://stag.<domain>,https://stag-manage.<domain>`, the JWT secrets, `AUTH_COOKIE_DOMAIN=.<domain>`, `AUTH_COOKIE_PREFIX=stag_`, `MAIL_FROM`, `STORAGE_LOCAL_ROOT`, `WORKER_ENABLED=true`, `APP_URL_MANAGE`, `APP_URL_WEB`, `LOG_ENABLED=true`, `LOG_LEVELS=error,warning,info`, `LOG_INGEST_KEY`, `LOG_VIEWER_DIRS`, `TRANSLATION_DIRS`.
- **`apps/manage/.env`, `apps/web/.env`:** `NEXT_PUBLIC_API_URL=https://stag-api.<domain>/api`, `NEXT_PUBLIC_AUTH_COOKIE_PREFIX=stag_`, `NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN=.<domain>`, `LOG_ENABLED=true`, `LOG_INGEST_KEY`.

The cookie prefix keeps the staging and production sign-ins apart on the same parent domain.

### 5. Database

```bash
mysql -u root -p -e "CREATE DATABASE <project>_stag_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
cd ~/stag_<project>/apps/api && for f in src/database/migrations/*.sql; do mysql -u <user> -p <project>_stag_db < "$f"; done
```

The API's database user needs `ALTER` on `app_translation` (a new language adds its column).

### 6. Build and start

```bash
cd ~/stag_<project>
for a in api manage web; do (cd apps/$a && npm ci && npm run build); done
pm2 start environments/ecosystem.stag.config.js && pm2 save
cd apps/api && npm run cli:dist user/create-super-admin "<name>" <email> <mobile> confirm
```

The last command prints the first Super Admin's password once.

### 7. Backups

Before applying migrations or a data command:

```bash
mkdir -p ~/db-backups
mysqldump -u <user> -p --single-transaction --routines --triggers --no-tablespaces <project>_stag_db | gzip > ~/db-backups/<project>_stag_db-$(date +%F-%H%M).sql.gz
gzip -dc ~/db-backups/<file>.sql.gz | tail -1
```

The last line must say "Dump completed".

## Checks

- `pm2 ls`: `stag-api`, `stag-manage`, `stag-web` online.
- `https://stag-api.<domain>/api/health` answers 200 with the database up.
- Signing in to `https://stag-manage.<domain>` works, and the API's `logs/info.log` shows `[jobs] Worker started`.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
