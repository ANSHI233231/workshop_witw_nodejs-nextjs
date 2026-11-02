# Background jobs

Work that runs outside a request: on a schedule (every night, every 15 minutes …), once at a planned time, or queued by the app (send this later, cancel this request if nobody answers it). The **worker** runs it, the **jobs** module keeps it, and the Super Admin manages it in **Console › Platform › Background Jobs**. (; module reference: [modules/jobs](../modules/jobs/README.md).)

**Every job is a CLI command**, the same commands `npm run cli` runs (`app-log/prune 30 confirm`). So a new background task is a new CLI command, nothing else; the worker, the schedules and the console pick it up by themselves.

## How it works

```
Console (Super Admin) ──► /api/jobs ──► job_schedule (the schedules)
                                    └─► job_run (waiting runs = the queue; finished runs = the logs)
A module ── jobQueue.enqueue() ────────► job_run
Worker (started by the API) ── every minute: due schedules → job_run (waiting)
                            └─ every few seconds: claim waiting runs → run each command in its own process
```

- **The worker** is a child process the API starts (`src/worker.ts`, when `WORKER_ENABLED=true`) and stops with it; if it stops on its own (a crash), the API starts it again five seconds later and logs it. It is not a separate pm2 process and needs no system crontab.
- **Every minute** it adds a waiting run for each active schedule due in that minute (schedules are in **India time, IST (`JOB_TIME_ZONE` in the jobs module)**). A schedule's run for a minute has a unique key, so it is added once even with two API processes. If the schedule's previous run is still waiting or running, the new one is recorded as **Skipped** ("Previous run still running."): a schedule never overlaps itself.
- **Every few seconds** (`WORKER_POLL_SECONDS`) it **claims** waiting runs whose time has come (`FOR UPDATE SKIP LOCKED`: two workers never take the same run), at most `WORKER_MAX_PARALLEL` at a time, and runs each one:
  - in **its own process**, `node cli/index.js <command> <arguments…>` (ts-node with the source in development), **without a shell**: the arguments reach the command as plain text, so `;`, `|` or `$(…)` mean nothing;
  - with `JOB_RUN_ID` set in the command's environment;
  - capturing stdout as the run's **output** and stderr as its **error** (64 KB each are kept);
  - **exit code 0 → Done**; any other exit code, a signal or a failure to start → **Failed** (the reason is written first in the error);
  - killed and **Failed** ("Timed out after N minutes.") when it runs past its time limit.
- A run that is **terminated** on the console has its process stopped and stays **Terminated**. A run whose worker stopped (the API stopped or crashed) is marked **Failed** ("Stopped before it finished.") once its heartbeat is two minutes old.
- Minutes missed while the API was down are not run afterwards; one-time runs planned in that time run as soon as the worker is back.
- **Runs are kept for good.** Nothing deletes them: not the worker, not the console.

### Settings (`apps/api/.env`)

| Variable | Meaning | Default |
|---|---|---|
| `WORKER_ENABLED` | start the worker with the API | off (`.env.example` sets `true`) |
| `WORKER_POLL_SECONDS` | seconds between checks for waiting runs (1–60) | 5 |
| `WORKER_MAX_PARALLEL` | runs at once per worker (1–10) | 2 |

A change needs an API restart (`pm2 restart <api process>`). Several API processes may each run a worker; claiming and run keys keep them from doubling up.

## Using the console (Super Admin)

**Console › Platform › Background Jobs**, three tabs and a **Run Command** button:

