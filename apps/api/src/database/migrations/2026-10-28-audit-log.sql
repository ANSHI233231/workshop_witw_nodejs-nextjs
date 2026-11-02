-- Audit log (audit module): one append-only row per write or key event, from every app (manage, web, CLI …).
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- Rows are never updated or deleted, so there is no status / updated_* column.
-- user_id and entity_id are indexed, no foreign key. created_at is UTC.
-- Only the raw user_agent is stored: browser, platform, device … are parsed from it with core/agent when needed.
--
-- Codes (the lists live in apps/api: core/context ClientApp, modules/audit/types/audit.types.ts):
--   client_app  1 = manage, 2 = web, 3 = CLI, 4 = system (header missing or unknown)
--   module      the module (AuditModule)
--   action      a module's actions are numbered in its hundred: module N → N00 … N99 (AuditAction)
--   entity_type what the row is about (AuditEntity)
--   outcome     1 = success, 2 = failure

CREATE TABLE audit_log (
    id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    client_app        TINYINT          NOT NULL,
    module            SMALLINT         NOT NULL,
    action            SMALLINT         NOT NULL,
    outcome           TINYINT          NOT NULL,
    user_id           INT UNSIGNED     NULL,
    actor_label       VARCHAR(254)     NULL,
    entity_type       SMALLINT         NULL,
    entity_id         BIGINT UNSIGNED  NULL,
    changes           JSON             NULL,
    details           JSON             NULL,
    request_id        CHAR(36)         NULL,
    ip_address        VARCHAR(45)      NULL,
    user_agent        VARCHAR(512)     NULL,
    created_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_log_created_at (created_at),
    KEY idx_audit_log_user_id_created_at (user_id, created_at),
    KEY idx_audit_log_module_action_created_at (module, action, created_at),
    KEY idx_audit_log_entity_type_entity_id (entity_type, entity_id),
    KEY idx_audit_log_client_app_created_at (client_app, created_at),
    KEY idx_audit_log_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
