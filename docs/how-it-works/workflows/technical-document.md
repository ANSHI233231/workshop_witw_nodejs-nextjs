# Technical Document

| | |
|---|---|
| Version | 0.1 (starter) |
| Date | 2026-10-28 |
| Purpose | Helps anyone joining or taking over the project understand how it is built and work on it correctly. |

**Who should read this**

| Reader | Read | To learn |
|---|---|---|
| **A developer joining the project** | All of it, then the documents listed in Section 8 | What the system is, how it is built and why, the rules to follow, and where everything is |
| **The development team** | Sections 3 to 8, as a reference | The core ideas, roles, architecture decisions, rules and way of working |
| **Product owner, testers and the business team** | Sections 1 to 4 | What the platform does, its words and ideas, and who can see and do what |
| **Anyone reviewing or taking over the project** | Sections 1, 5, 6 and 8 | Whether the system is soundly built and secured, and where the details are kept |

This document is an overview. How each part works in detail (screens, fields, rules, endpoints) is in `docs/how-it-works/`, and why it is that way in the planning files (Section 8). It is changed only when asked, one short line per concept.

## 1. What the product is

To be written by the project: what the product does, for whom, and which apps it has. The starter gives it a Super Admin console (`manage`) and an example portal (`web`).

## 2. Glossary

| Word | Meaning |
|---|---|
| App | One Next.js application under `apps/` (manage, web …) |
| Module | One business area of the API, in `apps/api/src/modules/<module>/` |
| Console | The manage app, for Super Admins |
| Super Admin | The system role that runs the platform |

## 3. Core concepts

- **One account, one session:** a person signs in once and is signed in on every app; what they may open is decided per app and, for real, by the API.
- **Audit:** every write is recorded with who, when, from which app and what changed.
- **Languages:** screen text is written in English and translated in the console; data text is translated per record.
- **Background jobs:** maintenance and later work run as CLI commands, scheduled or queued, managed in the console.

## 4. Roles and who sees what

| Role | App | Can |
|---|---|---|
| Super Admin | manage | Every console page ([roles/super-admin.md](../roles/super-admin.md)) |
| Signed-in user | web | The portal's pages |

## 5. Architecture, and why

```
            Browser
               │
       ┌───────┴───────┐
       ▼               ▼
     manage           web           one Next.js app per product
       └───────┬───────┘
               ▼
              API                   Node.js, /api/<module>
   ┌───────────┼───────────┐
   ▼           ▼           ▼
 MySQL    file storage   email

 CLI and worker (inside the API): maintenance, background and one-off tasks
```

| Decision | Why |
|---|---|
| **A separate frontend app per product**, no shared code package | Each product can change and be released on its own |
| **One API for all apps**, a **modular monolith** with enforced module boundaries | One place for every rule and every write, without the cost of separate services |
| **Hand-written SQL, no ORM** | Full control of queries and indexes; what runs is what you read |
| **One account and one session for all apps** | A person signs in once for every app; what they may open is still decided per app |
| **Files served by the API** behind each feature's access check | No public file links; where files are stored is a setting |
| **Outside services behind adapters** (email, SMS, payments, storage) | Modules never depend on a vendor; changing vendor is a new provider and a setting |
| **A CLI inside the API** for maintenance and one-off tasks | Tasks use the same modules and rules as the API; a task that changes data is a dry run unless confirmed |
| **Background jobs run by a worker the API starts**, each job a CLI command | No crontab or extra service to set up; a new background task is just a new CLI command |

Technology: Next.js, React, TypeScript and Tailwind CSS; Node.js with Express; MySQL; zod for validation; ESLint with boundary rules. Versions are in each app's `package.json`.

## 6. Rules developers follow

**Code**
- Each business area is one API module, layered `routes → controllers → services → repositories → sql`; business rules live in services and only repositories run SQL.
- A module writes only its own tables; reads may join anything.
- Every write records an audit event; writes that belong together run in one transaction.
- In the apps, only `services/` calls the API. No comments in code: explanations go in the docs.
- These boundaries are enforced by each app's lint.

**Database**
- Singular table names; a column pointing at a table is that table's name plus `_id`; no foreign keys, every such column indexed.
- Fixed value sets are numbers named in code; lists that grow are tables with screens.
- Soft delete (`status = -1`): business data is never physically removed.
- Times are UTC.
- Every schema change is a new dated SQL file, applied by hand.

**Screens and forms**
- A prototype screen is copied whole.
- The same validation runs in the form and in the API; errors show under the field.
- Hiding a link is not access control: restricted pages and API calls are guarded.

**Security and logging**
- Every request is validated; SQL is parameterised; passwords are hashed; sessions are HttpOnly cookies.
- Secrets live only in `.env` files, never in git.
- Every log line says who, where and which request; errors from every app are also shown in the console.

The full rule set is in [AGENTS.md](../../../AGENTS.md).

## 7. How we work

1. **Plan first.** Every feature gets a planning file with its test cases before code; every decision is written into it.
2. **Build from the prototype.** Only boards the business has declared ready are built; differences are recorded in PROTOTYPE-SYNC.
3. **Change a field through every layer at once:** migration, API, validation and every app that uses it.
4. **Verify:** type check, lint and build; run the test cases; check the live data; remove test data.
5. **Document:** update `docs/how-it-works/` in the same change and mark the plan shipped.

## 8. Where everything lives

| You want to know… | Look in |
|---|---|
| How a module or flow works **today** | `docs/how-it-works/` (`modules/`, `platform/`, `roles/`, `workflows/`) |
| **Why** a feature is the way it is, and its test results | `docs/planning/features/` |
| What is built, screen by screen, against the design | [PROTOTYPE-SYNC.md](../../PROTOTYPE-SYNC.md) |
| The design prototype | `docs/prototype/` (a separate repository; `init.js` starts it as a copy of the starter prototype) |
| The database tables | `apps/api/src/database/migrations/` (its README gives the order) |
| Background jobs, and adding one | [background-jobs.md](../platform/background-jobs.md) |
| Settings | each app's `.env.example` |
| Ports and process files | [environments/README.md](../../../environments/README.md) |
| The rules for working in this repo | [AGENTS.md](../../../AGENTS.md) |

```
apps/
├── api/src/
│   ├── modules/<module>/     one business area
│   ├── core/                 shared basics (never imports a module)
│   ├── database/             connection, transactions, migrations/
│   ├── infrastructure/       adapters to outside services
│   ├── config/               settings, validated
│   ├── routes/index.ts       where every module is mounted
│   └── cli/                  console commands
├── manage/                   the Super Admin console
└── web/                      the example portal
docs/  how-it-works/  planning/  PROTOTYPE-SYNC.md  tools/
environments/                 pm2 files and the port table
storage/                      uploaded files (not in git)
```

## 9. Team

To be written by the project.
