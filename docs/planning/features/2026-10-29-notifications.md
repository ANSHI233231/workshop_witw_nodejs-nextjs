# In-app notifications

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-29 |
| Shipped | 2026-10-29 |
| Apps | api / manage / web |
| Test cases | TC-NOTIF-01..12 |
| How it works | [docs/how-it-works/modules/notification/README.md](../../how-it-works/modules/notification/README.md) |

## 1. Requirement (as given)

> "Add the Notification Feature in the starter repo, Include it from the admin panel and the web dashbaord pannel and also cresate a full page and the popover of the notification as per the refrence project, merge the delivery log into one as previous and also show them in the same way."

Earlier in the same discussion: "no one knwo twhat inside the starter repo … i don't think we have any confilft bya ding this before handove to them beacuse it's a frature that most peoples needed?"

## 2. Plan

Port the reference project's notification feature, keeping its shape and screens, without its business parts (communities, announcements, profiles).

- **Tables** (new dated migration `2026-10-29-notification.sql`): `notification` (one row per person: `user_id`, `notification_kind`, `entity_type` + `entity_id`, `client_app`, `owner_type` + `owner_id` (empty in the starter), `title`, `excerpt`, `read_at`, `status`, audit columns) and `notification_template` (one row per kind: `code`, `name`, `title_template`, `sent_when`, `opens`, `client_app` (empty = any app), `status`), with the starter's templates seeded.
- **Kinds** (by module hundred, like the audit actions): 101 account created (users → portal), 102 password changed (users → the app it was changed in; set by an admin → the user's portal), 501 background job failed (jobs → every active Super Admin, console), 601 test notification (notification → the app the CLI names).
- **API module `notification`** (`/api/notification`): the feed (`GET /`, `/counts`, `/unread-count`, `PATCH /:id/read|unread`, `POST /read-all`; signed-in, own rows, the request's app) and, for Super Admins, `GET /templates`, `GET /delivery-log` (mails and in-app in one list, newest first) and `GET /delivery-log/in-app/:id`. `INotificationService.notify(...)` for other modules.
- **Senders:** users (`createAccount` → 101; `changePassword` → 102 in the same transaction), jobs worker (a run ending Failed → 501 to every active Super Admin). CLI `notification/send-test <userId> <manage|web> [confirm]` (dry run unless `confirm`; audited).
- **Console (manage):** the header **bell** with the unread count and a **popover** of the latest five; the full **Notifications** page (`/notifications`, tabs All, Unread, Account, Jobs); **System › Notification** replaces System › Email: **Notification Templates** (`/notifications/templates`, Email and In-app tabs) and **Delivery Log** (`/notifications/delivery-log`, mails and in-app together, detail dialog per row). The old `/email/*` pages go.
- **Portal (web):** the same bell and popover in the portal header; the full page `/notifications` (tabs All, Unread, Account).
- **Docs:** new `modules/notification`; updated mail, users, jobs, audit, manage-console, frontend-apps, CLI README, PROTOTYPE-SYNC, AGENTS.md (module list).
- Not in this change: editing templates on screen (read-only, as in the reference), live push, a cleanup job for old notifications.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-NOTIF-01 | Migration builds | blank database with the base files | apply `2026-10-29-notification.sql` | two tables, four templates | H | DB |
| TC-NOTIF-02 | Account created | console signed in as a `ct_` Super Admin | Users › Add User (`ct_` user) | the new user's portal bell shows 1; the row is in the Delivery Log as In-app, Sent | H | browser |
| TC-NOTIF-03 | Password changed, own | portal signed in as the `ct_` user | change password from the user menu | the portal bell shows the "password changed" notification | H | browser |
| TC-NOTIF-04 | Password set by an admin | console | Users › set the `ct_` user's password | it shows in that user's portal, not in the console | M | browser |
| TC-NOTIF-05 | Job failed | a schedule or one-time run of a command that fails | wait for the run to finish | every Super Admin's console bell shows "Background job … failed"; clicking opens Background Jobs › Logs, errors only | H | browser |
| TC-NOTIF-06 | Popover | unread notifications | open the bell | latest five, unread marked; "Mark all as read" clears the count; "View all" opens the full page | H | browser |
| TC-NOTIF-07 | Full page | several notifications | open `/notifications`, switch tabs, page, mark one read / unread | counts and lists match; the bell count follows | H | browser |
| TC-NOTIF-08 | Own rows only | two users | `PATCH /api/notification/<other's id>/read` | 404 `NOTIFICATION_NOT_FOUND` | H | API |
| TC-NOTIF-09 | App separation | a console-only notification | open the portal | it doesn't show there | H | API |
| TC-NOTIF-10 | Templates page | console | Notification Templates, Email and In-app tabs, search, status filter | email: Password reset; in-app: the four kinds | M | browser |
| TC-NOTIF-11 | Delivery Log | some mails (forgot password) and notifications | filters channel, template, status, search; open a mail and an in-app row | one list, newest first; mail shows its rendered body; in-app shows recipient, status, read time | H | browser |
| TC-NOTIF-12 | Test command | — | `npm run cli notification/send-test <id> web`, then with `confirm` | dry run writes nothing; with confirm the user's portal bell shows it; one audit row | M | CLI |

Every screen case at 1366 and 390 px, with no console errors.

## 4. Decisions

- 2026-10-29 (user): add notifications to the starter before it is handed over, from the console and the web portal, with the full page and the popover as in the reference project, and the delivery log merged (mails and in-app in one list) as before.
- 2026-10-29 (user, asked what should send notifications): **core events** (account created, password changed, background job failed) plus a CLI command to send a test notification.
- 2026-10-29 (user, asked whether to keep the reference's space scoping): **keep the `owner_type` / `owner_id` columns** (empty in the starter), so projects with spaces need no schema change.

## 5. Execution log

- 2026-10-29 — Built: migration `2026-10-29-notification.sql` (two tables, four templates); API module `notification` (feed, read marks, templates, merged delivery log, in-app detail; `notify`, `markEntityRead`, `sendTest`), audit module 6 (601 / 602); senders in users (`createAccount` → 101, `changePassword` → 102, `activeUserIdsWithRole`) and jobs (`JobFailureNotifier` in the worker → 501 to every active Super Admin; the worker builds the notification and users modules); CLI `notification/send-test`. Console: bell and popover in the header, `/notifications`, System › Notification › Notification Templates and Delivery Log (the `/email/*` pages and `components/mail/` removed). Portal: identical feed components, bell in the header, `/notifications`. The reference's bell, popover, page, templates and delivery-log CSS copied into each app's `console-extras.css` (kind colours: account blue, jobs amber, test green). Docs: new `modules/notification`; users, jobs (its audit codes were the source project's, now the starter's), audit, mail (already right), manage-console, super-admin, CLI README, PROTOTYPE-SYNC, README, the web welcome page.
- Checks: `npm run verify` passes in the API; `tsc` and `lint` pass in manage and web; `npm run build` passes in both. `route/list`: 73 routes (public 8, session 3, roles 55, key 1, signed-in 6); `GET /api/notification/unread-count` signed out → 401.
- 2026-10-29 — Migration applied to `starter_local` on the user's request (backup taken first). TC-NOTIF-01 PASS: both tables, four templates (applied to the existing database, not a blank one).
- Test data (`ct_notify_admin`, a Super Admin; `ct_notify_member`, no role) created through the API; one failing one-time job run; a forgot-password mail for the member.
- TC-NOTIF-02 PASS: both new accounts got "Welcome! Your account was created by ct Notify Admin" in the portal (app 2), listed in the Delivery Log as In-app, Sent. Created through the API, not the Add User screen.
- TC-NOTIF-03 PASS: the member changed their own password with `X-Client-App: web` (204, twice, back to the original); the feed shows two 102 rows, actor ct Notify Member, `actorIsYou: true`.
- TC-NOTIF-04 PASS: the password set by the admin shows in the member's portal ("Your password was changed by ct Notify Admin") and not in the console.
- TC-NOTIF-05 PASS: the failed run notified both active Super Admins (console); at 1366 the popover reads "The background job Test failing job failed", and clicking it opened `/background-jobs?tab=logs&errorsOnly=1` with the bell going 2 → 1.
- TC-NOTIF-06 PASS: console popover 2 items, portal popover 2 items, no sideways scroll at 1366 and 390; "Mark all as read" on the portal page took unread 2 → 0 and the bell to 0.
- TC-NOTIF-07 PASS: console tabs "All 2 | Unread 1 | Account 0 | Jobs 1"; marking the first item read changed `nt-item is-unread` → `nt-item` and the bell to 0; Jobs tab 1 item; portal tabs "All 2 | Unread 2 | Account 2".
- TC-NOTIF-08 PASS: the member's `PATCH /api/notification/6/read` (the admin's row) → 404 `NOTIFICATION_NOT_FOUND`.
- TC-NOTIF-09 PASS: the admin's web feed has 601 and 101 only; the 501 is only in the manage feed.
- TC-NOTIF-10 PASS: tabs "Email 1 | In-app 4"; in-app rows Account Created, Password Changed, Background Job Failed, Test Notification; the detail dialog shows title, sent when, code, opens, "Shows in Portal" and the bell preview.
- TC-NOTIF-11 PASS: 8 rows newest first, mail and in-app together; channel In-app → 7 rows; the mail dialog shows From, Template "Password reset", Status "Captured (not sent)", Subject; the in-app dialog shows recipient, status, app, title and the bell preview.
- TC-NOTIF-12 PASS: the dry run wrote nothing; with `confirm` the notification arrived ("Test notification from the system: Notifications are working.") with one audit row 601 per send.
- Browser errors: only the sign-in page's signed-out session check (401), which exists without this feature; no other failed requests at either width.
- 2026-10-29 — The user checked it and asked to commit; shipped. The `ct_notify_*` test data stays in `starter_local` until the user asks for it to be removed.

## 6. Post-deploy
