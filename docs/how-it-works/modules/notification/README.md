# Notification

**What it is.** The in-app notifications: one row per person in `notification`, listed on each app's **Notifications** page and counted by its header **bell**, whose popover shows the latest five. Nothing is sent outside the system (email is the [mail](../mail/README.md) module). The console also shows every email and every in-app notification in one **Delivery Log**, and both kinds of templates in **Notification Templates**.

**Who uses it.** Other modules send through `INotificationService.notify(...)` inside their own transaction. Every signed-in person reads and marks only their own notifications. Super Admins see the templates and the Delivery Log.

## What sends a notification

| Kind | Sent by | To | Shows in |
|---|---|---|---|
| 101 Account created | users: an account is created (console Add User or the CLI) | the new user | the portal |
| 102 Password changed | users: the password is changed, reset (forgot password) or set by an administrator | that user | the app it was changed in; set by an administrator → the portal |
| 501 Background job failed | jobs: a run ends as Failed in the worker | every active Super Admin | the console |
| 601 Test notification | the CLI `notification/send-test` | the user named | the app named |

The local sample data (`seed/shared-safari`, [shared-safari › Sample data](../shared-safari/README.md#sample-data-local-development-only)) writes the prototype's four Shared Safari notifications straight as in-app rows with their own created and read times (`createNotificationSeedModule`, built only by the CLI, refused in production); nothing is delivered.

Kinds are numbered by module in hundreds, like the audit actions. A new feature adds its kind to `NotificationKind`, a template row in its migration, the tab it belongs to (`KINDS_OF_TAB`, `KIND_TABS_OF_APP`), and its icon and link in each app (`KIND_STYLE`, the app's notification links).

## The row

- `user_id` (who receives it), `notification_kind`, `entity_type` + `entity_id` (what it is about, the audit log's entity codes), `title` and `excerpt` (the text as sent, never rewritten), `read_at`, `status` (1 active, -1 deleted), `created_by` (whose action caused it; empty for the system).
- **Where it shows:** `client_app` (1 console, 2 portal), written by the sender, and `owner_type` + `owner_id` (whose space inside that app). The starter has no spaces, so both are empty; a project with spaces (an organisation, a branch) defines its owner types and sends them, and each bell and page passes its space in the query. A bell or page lists only the rows of its own app and space.

## Templates (`notification_template`)

- One row per kind: `notification_kind` (unique), `client_app` (the app it shows in; empty when it shows in the app the action happened in), `code`, `name`, `title_template`, `sent_when`, `opens`, `status` (1 active, 2 inactive, 3 draft). Added by migrations; read-only on screen.
- The feed returns each row's active `titleTemplate`, and the apps fill it: `{{actor}}` is the person who acted ("you" when it was the recipient, "the system" when nobody), `{{subject}}` the stored title, each in bold. A kind without an active template shows its stored title.

## API (`/api/notification`)

Feed routes are `signed-in` (one's own rows, in the request's app; `ownerType` + `ownerId` in the query, both or neither); the last three are Super Admin.

1. `GET /?tab=&page=&limit=` → newest first, with `actorName` and `actorIsYou`; `tab`: `all`, `unread`, and the app's kind tabs: console `account` (101, 102) and `jobs` (501); portal `account`.
2. `GET /counts` → `{ all, unread, …the app's kind tabs }`.
3. `GET /unread-count` → `{ unread }` (the bell's count; its popover lists `GET /?tab=all&limit=5`).
4. `PATCH /:id/read`, `PATCH /:id/unread` → 204; another person's row → 404 `NOTIFICATION_NOT_FOUND`.
5. `POST /read-all` → `{ marked }`, "All notifications marked as read.".
6. `GET /templates?search=&status=` → the in-app templates (the Email tab uses `GET /api/mail/templates`).
7. `GET /delivery-log?search=&channel=&template=&status=&page=&limit=` → mails (`mail_log`) and in-app notifications in one list, newest first, paged in the database. Channel 1 email, 2 in-app; status 1 Delivered, 2 Failed, 3 Captured (mail), 4 Sent, 5 Read (in-app); `template` is the email or in-app template code.
8. `GET /delivery-log/in-app/:id` → one in-app delivery: recipient, app, template, title template, sent, status, read time, title, excerpt, actor, what it opens.

`markEntityRead(userId, entityType, entityId)` lets a feature mark a person's notifications about an item read when they open it. Read marks are the person's own state and are not audited; the writes that create notifications are audited by the feature that sends them. The test command records one audit row (601 sent, 602 failed).

## The screens

- **Bell and popover** (console and portal header): the unread count (refreshed every minute, on page change and when a page marks rows read), the latest five, "Mark all as read", "Show all notifications". A notification with a link (a failed job → Background Jobs › Logs, errors only) opens it; the rest open the Notifications page.
- **Notifications page** (`/notifications` in both apps): tabs with counts, grouped Today / Yesterday / Earlier, mark one read or unread, mark all read, 50 per page.
- **Notification Templates** and **Delivery Log** (console, System › Notification), with a detail dialog per row: a mail shows its rendered body in a sandboxed frame; an in-app row shows its bell preview.

## Where it lives

- **Module:** `apps/api/src/modules/notification/` (`createNotificationModule({ db, auditService, mailStatus })`, built in `routes/index.ts` and in the worker's `routes/jobs-worker.ts`, handed to the users and jobs modules)
- **Tables:** `notification`, `notification_template` (migration `2026-10-29-notification.sql`)
- **CLI:** `npm run cli notification/send-test <userId> <manage|web> [confirm]`
- **manage:** `components/notification-feed/` (bell, popover, page; identical copies in web), `components/notification/` (templates, delivery log), `components/console/console-notifications.ts`, `app/(dashboard)/notifications/`
- **web:** `components/notification-feed/`, `components/console/portal-notifications.ts`, `app/(portal)/notifications/`

## History

- Planning files: [2026-10-29-notifications](../../../planning/features/2026-10-29-notifications.md)
