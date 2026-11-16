# Test document: Partner portal

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-full-test-and-docs.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §2.4, §3 |
| How it works | `docs/how-it-works/platform/partner-portal.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 10 | 10 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PTR-06 | Portal guards | — | PASS | 2026-11-13 |
| TC-PTR-11 | Business Profile | — | PASS | 2026-11-13 |
| TC-PTR-12 | Portal API guards | — | PASS | 2026-11-14 |
| TC-PORTAL-01 | The partner portal bell and Notifications page (board PP10) | Partner | PASS | 2026-11-16 |
| TC-PORTAL-02 | The partner portal Forgot password screen | Guest | PASS | 2026-11-16 |
| TC-PORTAL-03 | Change Password on the public website pages | User | PASS | 2026-11-16 |
| TC-PORTAL-04 | Change Password in the website's signed-in portal pages (My Quote Requests) | User | PASS | 2026-11-16 |
| TC-PORTAL-05 | The partner portal not-found page | Partner | PASS | 2026-11-16 |
| TC-PORTAL-06 | A signed-in non-partner cannot use the partner portal: redirected to Partner request, feed API 403 | User | PASS | 2026-11-16 |
| TC-LOCAL-06 | Partner signs in to the partner portal | — | PASS | 2026-11-16 |

## Cases

### TC-PTR-06 Portal guards

| | |
|---|---|
| Title | Portal guards |
| Role | — |
| Pre-condition | accounts: none, Pending, Rejected, Inactive, Active |
| Steps | sign in to the portal and open Packages with each |
| Expected result | the guard for each state; Inactive shows only the deactivated message |
| Actual result | vivek.rao (Active) lands on the Dashboard; dev.khanna (Pending) and isha.kapoor (Rejected) are sent from `/`, `/notifications`, `/business-profile` to `/partner-request` (Pending card / form with reason); nikhil.bose (Inactive) from the same pages sees only "Account deactivated" and the deactivated message, no bell; ananya.iyer (none) gets "Become a Partner"; the sidebar for non-Active has only Partner request. Packages, Gallery and Quote Requests are Phases 4, 5, 7 (links go to the not-found page now); their guard is checked then. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-11 Business Profile

| | |
|---|---|
| Title | Business Profile |
| Role | — |
| Pre-condition | Active partner |
| Steps | PP9 |
| Expected result | details, logo, parks, partner since; view only |
| Actual result | vivek.rao's Business Profile shows the info banner, initials JT (no logo), Jungle Trails Safaris, Vivek Rao, 9811122233, hello@jungletrails.example.test, four parks, about, Partner since 14 Sep 2026; no edit control; no sideways scroll. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-12 Portal API guards

| | |
|---|---|
| Title | Portal API guards |
| Role | — |
| Pre-condition | non-partner, partner A |
| Steps | call partner B's package, gallery, quote; call portal routes as non-partner |
| Expected result | 403 / 404 each time |
| Actual result | curl: partner B (Tara Nambiar) on partner A's package 13 → 404 `PACKAGE_NOT_FOUND` for the detail, a version file, the Basic save, Send and the website-status switch; a user with no partner request (Ananya Iyer) and an inactive partner (Nikhil Bose) on the portal package routes → 403 `PACKAGE_PARTNER_NOT_ACTIVE`; a partner on a console package route → 403 `ACCESS_DENIED`; no session → 401 `UNAUTHENTICATED`. The quote part waits for Phase 7. |
| Result | PASS |
| Method | API, Phase 5 package part |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PORTAL-01 The partner portal bell and Notifications page (board PP10)

| | |
|---|---|
| Title | The partner portal bell and Notifications page (board PP10) |
| Role | Partner |
| Pre-condition | A Partner with at least one 1301 notification (from TC-E2E-08) |
| Steps | 1. Sign in to the partner portal. 2. Open the bell: count, latest rows, Mark all as read, Show all notifications. 3. Open Notifications: tabs, grouping, mark one read / unread. |
| Expected result | Count matches unread; rows open Quote Requests; mark read lowers the count; no kind tabs beyond All / Unread |
| Actual result | bell popover lists the quote notification, "Show all notifications" opens /notifications (no kind tabs, only the 1301 row, no 1101 / 1201), "Mark all as read" gives "All notifications marked as read.", clicking the row opens Quote Requests. The portal page has no per-row mark unread (only the bell and Mark all); the unread to read change was also seen in TC-E2E-09 (1 new, then read in the Delivery Log); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-01-bell-1366.png, tc-portal-01-1366.png, tc-portal-01-bell-390.png, tc-portal-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §11 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-PORTAL-02 The partner portal Forgot password screen

| | |
|---|---|
| Title | The partner portal Forgot password screen |
| Role | Guest |
| Pre-condition | Signed out |
| Steps | 1. Open portal `/forgot-password` (link from sign-in). 2. Submit with an empty field, then with the `ct_e2e_1` email. |
| Expected result | Empty shows the required message; a valid email moves to the next step ("code sent"); back link goes to sign-in; no console errors |
| Actual result | from the portal sign-in link; empty gives "Enter your registered email.", bad email "Enter a valid email address.", valid gives "Check Your Email" (masked c***@ct-test.example), "Use a different email" returns to the form; at 1366 px the captured reset link (mail_log, client app 5) opened Set New Password, mismatch gave "Passwords do not match.", the change gave "Password Changed" and the new password signed in (the set-password screen was not viewed at 390 px: the link is single use); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-02-1366.png, tc-portal-02-error-1366.png, tc-portal-02-sent-1366.png, tc-portal-02-newpw-1366.png, tc-portal-02-done-1366.png, tc-portal-02-390.png, tc-portal-02-error-390.png, tc-portal-02-sent-390.png |
| Ref (requirement / workflow) | auth module, docs/how-it-works/modules/auth |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-PORTAL-03 Change Password on the public website pages

| | |
|---|---|
| Title | Change Password on the public website pages |
| Role | User |
| Pre-condition | Own `ct_e2e_1` account |
| Steps | 1. Sign in on the website, open `/packages`. 2. Account menu > Change Password. 3. Empty submit, mismatch, wrong current password, then valid change. 4. Sign in with the new password. |
| Expected result | Each error shown with its message; valid change succeeds and the new password signs in |
| Actual result | own ct_e2e_1 account on /packages: empty gives the three required messages, mismatch "do not match.", wrong current password "Your current password is not correct." (the expected 422 on POST /auth/change-password), valid change "Password updated." and the new password signs in; the only console error is that expected 422. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-03-dialog-1366.png, tc-portal-03-errors-1366.png, tc-portal-03-wrong-1366.png, tc-portal-03-1366.png, tc-portal-03-dialog-390.png, tc-portal-03-errors-390.png, tc-portal-03-wrong-390.png, tc-portal-03-390.png |
| Ref (requirement / workflow) | docs/how-it-works/modules/auth |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-PORTAL-04 Change Password in the website's signed-in portal pages (My Quote Requests)

| | |
|---|---|
| Title | Change Password in the website's signed-in portal pages (My Quote Requests) |
| Role | User |
| Pre-condition | Own `ct_e2e_1` account |
| Steps | 1. Sign in with the new password from TC-PORTAL-03, open `/my-quote-requests`. 2. Account menu > Change Password, change back. |
| Expected result | Dialog opens in the portal frame and the change succeeds (the partner portal app has no Change Password entry; noted) |
| Actual result | on /my-quote-requests the same dialog opens in the portal frame and changing back gave "Password updated."; the old password signs in again. The partner portal app has no Change Password entry in its menu (the menu has Website and Log Out only); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-04-dialog-1366.png, tc-portal-04-1366.png, tc-portal-04-dialog-390.png, tc-portal-04-390.png |
| Ref (requirement / workflow) | docs/how-it-works/modules/auth |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-PORTAL-05 The partner portal not-found page

| | |
|---|---|
| Title | The partner portal not-found page |
| Role | Partner |
| Pre-condition | Signed in as the ct_e2e_1 partner |
| Steps | 1. Open portal `/does-not-exist-ct`. 2. Open `/gallery/99999999`. |
| Expected result | A framed not-found page with the portal's wording and a way back; no crash |
| Actual result | /does-not-exist-ct, /gallery/99999999 and /packages/99999999 show "404 Page not found" inside the portal frame with Go Back and Contact Us (HTTP status of the streamed page is 200); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-05-1366.png, tc-portal-05-1-1366.png, tc-portal-05-2-1366.png, tc-portal-05-390.png, tc-portal-05-1-390.png, tc-portal-05-2-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §3 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-PORTAL-06 A signed-in non-partner cannot use the partner portal: redirected to Partner request, feed API 403

| | |
|---|---|
| Title | A signed-in non-partner cannot use the partner portal: redirected to Partner request, feed API 403 |
| Role | User |
| Pre-condition | user@example.in signed in on the website (not a partner) |
| Steps | 1. Sign in at the portal with user@example.in. 2. Open `/packages`, `/gallery`, `/notifications`, `/quote-requests`. 3. Call the notification feed API with the portal's client app header. |
| Expected result | Every address lands on the Become a Partner (Partner request) screen, no bell, no partner data; the feed API answers 403 `NOTIFICATION_FEED_CLOSED` |
| Actual result | user@example.in signs in at the portal and every address (/packages, /gallery, /notifications, /quote-requests) lands on "Become a Partner" (/partner-request) with no bell and no partner data; curl with X-Client-App partner: GET /notification/unread-count, /notification and /notification/counts all answer 403 NOTIFICATION_FEED_CLOSED. The portal's 403 page (forbidden.tsx) is not reachable by any address today (no route calls forbidden()); no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-portal-06-1366.png, tc-portal-06-packages-1366.png, tc-portal-06-390.png, tc-portal-06-packages-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §1, §3 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-LOCAL-06 Partner signs in to the partner portal

| | |
|---|---|
| Title | Partner signs in to the partner portal |
| Role | — |
| Pre-condition | after 02 |
| Steps | partner `/login` with `partner@example.in` |
| Expected result | Dashboard with business name and logo; Packages lists 2 live packages; Galleries 1 approved |
| Actual result | partner portal sign-in as partner@example.in; business name and logo shown; Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail, both Live; Gallery shows Tiger Song Kanha Camp, Approved; no errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PTR-12 history

- 2026-11-13 PASS: curl: a non-partner and partner A (Jungle Trails) calling console partner routes for partner B (Tiger Trail) from the website → 403 `ACCESS_DENIED` each (GET detail, PUT edit, GET logo, GET list); partner A can't sign in to the console (`CONSOLE_ACCESS_DENIED`); no session → 401; `GET /requests/mine` gives only the caller's own row (A → partner 1, non-partner → null); A's send again → 409; A's own logo change after approval → 409 `PARTNER_REQUEST_LOCKED`. Package, gallery and quote routes don't exist yet: their part runs in Phases 5 and 7.
- 2026-11-14 PASS: curl: partner B (Tara Nambiar) marking partner A's request 7 → 404 `QUOTE_REQUEST_NOT_FOUND`; a user with no partner request (Ananya Iyer) and an inactive partner (Nikhil Bose) on the portal quote routes → 403 `QUOTE_REQUEST_PARTNER_NOT_ACTIVE`; a partner on the console quote routes (web and portal sessions) → 403 `ACCESS_DENIED`; no session → 401 `UNAUTHENTICATED`; each user's My Quote Requests lists only their own rows.
- 2026-11-14 PASS (current): curl: partner B (Tara Nambiar) on partner A's package 13 → 404 `PACKAGE_NOT_FOUND` for the detail, a version file, the Basic save, Send and the website-status switch; a user with no partner request (Ananya Iyer) and an inactive partner (Nikhil Bose) on the portal package routes → 403 `PACKAGE_PARTNER_NOT_ACTIVE`; a partner on a console package route → 403 `ACCESS_DENIED`; no session → 401 `UNAUTHENTICATED`. The quote part waits for Phase 7.
