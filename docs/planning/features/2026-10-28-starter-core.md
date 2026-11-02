# Starter core

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-28 |
| Shipped | 2026-10-28 |
| Apps | api / manage / web |
| Test cases | TC-START-01..12 |
| How it works | [docs/how-it-works/README.md](../../how-it-works/README.md) |

## 1. Requirement (as given)

> "So you are suggesting that we need to create an repo with those rules so it will alwasy start with it?" … "let's create the starter code" (user, 2026-10-28)

> "and also we need the tech docuemntation section also in the repo" (user, 2026-10-28)

A starter repository that every new project begins from: the rules (`AGENTS.md`), the working core of the API and the console, and one example portal app, with no business features and no project names.

## 2. Plan

The code is copied from an existing project built on these rules, then every business part and every project name is removed. Nothing business-specific stays.

### What goes in

**API (`apps/api`)**

- `config/`, `core/`, `database/` (connection, transactions), `routes/`, `server.ts`, `app.ts`, `worker.ts`
- `infrastructure/`: `email` (capture driver), `storage` (local driver), `process` (the worker's command runner); `payment`, `sms`, `queue`, `cache` as empty folders listed "not built" in its README
- `cli/`: the framework (`lib/`), `HealthController`, `ExampleController`, `AppLogController`, `UserController` (`user/create-super-admin`), `job/` (the worker's command list). No old-data copy commands
- Modules: `health`, `auth` (sign-in, refresh, sign-out, forgot / reset password), `users` (users, roles in `meta_role`), `audit`, `system-log` (Error Logs in `app_log`, System Logs viewer of every app's files, the apps' log ingest), `jobs` (schedules, runs, worker, queue), `language` (languages, App Translations, publish, data translations), `mail` (templates in `mail_template`, send through the adapter, Sent Email Log)
- Base migrations: one per module, in the base set

**manage (`apps/manage`)**

- Sign-in, forgot / reset password, the console frame (header, sidebar, language switch, phone drawer), the dashboard (empty cards)
- Users, Roles
- Audit Log, Error Logs, System Logs, Email Templates, Sent Email Log
- Background Jobs (Scheduled, One-time, Logs, Run Command)
- Languages (Language Master, App Translations)
- Tech Documentation (the repo's `docs/` with search, PDF, Download .md)
- 403 / 404 / 500 / loading pages, the logger with `/client-logs`, translations

**web (`apps/web`)**: the example portal: a public website (welcome page, sign-in, forgot / reset password), the signed-in portal with its menu bar and an empty dashboard, the logger, translations, error and loading pages. It shows the skeleton every new app copies.

**Repo**: `AGENTS.md` (the rules), `CLAUDE.md`, `environments/` (local example, staging, production pm2 files), `docs/` (how-it-works for every part above, planning template, `PROTOTYPE-SYNC.md`, the Word generator with the technical document skeleton), `.gitignore`.

### What does not go in

Every business module and screen of the source project (its communities, partners, orders, reports, contacts, masters other than the languages, notifications, comments, announcements), its old-data copy commands, its prototype, its names, domains, ports and data.

### Phases

1. Repo skeleton: rules, docs skeleton, this plan, `environments/`, `.gitignore`
2. API core: config, core, database, infrastructure, CLI framework, health
3. API modules: audit, auth and users, mail, system-log, jobs, language; base migrations
4. manage
5. web
6. Docs for every part; technical document skeleton; Word generator
7. Checks (§3), then the user commits

### Open questions

- Q1. The prototype repo (`starter_prototype`): added as `docs/prototype` when its first content exists (user, 2026-10-28: clone it only once we start adding its details).

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-START-01 | Blank database | MySQL 8 | create a database, apply every base migration in order | no error; every table created | H |
| TC-START-02 | API starts | `.env` from `.env.example` | `npm run dev` in `apps/api` | `GET /api/health` 200 | H |
| TC-START-03 | First Super Admin | blank database | the CLI command that creates the first Super Admin | can sign in to manage | H |
| TC-START-04 | Checks | | `tsc`, `lint` in api, manage, web; `build` in manage, web | pass | H |
| TC-START-05 | No source names | | search the repo for the source project's names, domains and business words | nothing found | H |
| TC-START-06 | Console screens | signed in as Super Admin | open every menu entry | every page loads, no 500 | H |
| TC-START-07 | Audit | | add a user, edit a role | both in the Audit Log with their changes | H |
| TC-START-08 | Error Logs | | cause a server error in web | it shows in Error Logs with method, URL, IP | M |
| TC-START-09 | Background Jobs | worker enabled | run `health` from Run Command | run Done with its output | M |
| TC-START-10 | Languages | | add Hindi, translate "Save", publish | the console's switch shows हि; Save shows in Hindi | M |
| TC-START-11 | Tech Documentation | | open it, search, Download .md | the docs tree shows; the file downloads unchanged | M |
| TC-START-12 | Forgot password | mail driver capture | ask for a reset | the mail is in the Sent Email Log; the link resets the password | M |

## 4. Decisions

- 2026-10-28 (user): a starter repository `starter_nodejs-nextjs` with the rules and the working core, so every new project starts from it.
- 2026-10-28 (user): **copied from the existing project and stripped**, not written fresh.
- 2026-10-28 (user): apps **api, manage and one example portal**. Its name `web` is the agent's choice (the name the rules use for a public website + portal app); the user may rename it.
- 2026-10-28 (user): the console app is named **`manage`**.
- 2026-10-28 (user): core = health, auth and users, audit, Error and System Logs, Background Jobs, Languages, plus **Mail**, the **Tech Documentation** section, and **file storage with the profile photo**. Not: location masters.
- 2026-10-28 (user): the prototype repo is cloned only when its content is added, inside the starter as `docs/prototype`.
- 2026-10-28 (user, asked whether My Profile should be basic, basic + address, or everything): "i think we don't need the profile". **No My Profile** in the API, manage or web; ~~file storage with the profile photo~~ (superseded the same day: no profile, so no profile photo). The storage adapter (`infrastructure/storage`, local driver) stays, unused until a project adds its first upload.
- 2026-10-28 (user): **Super Admin is the only role** (`meta_role`); each project adds its own roles in its own migration.
- 2026-10-28 (user, on the first `AGENTS.md`, a copy of the long architecture template: "why agents.md file is too diffrent then the actual working project" … "we are writing them as a tempaltes but dosent smean we write it like this" … "we decied it to copy tthe detailing form the workign project"): **`AGENTS.md` follows the working project's `AGENTS.md`**: the same sections, rules and wording, short, each rule linking to its doc in `docs/how-it-works/`; only the source project's own parts are left out (its apps, ready boards, business areas, hostnames). ~~`AGENTS.md` = the architecture template, adapted~~ (superseded). The details live in `docs/how-it-works/`, copied from the working project in phase 6. Added from the user's other project: the `environments/` rule.

- 2026-10-28 (user: "now do all of the pending work" … "Pick ui according to your recomandation don't wait for me" … "jsut build evertyhign"): the agent made the remaining UI calls without asking:
  - console header: no notifications bell (no in-app notifications in the core), no Extensions panel (it linked only to the source project's other sites), initials instead of a profile photo (no My Profile);
  - email screens: **Email Templates** (`/email/templates`) and **Sent Email Log** (`/email/sent-log`), email only, reusing the source's table, filter-bar and dialog markup;
  - dashboard: the Users count and cards linking to the platform pages;
  - Roles page: search and status only (roles have no group or level in the starter); Users page: no portal filter or column;
  - `web`: a copy of manage's skeleton, any signed-in user, menu Dashboard only, header "Portal", a welcome card;
  - error pages' Contact Support button: `NEXT_PUBLIC_SUPPORT_URL` (empty = shown, not clickable) in place of the source's extension link settings;
  - console stylesheets: the source's styles for screens not in the starter stay (they are mixed with styles still in use); only the source's names were removed. Pruning them is a later clean-up.

- 2026-10-28 (user: "fix if anything remaing"): the leftover styles and dead files removed (log below). Kept on purpose: the shared UI kit in `components/ui/` and `lib/` (searchable select, pager, number and mobile inputs, translation fields …) that new screens are built from, even where no starter page uses a piece yet.
- 2026-10-28 (user: "create a own favicon do not use the niwasi favicon" … "chnege and pick a diffrent colors for the superadmin"): the agent's choices: the console (manage) is **teal** (`#0F766E`, hover `#0D635C`, active `#0B524C`, soft `#ECF7F5` / `#BFE3DE`; white text on it about 5.5:1); web keeps its purple. Each app's favicon is a white shield with a check (the header's mark) on a rounded square in the app's colour, 16–64 px.
- 2026-10-28 (user: "add a welsome page for the web that describe few detaisl about this temaplte what it is how they can install it and make it their new project skeleton"): web's public home `/` is a **welcome page** (what the template is, what is inside, install it locally, make it your new project); the signed-in dashboard moved to `/dashboard`.
- 2026-10-28 (user: "run the app in localhost url direct do not need to run on m2 for now"): the three apps run with `npm run dev` on localhost (no pm2), against a local database `starter_local`, for the user to look at.

- 2026-10-28 (user: "web frontent should be like a web portal not like a backend" … "login page should be in website layout same as the super admin" … "i still see the old color in the web" … "pick another color insted of green"): web is a portal, not a copy of the console: its public pages in a website frame (top bar, footer), its signed-in pages a header with a horizontal menu bar (the design system's `app top` layout, the pattern of an existing portal), no sidebar. Colours, the agent's choices: ~~the console teal~~ (superseded the same day: the user did not want green) **the console slate** (`#334155`, hover `#1E293B`, active `#0F172A`, soft `#F1F5F9` / `#CBD5E1`), **web blue** (`#1D4ED8`, hover `#1E40AF`, active `#1E3A8A`, soft `#EFF4FF` / `#C7D7FE`); favicons in the same colours.
- 2026-10-28 (user, on the welcome page's `git clone <your repository URL>`: "if we clone it into another repo did it works or it will said it's alredy a repo" … "write the correct git url i alredy givein that to you"): the install step names the starter `git@github.com:aayush-cmd/starter_nodejs-nextjs.git` and gives two ways: Use this template then clone the new repository, or clone the starter, delete `.git`, `git init -b main` and add the new repository as `origin`; always into an empty folder outside another repository. README the same.

- 2026-10-28 (user: "update the above approach"): a new project starts with two commands: **degit** copies the starter without its history, and **`node init.js`** sets the copy up: environment, name, `.env` files with new secrets, database with migrations, packages, first Super Admin, git. "Use this template" stays as the other way.
- 2026-10-28 (user): the starter names no other framework or project as its inspiration: its setup is described as its own.
- 2026-10-28 (user: "add the password into .env and then re run as a dev without these argument"): the local `apps/api/.env` holds the MySQL password (git-ignored); the API runs with plain `npm run dev`.

- 2026-10-28 (user: "i alredy logined but insted of showing the sign out it still shwo the sign in"): the website frame shows the signed-in state: the person's name, Dashboard and Sign out (signed out: Sign in); the welcome page's main button becomes "Open your dashboard".

- 2026-10-28 (user: "agents.md file should be a seperat then this readme.md file beacus ethat is the part of the repo working not the tempalte"): **`AGENTS.md` holds only the rules for working in the repo; everything about the starter as a template (what it is, degit, starting a new project) is in `README.md`** and the welcome page. `init.js` stays in `AGENTS.md` as a repo tool (setting up a machine, staging, production), described without the renaming.

- 2026-10-28 (user: "create a another readme file after cloing the repo beacuse that current read.md file will be not useful after that"): `init.js` replaces the starter's `README.md` with one for the new project (title, a line to fill in, set up, run with the addresses, where things are, working in the repo), only when the project gets its own name and only while the README is still the starter's.

- 2026-10-28 (user: "keep it as you said, but once the setp or env id done then same command should not be run again? yes?"): `init.js` stays in every project as the machine setup; the one-time steps that make a project (name, renaming, README) are in `init-project.js`, run once at creation and then deleted; on a machine already set up (`apps/api/.env` exists) `init.js` does nothing unless `--force`.

- 2026-10-28 (user: "Install it locally … this is added on the welcome page that's fine but before it it will never be avalbe for those users who will install it? this should be on the readmd.md file"): the starter's `README.md` is the full install guide (what is inside, what you need, get a copy, set it up with every question and default, run, open with the addresses and sign-in, other ways, make it your project); the welcome page repeats it for after the install.

- 2026-10-28 (user: "acme_shop databse name should be same as the project name but starter_db"): a database is named after the project with `_db`: `starter_db`, `acme_shop_db`; on servers `acme_shop_stag_db`, `acme_shop_prod_db` (the guides' `<project>_stag_db`, `<project>_prod_db`).
- 2026-10-28 (user, on the README's explanation under the degit command: "why you need to write it here?"): the install steps give the commands without explaining degit; the same explanation is removed from the welcome page.

## 5. Execution log

- 2026-10-28 — Phase 1, repo skeleton: `AGENTS.md` (the rules, with this repo's apps `manage` and `web`; §24 still the general bootstrapping order, to be rewritten as "starting a new project from this starter" in phase 6), `CLAUDE.md`, `.gitignore`, `environments/` (README with the port table, local example, staging and production pm2 files; local defaults web 3040, manage 3041, api 8030 (clear of the other projects on this machine)), `docs/README.md`, `docs/PROTOTYPE-SYNC.md` (empty), `docs/how-it-works/README.md` and `TEMPLATE.md`, `docs/planning/TEMPLATE.md`, this plan.
- 2026-10-28 — Phases 2–3, API: copied `config`, `core`, `database`, `infrastructure` (email, storage, process; payment left out), `routes`, `cli` (framework, health, example, app-log, job) and the modules health, audit, auth, users, mail, system-log, jobs, language; then stripped:
  - users: no My Profile, profile photo, educations, achievements, default community / partner, old-data copy, portal column; roles without group / level; `meta_role` holds only 100 Super Admin.
  - auth: sign-in, refresh, sign-out, me, change password, forgot / reset password; no sign-up paths (community, partner staff, customer), no Aadhaar sign-in, no old PHP password hashes, no old cookie names.
  - client apps `ClientApp` 1 manage, 2 web, 3 CLI, 4 system; language places 1 Manage, 2 Web Portal, 3 Web Website; log sources 1 api, 2 manage, 3 web.
  - audit codes renumbered for the starter: modules 1 users, 2 auth, 3 system-log, 4 language, 5 jobs; actions in each module's hundred; entities 1–7.
  - language: no old-data copy (`importLegacy`, `copy-hindi-columns`); English the only seeded language; `app_translation` starts without a `hi_text` column (the API adds `<code>_text` when a language is added).
  - core: no Aadhaar / PAN / GSTIN checks; config without payment, the old database and the old app URLs (`APP_URL_MANAGE`, `APP_URL_WEB`).
  - new CLI `user/create-super-admin <name> <email> <mobile> [confirm]`: dry run by default; prints a random password once.
  - base migrations (2026-10-28): users-and-auth, audit-log, app-log, mail, languages, background-jobs.
  - Checks: `tsc` and `lint` clean in `apps/api`.
  - TC-START-01 PASS: a blank database `starter_check` built from the six files, 15 tables, no error.
  - TC-START-02 PASS: `npm run dev` on 8030, `GET /api/health` 200, database up.
  - TC-START-03 PASS (API side): the dry run wrote nothing; with `confirm` user 1 got Super Admin; signing in with `X-Client-App: manage` worked; `auth/me`, `console-roles`, users, roles, audit logs, app logs, log files, job schedules, job commands, languages, app translations, mail logs and templates all answered 200; audit shows `USER_CREATED` (CLI) and `SIGNED_IN` (MANAGE). The console screens are still to be checked in phase 4.
  - The test database `starter_check` is kept for phases 4–5 and dropped at the end; the local `apps/api/.env` (git-ignored) points at it, with the database password given only at run time.

- 2026-10-28 — Phase 4, manage: copied the app, deleted every business route, component, service and type; console access = Super Admin only (`lib/console-access.ts`, area `platform`); the menu (Dashboard; User & Role; System › Email, Logs, Background Jobs, Languages, Tech Documentation); the email screens, dashboard, Users / Roles changes and header changes above; client app, log sources, language places and log apps set to manage / web; config without the source's extension links; source names removed from texts, footer, CSS comments and the PDF header; unused icons removed. A first copy skipped every folder named `translations`, which dropped the App Translations route; it was copied in afterwards (no other folder was affected). `tsc`, `lint`, `build` clean.
- 2026-10-28 — Phase 5, web: copied manage's skeleton (`(public)` sign-in and forgot password, `(portal)` frame), removed the console screens and role checks; `X-Client-App: web`; port 3040. `tsc`, `lint`, `build` clean.
- 2026-10-28 — Phase 6, docs: copied and cleaned `platform/` adding-a-module, sql-transactions, logging, frontend-logging, background-jobs and `modules/` audit, jobs, mail, system-log, language; written for the starter: platform frontend-apps, manage-console, file-storage, local-development, the folder indexes, modules auth and users, roles super-admin, workflows README, technical document (skeleton: project sections to be written by each project), staging and production deployment; `PROTOTYPE-SYNC.md` lists the starter's screens as "ours, no board"; root `README.md` says how a new project starts from the starter. Word generator copied, configured for the technical document and the two deployment guides; `npm run build` and `npm run check` pass. Links checked: none broken apart from the two templates' placeholders.
- 2026-10-28 — Phase 7, checks (test database `starter_check`, test users `ct_*`, headless Chrome):
  - TC-START-03 PASS (console): a Super Admin made by the CLI signs in to manage; the dashboard shows Users 2.
  - TC-START-04 PASS: `tsc` and `lint` in api, manage, web; `build` in manage and web.
  - TC-START-05 PASS: no source project name, domain, hostname, port or business word left in the repo (the plan describes what was removed in general words).
  - TC-START-06 PASS: all 12 console pages answer 200 inside the frame with their own titles; 390 px: no sideways scroll; web: sign-in, Dashboard, unknown address → the 404 card inside the frame.
  - TC-START-07 PASS: Add User `ct_audit`, then Edit (name, Super Admin role) → audit `USER_CREATED`, `USER_UPDATED` from MANAGE.
  - TC-START-08 PASS: a browser error raised in web → Error Logs row, source web (3), category `browser.console`, with the IP.
  - TC-START-09 PASS: Run Command `health/check` → run Done, exit 0, output "Database: up".
  - TC-START-10 PASS: add Hindi (its `hi_text` column added by the API), translate "Dashboard", Publish → `hi.json` and `languages.json` in manage and web; web's switch shows EN / हि, and हि shows डैशबोर्ड.
  - TC-START-11 PASS: Tech Documentation lists the docs; a doc opens; Download .md gives the file byte for byte.
  - TC-START-12 PASS: forgot password from web → `password_reset` mail captured in the Sent Email Log; its link reset the password; sign-in with the new password worked.
  - Clean-up: the test servers stopped; `starter_check` dropped (it held only the 4 `ct_*` users and their rows); the test logs, the published translation files and the local `.env` files removed; scratch files deleted. Nothing committed: the user commits.

- 2026-10-28 — Leftovers: unused files removed (`components/ui/avatar-photo.tsx`, `logo-badge.tsx` in both apps); the console stylesheets pruned per app, removing every rule whose classes no source of that app uses (classes built in code, `is-${…}`, count as used; `globals.css` untouched): manage `console-extras.css` 85 → 32 KB (603 rules), `console-mobile.css` 10 → 4 KB; web `console-extras.css` 85 → 9 KB, `console-mobile.css` 10 → 4 KB. **Checked by screenshots** of all 16 console views, 4 dialogs / menus, web's pages, the sign-in and forgot-password pages and the phone drawer, at 1366 and 390 px, before and after: only the data that changes on its own differed (new audit rows, log sizes, the server clock). `tsc` and `lint` clean.
- 2026-10-28 — Colours and favicons: the console's `[data-portal="admin"]` tokens and its menu section colour are teal; new favicons in both apps (the source's file is gone). Checked: Users page and sign-in page in teal, `/favicon.ico` served.
- 2026-10-28 — Welcome page: `apps/web/src/app/(public)/page.tsx` with its own `welcome.module.css` (the app's tokens only); dashboard at `/dashboard`; sign-in, the "already signed in" redirect and the menu point there. Checked in Chrome: `/` 200 at 1366 and 390 px with no sideways scroll and no page error; Sign in → `/dashboard`; `/login` while signed in → `/dashboard`.
- 2026-10-28 — Web as a portal: `components/website/website-shell.tsx` + `website.module.css` (top bar, footer) wrap the welcome, sign-in and forgot-password pages; the signed-in frame uses `app top` with `PortalNav` (Dashboard, Welcome) instead of the sidebar; web's own palette `[data-portal="web"]` blue, the console's `[data-portal="admin"]` slate; new favicons. Found and fixed: the design stylesheet's second `.app.top` rule (for a frame with a sub-menu row) squeezed the page into a 44 px row; web's `console-extras.css` sets the plain rows. Removed the files only the sidebar used (`console-sidebar.tsx`, `drawer-language-bar.tsx`, `console-section-icons.tsx`, `console-icons.tsx`, `use-drawer-tools.ts`). Checked in Chrome at 1366 and 390 px: web sign-in in the website frame, dashboard under the blue menu bar, no sideways scroll, no page error; the console's sign-in and Users in slate. `tsc`, `lint`, `build` clean in both apps.
- 2026-10-28 — `init.js` (root, Node built-ins only): questions with defaults (flags answer them; `--yes` or no terminal = defaults), `--dry-run`, `--force`; rename list (local process names, environments README, local-development doc, `DB_NAME` / `MAIL_FROM` in the API's example, the API's description); `.env` for development / staging / production (ports, addresses, cookie domain and prefix, log levels as the deployment guides), new JWT secrets and one log key for all three; database defaults from an existing `apps/api/.env`; database created and migrations applied only when it has no tables; `npm ci`; the first Super Admin through the CLI; `git init -b main` and `origin`, or a warning when `origin` still points at the starter. Tested on a fresh copy (no `.git`, `.env`, packages) with a test database: first run did every step (15 tables, Super Admin user 1, remote set); second run kept everything; production run wrote 4210, `https://` addresses, `.domain` cookies, `error,warning`; dry run on the real repo wrote nothing. Test database dropped, the copy's `.env` files removed. degit itself is not tested yet: the starter repository on GitHub has no commit.
- 2026-10-28 — Website frame: `components/website/site-account.tsx` (Sign in, or Dashboard and Sign out); the frame reads the session on the server (`consoleSession`). Checked in Chrome: signed out → Sign in; signed in → name, Dashboard, Sign out, hero "Open your dashboard"; Sign out → back to Sign in. `init.js --help` lists every flag.
- 2026-10-28 — `init.js` writes the project's README. Checked on a fresh copy: a new name → README "# Acme Shop", its links all resolve; second run → kept; the starter itself (no new name) → the starter's README kept.
- 2026-10-28 — `init.js` split: `init-project.js` (project name, renaming, project README, the warning when `origin` still points at the starter) is run once at creation and deleted; the database name defaults to the renamed `.env.example`; already set up → "nothing to do" unless `--force`. Checked on a fresh copy: create → renamed, README, `init-project.js` removed, `.env` written; again → nothing to do; a fresh clone of the project without `.env` → "Machine setup" with no name question, `DB_NAME=acme_shop`; `--force` → set up again; the starter itself → name and README kept, `init-project.js` kept.
- 2026-10-28 — Database names end in `_db` (`.env.example` `starter_db`; `init.js` defaults; the rename; the guides; the API README). Checked on fresh copies: new project `acme_shop_db` (example renamed too), second machine `acme_shop_db`, staging `acme_shop_stag_db`, the starter unnamed `starter_db`.
- 2026-10-28 — Tested the README's commands end to end in a new folder: `degit` copied the starter with no `.git`; `node init.js` renamed it, removed `init-project.js`, created `acme_shop_test_db` with the six migrations, installed the packages, created the Super Admin and ran `git init` (no first commit: the project's first commit is the developer's); a second run did nothing; the three apps started with `npm run dev`, health answered with the database up, the console sign-in worked.
- 2026-10-28 — Found by reading an installed copy: §2 still listed what the decisions removed or added. Fixed §2: `UserController` instead of `LanguageController` (the language CLI was never copied), no My Profile in the API, manage or web, Email Templates in the mail module and the console, web as a public website plus the signed-in portal. The how-it-works index's example no longer names a My Profile doc.

## 6. Post-deploy
