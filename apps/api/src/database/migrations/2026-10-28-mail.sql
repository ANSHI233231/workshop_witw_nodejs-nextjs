-- Mail (mail module): every mail the system writes is rendered from a template and recorded in mail_log. With the
-- capture driver nothing is sent: mails are logged only. Each template says when it is sent (sent_when, the "Sent
-- When" column of the Email Templates screen). Seeds the password-reset template.
-- Base set: one file per module, holding the tables that module writes; together the files build a blank database.
-- Plan: docs/planning/features/2026-10-28-starter-core.md
--
-- mail_template_id / user_id point at mail_template.id / user.id: indexed, no foreign key. Rows are never deleted.
-- (user_password_reset, the reset links, is in 2026-10-28-users-and-auth.sql.)
--
-- Codes:
--   mail_template.status           1 = active, 2 = inactive, 3 = draft
--   mail_log.status                1 = sent, 2 = failed, 3 = captured (not sent: no email service set up)
--   mail_log.client_app            the app the mail belongs to: 1 = manage, 2 = web

CREATE TABLE mail_template (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    code        VARCHAR(64)   NOT NULL,
    name        VARCHAR(150)  NOT NULL,
    sent_when   VARCHAR(150)  NULL,
    subject     VARCHAR(255)  NOT NULL,
    body_html   MEDIUMTEXT    NOT NULL,
    status      TINYINT       NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED  NULL,
    updated_by  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mail_template_code (code),
    KEY idx_mail_template_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO mail_template (code, name, sent_when, subject, body_html, status) VALUES (
    'password_reset',
    'Password reset',
    'Password reset requested',
    'Reset your {{appName}} password',
    '<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#1F2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px">
    <tr><td style="padding:28px 32px 8px;font-size:20px;font-weight:bold">Reset your password</td></tr>
    <tr><td style="padding:8px 32px;font-size:15px;line-height:22px">Hello {{name}},</td></tr>
    <tr><td style="padding:8px 32px;font-size:15px;line-height:22px">We received a request to reset the password of your {{appName}} account. Use the button below to choose a new password. The link works once and is valid for {{validMinutes}} minutes.</td></tr>
    <tr><td style="padding:16px 32px"><a href="{{resetLink}}" style="display:inline-block;padding:12px 20px;background:#6B3FA0;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:bold">Set a new password</a></td></tr>
    <tr><td style="padding:8px 32px;font-size:13px;line-height:20px;color:#6B7280">If the button does not work, open this link: <a href="{{resetLink}}" style="color:#6B3FA0">{{resetLink}}</a></td></tr>
    <tr><td style="padding:8px 32px 28px;font-size:13px;line-height:20px;color:#6B7280">If you did not ask for this, you can ignore this email: your password stays the same.</td></tr>
  </table>
</body>
</html>',
    1
);

CREATE TABLE mail_log (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    mail_template_id  INT UNSIGNED  NULL,
    template_code     VARCHAR(64)   NULL,
    client_app        TINYINT       NULL,
    user_id           INT UNSIGNED  NULL,
    recipient_email   VARCHAR(254)  NOT NULL,
    sender_email      VARCHAR(254)  NOT NULL,
    subject           VARCHAR(255)  NOT NULL,
    body_html         MEDIUMTEXT    NOT NULL,
    status            TINYINT       NOT NULL,
    error_message     VARCHAR(1000) NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    KEY idx_mail_log_mail_template_id (mail_template_id),
    KEY idx_mail_log_template_code (template_code),
    KEY idx_mail_log_user_id (user_id),
    KEY idx_mail_log_recipient_email (recipient_email),
    KEY idx_mail_log_status (status),
    KEY idx_mail_log_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
