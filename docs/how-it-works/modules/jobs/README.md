# jobs

The schedules and runs of background work, and the worker that runs them. How to use and extend it: [platform/background-jobs.md](../../platform/background-jobs.md). .

**Who uses it.** The manage console's Platform › Background Jobs (Super Admin only), the worker (`src/worker.ts`), and any module that queues work through `IJobQueue`.

## Tables (migration `2026-10-28-background-jobs.sql`)

- **`job_schedule`**: name (unique), `command` (a CLI route), `arguments` (JSON array of strings), `cron_expression` (5-part, IST), `timeout_minutes` (1–1440), description, `status` 1 active / 2 inactive (never deleted). Starting rows: "Prune old app logs" (`app-log/prune`, `["30","confirm"]`, `0 2 * * *`).
- **`job_run`**: every run, the queue and the logs in one: `command`, `arguments` (a snapshot), `title`, `job_schedule_id`, `run_trigger` (1 schedule, 2 app, 3 Run now, 4 planned, 5 retry), `run_key` (unique when set), `run_at` (UTC), `status` (1 waiting, 2 running, 3 done, 4 failed, 5 cancelled, 6 terminated, 7 skipped), `timeout_minutes`, `pid`, `progress_percent`, `started_at`, `finished_at`, `heartbeat_at`, `exit_code`, `output` / `error` (64 KB each), `retry_of_job_run_id`, `created_by`. Rows are never deleted (they are the logs).

## API (`/api/jobs`, Super Admin; else 403)

- `GET /commands` → `[{ command, arguments: [{ name, optional }], description }]`: the CLI's commands (from `npm run cli job/commands`, cached five minutes).
- `GET /server-time` → `{ now, timeZone: 'Asia/Kolkata' }`.
- `POST /schedules/preview { cronExpression }` → `{ nextRuns }` (three, ISO).
- `GET /schedules` (`search`, `status`, paging) → `{ id, name, command, arguments, cronExpression, timeoutMinutes, description, status, lastRun: { id, status, runAt, durationSeconds } | null, nextRunAt }`; `POST /schedules`, `PUT /schedules/:id` `{ name, command, arguments, cronExpression, timeoutMinutes, description, status }` → "Scheduled job "X" added." / "saved."; `PATCH /schedules/:id/status { status }`; `POST /schedules/:id/run` (Run now).
- `GET /runs` (`search`, `scheduleId`, `status`, `trigger`, `from`, `to`, `errorsOnly`, `oneTime`, paging) → `{ id, command, arguments, title, scheduleId, scheduleName, trigger, runAt, status, timeoutMinutes, progressPercent, startedAt, finishedAt, durationSeconds, exitCode, retryOfRunId, createdByName }`; `GET /runs/:id` adds `output`, `error`.
- `POST /runs { title, command, arguments, runAt | null, timeoutMinutes }` (Run Command: now, or planned); `POST /runs/:id/cancel` (waiting), `/terminate` (running; the process is stopped), `/retry` (failed or terminated → a new run linked to it).
- Messages (422 on the field): "Enter the name.", "Use 2 to 100 characters.", "This name already exists.", "Enter the command.", "Enter the command as controller/action, e.g. app-log/prune.", "This command doesn't exist.", "Enter the schedule.", "Enter a valid cron expression.", "Enter a whole number from 1 to 1440.", "Pick a time in the future."; 409 "Only a waiting run can be cancelled." / "Only a running run can be terminated." / "Only a failed or terminated run can be retried.".

## For other modules

- `IJobQueue.enqueue({ command, arguments, title?, runAt?, runKey?, timeoutMinutes? })` → the run's id, or `null` when a run with that `runKey` already exists. Exported from `modules/jobs/index.ts`; handed to a module through its dependencies in `src/routes/index.ts`.

## Failed runs

When a run ends as Failed (a non-zero exit, a signal, a time-out or a start error), the worker sends every active Super Admin a 501 Background job failed notification in the console, with the run's title (or command) and the reason ([notification](../notification/README.md)). A failure to notify is logged and never changes the run.

## Audit

Module 5: 501 / 502 schedule added (failed), 503 / 504 schedule updated (failed; activate / deactivate too), 505 / 506 a run queued from the console (Run now, Run Command, Retry) (failed), 507 run cancelled, 508 run terminated, 509 cancel / terminate failed. Entities 6 (`JOB_SCHEDULE`), 7 (`JOB_RUN`). The worker's own changes to a run (claimed, finished, skipped, recovered) and `enqueue` are not audited: the run itself is the record.

## Where

- **Module:** `apps/api/src/modules/jobs/` (the worker loop: `services/job-worker.ts`; cron: `services/job-cron.ts`, `cron-parser`, IST).
- **Worker entry:** `apps/api/src/worker.ts`, started by `src/server.ts`; its wiring in `src/routes/jobs-worker.ts`.
- **Running commands:** `apps/api/src/infrastructure/process/` (`ICommandRunner`: the CLI in a child process, no shell).
- **Command list:** the CLI's `job/commands` (`src/cli/controllers/job/`).
