# Workshop Witw

What this project is and who it is for: write it here.

## Set it up

You need Node.js 20.9 or newer, npm, git and MySQL 8.

```bash
node init.js
```

Run it once on each machine (a new developer's computer, staging, production). It asks for the environment (development, staging, production) and the database connection, then writes the `.env` files with new secrets, creates the database with its migrations, installs the packages and creates the first Super Admin. `node init.js --help` lists its options; `--dry-run` shows what it would do. By hand: [docs/how-it-works/platform/local-development.md](docs/how-it-works/platform/local-development.md).

## Run it

```bash
cd apps/api && npm run dev
cd apps/manage && npm run dev
cd apps/web && npm run dev
```

Or with pm2: `pm2 start environments/ecosystem.local.config.js`.

| App | Address | What it is |
|---|---|---|
| web | http://localhost:3040 | The public website and the signed-in portal |
| manage | http://localhost:3041 | The Super Admin console |
| api | http://localhost:8030/api/health | The API |

## Where things are

| Path | What |
|---|---|
| `apps/api` | The API: Node.js, Express, MySQL, one folder per business module |
| `apps/manage` | The Super Admin console (Next.js) |
| `apps/web` | The website and portal (Next.js) |
| `environments/` | pm2 files and the ports of every copy ([README](environments/README.md)) |
| `docs/how-it-works/` | How every part works today |
| `docs/planning/features/` | One planning file per feature: requirement, decisions, test cases |
| `docs/prototype/` | The design prototype (its own repository): screens are designed there first |
| `docs/how-it-works/workflows/` | The technical document and the staging and production deployment guides |

## Working in this repo

Read [AGENTS.md](AGENTS.md) first: the rules for everyone working here, people and AI agents. Every feature starts with a planning file ([docs/planning/TEMPLATE.md](docs/planning/TEMPLATE.md)).
