-- In-app notifications (notification module): the notifications people get (the header bell, the Notifications page)
-- and the templates their sentences are built from.
-- Plan: docs/planning/features/2026-10-29-notifications.md
--
-- notification: one row per person. What it is about is entity_type + entity_id (the audit log's entity codes,
-- AuditEntity in TypeScript); where it shows is client_app (the app whose bell lists it) + owner_type / owner_id
-- (whose space inside that app; empty in the starter, for projects that add spaces such as an organisation).
-- title and excerpt are the text as sent, never rewritten; created_by is the person whose action caused it (empty
-- for the system: a CLI command or the jobs worker).
-- notification_template: one row per notification kind. The bell's sentence is built from title_template
-- (placeholders {{actor}}, the person who acted: "you" when it was the recipient, "the system" when nobody; and
-- {{subject}}, the stored title); client_app is the app the kind
-- shows in, or empty when it shows in the app the action happened in. The console lists the rows (read-only).
--
-- Codes:
--   notification.notification_kind,            numbered by module in hundreds (like the audit actions):
--   notification_template.notification_kind    101 = account created, 102 = password changed (users);
--                                              501 = background job failed (jobs);
--                                              601 = test notification (notification)
--   notification.client_app,                   the API's ClientApp codes: 1 = manage, 2 = web
--   notification_template.client_app
--   notification.owner_type                    defined by each project (none in the starter)
--   notification.status                        1 = active, -1 = deleted
--   notification_template.status               1 = active, 2 = inactive, 3 = draft

CREATE TABLE notification (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id            INT UNSIGNED  NOT NULL,
    notification_kind  SMALLINT      NOT NULL,
    entity_type        SMALLINT      NOT NULL,
    entity_id          INT UNSIGNED  NOT NULL,
    client_app         TINYINT       NOT NULL,
    owner_type         TINYINT       NULL,
    owner_id           INT UNSIGNED  NULL,
    title              VARCHAR(255)  NOT NULL,
    excerpt            VARCHAR(500)  NULL,
    read_at            DATETIME      NULL,
    status             TINYINT       NOT NULL DEFAULT 1,
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by         INT UNSIGNED  NULL,
    updated_by         INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    KEY idx_notification_user_app_owner_read (user_id, client_app, owner_type, owner_id, read_at),
    KEY idx_notification_entity_type_entity_id (entity_type, entity_id),
    KEY idx_notification_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notification_template (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    notification_kind  SMALLINT      NOT NULL,
    client_app         TINYINT       NULL,
    code               VARCHAR(64)   NOT NULL,
    name               VARCHAR(150)  NOT NULL,
    title_template     VARCHAR(255)  NOT NULL,
    sent_when          VARCHAR(150)  NULL,
    opens              VARCHAR(100)  NULL,
    status             TINYINT       NOT NULL DEFAULT 1,
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by         INT UNSIGNED  NULL,
    updated_by         INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_notification_template_notification_kind (notification_kind),
    UNIQUE KEY uq_notification_template_code (code),
    KEY idx_notification_template_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO notification_template (notification_kind, client_app, code, name, title_template, sent_when, opens, status)
VALUES
    (101, 2, 'account_created', 'Account Created', 'Welcome! Your account was created by {{actor}}',
        'An account is created for the person', 'Dashboard', 1),
    (102, NULL, 'password_changed', 'Password Changed', 'Your password was changed by {{actor}}',
        'The password is changed, reset or set by an administrator', NULL, 1),
    (501, 1, 'job_failed', 'Background Job Failed', 'The background job {{subject}} failed',
        'A background job run ends as Failed', 'Background Jobs logs', 1),
    (601, NULL, 'test_notification', 'Test Notification', 'Test notification from {{actor}}: {{subject}}',
        'The notification/send-test command is run', NULL, 1);
