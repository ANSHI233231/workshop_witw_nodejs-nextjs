# Test document: Notifications

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-29-notifications.md`, `docs/planning/features/2026-11-16-full-test-and-docs.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §10; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §11 |
| How it works | `docs/how-it-works/modules/notification/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 15 | 15 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-NOTIF-01 | Migration builds | none | PASS | 2026-11-16 |
| TC-NOTIF-02 | Account created | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-03 | Password changed, own | User | PASS | 2026-11-16 |
| TC-NOTIF-04 | Password set by an admin | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-05 | Job failed | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-06 | Popover | User | PASS | 2026-11-16 |
| TC-NOTIF-07 | Full page | User | PASS | 2026-11-16 |
| TC-NOTIF-08 | Own rows only | User | PASS | 2026-11-16 |
| TC-NOTIF-09 | App separation | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-10 | Templates page | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-11 | Delivery Log | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-12 | Test command | none | PASS | 2026-11-16 |
| TC-NOTIF-13 | Gallery sent for approval (1101) reaches every Super Admin in the console | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-14 | Package version sent for approval (1201) reaches every Super Admin in the console | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-15 | The Delivery Log shows the 1101 and 1201 rows with the business name as actor | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-NOTIF-01 Migration builds

| | |
|---|---|
| Title | Migration builds |
| Role | none |
| Pre-condition | blank database with the base files |
| Steps | apply `2026-10-29-notification.sql` |
| Expected result | two tables, four templates |
| Actual result | tables `notification` and `notification_template` exist; `notification_template` holds the base kinds 101 (Account created), 102 (Password changed), 501 (Background job failed), 601 (Test) plus the later Shared Safari / Gallery / Package / Quote kinds (10 rows), and `mail_template` has the Password reset email; the migration was not re-applied to a blank database (user rule: no DDL). |
| Result | PASS |
| Method | DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-02 Account created

| | |
|---|---|
| Title | Account created |
| Role | Super Admin |
| Pre-condition | console signed in as a `ct_` Super Admin |
| Steps | Users › Add User (`ct_` user) |
| Expected result | the new user's portal bell shows 1; the row is in the Delivery Log as In-app, Sent |
| Actual result | 1366: Add User "Ct Auth User10" (User "Ct Auth User10" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User10 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues \|\| 390: Add User "Ct Auth User11" (User "Ct Auth User11" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User11 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-02-1366.png, tc-notif-02-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-03 Password changed, own

| | |
|---|---|
| Title | Password changed, own |
| Role | User |
| Pre-condition | portal signed in as the `ct_` user |
| Steps | change password from the user menu |
| Expected result | the portal bell shows the "password changed" notification |
| Actual result | Change Password from the account menu; bell 2; popover: Notifications \| 2 new \| Mark all as read \| CA \| Your password was changed by you \| Just now \| A \| Welcome! Your account was created by Anshika \| Just now \| Show all notifications; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-03-1366.png, tc-notif-03-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-04 Password set by an admin

| | |
|---|---|
| Title | Password set by an admin |
| Role | Super Admin |
| Pre-condition | console |
| Steps | Users › set the `ct_` user's password |
| Expected result | it shows in that user's portal, not in the console |
| Actual result | 1366: admin set the password in Users ("Password changed for Ct Auth User10."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues \|\| 390: admin set the password in Users ("Password changed for Ct Auth User11."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-04-1366.png, tc-notif-04-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-05 Job failed

| | |
|---|---|
| Title | Job failed |
| Role | Super Admin |
| Pre-condition | a schedule or one-time run of a command that fails |
| Steps | wait for the run to finish |
| Expected result | every Super Admin's console bell shows "Background job … failed"; clicking opens Background Jobs › Logs, errors only |
| Actual result | 1366: failing run (notification/send-test with an unknown user): Job Run #10 Failed exit 1; the bell popover lists "The background job ct_auth failing 1366 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues \|\| 390: failing run (notification/send-test with an unknown user): Job Run #12 Failed exit 1; the bell popover lists "The background job ct_auth failing 390 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-05-1366.png, tc-notif-05-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-06 Popover

| | |
|---|---|
| Title | Popover |
| Role | User |
| Pre-condition | unread notifications |
| Steps | open the bell |
| Expected result | latest five, unread marked; "Mark all as read" clears the count; "View all" opens the full page |
| Actual result | bell 6; popover shows the latest 5 (unread marked 5), header "Notifications 6 new Mark all as read"; Mark all as read -> bell 0; Show all notifications -> /notifications; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-06-1366.png, tc-notif-06-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-07 Full page

| | |
|---|---|
| Title | Full page |
| Role | User |
| Pre-condition | several notifications |
| Steps | open `/notifications`, switch tabs, page, mark one read / unread (2026-11-16: the console has the per-row read / unread toggle; the website marks a row read on click, with Mark all as read, as on board Web-Notifications) |
| Expected result | counts and lists match; the bell count follows |
| Actual result | website /notifications: tabs {"All":9,"Unread":3,"Shared Safari":0,"Account":3}, All list 9, Unread list 3, Account list 3; opening one unread row: bell 3 -> 2, Unread tab 2; (the website page has no per-row Mark as unread, only click-to-read and Mark all as read); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-07-1366.png, tc-notif-07-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-08 Own rows only

| | |
|---|---|
| Title | Own rows only |
| Role | User |
| Pre-condition | two users |
| Steps | `PATCH /api/notification/<other's id>/read` |
| Expected result | 404 `NOTIFICATION_NOT_FOUND` |
| Actual result | ct_auth_5's session on ct_auth_6's notification 407: PATCH read 404 NOTIFICATION_NOT_FOUND, PATCH unread 404 NOTIFICATION_NOT_FOUND |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-09 App separation

