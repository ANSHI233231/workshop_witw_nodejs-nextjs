# CLI Application

Controller-Action CLI framework. All controllers in
`src/cli/controllers/` are auto-discovered at startup.

## Usage

```bash
# List all available commands
npm run cli -- --help

# Run a specific action
npm run cli <controller>/<action> [args...]

# Run the default action of a controller
npm run cli <controller> [args...]

# Production / cron (compiled)
npm run cli:dist <controller>/<action> [args...]
```

The CLI reads `.env` and validates it through `config/` like the server does, so every required
variable must be set. The database pool is opened only when a command first uses `this.db`.

## Structure

```
src/cli/
├── index.ts                  entry point
├── lib/
│   ├── Application.ts        auto-discovers and registers controllers
│   └── ConsoleController.ts  base class for all controllers
└── controllers/              one file per controller (auto-loaded, also from sub-folders)
    ├── ExampleController.ts  template: `npm run cli example`, `npm run cli example/hello -- World`
    ├── HealthController.ts   `npm run cli health`: calls the health module's service
    ├── AppLogController.ts   `npm run cli app-log/prune <days> [confirm]`: deletes old Error Logs rows
    ├── UserController.ts     `npm run cli user/create-super-admin "<name>" <email> <mobile> [confirm]`: the first Super Admin
    ├── RouteController.ts    `npm run cli route/list`: every API route with its access
    ├── NotificationController.ts `npm run cli notification/send-test <userId> <manage|web> [confirm]`: a test notification
    └── job/                  everything for one tool in its own folder
        ├── JobController.ts      `npm run cli job/commands`: the command list the Background Jobs console reads
        └── command-catalog.ts    reads every controller's actions and help text
```

## Adding a new command

Create `src/cli/controllers/<Name>Controller.ts` extending `ConsoleController` (or put it in a sub-folder with its helper files, e.g. `controllers/job/`; any `*Controller.ts` under `controllers/` is found). Methods prefixed
`action` are auto-registered as `<name>/<action>` (kebab-cased), and `actionIndex` doubles as the
controller's default action.

```typescript
import { ConsoleController } from '../lib/ConsoleController';

export class MyTaskController extends ConsoleController {
    // npm run cli my-task/index  (or just: npm run cli my-task)
    public async actionIndex() {
        this.stdout(this.ansiFormat("Done!\n", 'green'));
    }

    // npm run cli my-task/process [days]
    public async actionProcess(days: string = '30') {
        this.stdout(`Processing last ${days} days\n`);
    }
}
```

The first line of each action's `/** ... */` comment becomes its description in `--help`.

To use a module, build it from its `index.ts` with the shared database and call its service:

```typescript
const { healthService } = createHealthModule({ db: this.db });
const health = await healthService.check();
```

## Rules

- Import a module only through its `index.ts` and call its service. A CLI command never writes its own SQL (enforced by `npm run lint`).
- A destructive command defaults to a dry-run and only writes when given an explicit `confirm`
  argument (e.g. `npm run cli cleanup/purge 2026-10-01 confirm`).
