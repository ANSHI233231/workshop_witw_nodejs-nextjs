# Notification

**What it is.** The in-app notifications: one row per person in `notification`, listed on each app's **Notifications** page and counted by its header **bell**, whose popover shows the latest five. Nothing is sent outside the system (email is the [mail](../mail/README.md) module). The console also shows every email and every in-app notification in one **Delivery Log**, and both kinds of templates in **Notification Templates**.

**Who uses it.** Other modules send through `INotificationService.notify(...)` inside their own transaction. Every signed-in person reads and marks only their own notifications. Super Admins see the templates and the Delivery Log.

**Workflows:** [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md), [WITW Packages](../../workflows/WITW-Packages-Workflow.md).

## What sends a notification

| Kind | Sent by | To | Shows in |
|---|---|---|---|
| 101 Account created | users: an account is created (console Add User or the CLI) | the new user | the website |
| 102 Password changed | users: the password is changed, reset (forgot password) or set by an administrator | that user | the app it was changed in; set by an administrator → the website |
| 501 Background job failed | jobs: a run ends as Failed in the worker | every active Super Admin | the console |
| 601 Test notification | the CLI `notification/send-test` | the user named | the app named |
| 801 Shared Safari Joined | shared-safari: a user joins a safari for the first time (not a join again after leaving) | the host | the website |
| 802 Shared Safari Commented | shared-safari: someone other than the host posts a comment or reply | the host | the website (a partner writer's business name is the actor name) |
| 1101 Gallery Sent for Approval | gallery: a partner sends a gallery | every active Super Admin | the console (opens Gallery Approvals; the partner's business name is the actor name) |
| 1201 Package Version Sent for Approval | package: a partner sends a package version | every active Super Admin | the console (opens Package Approvals; the partner's business name is the actor name) |
| 1301 Quote request received | quote-request: a user sends a quote request | the package's partner | the Partner portal (opens Quote Requests) |
| 1302 Super Admin message on a quote request | quote-request: Console › Quote Requests › Send a notification | the package's partner | the Partner portal (opens Notifications; the message is the excerpt) |

The local sample data (`seed/shared-safari`, [shared-safari › Sample data](../shared-safari/README.md#sample-data-local-development-only)) writes the prototype's four Shared Safari notifications, plus a joined / commented row to `user@example.in` (Ananya Iyer) for each member and comment of her safaris, straight as in-app rows with their own created and read times (`createNotificationSeedModule`, built only by the CLI, refused in production); nothing is delivered. The Packages demo data (`packages-demo/add`, [quote-request › Demo data](../quote-request/README.md#demo-data-local-only)) writes the prototype's four partner notifications about quote requests, plus a read "received" row for its two other quote requests, the same way (Jungle Trails Safaris' are in `partner@example.in`'s portal feed).

Kinds are numbered by module in hundreds, like the audit actions. A new feature adds its kind to `NotificationKind`, a template row in its migration, the tab it belongs to (`KINDS_OF_TAB`, `KIND_TABS_OF_APP`), and its icon and link in each app (`KIND_STYLE`, the app's notification links).

## The row

- `user_id` (who receives it), `notification_kind`, `entity_type` + `entity_id` (what it is about, the audit log's entity codes), `title` and `excerpt` (the text as sent, never rewritten), `read_at`, `status` (1 active, -1 deleted), `created_by` (whose action caused it; empty for the system).
- **Where it shows:** `client_app` (the API's `ClientApp` codes: 1 console (manage), 2 website (web), 5 Partner portal (partner)), written by the sender, and `owner_type` + `owner_id` (whose space inside that app). The starter has no spaces, so both are empty; a project with spaces (an organisation, a branch) defines its owner types and sends them, and each bell and page passes its space in the query. A bell or page lists only the rows of its own app and space.

## Templates (`notification_template`)

- One row per kind: `notification_kind` (unique), `client_app` (the app it shows in; empty when it shows in the app the action happened in), `code`, `name`, `title_template`, `sent_when`, `opens`, `status` (1 active, 2 inactive, 3 draft). Added by migrations; read-only on screen.
- The feed returns each row's active `titleTemplate`, and the apps fill it: `{{actor}}` is the person who acted ("you" when it was the recipient, "the system" when nobody); `actorName` is the notification's stored `actor_name` when it has one (a partner's business name, kept as it was when sent), else the acting account's name, `{{subject}}` the stored title, each in bold. A kind without an active template shows its stored title.

## API (`/api/notification`)

Feed routes are `signed-in` (one's own rows, in the request's app; `ownerType` + `ownerId` in the query, both or neither); the last three are Super Admin.

1. `GET /?tab=&page=&limit=` → newest first, with `actorName` and `actorIsYou`; `tab`: `all`, `unread`, and the app's kind tabs: console `account` (101, 102) and `jobs` (501); website `shared-safari` (801, 802) and `account` (101, 102). Gallery sent for approval (1101) and package version sent for approval (1201), both to every Super Admin in the console with the partner's business name as the actor, have no kind tab yet: they show under `all` and `unread`. The Partner portal has no kind tabs: quote request received (1301, actor = the user, subject = the package) and the Super Admin's message on a quote request (1302, subject = the user's name, excerpt = the message, template "From the Super Admin about {{subject}}'s request:") show under `all` and `unread` ([quote-request](../quote-request/README.md)).
2. `GET /counts` → `{ all, unread, …the app's kind tabs }`.
3. `GET /unread-count` → `{ unread }` (the bell's count; its popover lists `GET /?tab=all&limit=5`).
4. `PATCH /:id/read`, `PATCH /:id/unread` → 204; another person's row → 404 `NOTIFICATION_NOT_FOUND`.
5. `POST /read-all` → `{ marked }`, "All notifications marked as read.".
6. `GET /templates?search=&status=` → the in-app templates (the Email tab uses `GET /api/mail/templates`).
7. `GET /delivery-log?search=&channel=&template=&status=&page=&limit=` → mails (`mail_log`) and in-app notifications in one list, newest first, paged in the database. Channel 1 email, 2 in-app; status 1 Delivered, 2 Failed, 3 Captured (mail), 4 Sent, 5 Read (in-app); `template` is the email or in-app template code.
8. `GET /delivery-log/in-app/:id` → one in-app delivery: recipient, app, template, title template, sent, status, read time, title, excerpt, actor, what it opens.

`markEntityRead(userId, entityType, entityId)` lets a feature mark a person's notifications about an item read when they open it. Read marks are the person's own state and are not audited; the writes that create notifications are audited by the feature that sends them. The test command records one audit row (601 sent, 602 failed); `test-data/remove-ct` removes `ct_` test notifications with one row (603 removed, 604 failed).

## The screens

- **Bell and popover** (the header of the console, the website and the Partner portal): the unread count (refreshed every minute, on page change and when a page marks rows read), the latest five, "Mark all as read", "Show all notifications". A notification with a link (a failed job → Background Jobs › Logs, errors only) opens it; the rest open the Notifications page.
- **Notifications page** (`/notifications` in each app, 50 per page, Mark all as read):
  - **Console:** tabs with counts, grouped Today / Yesterday / Earlier, and a per-row toggle to mark one read or unread.
  - **Website** (Web-Notifications) and **Partner portal** (PP10, no tabs): opening a row marks it read; there is no way to mark it unread again. The website has the tabs All, Unread, Shared Safari and Account.
- **Notification Templates** and **Delivery Log** (console, System › Notification), with a detail dialog per row: a mail shows its rendered body in a sandboxed frame; an in-app row shows its bell preview.

## Actor name and the Partner portal's feed

- `notify()` takes an optional `actorName`, stored in `notification.actor_name` (up to 255): the name shown for the actor when it isn't the account's own name. The gallery and package modules pass the partner's **business name** for 1101 and 1201, so the console reads "Jungle Trails Safaris sent …" (the bell, the Notifications page and the Delivery Log detail). It is kept as at sending, like the title; rows without it show the account's name.
- **Feed gates:** `createRouter({ …, feedGates })` takes, per client app, a check run before every feed call from that app (list, counts, unread count, mark read / unread, mark all read). `routes/index.ts` gives the Partner portal (client app 5) "is this user an **active partner**" (`partnerService.activePartnerOf`), so an Inactive partner, an applicant or anyone else calling the feed with the portal's header gets 403 `NOTIFICATION_FEED_CLOSED`. The website and the console have no gate.

## Where it lives

- **Module:** `apps/api/src/modules/notification/` (`createNotificationModule({ db, auditService, mailStatus })`, built in `routes/index.ts` and in the worker's `routes/jobs-worker.ts`, handed to the users and jobs modules)
- **Tables:** `notification`, `notification_template` (migration `2026-10-29-notification.sql`)
- **CLI:** `npm run cli notification/send-test <userId> <manage|web|partner> [confirm]`
- **manage:** `components/notification-feed/` (bell, popover, page; identical copies in web and partner), `components/notification/` (templates, delivery log), `components/console/console-notifications.ts`, `app/(dashboard)/notifications/`
- **web:** `components/notification-feed/`, `components/console/portal-notifications.ts`, `app/(portal)/notifications/`
- **partner:** `components/notification-feed/`, `components/portal/portal-notifications.ts`, `components/portal-notifications/`, `app/(portal)/notifications/`

## History

- Planning files: [2026-10-29-notifications](../../../planning/features/2026-10-29-notifications.md)
