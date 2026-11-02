-- Languages, screen text and data text (language module).
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- English is the base: screen text is written in English in the code, and data text in English in each table's own
-- column; English is never stored as a translation. app_translation holds screen text, data_translation data text.
--
-- master_language: the languages offered (no delete). Its key is `code`, the ISO 639-1 code ('en', 'hi'), an outside
--   standard, so text; no id. short_name is shown on the header's language switch (EN, हि); native_name labels form
--   fields (Name (हिन्दी)). Seeded with English only; other languages are added in the console.
-- master_language_site: where each language is shown, and which language each place starts in. One row per language
--   and place: a row with status 1 = shown there, -1 = hidden there (soft delete; deleted_at / deleted_by say when and
--   by whom); is_default = that place shows this language before a visitor picks one. The API keeps: English shown
--   everywhere; exactly one default per place, which must be shown there; a language switched off keeps its rows.
--   Publish builds each app's languages.json from its portal's and its website's rows. Seeded: English shown and the
--   default everywhere.
-- app_translation: screen text (labels, buttons, messages): one row per English text (en_text, the key the apps look
--   up, lower case). Each other language gets its own column <code>_text, added by the API when the language is added
--   (empty = the English shows). Publish writes each app's <code>.json and languages.json from it.
-- data_translation: data text only (free text admins type into the database: names, descriptions): one row per table,
--   row, column and language other than English. entity_table / entity_column are the table's and column's names
--   (not codes), so a row reads by itself; master_language_code points at master_language.code. A new language needs
--   no column here. Clearing a translation sets status -1; entering it again brings the same row back (the unique key).
--
-- Codes (the lists live in apps/api/src/modules/language/types/language.types.ts):
--   master_language.status      1 = active, 2 = inactive
--   master_language_site.site   1 = Manage, 2 = Web Portal, 3 = Web Website
--   master_language_site.status 1 = shown, -1 = hidden
--   app_translation.status      1 = active, 2 = inactive, -1 = deleted
--   data_translation.status     1 = active, -1 = deleted (cleared)

CREATE TABLE master_language (
    code                        VARCHAR(10)  NOT NULL,
    name                        VARCHAR(100) NOT NULL,
    native_name                 VARCHAR(100) NOT NULL,
    short_name                  VARCHAR(10)  NOT NULL,
    status                      TINYINT      NOT NULL DEFAULT 1,
    created_at                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by                  INT UNSIGNED NULL,
    updated_by                  INT UNSIGNED NULL,
    PRIMARY KEY (code),
    UNIQUE KEY uq_master_language_name (name),
    KEY idx_master_language_status_name (status, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_language (code, name, native_name, short_name)
VALUES ('en', 'English', 'English', 'EN');

CREATE TABLE master_language_site (
    master_language_code  VARCHAR(10)  NOT NULL,
    site                  TINYINT      NOT NULL,
    is_default            TINYINT(1)   NOT NULL DEFAULT 0,
    status                TINYINT      NOT NULL DEFAULT 1,
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by            INT UNSIGNED NULL,
    updated_by            INT UNSIGNED NULL,
    deleted_at            DATETIME     NULL,
    deleted_by            INT UNSIGNED NULL,
    PRIMARY KEY (master_language_code, site),
    KEY idx_master_language_site_site_default (site, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_language_site (master_language_code, site, is_default)
VALUES ('en', 1, 1), ('en', 2, 1), ('en', 3, 1);

CREATE TABLE app_translation (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    en_text     VARCHAR(500) NOT NULL,
    status      TINYINT      NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED NULL,
    updated_by  INT UNSIGNED NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_app_translation_en_text (en_text),
    KEY idx_app_translation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE data_translation (
    id                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    entity_table          VARCHAR(64)   NOT NULL,
    entity_id             INT UNSIGNED  NOT NULL,
    entity_column         VARCHAR(64)   NOT NULL,
    master_language_code  VARCHAR(10)   NOT NULL,
    translated_text       VARCHAR(2000) NOT NULL,
    status                TINYINT       NOT NULL DEFAULT 1,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by            INT UNSIGNED  NULL,
    updated_by            INT UNSIGNED  NULL,
    deleted_at            DATETIME      NULL,
    deleted_by            INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_data_translation_table_language_row_column (entity_table, master_language_code, entity_id, entity_column),
    KEY idx_data_translation_entity (entity_table, entity_id),
    KEY idx_data_translation_master_language_code (master_language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
