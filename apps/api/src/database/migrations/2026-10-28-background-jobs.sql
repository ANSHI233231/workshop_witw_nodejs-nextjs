-- Background jobs (jobs module): the scheduled jobs (crons) and every run, kept by the worker the API starts and
-- managed by the Super Admin in Console › Platform › Background Jobs. A command is a CLI command (its route and
-- arguments, as `npm run cli` takes them), run by the worker in its own process without a shell.
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- job_schedule: a recurring job. cron_expression: 5-part cron in India time (IST), e.g. '0 2 * * *' = every day at
--   02:00 IST. arguments: a JSON array of strings, in order. timeout_minutes: 1–1440. A schedule is never deleted.
--   status: 1 active, 2 inactive
-- job_run: one run of a command (a schedule's run, a one-time job, a Run now, a retry, or a job a module queued); the
--   worker's queue and the logs in one table. Never deleted.
--   run_trigger: 1 schedule, 2 the app (a module), 3 console Run now, 4 console planned (one-time), 5 retry
--   status:      1 waiting, 2 running, 3 done, 4 failed, 5 cancelled, 6 terminated, 7 skipped
--   run_key: unique when set (a schedule's minute 'schedule:<id>@<UTC minute>', or a module's own key), so the same run
--     is never queued twice. run_at: when it should run (UTC). heartbeat_at: refreshed by the worker while the run is
--     running; a run whose heartbeat stops is marked failed ("Stopped before it finished").
--   output, error: the command's stdout and stderr, kept to 64 KB each.
--   command and arguments are a snapshot: editing a schedule never changes its past runs.
-- The first schedule (pruning old app logs) is inserted at the end; it is data, changed on the console.

CREATE TABLE job_schedule (
    id               INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    name             VARCHAR(150)       NOT NULL,
    command          VARCHAR(150)       NOT NULL,
    arguments        JSON               NOT NULL,
    cron_expression  VARCHAR(100)       NOT NULL,
    timeout_minutes  SMALLINT UNSIGNED  NOT NULL DEFAULT 60,
    description      VARCHAR(1000)      NULL,
    status           TINYINT            NOT NULL DEFAULT 1,
    created_at       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by       INT UNSIGNED       NULL,
    updated_by       INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_job_schedule_name (name),
    KEY idx_job_schedule_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE job_run (
    id                   INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    command              VARCHAR(150)       NOT NULL,
    arguments            JSON               NOT NULL,
    title                VARCHAR(150)       NULL,
    job_schedule_id      INT UNSIGNED       NULL,
    run_trigger          TINYINT            NOT NULL,
    run_key              VARCHAR(190)       NULL,
    run_at               DATETIME           NOT NULL,
    status               TINYINT            NOT NULL DEFAULT 1,
    timeout_minutes      SMALLINT UNSIGNED  NOT NULL DEFAULT 60,
    pid                  INT UNSIGNED       NULL,
    progress_percent     TINYINT UNSIGNED   NULL,
    started_at           DATETIME           NULL,
    finished_at          DATETIME           NULL,
    heartbeat_at         DATETIME           NULL,
    exit_code            SMALLINT           NULL,
    output               MEDIUMTEXT         NULL,
    error                MEDIUMTEXT         NULL,
    retry_of_job_run_id  INT UNSIGNED       NULL,
    created_by           INT UNSIGNED       NULL,
    created_at           DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_job_run_run_key (run_key),
    KEY idx_job_run_status_run_at (status, run_at),
    KEY idx_job_run_job_schedule_created (job_schedule_id, created_at),
    KEY idx_job_run_command_created (command, created_at),
    KEY idx_job_run_created (created_at),
    KEY idx_job_run_retry_of_job_run (retry_of_job_run_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO job_schedule (name, command, arguments, cron_expression, timeout_minutes, description) VALUES
    ('Prune old app logs', 'app-log/prune', '["30", "confirm"]', '0 2 * * *', 60,
     'Deletes app-log rows older than 30 days, every day at 02:00 IST.');
