# Test document: Partner portal

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-full-test-and-docs.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §2.4, §3 |
| How it works | `docs/how-it-works/platform/partner-portal.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 16 | 16 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PTR-06 | Portal guards | Guest, User, Partner | PASS | 2026-11-16 |
| TC-PTR-11 | Business Profile | Partner | PASS | 2026-11-16 |
| TC-PTR-12 | Portal API guards | Partner | PASS | 2026-11-16 |
| TC-PORTAL-01 | The partner portal bell and Notifications page (board PP10) | Partner | PASS | 2026-11-16 |
| TC-PORTAL-02 | The partner portal Forgot password screen | Guest | PASS | 2026-11-16 |
| TC-PORTAL-03 | Change Password on the public website pages | User | PASS | 2026-11-16 |
| TC-PORTAL-04 | Change Password in the website's signed-in portal pages (My Quote Requests) | User | PASS | 2026-11-16 |
| TC-PORTAL-05 | The partner portal not-found page | Partner | PASS | 2026-11-16 |
| TC-PORTAL-06 | A signed-in non-partner cannot use the partner portal: redirected to Partner request, feed API 403 | User | PASS | 2026-11-16 |
| TC-LOCAL-06 | Partner signs in to the partner portal | Partner | PASS | 2026-11-16 |
| TC-FIX-10 | Languages screen offers the Partner Portal as a place | Super Admin | PASS | 2026-11-16 |
| TC-FIX-11 | Publish writes the portal's files | Super Admin | PASS | 2026-11-16 |
| TC-FIX-12 | Portal header language switch | Partner partner@example.in | PASS | 2026-11-16 |
| TC-FIX-13 | Default language of the portal | Super Admin, Partner | PASS | 2026-11-16 |
| TC-FIX-14 | Every portal text goes through t() | developer | PASS | 2026-11-16 |
| TC-FIX-15 | Change Password in the portal account menu | Partner partner@example.in | PASS | 2026-11-16 |

## Cases

### TC-PTR-06 Portal guards

| | |
|---|---|
| Title | Portal guards |
| Role | Guest, User, Partner |
| Pre-condition | accounts: none, Pending, Rejected, Inactive, Active |
| Steps | sign in to the portal and open Packages with each |
| Expected result | the guard for each state; Inactive shows only the deactivated message |
| Actual result | corrected screenshot names for the TC-PTR-06 line above; same result (portal /packages with none, no request, Pending, Rejected, Inactive, Active). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-06-none-1366.png, tc-ptr-06-none-390.png, tc-ptr-06-norequest-1366.png, tc-ptr-06-norequest-390.png, tc-ptr-06-pending-1366.png, tc-ptr-06-pending-390.png, tc-ptr-06-rejected-1366.png, tc-ptr-06-rejected-390.png, tc-ptr-06-inactive-1366.png, tc-ptr-06-inactive-390.png, tc-ptr-06-active-1366.png, tc-ptr-06-active-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-11 Business Profile

| | |
|---|---|
| Title | Business Profile |
| Role | Partner |
| Pre-condition | Active partner |
| Steps | PP9 |
| Expected result | details, logo, parks, partner since; view only |
| Actual result | partner@example.in Business Profile: business name, owner, parks, partner since, logo; view only (0 fields); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-11-1366.png, tc-ptr-11-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-12 Portal API guards

| | |
|---|---|
| Title | Portal API guards |
| Role | Partner |
| Pre-condition | non-partner, partner A |
| Steps | call partner B's package, gallery, quote; call portal routes as non-partner |
| Expected result | 403 / 404 each time |
| Actual result | coordinator check of the website-status own-data guard with a valid body: partner@example.in `PUT /api/package/portal/packages/9/website-status {"websiteStatus":3}` (package of Tiger Trail Tours) → 404 PACKAGE_NOT_FOUND, package 9 website status unchanged (2). |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PORTAL-01 The partner portal bell and Notifications page (board PP10)

| | |
|---|---|
| Title | The partner portal bell and Notifications page (board PP10) |
| Role | Partner |
| Pre-condition | A Partner with at least one 1301 notification (from TC-E2E-08) |
| Steps | 1. Sign in to the partner portal. 2. Open the bell: count, latest rows, Mark all as read, Show all notifications. 3. Open Notifications: grouping, click a row, Mark all as read (no per-row mark unread, as on board PP10; corrected 2026-11-16 after review). |
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
| Role | Partner |
| Pre-condition | after 02 |
| Steps | partner `/login` with `partner@example.in` |
| Expected result | Dashboard with business name and logo; Packages lists 2 live packages; Galleries 1 approved |
| Actual result | partner portal Login lands / with business name Tiger Song Safaris and 1 logo image(s); Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail (2 Live); Gallery lists Tiger Song Kanha Camp, Approved; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-06-1366.png, tc-local-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.4, §3 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-FIX-10 Languages screen offers the Partner Portal as a place

| | |
|---|---|
| Title | Languages screen offers the Partner Portal as a place |
| Role | Super Admin |
| Pre-condition | Signed in to the console as anshika@example.in |
| Steps | Open Languages › Language Master, open Add Language and an English edit |
| Expected result | "Where it is shown" has a Partner Portal row with Shown and Default ticks; English's Shown tick locked; list column "Shown in" names Partner Portal for a language shown there |
| Actual result | Add Language shows the places Web Portal, Web Website, Partner Portal, Manage with Shown and Default ticks; the saved ct_Test row's Shown in reads All; English's row lists Partner Portal; no console errors (only the guest 401 on the login page). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-10-1366.png, tc-fix-10-390.png |
| Ref (requirement / workflow) | language README §1 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-11 Publish writes the portal's files

| | |
|---|---|
| Title | Publish writes the portal's files |
| Role | Super Admin |
| Pre-condition | A `ct_` test language (code zq) shown in Partner Portal with one `ct_` screen text translated |
| Steps | Save the language, press Publish translations in App Translations |
| Expected result | apps/partner/translations/zq.json holds the text and languages.json lists EN and zq under languages; a language not shown in Partner Portal gets no file there |
| Actual result | with ct_Test (zq) shown in Partner Portal and two screen texts, Publish wrote apps/partner/translations/zq.json (2 texts) and languages.json (EN, ZQ); after hiding zq from Partner Portal and publishing again, zq.json was removed and languages.json listed only EN. |
| Result | PASS |
| Method | browser + files |
| Date | 2026-11-16 |
| Screenshot | tc-fix-11-1366.png |
| Ref (requirement / workflow) | language README §1, §5 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-12 Portal header language switch

| | |
|---|---|
| Title | Portal header language switch |
| Role | Partner partner@example.in |
| Pre-condition | TC-FIX-11 done; signed in to the portal as partner@example.in |
| Steps | Open the dashboard at 1366 and 390 px, click the zq button |
| Expected result | Header shows one button per language beside the bell; clicking zq re-renders the screen texts that have a translation, cookie `locale=zq` is set, EN switches back; no console errors |
| Actual result | header shows EN \| ZQ left of the bell at both widths (fits at 390); ZQ gives cookie locale=zq and "ct_zq Dashboard" / "ct_zq Quote Requests" in the sidebar and heading; EN returns to English; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-12-1366.png, tc-fix-12-390.png |
| Ref (requirement / workflow) | language README §6, frontend-apps |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-13 Default language of the portal

| | |
|---|---|
| Title | Default language of the portal |
| Role | Super Admin, Partner |
| Pre-condition | zq ticked Default for Partner Portal |
| Steps | Clear the locale cookie, open the portal |
| Expected result | Portal starts in zq; unticking the default returns the start to English |
| Actual result | with Default for Partner Portal ticked on ct_Test and the locale cookie cleared, the portal starts in ZQ; after ticking it on English (the console refuses unticking it on zq until another default exists) it starts in EN. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-13-1366.png, tc-fix-13-390.png |
| Ref (requirement / workflow) | language README §1 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-14 Every portal text goes through t()

| | |
|---|---|
| Title | Every portal text goes through t() |
| Role | developer |
| Pre-condition | Source of apps/partner |
| Steps | Scan components and pages for visible text not passed through t() |
| Expected result | No visible literal outside t() (except data, numbers, dates) |
| Actual result | no visible literal outside t() (status pages, package labels, badges, options and toasts all call t()); only the logo alt "Walk Into The Wild" (brand name, as in web) is plain. |
| Result | PASS |
| Method | static scan of apps/partner/src |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | frontend-apps |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-15 Change Password in the portal account menu

| | |
|---|---|
| Title | Change Password in the portal account menu |
| Role | Partner partner@example.in |
| Pre-condition | Signed in to the portal as partner@example.in |
| Steps | Open the account menu, choose Change Password; submit with a wrong current password; then change to a new value and back to the local password |
| Expected result | Menu lists Website, Change Password, Log Out; dialog shows name, username, email, role, status, Password updated, three fields; wrong current password gives the field error; a valid change shows "Password updated." and the new password signs in; the password is changed back |
| Actual result | the account menu lists Website, Change Password, Log Out; the dialog shows Name, Username, Email, Role, Status, Password updated and the three fields; a wrong current password gives "Your current password is not correct." under the field (422); changing to a new value showed "Password updated." and the new value signed in from a fresh browser; changed back to the local password at both widths, a final sign-in with the local password works, so the account ends as it started (its "Password updated" date moved to today); no console errors besides the expected 401 / 422. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-15-1366.png, tc-fix-15-390.png |
| Ref (requirement / workflow) | auth README §6, partner-portal |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PTR-06 history

- 2026-11-13 PASS: vivek.rao (Active) lands on the Dashboard; dev.khanna (Pending) and isha.kapoor (Rejected) are sent from `/`, `/notifications`, `/business-profile` to `/partner-request` (Pending card / form with reason); nikhil.bose (Inactive) from the same pages sees only "Account deactivated" and the deactivated message, no bell; ananya.iyer (none) gets "Become a Partner"; the sidebar for non-Active has only Partner request. Packages, Gallery and Quote Requests are Phases 4, 5, 7 (links go to the not-found page now); their guard is checked then.
- 2026-11-16 PASS: portal /packages with each state: none: ok (/login); norequest: ok (/partner-request); pending: ok (/partner-request); rejected: ok (/partner-request); inactive: ok (/partner-request); active: ok (/packages); the Inactive account sees only "Account deactivated" and the deactivated message; no console errors, no failed calls
- 2026-11-16 PASS (current): corrected screenshot names for the TC-PTR-06 line above; same result (portal /packages with none, no request, Pending, Rejected, Inactive, Active).

### TC-PTR-11 history

- 2026-11-13 PASS: vivek.rao's Business Profile shows the info banner, initials JT (no logo), Jungle Trails Safaris, Vivek Rao, 9811122233, hello@jungletrails.example.test, four parks, about, Partner since 14 Sep 2026; no edit control; no sideways scroll.
- 2026-11-16 PASS (current): partner@example.in Business Profile: business name, owner, parks, partner since, logo; view only (0 fields); no console errors, no failed calls

### TC-PTR-12 history

- 2026-11-13 PASS: curl: a non-partner and partner A (Jungle Trails) calling console partner routes for partner B (Tiger Trail) from the website → 403 `ACCESS_DENIED` each (GET detail, PUT edit, GET logo, GET list); partner A can't sign in to the console (`CONSOLE_ACCESS_DENIED`); no session → 401; `GET /requests/mine` gives only the caller's own row (A → partner 1, non-partner → null); A's send again → 409; A's own logo change after approval → 409 `PARTNER_REQUEST_LOCKED`. Package, gallery and quote routes don't exist yet: their part runs in Phases 5 and 7.
- 2026-11-14 PASS: curl: partner B (Tara Nambiar) marking partner A's request 7 → 404 `QUOTE_REQUEST_NOT_FOUND`; a user with no partner request (Ananya Iyer) and an inactive partner (Nikhil Bose) on the portal quote routes → 403 `QUOTE_REQUEST_PARTNER_NOT_ACTIVE`; a partner on the console quote routes (web and portal sessions) → 403 `ACCESS_DENIED`; no session → 401 `UNAUTHENTICATED`; each user's My Quote Requests lists only their own rows.
- 2026-11-14 PASS: curl: partner B (Tara Nambiar) on partner A's package 13 → 404 `PACKAGE_NOT_FOUND` for the detail, a version file, the Basic save, Send and the website-status switch; a user with no partner request (Ananya Iyer) and an inactive partner (Nikhil Bose) on the portal package routes → 403 `PACKAGE_PARTNER_NOT_ACTIVE`; a partner on a console package route → 403 `ACCESS_DENIED`; no session → 401 `UNAUTHENTICATED`. The quote part waits for Phase 7.
- 2026-11-16 PASS: ok ct_ptr_2 GET partner B's package 50 404; ok ct_ptr_2 PUT website-status on B's package 422; ok ct_ptr_2 POST send B's version 404; ok ct_ptr_2 GET B's gallery 404; ok ct_ptr_2 PUT mark B's quote 404; ok user@example.in GET partner B's package 50 403; ok user@example.in PUT website-status on B's package 422; ok user@example.in POST send B's version 403; ok user@example.in GET B's gallery 403; ok user@example.in PUT mark B's quote 403; ok user@example.in GET portal dashboard 403; ok user@example.in GET portal packages 403; ok user@example.in GET portal quote requests 403; ok user@example.in GET galleries 403; ok partner B own list 200
- 2026-11-16 PASS: corrected method line for the TC-PTR-12 line above. Partner A (ct_ptr_2) on partner B's (ct_ptr_1) package, version send, gallery and quote: 404 each; non-partner user@example.in on the same plus portal dashboard, packages, quote requests and galleries: 403 each; B's own list 200. Note: the PUT website-status call returned 422 (body validation ran first), so it is not counted as proof of the own-data check.
- 2026-11-16 PASS (current): coordinator check of the website-status own-data guard with a valid body: partner@example.in `PUT /api/package/portal/packages/9/website-status {"websiteStatus":3}` (package of Tiger Trail Tours) → 404 PACKAGE_NOT_FOUND, package 9 website status unchanged (2).

### TC-LOCAL-06 history

- 2026-11-16 PASS: partner portal sign-in as partner@example.in; business name and logo shown; Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail, both Live; Gallery shows Tiger Song Kanha Camp, Approved; no errors.
- 2026-11-16 PASS (current): partner portal Login lands / with business name Tiger Song Safaris and 1 logo image(s); Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail (2 Live); Gallery lists Tiger Song Kanha Camp, Approved; no issues
