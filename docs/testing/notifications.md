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
| TC-NOTIF-01 | Migration builds | — | PASS | 2026-10-29 |
| TC-NOTIF-02 | Account created | — | PASS | 2026-10-29 |
| TC-NOTIF-03 | Password changed, own | — | PASS | 2026-10-29 |
| TC-NOTIF-04 | Password set by an admin | — | PASS | 2026-10-29 |
| TC-NOTIF-05 | Job failed | — | PASS | 2026-10-29 |
| TC-NOTIF-06 | Popover | — | PASS | 2026-10-29 |
| TC-NOTIF-07 | Full page | — | PASS | 2026-10-29 |
| TC-NOTIF-08 | Own rows only | — | PASS | 2026-10-29 |
| TC-NOTIF-09 | App separation | — | PASS | 2026-10-29 |
| TC-NOTIF-10 | Templates page | — | PASS | 2026-10-29 |
| TC-NOTIF-11 | Delivery Log | — | PASS | 2026-10-29 |
| TC-NOTIF-12 | Test command | — | PASS | 2026-10-29 |
| TC-NOTIF-13 | Gallery sent for approval (1101) reaches every Super Admin in the console | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-14 | Package version sent for approval (1201) reaches every Super Admin in the console | Super Admin | PASS | 2026-11-16 |
| TC-NOTIF-15 | The Delivery Log shows the 1101 and 1201 rows with the business name as actor | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-NOTIF-01 Migration builds

| | |
|---|---|
| Title | Migration builds |
| Role | — |
| Pre-condition | blank database with the base files |
| Steps | apply `2026-10-29-notification.sql` |
| Expected result | two tables, four templates |
| Actual result | both tables, four templates (applied to the existing database, not a blank one). |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-02 Account created

| | |
|---|---|
| Title | Account created |
| Role | — |
| Pre-condition | console signed in as a `ct_` Super Admin |
| Steps | Users › Add User (`ct_` user) |
| Expected result | the new user's portal bell shows 1; the row is in the Delivery Log as In-app, Sent |
| Actual result | both new accounts got "Welcome! Your account was created by ct Notify Admin" in the portal (app 2), listed in the Delivery Log as In-app, Sent. Created through the API, not the Add User screen. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-03 Password changed, own

| | |
|---|---|
| Title | Password changed, own |
| Role | — |
| Pre-condition | portal signed in as the `ct_` user |
| Steps | change password from the user menu |
| Expected result | the portal bell shows the "password changed" notification |
| Actual result | the member changed their own password with `X-Client-App: web` (204, twice, back to the original); the feed shows two 102 rows, actor ct Notify Member, `actorIsYou: true`. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-04 Password set by an admin

| | |
|---|---|
| Title | Password set by an admin |
| Role | — |
| Pre-condition | console |
| Steps | Users › set the `ct_` user's password |
| Expected result | it shows in that user's portal, not in the console |
| Actual result | the password set by the admin shows in the member's portal ("Your password was changed by ct Notify Admin") and not in the console. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-05 Job failed

| | |
|---|---|
| Title | Job failed |
| Role | — |
| Pre-condition | a schedule or one-time run of a command that fails |
| Steps | wait for the run to finish |
| Expected result | every Super Admin's console bell shows "Background job … failed"; clicking opens Background Jobs › Logs, errors only |
| Actual result | the failed run notified both active Super Admins (console); at 1366 the popover reads "The background job Test failing job failed", and clicking it opened `/background-jobs?tab=logs&errorsOnly=1` with the bell going 2 → 1. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-06 Popover

| | |
|---|---|
| Title | Popover |
| Role | — |
| Pre-condition | unread notifications |
| Steps | open the bell |
| Expected result | latest five, unread marked; "Mark all as read" clears the count; "View all" opens the full page |
| Actual result | console popover 2 items, portal popover 2 items, no sideways scroll at 1366 and 390; "Mark all as read" on the portal page took unread 2 → 0 and the bell to 0. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-07 Full page

| | |
|---|---|
| Title | Full page |
| Role | — |
| Pre-condition | several notifications |
| Steps | open `/notifications`, switch tabs, page, mark one read / unread |
| Expected result | counts and lists match; the bell count follows |
| Actual result | console tabs "All 2 \| Unread 1 \| Account 0 \| Jobs 1"; marking the first item read changed `nt-item is-unread` → `nt-item` and the bell to 0; Jobs tab 1 item; portal tabs "All 2 \| Unread 2 \| Account 2". |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-08 Own rows only

| | |
|---|---|
| Title | Own rows only |
| Role | — |
| Pre-condition | two users |
| Steps | `PATCH /api/notification/<other's id>/read` |
| Expected result | 404 `NOTIFICATION_NOT_FOUND` |
| Actual result | the member's `PATCH /api/notification/6/read` (the admin's row) → 404 `NOTIFICATION_NOT_FOUND`. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-09 App separation

| | |
|---|---|
| Title | App separation |
| Role | — |
| Pre-condition | a console-only notification |
| Steps | open the portal |
| Expected result | it doesn't show there |
| Actual result | the admin's web feed has 601 and 101 only; the 501 is only in the manage feed. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-10 Templates page

| | |
|---|---|
| Title | Templates page |
| Role | — |
| Pre-condition | console |
| Steps | Notification Templates, Email and In-app tabs, search, status filter |
| Expected result | email: Password reset; in-app: the four kinds |
| Actual result | tabs "Email 1 \| In-app 4"; in-app rows Account Created, Password Changed, Background Job Failed, Test Notification; the detail dialog shows title, sent when, code, opens, "Shows in Portal" and the bell preview. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-11 Delivery Log

| | |
|---|---|
| Title | Delivery Log |
| Role | — |
| Pre-condition | some mails (forgot password) and notifications |
| Steps | filters channel, template, status, search; open a mail and an in-app row |
| Expected result | one list, newest first; mail shows its rendered body; in-app shows recipient, status, read time |
| Actual result | 8 rows newest first, mail and in-app together; channel In-app → 7 rows; the mail dialog shows From, Template "Password reset", Status "Captured (not sent)", Subject; the in-app dialog shows recipient, status, app, title and the bell preview. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-12 Test command

| | |
|---|---|
| Title | Test command |
| Role | — |
| Pre-condition | — |
| Steps | `npm run cli notification/send-test <id> web`, then with `confirm` |
| Expected result | dry run writes nothing; with confirm the user's portal bell shows it; one audit row |
| Actual result | the dry run wrote nothing; with `confirm` the notification arrived ("Test notification from the system: Notifications are working.") with one audit row 601 per send. |
| Result | PASS |
| Method | — |
| Date | 2026-10-29 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §10; WITW-Packages-Workflow §11 |
| Planning file | docs/planning/features/2026-10-29-notifications.md |

### TC-NOTIF-13 Gallery sent for approval (1101) reaches every Super Admin in the console

| | |
|---|---|
| Title | Gallery sent for approval (1101) reaches every Super Admin in the console |
| Role | Super Admin |
| Pre-condition | TC-E2E-03 done |
| Steps | 1. Sign in to the console. 2. Open the bell, then Notifications > All and Unread. |
| Expected result | A row "ct_E2E Safaris sent ..." for `ct_E2E Gallery` with the business name as actor, unread, opens Notifications; not in the partner's feed |
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

No case has more than one result line.
