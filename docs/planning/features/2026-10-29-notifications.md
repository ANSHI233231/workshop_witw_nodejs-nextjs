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
| TC-NOTIF-07 | Full page | several notifications | open `/notifications`, switch tabs, page, mark one read / unread (2026-11-16: the console has the per-row read / unread toggle; the website marks a row read on click, with Mark all as read, as on board Web-Notifications) | counts and lists match; the bell count follows | H | browser |
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
- 2026-11-16: Full re-run ([2026-11-16-full-test-and-docs](2026-11-16-full-test-and-docs.md)), group auth-platform, after the machine restart; screenshots in `.work/screenshots/2026-11-16-full-test/` (local, git-ignored).
- TC-NOTIF-08 PASS (API; role: User; screenshots: none) 2026-11-16: ct_auth_5's session on ct_auth_6's notification 407: PATCH read 404 NOTIFICATION_NOT_FOUND, PATCH unread 404 NOTIFICATION_NOT_FOUND
- TC-NOTIF-09 PASS (API; role: Super Admin; screenshots: none) 2026-11-16: anshika has 22 console notifications and 1 website ones; the website feed returns 1 (Account created), unread-count web 1 vs console 20: console-only rows do not show in the web app
- TC-NOTIF-02 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-02-1366.png, tc-notif-02-390.png) 2026-11-16: 1366: Add User "Ct Auth User10" (User "Ct Auth User10" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User10 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues || 390: Add User "Ct Auth User11" (User "Ct Auth User11" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User11 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues
- TC-NOTIF-03 PASS (browser, 1366 + 390 px; role: User; screenshots: tc-notif-03-1366.png, tc-notif-03-390.png) 2026-11-16: Change Password from the account menu; bell 2; popover: Notifications | 2 new | Mark all as read | CA | Your password was changed by you | Just now | A | Welcome! Your account was created by Anshika | Just now | Show all notifications; no issues
- TC-NOTIF-04 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-04-1366.png, tc-notif-04-390.png) 2026-11-16: 1366: admin set the password in Users ("Password changed for Ct Auth User10."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues || 390: admin set the password in Users ("Password changed for Ct Auth User11."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues
- TC-NOTIF-12 PASS (CLI + DB; role: none; screenshots: none) 2026-11-16: `notification/send-test 142 web` dry run printed "Would send ..." and wrote nothing (notification rows 3 -> 3); with `confirm` one row was added (4) and one audit row 601 recorded (count 0 -> 1); the user's bell shows the test notifications in TC-NOTIF-06 / 07.
- TC-NOTIF-06 PASS (browser, 1366 + 390 px; role: User; screenshots: tc-notif-06-1366.png, tc-notif-06-390.png) 2026-11-16: bell 6; popover shows the latest 5 (unread marked 5), header "Notifications 6 new Mark all as read"; Mark all as read -> bell 0; Show all notifications -> /notifications; no issues
- TC-NOTIF-07 PASS (browser, 1366 + 390 px; role: User; screenshots: tc-notif-07-1366.png, tc-notif-07-390.png) 2026-11-16: website /notifications: tabs {"All":9,"Unread":3,"Shared Safari":0,"Account":3}, All list 9, Unread list 3, Account list 3; opening one unread row: bell 3 -> 2, Unread tab 2; (the website page has no per-row Mark as unread, only click-to-read and Mark all as read); no issues
- TC-NOTIF-07-console PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-07-console-1366.png, tc-notif-07-console-390.png) 2026-11-16: console /notifications: tabs {"All":34,"Unread":32,"Account":0,"Jobs":2}, Jobs list 2; toggling the first Jobs row "nt-item" -> "nt-item is-unread" -> "nt-item": Unread 32 -> 33 (bell 33) -> 32; no issues
- TC-NOTIF-05 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-05-1366.png, tc-notif-05-390.png) 2026-11-16: 1366: failing run (notification/send-test with an unknown user): Job Run #10 Failed exit 1; the bell popover lists "The background job ct_auth failing 1366 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues || 390: failing run (notification/send-test with an unknown user): Job Run #12 Failed exit 1; the bell popover lists "The background job ct_auth failing 390 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues
- TC-NOTIF-10 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-10-1366.png, tc-notif-10-390.png) 2026-11-16: Email tab: 1 template (Password reset); In-app tab: 10 templates (Account Created, Password Changed, Background Job Failed, Test Notification plus the later Shared Safari / Gallery / Package / Quote kinds); search "Password" -> 1; status Active 10, Draft "No templates found."; no issues
- TC-NOTIF-11 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-notif-11-1366.png, tc-notif-11-390.png) 2026-11-16: 1366: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To Meher Kapoor Channel In-app Template Shared Safari Commented Sent On 16 Nov 2026, 01:2"; no issues || 390: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To ct_ First Admin Channel In-app Template Package Version Sent for Approval Sent On 16 N"; no issues
- TC-NOTIF-01 PASS (DB; role: none; screenshots: none) 2026-11-16: tables `notification` and `notification_template` exist; `notification_template` holds the base kinds 101 (Account created), 102 (Password changed), 501 (Background job failed), 601 (Test) plus the later Shared Safari / Gallery / Package / Quote kinds (10 rows), and `mail_template` has the Password reset email; the migration was not re-applied to a blank database (user rule: no DDL).

## 6. Post-deploy
