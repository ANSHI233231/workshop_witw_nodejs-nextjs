-- Users, roles and sign-in (users and auth modules): users, the role list (meta_role), each user's roles
-- (user_role), refresh tokens (one session shared by the apps) and password-reset links.
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- Sign-in identifiers: username, email and mobile are each optional and each unique (uq_user_username,
-- uq_user_email, uq_user_mobile); at least one of the three must be set (chk_user_sign_in_identifier).
-- The collation is case- and accent-insensitive, so "Foo" and "foo" are the same username / email.
-- password_changed_at: when the password was last changed. No foreign keys: every column pointing at another table
-- is indexed.
--
-- meta_role: every role in the system, with fixed ids; code refers to roles by id (MetaRole.SUPER_ADMIN = 100).
-- meta_ tables hold values the system itself runs on: rows come from migrations, there is no create / edit / delete
-- screen. System roles use ids 100–199; a project's own roles take the next hundreds (200–299 …), added in its own
-- migration.
--
-- Tokens: only SHA-256 hashes are stored (refresh tokens and reset links). A refresh retires the row it used and adds
-- a new one; presenting a token retired more than 30 seconds earlier retires every active row of that user. A reset
-- link lives 60 minutes and works once (a conditional update). Rows of these tables are never deleted.
--
-- Codes:
--   user.status                         1 = active, 2 = inactive, -1 = deleted
--   meta_role.status                    1 = active, 2 = inactive
--   user_role.status                    1 = active, 2 = inactive, -1 = deleted
--   user_refresh_token.client_app       the API's ClientApp codes (1 = manage, 2 = web): the app the token was
--                                       issued from; the session itself serves every app
--   user_refresh_token.status           1 = active, -1 = retired (used, signed out, or revoked)
--   user_password_reset.client_app      the API's ClientApp codes: the app whose link it is
--   user_password_reset.status          1 = issued, 2 = used, -1 = retired (a newer link was issued)

CREATE TABLE user (
    id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(150)  NOT NULL,
    username             VARCHAR(100)  NULL,
    email                VARCHAR(254)  NULL,
    mobile               VARCHAR(15)   NULL,
    password_hash        VARCHAR(255)  NULL,
    password_changed_at  DATETIME      NULL,
    status               TINYINT       NOT NULL DEFAULT 1,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by           INT UNSIGNED  NULL,
    updated_by           INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_username (username),
    UNIQUE KEY uq_user_email (email),
    UNIQUE KEY uq_user_mobile (mobile),
    KEY idx_user_status (status),
    CONSTRAINT chk_user_sign_in_identifier CHECK (username IS NOT NULL OR email IS NOT NULL OR mobile IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE meta_role (
    id          SMALLINT UNSIGNED  NOT NULL,
    name        VARCHAR(100)       NOT NULL,
    status      TINYINT            NOT NULL DEFAULT 1,
    created_at  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_meta_role_name (name),
    KEY idx_meta_role_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_role (
    id            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED       NOT NULL,
    meta_role_id  SMALLINT UNSIGNED  NOT NULL,
    status        TINYINT            NOT NULL DEFAULT 1,
    created_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by    INT UNSIGNED       NULL,
    updated_by    INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_role_user_meta_role (user_id, meta_role_id),
    KEY idx_user_role_meta_role_id (meta_role_id),
    KEY idx_user_role_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_refresh_token (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED  NOT NULL,
    client_app  TINYINT       NOT NULL,
    token_hash  CHAR(64)      NOT NULL,
    expires_at  DATETIME      NOT NULL,
    status      TINYINT       NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED  NULL,
    updated_by  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_refresh_token_token_hash (token_hash),
    KEY idx_user_refresh_token_user_id_client_app_status (user_id, client_app, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_password_reset (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED  NOT NULL,
    client_app  TINYINT       NOT NULL,
    token_hash  CHAR(64)      NOT NULL,
    expires_at  DATETIME      NOT NULL,
    used_at     DATETIME      NULL,
    status      TINYINT       NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED  NULL,
    updated_by  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_password_reset_token_hash (token_hash),
    KEY idx_user_password_reset_user_id_client_app_status (user_id, client_app, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO meta_role (id, name, status) VALUES (100, 'Super Admin', 1);
