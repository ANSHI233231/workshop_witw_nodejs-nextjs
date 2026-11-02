# Mail

Every mail the system writes is rendered from a **template** and recorded in the **mail log**. There is no email service yet, so mails are **captured**: logged, not sent.

## The flow

1. A module calls `mailService.sendTemplate(code, { to, userId, variables })` **after** its business transaction (never inside one).
2. The mail service loads the active template by `code`, renders the subject (plain text) and the body (each `{{variable}}` replaced by its value, **HTML-escaped**; an unknown variable becomes empty).
3. It hands the mail to the email adapter (`infrastructure/email`, `IEmailSender`). With `EMAIL_DRIVER=capture` (the only driver today) nothing leaves the server and the adapter answers `captured`.
4. It writes one `mail_log` row whatever happens: status **1 sent**, **2 failed** (with `error_message`; also when the template is missing or inactive) or **3 captured**. A provider failure never throws to the caller.

## Rules

- **Templates** (`mail_template`): `code` (the key the code uses, unique), `name`, `sent_when` (when it is sent, for the Email Templates screen), `subject`, `body_html`, `status` (1 active, 2 inactive, 3 draft). Added by migrations; no edit screen yet. A later change to a stored body is a CLI command calling `mailService.updateTemplateBody(id, bodyHtml)` (audited: module 7 Mail, 701 updated / 702 failed, with the body `from` / `to`): `npm run cli mail/witw-colours [confirm]` gives `password_reset` the WITW colours (dry run unless `confirm`; a second run changes nothing). Today: **`password_reset`** (Password reset): variables `name`, `appName`, `resetLink`, `validMinutes`.
- **Log** (`mail_log`): template id and code, `client_app` (the app of the request), `user_id` (the recipient), recipient, sender (`MAIL_FROM`), subject, rendered body, status, error, `created_by` (the signed-in person, if any), `created_at`. Rows are never deleted.
- **Email tab of Notification Templates** (manage, `/notifications/templates`, Super Admin): the templates from `GET /api/mail/templates` (`search` name / subject, `status` 1–3); View opens one (`GET /api/mail/templates/:id`) with its body in a sandboxed frame, placeholders shown as `{{name}}`. Read-only (templates come from migrations and CLI commands). See [manage console](../../platform/manage-console.md).
- **Mails in the Delivery Log** (manage, `/notifications/delivery-log`, Super Admin): the list comes from the notification module's `GET /api/notification/delivery-log` (mails and in-app together; mail status shown as 1 Delivered, 2 Failed, 3 Captured (not sent)); a mail's details from `GET /api/mail/logs/:id` (the full mail). `GET /api/mail/logs` still lists mails alone. The detail shows the rendered mail in a **sandboxed frame** (no scripts, links open in a new tab), so while mails are only captured an admin can open a reset link from here.
- Settings: `EMAIL_DRIVER` (`capture`), `MAIL_FROM`, and the app addresses used in links `APP_URL_MANAGE`, `APP_URL_WEB` (`.env.example`).

## Where it lives

- **Module:** `apps/api/src/modules/mail/` (`MailService`, `MailTemplateRepository`, `MailLogRepository`, `render-template.ts`)
- **Adapter:** `apps/api/src/infrastructure/email/` (`IEmailSender`, `createEmailSender`, `providers/capture.provider.ts`), built in `server.ts`
- **Tables:** `mail_template`, `mail_log` (migration `2026-10-28-mail.sql`)
- **manage:** `components/notification/`, `app/(dashboard)/notifications/templates/`, `…/delivery-log/`
