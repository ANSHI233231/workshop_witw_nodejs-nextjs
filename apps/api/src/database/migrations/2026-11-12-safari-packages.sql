-- Safari Packages: partners (partner module), their photo galleries (gallery module), packages kept as numbered
-- versions with the Package Delete Reasons master (package module), and the quote requests users send (quote-request
-- module); the Partner role and the templates of the four new in-app notifications.
-- Plan: docs/planning/features/2026-11-12-safari-packages.md
-- Workflow: docs/how-it-works/workflows/WITW-Packages-Workflow.md
--
-- master_park.avg_safari_price_min / _max (plan Q2): since Phase 6 the park module calculates the average price from
--   the park's shown packages and no longer reads or writes these columns; 2026-11-14-drop-park-average-price.sql
--   drops them. master_park.feature_image is the stored file's name only, at park/<id>/feature_image/<feature_image>.
--
-- partner: one row per account (user_id is unique): the partner request and, once approved, the partner. Sending
--   again after a rejection updates the same row (status back to 1, reject_reason cleared, requested_at the new
--   send). decided_at / decided_by are the last approve or reject; approved_at is the first approval ("partner
--   since"). logo is the stored file's name only, at partner/<id>/logo/<logo>. is_phone_shown is the console's
--   "Show phone numbers" switch (the partner sees users' phones in their quote requests). A partner is never deleted.
-- partner_park: the parks the partner operates in, one row per partner and park (the unique key). Removing a park
--   sets status -1; adding it again sets 1 on the same row.
-- master_package_delete_reason: the reasons offered when the Super Admin deletes a package, managed in Console ›
--   Package Delete Reasons (no delete; the screen limits the name to 100 characters). name is unique regardless of
--   case. Only active reasons are offered. Listed in the order added (by id). Starts with the 5 reasons below.
--
-- package: one row per package; what it shows lives in its versions. slug is made from the first name and never
--   changes. website_status is the website state; -1 is a package never live whose only draft the partner deleted
--   (it leaves the lists). is_popular is cleared by every approval. first_live_at is the first approval.
--   A delete by the Super Admin (website_status 4, final) records master_package_delete_reason_id, the reason's name
--   at that moment (delete_reason_name, kept as shown when the reason is renamed), delete_details, deleted_at /
--   deleted_by.
-- package_version: v1, v2 … of a package (unique package_id + version_number), each a full copy of the five
--   sections. A package has at most one live version (status 4) and one working version (status 1, 2 or 3): the
--   generated columns live_version_key and working_version_key hold package_id for such a version and NULL otherwise,
--   and their unique keys refuse a second one; code never writes them. Approving makes the working version live and
--   the old live one 5 (replaced_at). Nights are day_count − 1 (not stored). Prices are whole rupees.
--   tag_background_color / tag_text_color are '#RRGGBB'. package_image / banner_image are file names only, at
--   package/<package id>/<version_number>/…. gallery_id is the approved gallery chosen for the package, gallery_title
--   its title when copied; its photos are copied into package_version_photo. is_*_saved record which of sections 2–5
--   have been saved (Basic is saved when the version exists). reject_reason is the Super Admin's, shown on the package;
--   sent_at the last send; decided_at / decided_by the approve or reject; admin_edited_at / admin_edited_by the last
--   Super Admin edit ("edited by Super Admin"); deleted_at / deleted_by the partner's delete of a draft (status -1).
-- package_version_park: the version's parks (unique version + park); sort_order 0 is the main park.
-- package_version_feature, package_version_inclusion: the chosen codes (unique version + code); an inclusion row says
--   Included (is_included 1) or Not included (0).
-- package_version_day: one row per itinerary day (day_number 1 …). Lowering the days sets status -1 on the removed
--   days. day_image is a file name only; gallery_id / gallery_title as on the version.
-- package_version_faq: the version's FAQs in sort_order. answer is any length.
-- package_version_photo: the copy of a gallery's approved photos taken when a section is saved:
--   package_version_day_id empty = the package's gallery, set = that day's gallery. Files are copied into the
--   package's folder, so later gallery changes or deletes don't reach the package until it is saved and approved
--   again.
--
-- gallery: a partner's named set of photos for one of their parks. title is the working title; approved_title the
--   title in use while the gallery is approved (restored on discarding a draft). has_approved_set says the gallery has
--   approved photos in use (offered in package pickers and on the Approved tab); status says where its working copy is:
--   1 = a draft is open (a new gallery, or a draft of an approved one when has_approved_set), 2 = sent and waiting,
--   3 = approved with no draft open, 4 = deleted by the Super Admin (delete_reason, deleted_at / deleted_by),
--   -1 = discarded (never approved; deleted by the partner). A reject sends it back to 1 with reject_reason.
--   sent_at the last send; decided_at / decided_by the last approve or reject.
-- gallery_photo: photo_set 1 = the approved photos, 2 = the draft's. Editing an approved gallery copies set 1 into set
--   2; approving replaces set 1 with set 2; discarding the draft sets status -1 on set 2. Each set has one
--   is_thumbnail photo. file_name only, at gallery/<gallery id>/<file_name>.
--
-- quote_request: one row per request. partner_id is the package's partner (it never changes), so the partner's list
--   reads its own rows directly. package_version_id is the live version when it was sent. user_name / user_email /
--   user_mobile are the account's details as sent. start_date is a calendar date (IST). mark is empty until the
--   partner marks it; marked_at when.
--
-- Codes (the lists live in the modules' types/):
--   partner.status                       1 = pending, 2 = rejected, 3 = active, 4 = inactive
--   partner_park.status                  1 = active, -1 = removed
--   master_package_delete_reason.status  1 = active, 2 = inactive
--   package.website_status               1 = not live yet, 2 = active, 3 = inactive, 4 = deleted by Super Admin,
--                                        -1 = discarded (never live)
--   package_version.status               1 = draft, 2 = waiting for approval, 3 = rejected, 4 = approved (live),
--                                        5 = replaced, -1 = discarded
--   package_version.safari_type          1 = Shared, 2 = Private
--   package_version.vehicle              1 = Gypsy / Jeep, 2 = Canter / Bus, 3 = Other (Elephant, Boat)
--   package_version.theme                1 = Photography, 2 = Safari Experience, 3 = Wildlife Exploration
--   package_version.stay                 1 = Premium, 2 = Standard, 3 = Economical, 4 = Not Included,
--                                        5 = Forest Rest House, 6 = Home Stay
--   package_version_feature.feature      1 = Multiple Parks, 2 = Customizable, 3 = Private Room, 4 = Shared Room,
--                                        5 = Private Safari, 6 = Shared Safari, 7 = Photography Special,
--                                        8 = Forest Rest House Stay, 9 = Other Activities
--   package_version_inclusion.inclusion  1 = Accommodation, 2 = Meals, 3 = Pick & Drop, 4 = Camera Fee, 5 = Permit,
--                                        6 = Guide Fee
--   meals (code only; the day's has_breakfast / has_lunch / has_dinner)
--                                        1 = Breakfast, 2 = Lunch, 3 = Dinner
--   package_version_park.status, package_version_feature.status, package_version_inclusion.status,
--   package_version_day.status, package_version_faq.status, package_version_photo.status,
--   gallery_photo.status                 1 = active, -1 = deleted
--   gallery.status                       1 = draft, 2 = waiting for approval, 3 = approved, 4 = deleted by Super Admin,
--                                        -1 = discarded
--   gallery_photo.photo_set              1 = approved, 2 = draft
--   quote_request.mark                   1 = Hot, 2 = Cold (NULL = no mark)
--   quote_request.status                 1 = active, 2 = inactive
--   meta_role.id                         101 = Partner (MetaRole.PARTNER)
--   notification_template.notification_kind
--                                        1101 = gallery sent for approval (to every Super Admin),
--                                        1201 = package version sent for approval (to every Super Admin),
--                                        1301 = new quote request (to the partner),
--                                        1302 = Super Admin message about a quote request (to the partner)
--   notification_template.client_app     the API's ClientApp codes: 1 = manage, 5 = partner (ClientApp.PARTNER, added
--                                        with the partner app; 3 and 4 are CLI and SYSTEM)
--   audit module (audit_log)             10 = partner (1001…), 11 = gallery (1101…), 12 = package (1201…),
--                                        13 = quote-request (1301…)
--
-- notification.actor_name (new column on the existing table): the name shown as the notification's actor when it is
--   not the account's own name, as at sending (a partner's business name for 1101 and 1201); empty = the account's name.
--
-- Notification sentences use the template placeholders {{actor}} and {{subject}} (the stored title):
--   1101 title = the gallery title; 1201 title = "<package name> (v<n>)"; 1301 title = the package name, actor = the
--   user; 1302 title = the user's name, excerpt = the Super Admin's message (up to 500).

CREATE TABLE partner (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED  NOT NULL,
    business_name    VARCHAR(255)  NOT NULL,
    owner_name       VARCHAR(255)  NOT NULL,
    business_phone   VARCHAR(15)   NOT NULL,
    business_email   VARCHAR(254)  NOT NULL,
    about            VARCHAR(2000) NULL,
    logo             VARCHAR(255)  NULL,
    is_phone_shown   TINYINT(1)    NOT NULL DEFAULT 0,
    reject_reason    VARCHAR(512)  NULL,
    requested_at     DATETIME      NOT NULL,
    decided_at       DATETIME      NULL,
    decided_by       INT UNSIGNED  NULL,
    approved_at      DATETIME      NULL,
    status           TINYINT       NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by       INT UNSIGNED  NULL,
    updated_by       INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_partner_user_id (user_id),
    KEY idx_partner_status_requested_at (status, requested_at),
    KEY idx_partner_business_name (business_name),
    KEY idx_partner_decided_by (decided_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE partner_park (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    partner_id      INT UNSIGNED  NOT NULL,
    master_park_id  INT UNSIGNED  NOT NULL,
    status          TINYINT       NOT NULL DEFAULT 1,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      INT UNSIGNED  NULL,
    updated_by      INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_partner_park_partner_id_master_park_id (partner_id, master_park_id),
    KEY idx_partner_park_master_park_id_status (master_park_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE master_package_delete_reason (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)  NOT NULL,
    status      TINYINT       NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED  NULL,
    updated_by  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_master_package_delete_reason_name (name),
    KEY idx_master_package_delete_reason_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package (
    id                               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    partner_id                       INT UNSIGNED  NOT NULL,
    slug                             VARCHAR(255)  NOT NULL,
    website_status                   TINYINT       NOT NULL DEFAULT 1,
    is_popular                       TINYINT(1)    NOT NULL DEFAULT 0,
    is_best_deal                     TINYINT(1)    NOT NULL DEFAULT 0,
    first_live_at                    DATETIME      NULL,
    master_package_delete_reason_id  INT UNSIGNED  NULL,
    delete_reason_name               VARCHAR(150)  NULL,
    delete_details                   VARCHAR(1000) NULL,
    deleted_at                       DATETIME      NULL,
    deleted_by                       INT UNSIGNED  NULL,
    created_at                       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by                       INT UNSIGNED  NULL,
    updated_by                       INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_slug (slug),
    KEY idx_package_partner_id_website_status (partner_id, website_status),
    KEY idx_package_website_status_is_popular_first_live_at (website_status, is_popular, first_live_at),
    KEY idx_package_website_status_first_live_at (website_status, first_live_at),
    KEY idx_package_master_package_delete_reason_id (master_package_delete_reason_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version (
    id                      INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    package_id              INT UNSIGNED       NOT NULL,
    version_number          SMALLINT UNSIGNED  NOT NULL,
    name                    VARCHAR(255)       NOT NULL,
    day_count               TINYINT UNSIGNED   NOT NULL,
    safari_count            TINYINT UNSIGNED   NOT NULL,
    safari_type             TINYINT            NOT NULL,
    vehicle                 TINYINT            NOT NULL,
    theme                   TINYINT            NOT NULL,
    stay                    TINYINT            NOT NULL,
    start_place             VARCHAR(255)       NULL,
    end_place               VARCHAR(255)       NULL,
    price_per_person        INT UNSIGNED       NOT NULL,
    total_price             INT UNSIGNED       NOT NULL,
    price_before_discount   INT UNSIGNED       NULL,
    activity_message        VARCHAR(255)       NULL,
    price_message           VARCHAR(255)       NULL,
    tag_text                VARCHAR(255)       NULL,
    tag_background_color    CHAR(7)            NOT NULL DEFAULT '#C0392B',
    tag_text_color          CHAR(7)            NOT NULL DEFAULT '#FFFFFF',
    package_image           VARCHAR(255)       NULL,
    banner_image            VARCHAR(255)       NULL,
    gallery_id              INT UNSIGNED       NULL,
    gallery_title           VARCHAR(255)       NULL,
    overview                VARCHAR(2000)      NULL,
    more_inclusions         VARCHAR(512)       NULL,
    exclusions              VARCHAR(512)       NULL,
    getting_there           VARCHAR(2000)      NULL,
    is_itinerary_saved      TINYINT(1)         NOT NULL DEFAULT 0,
    is_inclusions_saved     TINYINT(1)         NOT NULL DEFAULT 0,
    is_getting_there_saved  TINYINT(1)         NOT NULL DEFAULT 0,
    is_faqs_saved           TINYINT(1)         NOT NULL DEFAULT 0,
    reject_reason           VARCHAR(512)       NULL,
    sent_at                 DATETIME           NULL,
    decided_at              DATETIME           NULL,
    decided_by              INT UNSIGNED       NULL,
    replaced_at             DATETIME           NULL,
    admin_edited_at         DATETIME           NULL,
    admin_edited_by         INT UNSIGNED       NULL,
    status                  TINYINT            NOT NULL DEFAULT 1,
    live_version_key        INT UNSIGNED       AS (CASE WHEN status = 4 THEN package_id END) STORED,
    working_version_key     INT UNSIGNED       AS (CASE WHEN status IN (1, 2, 3) THEN package_id END) STORED,
    created_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              INT UNSIGNED       NULL,
    updated_by              INT UNSIGNED       NULL,
    deleted_at              DATETIME           NULL,
    deleted_by              INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_version_package_id_version_number (package_id, version_number),
    UNIQUE KEY uq_package_version_live_version_key (live_version_key),
    UNIQUE KEY uq_package_version_working_version_key (working_version_key),
    KEY idx_package_version_package_id_status (package_id, status),
    KEY idx_package_version_status_sent_at (status, sent_at),
    KEY idx_package_version_status_price_per_person (status, price_per_person),
    KEY idx_package_version_status_safari_count (status, safari_count),
    KEY idx_package_version_name (name),
    KEY idx_package_version_gallery_id (gallery_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_park (
    id                  INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    package_version_id  INT UNSIGNED       NOT NULL,
    master_park_id      INT UNSIGNED       NOT NULL,
    sort_order          SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    status              TINYINT            NOT NULL DEFAULT 1,
    created_at          DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED       NULL,
    updated_by          INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_version_park_package_version_id_master_park_id (package_version_id, master_park_id),
    KEY idx_package_version_park_master_park_id_status (master_park_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_feature (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    package_version_id  INT UNSIGNED  NOT NULL,
    feature             TINYINT       NOT NULL,
    status              TINYINT       NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_by          INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_version_feature_package_version_id_feature (package_version_id, feature),
    KEY idx_package_version_feature_feature_status (feature, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_inclusion (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    package_version_id  INT UNSIGNED  NOT NULL,
    inclusion           TINYINT       NOT NULL,
    is_included         TINYINT(1)    NOT NULL,
    status              TINYINT       NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_by          INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_version_inclusion_package_version_id_inclusion (package_version_id, inclusion),
    KEY idx_package_version_inclusion_inclusion_is_included_status (inclusion, is_included, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_day (
    id                  INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    package_version_id  INT UNSIGNED      NOT NULL,
    day_number          TINYINT UNSIGNED  NOT NULL,
    title               VARCHAR(255)      NOT NULL,
    description         VARCHAR(2000)     NOT NULL,
    start_location      VARCHAR(255)      NULL,
    end_location        VARCHAR(255)      NULL,
    hotel_name          VARCHAR(255)      NULL,
    has_breakfast       TINYINT(1)        NOT NULL DEFAULT 0,
    has_lunch           TINYINT(1)        NOT NULL DEFAULT 0,
    has_dinner          TINYINT(1)        NOT NULL DEFAULT 0,
    activity            VARCHAR(500)      NULL,
    accommodation       VARCHAR(500)      NULL,
    note                VARCHAR(500)      NULL,
    day_image           VARCHAR(255)      NULL,
    gallery_id          INT UNSIGNED      NULL,
    gallery_title       VARCHAR(255)      NULL,
    status              TINYINT           NOT NULL DEFAULT 1,
    created_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED      NULL,
    updated_by          INT UNSIGNED      NULL,
    PRIMARY KEY (id),
    KEY idx_package_version_day_package_version_id_status_day_number (package_version_id, status, day_number),
    KEY idx_package_version_day_gallery_id (gallery_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_faq (
    id                  INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    package_version_id  INT UNSIGNED       NOT NULL,
    question            VARCHAR(512)       NOT NULL,
    answer              MEDIUMTEXT         NOT NULL,
    sort_order          SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    status              TINYINT            NOT NULL DEFAULT 1,
    created_at          DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED       NULL,
    updated_by          INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    KEY idx_package_version_faq_package_version_id_status_sort_order (package_version_id, status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_version_photo (
    id                      INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    package_version_id      INT UNSIGNED       NOT NULL,
    package_version_day_id  INT UNSIGNED       NULL,
    file_name               VARCHAR(255)       NOT NULL,
    title                   VARCHAR(255)       NULL,
    caption                 VARCHAR(1000)      NULL,
    sort_order              SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    status                  TINYINT            NOT NULL DEFAULT 1,
    created_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              INT UNSIGNED       NULL,
    updated_by              INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    KEY idx_package_version_photo_package_version_id_status_sort_order (package_version_id, status, sort_order),
    KEY idx_package_version_photo_package_version_day_id (package_version_day_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gallery (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    partner_id        INT UNSIGNED  NOT NULL,
    master_park_id    INT UNSIGNED  NOT NULL,
    title             VARCHAR(255)  NOT NULL,
    approved_title    VARCHAR(255)  NULL,
    has_approved_set  TINYINT(1)    NOT NULL DEFAULT 0,
    reject_reason     VARCHAR(512)  NULL,
    delete_reason     VARCHAR(512)  NULL,
    sent_at           DATETIME      NULL,
    decided_at        DATETIME      NULL,
    decided_by        INT UNSIGNED  NULL,
    status            TINYINT       NOT NULL DEFAULT 1,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by        INT UNSIGNED  NULL,
    updated_by        INT UNSIGNED  NULL,
    deleted_at        DATETIME      NULL,
    deleted_by        INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    KEY idx_gallery_partner_id_status (partner_id, status),
    KEY idx_gallery_partner_id_has_approved_set (partner_id, has_approved_set),
    KEY idx_gallery_status_sent_at (status, sent_at),
    KEY idx_gallery_has_approved_set_status (has_approved_set, status),
    KEY idx_gallery_master_park_id (master_park_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gallery_photo (
    id            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    gallery_id    INT UNSIGNED       NOT NULL,
    photo_set     TINYINT            NOT NULL,
    file_name     VARCHAR(255)       NOT NULL,
    title         VARCHAR(255)       NULL,
    caption       VARCHAR(1000)      NULL,
    sort_order    SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    is_thumbnail  TINYINT(1)         NOT NULL DEFAULT 0,
    status        TINYINT            NOT NULL DEFAULT 1,
    created_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by    INT UNSIGNED       NULL,
    updated_by    INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    KEY idx_gallery_photo_gallery_id_photo_set_status_sort_order (gallery_id, photo_set, status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE quote_request (
    id                  INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED      NOT NULL,
    partner_id          INT UNSIGNED      NOT NULL,
    package_id          INT UNSIGNED      NOT NULL,
    package_version_id  INT UNSIGNED      NOT NULL,
    traveller_count     TINYINT UNSIGNED  NOT NULL,
    start_date          DATE              NOT NULL,
    notes               VARCHAR(1000)     NOT NULL,
    user_name           VARCHAR(150)      NOT NULL,
    user_email          VARCHAR(254)      NULL,
    user_mobile         VARCHAR(15)       NULL,
    mark                TINYINT           NULL,
    marked_at           DATETIME          NULL,
    status              TINYINT           NOT NULL DEFAULT 1,
    created_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED      NULL,
    updated_by          INT UNSIGNED      NULL,
    PRIMARY KEY (id),
    KEY idx_quote_request_user_id_status_created_at (user_id, status, created_at),
    KEY idx_quote_request_partner_id_status_created_at (partner_id, status, created_at),
    KEY idx_quote_request_status_created_at (status, created_at),
    KEY idx_quote_request_package_id (package_id),
    KEY idx_quote_request_package_version_id (package_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE notification ADD COLUMN actor_name VARCHAR(255) NULL AFTER excerpt;

INSERT INTO meta_role (id, name, status) VALUES (101, 'Partner', 1);

INSERT INTO master_package_delete_reason (name, status)
VALUES
    ('Misleading information', 1),
    ('Duplicate package', 1),
    ('Wrong prices', 1),
    ('Partner asked to delete', 1),
    ('Other', 1);

INSERT INTO notification_template (notification_kind, client_app, code, name, title_template, sent_when, opens, status)
VALUES
    (1101, 1, 'gallery_sent', 'Gallery Sent for Approval', '{{actor}} sent the gallery {{subject}} for approval.',
        'A partner sends a gallery for approval', 'Gallery Approvals', 1),
    (1201, 1, 'package_version_sent', 'Package Version Sent for Approval', '{{actor}} sent {{subject}} for approval.',
        'A partner sends a package version for approval', 'Package Approvals', 1),
    (1301, 5, 'quote_request_received', 'Quote Request Received', '{{actor}} sent a quote request for {{subject}}.',
        'A user sends a quote request for one of the partner''s packages', 'Quote Requests', 1),
    (1302, 5, 'quote_request_admin_message', 'Super Admin Message on a Quote Request',
        'From the Super Admin about {{subject}}''s request:',
        'The Super Admin sends the partner a notification about a quote request', 'Quote Requests', 1);