- **Scheduled**: the schedules. Add / Edit: a name, the **command** (typed; suggestions and each command's help as you type), its **arguments** (one box each, in order), the **schedule** (presets such as Every 15 minutes, Daily at 02:00, Weekly on Monday at 09:00, or a cron expression) with the next three run times shown, a time limit, a description. Run now, Activate / Deactivate (a schedule is never deleted), and Logs (its runs).
- **One-time**: runs that aren't a schedule's: started with Run Command (now or at a planned date and time), retries, and jobs a module queued. Cancel a waiting run, Terminate a running one, Retry a failed or terminated one.
- **Logs**: every run, with filters (schedule, status, trigger, dates, errors only). View shows the command and arguments, times, exit code and the full output and error, refreshing while it runs. Retry a failed or terminated run. Logs can't be deleted.

Every change is in the audit log (module 18).

## Adding a new worker command

1. **Write it as a CLI command.** Add an action to a controller in `apps/api/src/cli/controllers/` (or a new `<Name>Controller.ts`; a controller with helper files gets its own sub-folder). The method name gives the command: `RequestController.actionAutoCancel` → `request/auto-cancel`; its parameters are the arguments, in order. The `/** … */` comment above it is the help text the console shows.

   ```ts
   /**
    * Cancels requests nobody answered in time. Dry run unless "confirm" is given.
    */
   public async actionAutoDenyOrders(confirm?: string): Promise<void> {
       const { auditService } = createAuditModule({ db: this.db });
       const { requestService } = createRequestModule({ db: this.db, auditService });
       const cancelled = await requestService.cancelOverdue(confirm === 'confirm');
       this.stdout(`Cancelled: ${cancelled}\n`);
   }
   ```

   As every CLI command: build the module from its `index.ts` with `this.db` and call **its service**; never write SQL in the command.
2. **Try it in the terminal:** `npm run cli request/auto-cancel` (dry run), then with `confirm`.
3. **Schedule it or run it** from the console: Scheduled › Add (e.g. Every minute, arguments `confirm`), or Run Command. Nothing to register: the console reads the CLI's commands (`npm run cli job/commands`, cached five minutes).
4. **Starting schedules** a feature always needs go at the end of the feature's migration (`INSERT INTO job_schedule (name, command, arguments, cron_expression, timeout_minutes, description) VALUES (…)`), like the first one, "Prune old app logs" (`app-log/prune`, `["30", "confirm"]`, `0 2 * * *`).

### Rules for a good worker command

- **Exit codes decide the result.** Return normally for success. For a failure throw an error (the CLI prints it and exits 1) or set `process.exitCode = 1` after writing the reason with `this.stderr(…)`. Don't call `process.exit()` in the middle of work.
- **Print a short, useful summary** with `this.stdout(…)` (counts, what was done); it becomes the run's output. Keep it well under 64 KB; detailed lines belong in the logger (`logger.category('<module>')`).
- **Be safe to run again.** A schedule may run while the previous day's work was partly done, and Retry runs the same command again. Make the work idempotent (process what is due, mark what is done).
- **Writes:** keep the CLI rule: a command that changes data defaults to a dry run and writes only with `confirm`; schedule it with the argument `confirm`.
- **Stay within the time limit** (60 minutes by default; set per schedule, up to 24 hours). Long work in batches, each committed, so a time-out loses little.
- **`JOB_RUN_ID`** is in the command's environment when the worker runs it (absent in the terminal), for a command that wants to know its own run.
- **Old-database commands** (copying an old system's data) can be run from the console like any other, but they read the old database and write in bulk: run them by hand, not on a schedule.

## Queueing a job from a module

A module that needs work done later (or now, but not inside the request) queues a CLI command through the jobs module's **`IJobQueue`** (`jobQueue` from `createJobsModule`):

1. Add `jobQueue: IJobQueue` (imported from `../../jobs`) to the module's dependencies contract, and pass `jobs.jobQueue` to it in `src/routes/index.ts` (create the jobs module before that module).
2. In the module's service (the command below is an example: no module queues a job yet):

   ```ts
   await this.jobQueue.enqueue({
       command: 'request/auto-cancel-one',
       arguments: [String(requestId), 'confirm'],
       title: `Auto-cancel request ${requestNumber}`,
       runAt: new Date(Date.now() + minutes * 60_000),
       runKey: `request-auto-cancel:${requestId}`,
   });
   ```

   - `runAt` (default now), `timeoutMinutes` (default 60) and `title` are optional.
   - `runKey` makes it **idempotent**: the same key is queued once (a second call does nothing and returns `null`). Use it whenever the same work could be queued twice.
   - It runs with trigger **App** and shows in the console's One-time and Logs tabs.
3. Queue it **inside the same transaction** as the change that needs it, so both are saved or neither is (the queue is a table: no outside call, so this is allowed).

## Troubleshooting

- **Nothing runs:** is `WORKER_ENABLED=true` and was the API restarted? The API's `logs/info.log` shows `[jobs] Worker started` at boot; the process list shows `worker.ts` / `worker.js`.
- **A run stays Waiting:** its planned time hasn't come, or the worker is busy (`WORKER_MAX_PARALLEL` runs already going).
- **"This command doesn't exist.":** the route isn't a CLI command; check `npm run cli job/commands`. A command added a moment ago appears within five minutes (the list is cached).
- **Failed with an exit code but no message:** the command exited non-zero without writing to stderr; its own lines are in the API's `logs/` (the command logs there, as every CLI command).
- **Skipped runs:** the schedule's previous run was still going; lengthen the interval or shorten the work.
- **A schedule ran at the wrong hour:** schedules are IST; `0 2 * * *` is 02:00 IST (20:30 UTC the day before).