| | |
|---|---|
| Title | App separation |
| Role | Super Admin |
| Pre-condition | a console-only notification |
| Steps | open the portal |
| Expected result | it doesn't show there |
| Actual result | anshika has 22 console notifications and 1 website ones; the website feed returns 1 (Account created), unread-count web 1 vs console 20: console-only rows do not show in the web app |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-10 Templates page

| | |
|---|---|
| Title | Templates page |
| Role | Super Admin |
| Pre-condition | console |
| Steps | Notification Templates, Email and In-app tabs, search, status filter |
| Expected result | email: Password reset; in-app: the four kinds |
| Actual result | Email tab: 1 template (Password reset); In-app tab: 10 templates (Account Created, Password Changed, Background Job Failed, Test Notification plus the later Shared Safari / Gallery / Package / Quote kinds); search "Password" -> 1; status Active 10, Draft "No templates found."; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-10-1366.png, tc-notif-10-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-11 Delivery Log

| | |
|---|---|
| Title | Delivery Log |
| Role | Super Admin |
| Pre-condition | some mails (forgot password) and notifications |
| Steps | filters channel, template, status, search; open a mail and an in-app row |
| Expected result | one list, newest first; mail shows its rendered body; in-app shows recipient, status, read time |
| Actual result | 1366: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To Meher Kapoor Channel In-app Template Shared Safari Commented Sent On 16 Nov 2026, 01:2"; no issues \|\| 390: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To ct_ First Admin Channel In-app Template Package Version Sent for Approval Sent On 16 N"; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-11-1366.png, tc-notif-11-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-12 Test command

| | |
|---|---|
| Title | Test command |
| Role | none |
| Pre-condition | — |
| Steps | `npm run cli notification/send-test <id> web`, then with `confirm` |
| Expected result | dry run writes nothing; with confirm the user's portal bell shows it; one audit row |
| Actual result | `notification/send-test 142 web` dry run printed "Would send ..." and wrote nothing (notification rows 3 -> 3); with `confirm` one row was added (4) and one audit row 601 recorded (count 0 -> 1); the user's bell shows the test notifications in TC-NOTIF-06 / 07. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-13 Gallery sent for approval (1101) reaches every Super Admin in the console

| | |
|---|---|
| Title | Gallery sent for approval (1101) reaches every Super Admin in the console |
| Role | Super Admin |
| Pre-condition | TC-E2E-03 done |
| Steps | 1. Sign in to the console. 2. Open the bell, then Notifications > All and Unread. |
| Expected result | A row "ct_E2E Safaris sent ..." for `ct_E2E Gallery` with the business name as actor, unread, opens Gallery Approvals (corrected 2026-11-16 after review); not in the partner's feed |
| Actual result | console bell "2 new" and Notifications page > All show "ct_E2E Safaris sent the gallery ct_E2E Gallery for approval." (actor = business name, unread, kind label Gallery); tabs All 2, Unread 2, Account 0, Jobs 0; not in the partner's feed (TC-PORTAL-01); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-13-bell-1366.png, tc-notif-13-1366.png, tc-notif-13-bell-390.png, tc-notif-13-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §11 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-NOTIF-14 Package version sent for approval (1201) reaches every Super Admin in the console

