# Platform

How the system itself works, and how we do things as developers.

| Doc | What it covers |
|---|---|
| [adding-a-module.md](adding-a-module.md) | How to add a new business module to the API |
| [route-access.md](route-access.md) | How every API route states who may call it (public, session, signed-in, roles, key), and `route/list` |
| [sql-transactions.md](sql-transactions.md) | How several writes, across modules, succeed or fail together |
| [logging.md](logging.md) | What the API logs, where, and how to follow a bug through a request |
| [frontend-logging.md](frontend-logging.md) | How the apps save browser and server logs to their own `logs/` folder, and their errors to the database |
| [background-jobs.md](background-jobs.md) | The worker the API starts, scheduled and one-time jobs, the console's Background Jobs, and **how to add a new worker command** or queue one from a module |
| [file-storage.md](file-storage.md) | Where uploaded files are kept, the path rule every upload follows, how an app shows a file |
| [frontend-apps.md](frontend-apps.md) | How manage and web are structured and how a screen gets data from the API |
| [manage-console.md](manage-console.md) | The Super Admin console: login, frame, sidebar menu, its pages and the Tech Documentation viewer |
| [local-development.md](local-development.md) | How the API and apps run locally: database, `.env`, ports, hostnames |
| [prototype.md](prototype.md) | The project's design prototype: its own repo as `docs/prototype`, how `init.js` copies the starter prototype into it, adding it later, the pin |
| [browser-testing.md](browser-testing.md) | How each test case of a feature is run in the browser with Playwright and its PASS / FAIL written in the planning file |
