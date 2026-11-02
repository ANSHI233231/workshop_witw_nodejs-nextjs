# modules/

One folder per business module (e.g. `users`, `audit`, `language`). All frontend apps (`manage`, `web`) use the same modules through the one API.

## Anatomy

A module creates **only the folders it needs**. `health/` is the smallest real example.

```
modules/<module>/
├── index.ts         REQUIRED. Public surface + composition root: createXModule(deps) builds
│                    repositories → services → controllers → router and exports only what others may use
├── routes/          <module>.routes.ts: createXRouter(controller). Wrap every handler in asyncHandler()
├── controllers/     Thin: read request → call service → respond with ok()/created()/noContent()/paginated()/sendDownload(), never res.json() & co. (lint)
├── services/        Business rules. The only layer that may call another module
├── repositories/    Data access. One method runs one named query; `db: DbExecutor` is always the first argument
├── sql/             <entity>.sql.ts: named, parameterized statements (`?` placeholders)
├── contracts/       Interfaces: the service contract, repository contract, and <module>-module.contract.ts (its dependencies)
├── validators/      zod request schemas, used with validate(schema) in routes
├── dto/             Request / response shapes that cross the API boundary
├── mappers/         Row → response DTO, with an explicit field whitelist
├── types/           Row types, constants, internal types
└── middlewares/     Middleware used only by this module's routes
```

## Rules (enforced by `npm run lint`)

- Outside a module, import **only its `index.ts`**. Its folders are private.
- A module talks to another module only from a **service**, through the other module's service contract, which is passed in via `createXModule(deps)` in `routes/index.ts`. Never through its repositories, and never by writing to its tables.
- **Writes are owned, reads are open.** A module INSERTs / UPDATEs / DELETEs only its own tables. Its SELECTs may JOIN any table, including other modules' tables and the global masters, for lists, detail pages and reports. A read with business meaning ("is this user active and allowed to sign in?") still goes through the owning module's service, so the rule lives in one place.
- Controllers never reach repositories, `sql/` or the database.
- A module never imports `config/` and never creates a database connection; everything is injected.

## Adding a module

1. Planning file in `docs/planning/features/`, and a migration in `src/database/migrations/` if it needs tables.
2. Create the folders you need, starting from `health/`.
3. Routes with `apiRouter()`, each with its access; mount in `src/routes/index.ts`: `...mountApi(app, \`${API_PREFIX}/<module>\`, x.createRouter(access))`.