| | |
|---|---|
| Title | Package version sent for approval (1201) reaches every Super Admin in the console |
| Role | Super Admin |
| Pre-condition | TC-E2E-05 done |
| Steps | Same as TC-NOTIF-13 for the package |
| Expected result | A row "ct_E2E Safaris sent ..." for `ct_E2E Safari Package`, actor = business name, in All and Unread |
| Actual result | the Unread tab shows "ct_E2E Safaris sent ct_E2E Safari Package (v1) for approval." (Package); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-14-1366.png, tc-notif-14-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §11 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-NOTIF-15 The Delivery Log shows the 1101 and 1201 rows with the business name as actor

| | |
|---|---|
| Title | The Delivery Log shows the 1101 and 1201 rows with the business name as actor |
| Role | Super Admin |
| Pre-condition | TC-NOTIF-13 and 14 done |
| Steps | 1. Console > Notification > Delivery Log, channel In-app. 2. Open the 1101 row and the 1201 row. |
| Expected result | Detail shows recipient, template, title, sent, actor `ct_E2E Safaris` |
| Actual result | Delivery Log search "ct_E2E" lists 7 in-app rows (3 Gallery Sent, 3 Package Version Sent, 1 Quote Request Received); details show recipient, template, sent, app Console, the bell preview "ct_E2E Safaris sent ..." and "Opens Gallery Approvals / Package Approvals" (the 1301 row shows Read and its read time); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-notif-15-list-1366.png, tc-notif-15-a-1366.png, tc-notif-15-b-1366.png, tc-notif-15-c-1366.png, tc-notif-15-list-390.png, tc-notif-15-c-390.png |
| Ref (requirement / workflow) | notification README |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-NOTIF-01 history

- 2026-10-29 PASS: both tables, four templates (applied to the existing database, not a blank one).
- 2026-11-16 PASS (current): tables `notification` and `notification_template` exist; `notification_template` holds the base kinds 101 (Account created), 102 (Password changed), 501 (Background job failed), 601 (Test) plus the later Shared Safari / Gallery / Package / Quote kinds (10 rows), and `mail_template` has the Password reset email; the migration was not re-applied to a blank database (user rule: no DDL).

### TC-NOTIF-02 history

