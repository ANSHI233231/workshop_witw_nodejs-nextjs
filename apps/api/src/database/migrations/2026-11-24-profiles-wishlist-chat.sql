-- Profiles, Wishlist and Direct Chat: the items a user saves (wishlist module), each user's own profile details
-- (profile module), the direct conversations between two users and their messages (chat module), and the template of
-- the new in-app notification for a message.
-- Plan: docs/planning/features/2026-11-24-profiles-wishlist-chat.md
-- Workflow: docs/how-it-works/workflows/WITW-Profiles-Wishlist-Chat-Workflow.md
--
-- wishlist_item: one row per user and saved item (the two unique keys: a package or a shared safari, never both).
--   item_type says which pointer is set. saved_price_per_person is the live version's price per person when the
--   package was saved (empty for a shared safari): a package that left the website comes back only at that price.
--   is_hidden is set while a saved package is not shown on the website; when it is shown again at the saved price it
--   is cleared, at another price the row becomes status 2 (dropped for good). saved_at is the last time the user saved
--   it (the wishlist is newest saved first); saving again after a remove or a drop reuses the row.
-- user_profile: one row per user (user_id is unique), created when it is first saved (at Sign Up, or from Edit
--   Profile). date_of_birth and gender are empty for accounts made before this feature. bio and about have no length
--   limit (MEDIUMTEXT: a TEXT column holds only 64 KB, less than one request may carry). The four social links are
--   any text up to 1,000 characters, or empty (workflow R242). photo and cover_photo are the stored
--   file's name only, at user_profile/<user_id>/photo/<photo> and user_profile/<user_id>/cover_photo/<cover_photo>;
--   empty = the placeholder image. The name stays on user (users module).
-- chat_conversation: one row per pair of users: first_user_id is the lower user id, second_user_id the higher, so the
--   unique key allows one conversation per pair. It is created with its first message. last_message_at orders the
--   conversation list. Never edited or deleted.
-- chat_message: the messages of a conversation; user_id is the sender. message_text is up to 1,000 characters.
--   read_at is when the other user opened the conversation (empty = unread). Never edited or deleted.
--
-- Codes (the lists live in the modules' types/):
--   wishlist_item.item_type              1 = package, 2 = shared safari (WishlistItemType)
--   wishlist_item.status                 1 = saved, 2 = dropped for good (the package came back at another price),
--                                        -1 = removed by the user
--   user_profile.gender                  1 = Male, 2 = Female, 3 = Other (Gender)
--   notification_template.notification_kind
--                                        1601 = new direct message (to the recipient, on the website)
--   notification_template.client_app     the API's ClientApp codes: 2 = web
--   audit module (audit_log)             14 = wishlist (1401…), 15 = profile (1501…), 16 = chat (1601…)
--
-- Notification sentence: 1601 "{{actor}} sent you a message." (actor = the sender); the notification's entity is
-- the conversation (audit entity 20), title = the sender's name.

CREATE TABLE wishlist_item (
    id                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id                 INT UNSIGNED  NOT NULL,
    item_type               TINYINT       NOT NULL,
    package_id              INT UNSIGNED  NULL,
    shared_safari_id        INT UNSIGNED  NULL,
    saved_price_per_person  INT UNSIGNED  NULL,
    is_hidden               TINYINT(1)    NOT NULL DEFAULT 0,
    saved_at                DATETIME      NOT NULL,
    status                  TINYINT       NOT NULL DEFAULT 1,
    created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              INT UNSIGNED  NULL,
    updated_by              INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist_item_user_id_package_id (user_id, package_id),
    UNIQUE KEY uq_wishlist_item_user_id_shared_safari_id (user_id, shared_safari_id),
    KEY idx_wishlist_item_user_id_item_type_status_saved_at (user_id, item_type, status, saved_at),
    KEY idx_wishlist_item_package_id (package_id),
    KEY idx_wishlist_item_shared_safari_id (shared_safari_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_profile (
    id             INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED   NOT NULL,
    date_of_birth  DATE           NULL,
    gender         TINYINT        NULL,
    bio            MEDIUMTEXT     NULL,
    about          MEDIUMTEXT     NULL,
    facebook_url   VARCHAR(1000)  NULL,
    x_url          VARCHAR(1000)  NULL,
    instagram_url  VARCHAR(1000)  NULL,
    youtube_url    VARCHAR(1000)  NULL,
    photo          VARCHAR(255)   NULL,
    cover_photo    VARCHAR(255)   NULL,
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     INT UNSIGNED   NULL,
    updated_by     INT UNSIGNED   NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_profile_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE chat_conversation (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    first_user_id    INT UNSIGNED  NOT NULL,
    second_user_id   INT UNSIGNED  NOT NULL,
    last_message_at  DATETIME      NOT NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by       INT UNSIGNED  NULL,
    updated_by       INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_chat_conversation_first_user_id_second_user_id (first_user_id, second_user_id),
    KEY idx_chat_conversation_first_user_id_last_message_at (first_user_id, last_message_at),
    KEY idx_chat_conversation_second_user_id_last_message_at (second_user_id, last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE chat_message (
    id                    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    chat_conversation_id  INT UNSIGNED   NOT NULL,
    user_id               INT UNSIGNED   NOT NULL,
    message_text          VARCHAR(1000)  NOT NULL,
    read_at               DATETIME       NULL,
    created_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by            INT UNSIGNED   NULL,
    updated_by            INT UNSIGNED   NULL,
    PRIMARY KEY (id),
    KEY idx_chat_message_chat_conversation_id_id (chat_conversation_id, id),
    KEY idx_chat_message_chat_conversation_id_read_at (chat_conversation_id, read_at),
    KEY idx_chat_message_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO notification_template (notification_kind, client_app, code, name, title_template, sent_when, opens, status)
VALUES
    (1601, 2, 'chat_message_received', 'Message Received', '{{actor}} sent you a message.',
        'A user sends the person a direct message', 'Messages', 1);
