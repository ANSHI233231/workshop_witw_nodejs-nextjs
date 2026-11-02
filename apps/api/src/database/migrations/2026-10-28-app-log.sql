-- Log entries saved in the database (system-log module; the "DB logger", beside the log files): by default only
-- errors, from the API and, forwarded by the API, from the manage / web app servers. Read on the manage Error Logs
-- page; old rows removed by `npm run cli app-log/prune <days> confirm`. Rows are deleted only by that command (log
-- rows, not business records: no soft delete).
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- user_id points at user.id (indexed, no foreign key).
--
-- Codes:
--   app_log.source_app   the app the entry came from: 1 = api, 2 = manage, 3 = web
--   app_log.log_level    1 = error, 2 = warning, 3 = info, 4 = debug
--   app_log.client_app   the app of the request, as audit_log.client_app: 1 = manage, 2 = web

CREATE TABLE app_log (
    id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    source_app     TINYINT          NOT NULL,
    log_level      TINYINT          NOT NULL,
    category       VARCHAR(100)     NOT NULL,
    message        TEXT             NOT NULL,
    error_name     VARCHAR(150)     NULL,
    error_message  TEXT             NULL,
    error_stack    MEDIUMTEXT       NULL,
    log_context    JSON             NULL,
    request_id     VARCHAR(64)      NULL,
    ip_address     VARCHAR(45)      NULL,
    user_id        INT UNSIGNED     NULL,
    http_method    VARCHAR(10)      NULL,
    request_url    VARCHAR(500)     NULL,
    client_app     TINYINT          NULL,
    user_agent     VARCHAR(255)     NULL,
    logged_at      DATETIME(3)      NOT NULL,
    created_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_app_log_logged_at (logged_at),
    KEY idx_app_log_source_app_log_level_logged_at (source_app, log_level, logged_at),
    KEY idx_app_log_request_id (request_id),
    KEY idx_app_log_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