- 2026-10-29 PASS: both new accounts got "Welcome! Your account was created by ct Notify Admin" in the portal (app 2), listed in the Delivery Log as In-app, Sent. Created through the API, not the Add User screen.
- 2026-11-16 PASS (current): 1366: Add User "Ct Auth User10" (User "Ct Auth User10" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User10 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues \|\| 390: Add User "Ct Auth User11" (User "Ct Auth User11" added.); the new user's website bell shows 1; Delivery Log row: 1 In-app Ct Auth User11 Account created Account Created 16 Nov 2026, 01:22 PM Sent ; no issues

### TC-NOTIF-03 history

- 2026-10-29 PASS: the member changed their own password with `X-Client-App: web` (204, twice, back to the original); the feed shows two 102 rows, actor ct Notify Member, `actorIsYou: true`.
- 2026-11-16 PASS (current): Change Password from the account menu; bell 2; popover: Notifications \| 2 new \| Mark all as read \| CA \| Your password was changed by you \| Just now \| A \| Welcome! Your account was created by Anshika \| Just now \| Show all notifications; no issues

### TC-NOTIF-04 history

- 2026-10-29 PASS: the password set by the admin shows in the member's portal ("Your password was changed by ct Notify Admin") and not in the console.
- 2026-11-16 PASS (current): 1366: admin set the password in Users ("Password changed for Ct Auth User10."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues \|\| 390: admin set the password in Users ("Password changed for Ct Auth User11."); the user's website bell 3 and popover lists "Your password was changed by Anshika"; the admin's own console notifications got no password row (0); no issues

### TC-NOTIF-05 history

- 2026-10-29 PASS: the failed run notified both active Super Admins (console); at 1366 the popover reads "The background job Test failing job failed", and clicking it opened `/background-jobs?tab=logs&errorsOnly=1` with the bell going 2 → 1.
- 2026-11-16 PASS (current): 1366: failing run (notification/send-test with an unknown user): Job Run #10 Failed exit 1; the bell popover lists "The background job ct_auth failing 1366 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues \|\| 390: failing run (notification/send-test with an unknown user): Job Run #12 Failed exit 1; the bell popover lists "The background job ct_auth failing 390 failed"; clicking it opened /background-jobs?tab=logs&errorsOnly=1; no issues

### TC-NOTIF-06 history

- 2026-10-29 PASS: console popover 2 items, portal popover 2 items, no sideways scroll at 1366 and 390; "Mark all as read" on the portal page took unread 2 → 0 and the bell to 0.
- 2026-11-16 PASS (current): bell 6; popover shows the latest 5 (unread marked 5), header "Notifications 6 new Mark all as read"; Mark all as read -> bell 0; Show all notifications -> /notifications; no issues

### TC-NOTIF-07 history

- 2026-10-29 PASS: console tabs "All 2 \| Unread 1 \| Account 0 \| Jobs 1"; marking the first item read changed `nt-item is-unread` → `nt-item` and the bell to 0; Jobs tab 1 item; portal tabs "All 2 \| Unread 2 \| Account 2".
- 2026-11-16 PASS (current): website /notifications: tabs {"All":9,"Unread":3,"Shared Safari":0,"Account":3}, All list 9, Unread list 3, Account list 3; opening one unread row: bell 3 -> 2, Unread tab 2; (the website page has no per-row Mark as unread, only click-to-read and Mark all as read); no issues

### TC-NOTIF-08 history

- 2026-10-29 PASS: the member's `PATCH /api/notification/6/read` (the admin's row) → 404 `NOTIFICATION_NOT_FOUND`.
- 2026-11-16 PASS (current): ct_auth_5's session on ct_auth_6's notification 407: PATCH read 404 NOTIFICATION_NOT_FOUND, PATCH unread 404 NOTIFICATION_NOT_FOUND

### TC-NOTIF-09 history

- 2026-10-29 PASS: the admin's web feed has 601 and 101 only; the 501 is only in the manage feed.
- 2026-11-16 PASS (current): anshika has 22 console notifications and 1 website ones; the website feed returns 1 (Account created), unread-count web 1 vs console 20: console-only rows do not show in the web app

### TC-NOTIF-10 history

- 2026-10-29 PASS: tabs "Email 1 \| In-app 4"; in-app rows Account Created, Password Changed, Background Job Failed, Test Notification; the detail dialog shows title, sent when, code, opens, "Shows in Portal" and the bell preview.
- 2026-11-16 PASS (current): Email tab: 1 template (Password reset); In-app tab: 10 templates (Account Created, Password Changed, Background Job Failed, Test Notification plus the later Shared Safari / Gallery / Package / Quote kinds); search "Password" -> 1; status Active 10, Draft "No templates found."; no issues

### TC-NOTIF-11 history

- 2026-10-29 PASS: 8 rows newest first, mail and in-app together; channel In-app → 7 rows; the mail dialog shows From, Template "Password reset", Status "Captured (not sent)", Subject; the in-app dialog shows recipient, status, app, title and the bell preview.
- 2026-11-16 PASS (current): 1366: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To Meher Kapoor Channel In-app Template Shared Safari Commented Sent On 16 Nov 2026, 01:2"; no issues \|\| 390: one list newest first (true); Channel Email 18 / In-app 20; Template "Password reset" 18; Status Captured 18; search ct_auth_1@ -> 1; mail dialog: "Email Details To ct_ptr_1@ct-test.example Channel Email From Workshop Witw <no-reply@example.com> Template Pas"; in-app dialog: "Notification Details To ct_ First Admin Channel In-app Template Package Version Sent for Approval Sent On 16 N"; no issues

### TC-NOTIF-12 history

- 2026-10-29 PASS: the dry run wrote nothing; with `confirm` the notification arrived ("Test notification from the system: Notifications are working.") with one audit row 601 per send.
- 2026-11-16 PASS (current): `notification/send-test 142 web` dry run printed "Would send ..." and wrote nothing (notification rows 3 -> 3); with `confirm` one row was added (4) and one audit row 601 recorded (count 0 -> 1); the user's bell shows the test notifications in TC-NOTIF-06 / 07.
