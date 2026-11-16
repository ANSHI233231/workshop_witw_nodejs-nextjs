# Test document: Users and Auth

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-28-route-access.md`, `docs/planning/features/2026-10-28-starter-core.md`, `docs/planning/features/2026-11-04-shared-safari.md`, `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §2; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §2.2, §3; `docs/how-it-works/workflows/technical-document.md` §4 |
| How it works | `docs/how-it-works/modules/auth/README.md`, `docs/how-it-works/modules/users/README.md`, `docs/how-it-works/platform/route-access.md`, `docs/how-it-works/platform/partner-portal.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 23 | 23 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-ACCESS-01 | A route without access doesn't compile | — | PASS | 2026-10-28 |
| TC-ACCESS-02 | No way around `apiRouter()` | — | PASS | 2026-10-28 |
| TC-ACCESS-03 | `route/list` | — | PASS | 2026-10-28 |
| TC-ACCESS-04 | Signed out is refused everywhere but the public routes | — | PASS | 2026-10-28 |
| TC-ACCESS-05 | Wrong role is refused | — | PASS | 2026-10-28 |
| TC-ACCESS-06 | Console works | — | PASS | 2026-10-28 |
| TC-ACCESS-07 | Web works | — | PASS | 2026-10-28 |
| TC-START-03 | First Super Admin | — | PASS | 2026-10-28 |
| TC-START-06 | Console screens | — | PASS | 2026-10-28 |
| TC-START-12 | Forgot password | — | PASS | 2026-10-28 |
| TC-AUTH-01 | Sign Up | — | PASS | 2026-11-10 |
| TC-AUTH-02 | Sign Up errors | — | PASS | 2026-11-04 |
| TC-AUTH-03 | Sign in with email or mobile | — | PASS | 2026-11-04 |
| TC-AUTH-04 | Console from the website | — | PASS | 2026-11-10 |
| TC-PTR-07 | Portal sign-in | — | PASS | 2026-11-14 |
| TC-LOCAL-01 | Dry run writes nothing | — | PASS | 2026-11-16 |
| TC-LOCAL-02 | Add creates the accounts and data | — | PASS | 2026-11-16 |
| TC-LOCAL-03 | Add again duplicates nothing | — | PASS | 2026-11-16 |
| TC-LOCAL-04 | Refused in production | — | PASS | 2026-11-16 |
| TC-LOCAL-05 | Super Admin signs in to the console | — | PASS | 2026-11-16 |
| TC-LOCAL-07 | Partner signs in to the website | — | PASS | 2026-11-16 |
| TC-LOCAL-08 | User signs in to the website | — | PASS | 2026-11-16 |
| TC-LOCAL-12 | Remove takes only these accounts | — | PASS | 2026-11-16 |

## Cases

### TC-ACCESS-01 A route without access doesn't compile

| | |
|---|---|
| Title | A route without access doesn't compile |
| Role | — |
| Pre-condition | the change applied |
| Steps | scratch lines in a route file: `route.get('/x', asyncHandler(…))`, `route.get('/x', validate(schema), …)`, `route.get('/x', { kind: 'public', … })`; `npm run type-check` |
| Expected result | each is a type error; scratch lines removed |
| Actual result | scratch routes in `audit.routes.ts` with only a handler, with a validator in the access place, and with a hand-written `{ kind: 'public', … }`: three type errors; file restored. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-02 No way around `apiRouter()`

| | |
|---|---|
| Title | No way around `apiRouter()` |
| Role | — |
| Pre-condition | the change applied |
| Steps | scratch: `import { Router } from 'express'` in a module, `express.Router()`, `app.get('/api/x', …)` in `routes/index.ts`; `npm run lint` |
| Expected result | each fails with the rule's message; scratch removed |
| Actual result | scratch `import { Router } from 'express'`, `express.Router()` in a module and `app.get('/api/x', …)` in `routes/index.ts`: three lint errors with the rule's message (a `raw.get(...)` on the scratch Router is not flagged itself, but that Router can't be made without the import error); files restored. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-03 `route/list`

| | |
|---|---|
| Title | `route/list` |
| Role | — |
| Pre-condition | the change applied |
| Steps | `npm run cli route/list` |
| Expected result | every route with method, full path and access; public: health, sign-in, refresh, sign-out, forgot and reset password (GET and POST), languages active; key: log ingest; everything else session or Super Admin |
| Actual result | `route/list` printed 64 routes, "public 8, session 3, roles 52, key 1"; public: health, sign-in, refresh, sign-out, forgot password, reset password GET and POST, languages active; key: the log ingest; session: me, change-password, console-roles; every other route Super Admin. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-04 Signed out is refused everywhere but the public routes

| | |
|---|---|
| Title | Signed out is refused everywhere but the public routes |
| Role | — |
| Pre-condition | API running |
| Steps | call every route from `route/list` without a session |
| Expected result | public ones answer (200 or a validation 422), key route 401 without the key, every other route 401 |
| Actual result | every route from `route/list` called with no session (`:id` 1, `:app` api, `:name` error.log, `:code` hi; POST bodies `{}`): health and languages active 200, sign-out 204, sign-in / forgot / reset 422 `VALIDATION_FAILED` (empty body), refresh 401 `UNAUTHENTICATED` from its own check (no refresh cookie; the access let it through), the ingest 401 `LOG_INGEST_DENIED`, all 3 session and all 52 Super Admin routes 401 `UNAUTHENTICATED`. |
| Result | PASS |
| Method | API |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-05 Wrong role is refused

| | |
|---|---|
| Title | Wrong role is refused |
| Role | — |
| Pre-condition | API running, a `ct_` user without Super Admin in the web app |
| Steps | call a Super Admin route with that user's session |
| Expected result | 403 `ACCESS_DENIED` |
| Actual result | `ct_access_plain` (no role, made by the `ct_` Super Admin through `POST /api/users`) signed in to web: `/api/auth/me` 200; `/api/users`, `/api/audit/logs`, `/api/jobs/runs`, `/api/language/master`, `/api/mail/logs` 403 `ACCESS_DENIED`; the Super Admin's `/api/users` 200. |
| Result | PASS |
| Method | API |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-06 Console works

| | |
|---|---|
| Title | Console works |
| Role | — |
| Pre-condition | API and manage running, `ct_` Super Admin |
| Steps | sign in; open Users, Roles, Audit Log, Error Logs, System Logs (download a file), Background Jobs, Languages, App Translations, Email Templates, Sent Email Log; open Change Password from the user menu; log out |
| Expected result | every page loads its data; no console errors or failed calls; 1366 and 390 px |
| Actual result | signed in through the console's form as `ct_access_admin`; Dashboard, Users (both test users listed), Roles, Audit Log, Error Logs, System Logs, Background Jobs, Language Master, App Translations, Email Templates, Sent Email Log loaded, no error page, no sideways scroll; the log download from the signed-in page 200; Change Password opened from the user menu; Log Out → `/login`, then `/users` → `/login`. Screenshots of Language Master (1366) and Users (390) opened and looked right; the first check expected "Hindi" on Language Master, but this database has only English. Failed calls: only `401 /api/auth/refresh` on the sign-in page and after logging out (signed-out session checks). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-07 Web works

| | |
|---|---|
| Title | Web works |
| Role | — |
| Pre-condition | API and web running, `ct_` Super Admin |
| Steps | welcome page signed out; sign in; dashboard; sign out |
| Expected result | as before; no console errors or failed calls; 1366 and 390 px |
| Actual result | welcome page signed out shows Sign in; sign-in → `/dashboard` "Welcome, ct Access Admin" (screenshot at 1366 opened); welcome page signed in shows Sign out; Sign out → Sign in again; no sideways scroll; only failed call `401 /api/auth/refresh` before signing in. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-START-03 First Super Admin

| | |
|---|---|
| Title | First Super Admin |
| Role | — |
| Pre-condition | blank database |
| Steps | the CLI command that creates the first Super Admin |
| Expected result | can sign in to manage |
| Actual result | a Super Admin made by the CLI signs in to manage; the dashboard shows Users 2. |
| Result | PASS |
| Method | console |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-06 Console screens

| | |
|---|---|
| Title | Console screens |
| Role | — |
| Pre-condition | signed in as Super Admin |
| Steps | open every menu entry |
| Expected result | every page loads, no 500 |
| Actual result | all 12 console pages answer 200 inside the frame with their own titles; 390 px: no sideways scroll; web: sign-in, Dashboard, unknown address → the 404 card inside the frame. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-12 Forgot password

| | |
|---|---|
| Title | Forgot password |
| Role | — |
| Pre-condition | mail driver capture |
| Steps | ask for a reset |
| Expected result | the mail is in the Sent Email Log; the link resets the password |
| Actual result | forgot password from web → `password_reset` mail captured in the Sent Email Log; its link reset the password; sign-in with the new password worked. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-AUTH-01 Sign Up

| | |
|---|---|
| Title | Sign Up |
| Role | — |
| Pre-condition | web, guest |
| Steps | Login › Sign Up; fill Full Name, Email, Mobile, Password |
| Expected result | signed in, on Shared Safaris, "Welcome, {first name}! Your account is created."; the user has no role; console refuses them |
| Actual result | Sign Up still signs the user in on the website (the `web_*` pair). |
| Result | PASS |
| Method | browser, lead, re-run after the split |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-02 Sign Up errors

| | |
|---|---|
| Title | Sign Up errors |
| Role | — |
| Pre-condition | web |
| Steps | submit empty; bad email; taken email (other case); bad mobile; taken mobile; 7-char password |
| Expected result | the six workflow messages under their fields |
| Actual result | the six messages under their fields (empty, bad email, taken email in other case, bad mobile, taken mobile, 7-character password). |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-03 Sign in with email or mobile

| | |
|---|---|
| Title | Sign in with email or mobile |
| Role | — |
| Pre-condition | a signed-up user |
| Steps | sign out; sign in with the email, then with the mobile |
| Expected result | both sign in |
| Actual result | signed out, then signed in with the email and with the mobile. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-04 Console from the website

| | |
|---|---|
| Title | Console from the website |
| Role | — |
| Pre-condition | signed in on the website as a member; then as a Super Admin |
| Steps | open Console from the website |
| Expected result | the console Login page both times; the member's account cannot enter the console |
| Actual result | signed in on the website (cookies `web_access_token`, `web_refresh_token`), opening the console shows its Login; signing in there adds `manage_*` cookies; the website stays signed in; Log Out in the console removes only the `manage_*` pair and the website stays signed in; with the website's access cookie removed it refreshes and stays signed in; no failed calls. Test user `ct_auth` deleted. |
| Result | PASS |
| Method | browser 1366 + 390, lead |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PTR-07 Portal sign-in

| | |
|---|---|
| Title | Portal sign-in |
| Role | — |
| Pre-condition | portal |
| Steps | email, then mobile number; wrong password; empty fields; Forgot password; Become a Partner link |
| Expected result | the website's messages ("Enter your mobile number, email or username."); reset email sent; no Sign Up |
| Actual result | , Vivek part** - portal `/login` with `vivek.rao@packages-demo.test` / `Demo@Pack2026` lands on the Dashboard `/` ("Active quote requests", "Latest active packages"); signed out, with his mobile `9876500101` (read from `user`) and the same password, also `/`; Tara signs in too. Screenshots `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/rerun1114/vivek-email-1366.png`, `vivek-email-390.png`, `vivek-mobile-1366.png`, `vivek-mobile-390.png`. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-01 Dry run writes nothing

| | |
|---|---|
| Title | Dry run writes nothing |
| Role | — |
| Pre-condition | none of the three accounts |
| Steps | `local-accounts/add <password>` |
| Expected result | lists what it would create; nothing written |
| Actual result | dry run listed the three emails "to create"; row counts of user, partner, gallery, package, quote_request unchanged (25 / 5 / 6 / 12 / 5). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-02 Add creates the accounts and data

| | |
|---|---|
| Title | Add creates the accounts and data |
| Role | — |
| Pre-condition | — |
| Steps | `local-accounts/add <password> confirm` |
| Expected result | 3 accounts, 1 active partner with logo and 3 parks, 1 approved gallery, 2 live packages, 1 quote request |
| Actual result | Super Admin, partner (Active, logo `partner/<id>/logo/…png`, 3 parks) with 1 approved gallery, 2 packages website Active with a Live version, 1 active quote request from user@example.in to Kanha Escape. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-03 Add again duplicates nothing

| | |
|---|---|
| Title | Add again duplicates nothing |
| Role | — |
| Pre-condition | after 02 |
| Steps | run add again |
| Expected result | everything "kept", row counts unchanged |
| Actual result | second run printed "kept" for everything; counts unchanged. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-04 Refused in production

| | |
|---|---|
| Title | Refused in production |
| Role | — |
| Pre-condition | `NODE_ENV=production` |
| Steps | run add |
| Expected result | refused, nothing written |
| Actual result | `NODE_ENV=production` add and remove → "Local test accounts are never written in production", nothing written. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-05 Super Admin signs in to the console

| | |
|---|---|
| Title | Super Admin signs in to the console |
| Role | — |
| Pre-condition | after 02 |
| Steps | console `/login` with `anshika@example.in` |
| Expected result | Dashboard, `manage_` cookies, no console errors |
| Actual result | console sign-in as anshika@example.in → Dashboard, `manage_access_token` / `manage_refresh_token`; no console errors, no failed calls, no sideways scroll. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-07 Partner signs in to the website

| | |
|---|---|
| Title | Partner signs in to the website |
| Role | — |
| Pre-condition | after 02 |
| Steps | web `/login` with `partner@example.in` |
| Expected result | signed in; account menu shows the business and Partner portal |
| Actual result | website sign-in as partner@example.in; account button "Account: Tiger Song Safaris", menu has Partner portal; no errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-08 User signs in to the website

| | |
|---|---|
| Title | User signs in to the website |
| Role | — |
| Pre-condition | after 02 |
| Steps | web `/login` with `user@example.in` |
| Expected result | signed in; My Quote Requests lists 1 request |
| Actual result | website sign-in as user@example.in; My Quote Requests lists the request to Kanha Escape; no errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-12 Remove takes only these accounts

| | |
|---|---|
| Title | Remove takes only these accounts |
| Role | — |
| Pre-condition | after 02 |
| Steps | `local-accounts/remove` then `remove confirm` |
| Expected result | dry run lists them; confirm removes the 3 accounts and their rows; `@example.test`, `@packages-demo.test`, `anshika@triline.co.in` untouched |
| Actual result | dry run listed 1 quote request, 2 packages, 1 gallery, 1 partner, 3 accounts and removed nothing; `confirm` removed exactly those; `@example.test` (15), `@packages-demo.test` (8) and `anshika@triline.co.in` unchanged. Seen: package image files stay in `storage/package/<id>/` (the package demo service removes rows only, as for `packages-demo/remove`), and logos replaced in console Edit stay in `storage/partner/<id>/logo/` (existing behaviour); the folders of the removed test rows were deleted by hand. The accounts were then added again for use. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-START-03 history

- 2026-10-28 PASS: the dry run wrote nothing; with `confirm` user 1 got Super Admin; signing in with `X-Client-App: manage` worked; `auth/me`, `console-roles`, users, roles, audit logs, app logs, log files, job schedules, job commands, languages, app translations, mail logs and templates all answered 200; audit shows `USER_CREATED` (CLI) and `SIGNED_IN` (MANAGE). The console screens are still to be checked in phase 4.
- 2026-10-28 PASS (current): a Super Admin made by the CLI signs in to manage; the dashboard shows Users 2.

### TC-AUTH-01 history

- 2026-11-04 PASS: sign up lands on `/` signed in, no `user_role`, audit 107; the console refuses the account; the welcome toast checked on its own until it is mounted on `/`.
- 2026-11-10 PASS (current): Sign Up still signs the user in on the website (the `web_*` pair).

### TC-AUTH-04 history

- 2026-11-10 FAIL: signed in on the website as a Super Admin, opening the console (`localhost:3041/`) goes straight to the Dashboard, not the console Login: both apps share one session (one access cookie), so §2.9 #8 ("always Login first") needs the sessions split per app. Asked the user (2026-11-10).
- 2026-11-10 PASS (current): signed in on the website (cookies `web_access_token`, `web_refresh_token`), opening the console shows its Login; signing in there adds `manage_*` cookies; the website stays signed in; Log Out in the console removes only the `manage_*` pair and the website stays signed in; with the website's access cookie removed it refreshes and stays signed in; no failed calls. Test user `ct_auth` deleted.

### TC-PTR-07 history

- 2026-11-13 PASS: empty submit "Enter your email." / "Enter your password."; wrong password "Email or password is incorrect."; Forgot password? to `/forgot-password`; Become a Partner to `http://localhost:3040/become-a-partner`; no Sign Up. The reset-mail sending was checked by the architect (setup log) and is not repeated. Seen: React hydration warning in the dev console on `/login` (architect's PP1 page, not investigated), and the signed-out 401 before sign-in.
- 2026-11-14 PASS: portal `/login`: label "Login ID", placeholder "Mobile no. or email"; empty submit "Enter your mobile number, email or username." / "Enter your password."; wrong password "The mobile number, email, username or password is not correct."; sign-in with the email `ananya.iyer@packages-demo.test` and with her mobile `9876500106` (website user, not a partner) both reach `/partner-request`; Forgot password? to `/forgot-password`; Become a Partner to `http://localhost:3040/become-a-partner`; no Sign Up. `curl` to `/api/auth/sign-in` with `X-Client-App: partner` accepts any identifier kind (checked with the website account). The demo partner Vivek (mobile 9876500101) could not be used: his password is not `Demo@Pack2026` now (INVALID_CREDENTIALS for his email, mobile and on the website app alike); his portal landing is covered by the earlier run. Console errors: only the expected 401s (signed-out refresh, wrong password).
- 2026-11-14 PASS (current): , Vivek part** - portal `/login` with `vivek.rao@packages-demo.test` / `Demo@Pack2026` lands on the Dashboard `/` ("Active quote requests", "Latest active packages"); signed out, with his mobile `9876500101` (read from `user`) and the same password, also `/`; Tara signs in too. Screenshots `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/rerun1114/vivek-email-1366.png`, `vivek-email-390.png`, `vivek-mobile-1366.png`, `vivek-mobile-390.png`.

### TC-LOCAL-07 history

- 2026-11-16 FAIL: the script opened the notifications popover, not the account menu (test script fault). Fixed the script.
- 2026-11-16 PASS (current): website sign-in as partner@example.in; account button "Account: Tiger Song Safaris", menu has Partner portal; no errors.
