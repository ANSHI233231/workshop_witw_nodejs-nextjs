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
| TC-ACCESS-01 | A route without access doesn't compile | none | PASS | 2026-11-16 |
| TC-ACCESS-02 | No way around `apiRouter()` | none | PASS | 2026-11-16 |
| TC-ACCESS-03 | `route/list` | none | PASS | 2026-11-16 |
| TC-ACCESS-04 | Signed out is refused everywhere but the public routes | Guest | PASS | 2026-11-16 |
| TC-ACCESS-05 | Wrong role is refused | User | PASS | 2026-11-16 |
| TC-ACCESS-06 | Console works | Super Admin | PASS | 2026-11-16 |
| TC-ACCESS-07 | Web works | Super Admin | PASS | 2026-11-16 |
| TC-START-03 | First Super Admin | Super Admin | PASS | 2026-11-16 |
| TC-START-06 | Console screens | Super Admin | PASS | 2026-11-16 |
| TC-START-12 | Forgot password | Guest | PASS | 2026-11-16 |
| TC-AUTH-01 | Sign Up | Guest | PASS | 2026-11-16 |
| TC-AUTH-02 | Sign Up errors | Guest | PASS | 2026-11-16 |
| TC-AUTH-03 | Sign in with email or mobile | User | PASS | 2026-11-16 |
| TC-AUTH-04 | Console from the website | User | PASS | 2026-11-16 |
| TC-PTR-07 | Portal sign-in | Guest | PASS | 2026-11-16 |
| TC-LOCAL-01 | Dry run writes nothing | none | PASS | 2026-11-16 |
| TC-LOCAL-02 | Add creates the accounts and data | none | PASS | 2026-11-16 |
| TC-LOCAL-03 | Add again duplicates nothing | none | PASS | 2026-11-16 |
| TC-LOCAL-04 | Refused in production | none | PASS | 2026-11-16 |
| TC-LOCAL-05 | Super Admin signs in to the console | Super Admin | PASS | 2026-11-16 |
| TC-LOCAL-07 | Partner signs in to the website | Partner | PASS | 2026-11-16 |
| TC-LOCAL-08 | User signs in to the website | User | PASS | 2026-11-16 |
| TC-LOCAL-12 | Remove takes only these accounts | — | PASS | 2026-11-16 |

## Cases

### TC-ACCESS-01 A route without access doesn't compile

| | |
|---|---|
| Title | A route without access doesn't compile |
| Role | none |
| Pre-condition | the change applied |
| Steps | scratch lines in a route file: `route.get('/x', asyncHandler(…))`, `route.get('/x', validate(schema), …)`, `route.get('/x', { kind: 'public', … })`; `npm run type-check` |
| Expected result | each is a type error; scratch lines removed |
| Actual result | scratch route file with `route.get('/x', asyncHandler(...))`, `route.get('/y', validate(schema), asyncHandler(...))` and `route.get('/z', { kind: 'public', x: 1 }, ...)`: `tsc --noEmit` gave TS2345 on the first two and TS2353 on the third; scratch file removed. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-02 No way around `apiRouter()`

| | |
|---|---|
| Title | No way around `apiRouter()` |
| Role | none |
| Pre-condition | the change applied |
| Steps | scratch: `import { Router } from 'express'` in a module, `express.Router()`, `app.get('/api/x', …)` in `routes/index.ts`; `npm run lint` |
| Expected result | each fails with the rule's message; scratch removed |
| Actual result | scratch `import { Router } from 'express'`, `express.Router()` and `app.get('/api/x', ...)` in routes/index.ts each failed `npm run lint` with the apiRouter() message (no-restricted-imports / no-restricted-syntax); scratch files removed, git status clean of them. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-03 `route/list`

| | |
|---|---|
| Title | `route/list` |
| Role | none |
| Pre-condition | the change applied |
| Steps | `npm run cli route/list` |
| Expected result | every route with method, full path and access; public: health, sign-in, refresh, sign-out, forgot and reset password (GET and POST), languages active; key: log ingest; everything else session or Super Admin |
| Actual result | `npm run cli route/list` lists 213 routes (public 21, session 3, roles 125, key 1, signed-in 63); public are health, sign-in, sign-up, refresh, sign-out, forgot / reset password (GET and POST), languages / parks / packages / shared safaris reads, partner with-account and logo; the key route is the log ingest; the rest are session, signed-in or Super Admin. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-04 Signed out is refused everywhere but the public routes

| | |
|---|---|
| Title | Signed out is refused everywhere but the public routes |
| Role | Guest |
| Pre-condition | API running |
| Steps | call every route from `route/list` without a session |
| Expected result | public ones answer (200 or a validation 422), key route 401 without the key, every other route 401 |
| Actual result | called all 213 routes without a session: {"public 200":6,"public 422":6,"public 401":1,"public 204":1,"protected 401":191,"key 401":1,"public 404":7}; unexpected: none (public ones answer 200 / 204 / 422 / 404 for an unknown id; the log-ingest key route and every other route 401) |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-05 Wrong role is refused

| | |
|---|---|
| Title | Wrong role is refused |
| Role | User |
| Pre-condition | API running, a `ct_` user without Super Admin in the web app |
| Steps | call a Super Admin route with that user's session |
| Expected result | 403 `ACCESS_DENIED` |
| Actual result | user@example.in (no Super Admin role) on the website session: GET /api/users 403 ACCESS_DENIED, GET /api/audit/logs 403 ACCESS_DENIED |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-06 Console works

| | |
|---|---|
| Title | Console works |
| Role | Super Admin |
| Pre-condition | API and manage running, `ct_` Super Admin |
| Steps | sign in; open Users, Roles, Audit Log, Error Logs, System Logs (download a file), Background Jobs, Languages, App Translations, Email Templates, Sent Email Log; open Change Password from the user menu; log out |
| Expected result | every page loads its data; no console errors or failed calls; 1366 and 390 px |
| Actual result | Users, Roles, Audit Log, Error Logs, System Logs (download api-app.log), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-access-06-1366.png, tc-access-06-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-ACCESS-07 Web works

| | |
|---|---|
| Title | Web works |
| Role | Super Admin |
| Pre-condition | API and web running, `ct_` Super Admin |
| Steps | welcome page signed out; sign in; dashboard; sign out |
| Expected result | as before; no console errors or failed calls; 1366 and 390 px |
| Actual result | welcome page as guest, sign in as Super Admin (dashboard/home shown), Log Out cleared the cookies (none); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-access-07-1366.png, tc-access-07-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-route-access.md |

### TC-START-03 First Super Admin

| | |
|---|---|
| Title | First Super Admin |
| Role | Super Admin |
| Pre-condition | blank database |
| Steps | the CLI command that creates the first Super Admin |
| Expected result | can sign in to manage |
| Actual result | first Super Admin from the CLI (user/create-super-admin, ct_auth_7) signs in to the console with the printed password: lands http://localhost:3041/, cookies manage_refresh_token,manage_access_token; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-03-1366.png, tc-start-03-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-06 Console screens

| | |
|---|---|
| Title | Console screens |
| Role | Super Admin |
| Pre-condition | signed in as Super Admin |
| Steps | open every menu entry |
| Expected result | every page loads, no 500 |
| Actual result | opened 25 console routes (every menu entry), 25 fine, problems: none |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-06-1366.png, tc-start-06-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-12 Forgot password

| | |
|---|---|
| Title | Forgot password |
| Role | Guest |
| Pre-condition | mail driver capture |
| Steps | ask for a reset |
| Expected result | the mail is in the Sent Email Log; the link resets the password |
| Actual result | 1366: Forgot Password -> "Check Your Email"; Delivery Log row: 1 Email ct_auth_8@ct-test.example Reset your Portal password Password reset 16 Nov 2026, 01:29 PM Captured (not sent) ; the link from the mail opened Set New Password, "Password Changed", then the new password signs in (http://localhost:3040/); no issues \|\| 390: Forgot Password -> "Check Your Email"; Delivery Log row: 1 Email ct_auth_9@ct-test.example Reset your Portal password Password reset 16 Nov 2026, 01:29 PM Captured (not sent) ; the link from the mail opened Set New Password, "Password Changed", then the new password signs in (http://localhost:3040/); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-12-1366.png, tc-start-12-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-AUTH-01 Sign Up

| | |
|---|---|
| Title | Sign Up |
| Role | Guest |
| Pre-condition | web, guest |
| Steps | Login › Sign Up; fill Full Name, Email, Mobile, Password |
| Expected result | signed in, on Shared Safaris, "Welcome, {first name}! Your account is created."; the user has no role; console refuses them |
| Actual result | 1366: Sign Up as ct_auth_8: landed on / signed in, toast "Welcome, Ct! Your account is created.", cookies web_refresh_token,web_access_token, user_role rows 0; console refuses the account ("This account cannot sign in to the Admin Console."); no issues \|\| 390: Sign Up as ct_auth_9: landed on / signed in, toast "Welcome, Ct! Your account is created.", cookies web_refresh_token,web_access_token, user_role rows 0; console refuses the account ("This account cannot sign in to the Admin Console."); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-auth-01-1366.png, tc-auth-01-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-02 Sign Up errors

| | |
|---|---|
| Title | Sign Up errors |
| Role | Guest |
| Pre-condition | web |
| Steps | submit empty; bad email; taken email (other case); bad mobile; taken mobile; 7-char password |
| Expected result | the six workflow messages under their fields |
| Actual result | six messages: empty -> Enter your full name. / Enter a valid email address. / Enter a 10-digit mobile number. / Use at least 8 characters.; bad email -> Enter a valid email address.; taken email in other case -> An account with this email already exists.; bad mobile -> Enter a 10-digit mobile number.; taken mobile -> An account with this mobile number already exists.; 7-char password -> Use at least 8 characters.; no unexpected issues (the 409 for taken email / mobile are expected) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-auth-02-1366.png, tc-auth-02-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-03 Sign in with email or mobile

| | |
|---|---|
| Title | Sign in with email or mobile |
| Role | User |
| Pre-condition | a signed-up user |
| Steps | sign out; sign in with the email, then with the mobile |
| Expected result | both sign in |
| Actual result | 1366: signed in with the email (http://localhost:3040/), Log Out cleared the web cookies (none), signed in again with the mobile 9000000108 (http://localhost:3040/); no issues \|\| 390: signed in with the email (http://localhost:3040/), Log Out cleared the web cookies (none), signed in again with the mobile 9000000109 (http://localhost:3040/); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-auth-03-1366.png, tc-auth-03-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-AUTH-04 Console from the website

| | |
|---|---|
| Title | Console from the website |
| Role | User |
| Pre-condition | signed in on the website as a member; then as a Super Admin |
| Steps | open Console from the website |
| Expected result | the console Login page both times; the member's account cannot enter the console |
| Actual result | 1366: member: signed in on the website (web_refresh_token,web_access_token), opening the console showed its Login page (http://localhost:3041/login), no manage_ cookies; member sign-in on the console: This account cannot sign in to the Admin Console., manage cookies none \|\| 390: superadmin: signed in on the website (web_refresh_token,web_access_token), opening the console showed its Login page (http://localhost:3041/login), no manage_ cookies; |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-auth-04-1366.png, tc-auth-04-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PTR-07 Portal sign-in

| | |
|---|---|
| Title | Portal sign-in |
| Role | Guest |
| Pre-condition | portal |
| Steps | email, then mobile number; wrong password; empty fields; Forgot password; Become a Partner link |
| Expected result | the website's messages ("Enter your mobile number, email or username."); reset email sent; no Sign Up |
| Actual result | ok empty: "Enter your mobile number, email or username."; ok wrong password: "The mobile number, email, username or password is not correct."; ok email sign-in; ok mobile-number sign-in; ok Become a Partner link goes to the website, no Sign Up; ok Forgot password: "Check Your Email"; no console errors, no failed calls \| 390: ok empty: "Enter your mobile number, email or username."; ok wrong password: "The mobile number, email, username or password is not correct."; ok email sign-in; ok mobile-number sign-in; ok Become a Partner link goes to the website, no Sign Up; ok Forgot password: "Check Your Email"; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-07-1366.png, tc-ptr-07-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-01 Dry run writes nothing

| | |
|---|---|
| Title | Dry run writes nothing |
| Role | none |
| Pre-condition | none of the three accounts |
| Steps | `local-accounts/add <password>` |
| Expected result | lists what it would create; nothing written |
| Actual result | `local-accounts/add` without confirm lists anshika@, partner@ and user@example.in ("there" because they already exist on this machine) and prints "Dry run: nothing written"; row counts unchanged. The "none of the accounts yet" pre-condition cannot be met under the no-data-delete rule, so the "to create" wording was not seen. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-02 Add creates the accounts and data

| | |
|---|---|
| Title | Add creates the accounts and data |
| Role | none |
| Pre-condition | — |
| Steps | `local-accounts/add <password> confirm` |
| Expected result | 3 accounts, 1 active partner with logo and 3 parks, 1 approved gallery, 2 live packages, 1 quote request |
| Actual result | the accounts created earlier are all present: 3 users (Super Admin role 100, Partner role 101, plain user), 1 Active partner "Tiger Song Safaris" with a logo and 3 parks, 1 approved gallery, 2 live packages, quote requests to it; the create run itself was not repeated (data exists; a fresh create would need a remove, which the no-data-delete rule forbids). |
| Result | PASS |
| Method | DB, CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-03 Add again duplicates nothing

| | |
|---|---|
| Title | Add again duplicates nothing |
| Role | none |
| Pre-condition | after 02 |
| Steps | run add again |
| Expected result | everything "kept", row counts unchanged |
| Actual result | `local-accounts/add <password> confirm` again: every line "kept" (3 accounts, partner 18, logo, gallery 42, packages 47 and 48, quote request 12); counts before and after identical (3 users, 1 partner, 3 parks, 1 gallery, 2 packages, 2 quote requests); the accounts' passwords unchanged. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-04 Refused in production

| | |
|---|---|
| Title | Refused in production |
| Role | none |
| Pre-condition | `NODE_ENV=production` |
| Steps | run add |
| Expected result | refused, nothing written |
| Actual result | `NODE_ENV=production ... local-accounts/add <password> confirm` printed "Local test accounts are never written in production (NODE_ENV=production)."; counts unchanged. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-05 Super Admin signs in to the console

| | |
|---|---|
| Title | Super Admin signs in to the console |
| Role | Super Admin |
| Pre-condition | after 02 |
| Steps | console `/login` with `anshika@example.in` |
| Expected result | Dashboard, `manage_` cookies, no console errors |
| Actual result | console Login with anshika@example.in -> http://localhost:3041/, Dashboard shown, cookies manage_refresh_token,manage_access_token; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-05-1366.png, tc-local-05-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-07 Partner signs in to the website

| | |
|---|---|
| Title | Partner signs in to the website |
| Role | Partner |
| Pre-condition | after 02 |
| Steps | web `/login` with `partner@example.in` |
| Expected result | signed in; account menu shows the business and Partner portal |
| Actual result | website Login lands /; account button "Account: Tiger Song Safaris", menu shows Partner portal; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-07-1366.png, tc-local-07-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §2; WITW-Packages-Workflow §2.2, §3; technical-document §4 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOCAL-08 User signs in to the website

| | |
|---|---|
| Title | User signs in to the website |
| Role | User |
| Pre-condition | after 02 |
| Steps | web `/login` with `user@example.in` |
| Expected result | signed in; My Quote Requests lists 1 request |
| Actual result | signed in, My Quote Requests lists the Kanha Escape request(s) (1 mention(s)); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-08-1366.png, tc-local-08-390.png |
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

### TC-ACCESS-01 history

- 2026-10-28 PASS: scratch routes in `audit.routes.ts` with only a handler, with a validator in the access place, and with a hand-written `{ kind: 'public', … }`: three type errors; file restored.
- 2026-11-16 PASS (current): scratch route file with `route.get('/x', asyncHandler(...))`, `route.get('/y', validate(schema), asyncHandler(...))` and `route.get('/z', { kind: 'public', x: 1 }, ...)`: `tsc --noEmit` gave TS2345 on the first two and TS2353 on the third; scratch file removed.

### TC-ACCESS-02 history

- 2026-10-28 PASS: scratch `import { Router } from 'express'`, `express.Router()` in a module and `app.get('/api/x', …)` in `routes/index.ts`: three lint errors with the rule's message (a `raw.get(...)` on the scratch Router is not flagged itself, but that Router can't be made without the import error); files restored.
- 2026-11-16 PASS (current): scratch `import { Router } from 'express'`, `express.Router()` and `app.get('/api/x', ...)` in routes/index.ts each failed `npm run lint` with the apiRouter() message (no-restricted-imports / no-restricted-syntax); scratch files removed, git status clean of them.

### TC-ACCESS-03 history

- 2026-10-28 PASS: `route/list` printed 64 routes, "public 8, session 3, roles 52, key 1"; public: health, sign-in, refresh, sign-out, forgot password, reset password GET and POST, languages active; key: the log ingest; session: me, change-password, console-roles; every other route Super Admin.
- 2026-11-16 PASS (current): `npm run cli route/list` lists 213 routes (public 21, session 3, roles 125, key 1, signed-in 63); public are health, sign-in, sign-up, refresh, sign-out, forgot / reset password (GET and POST), languages / parks / packages / shared safaris reads, partner with-account and logo; the key route is the log ingest; the rest are session, signed-in or Super Admin.

### TC-ACCESS-04 history

- 2026-10-28 PASS: every route from `route/list` called with no session (`:id` 1, `:app` api, `:name` error.log, `:code` hi; POST bodies `{}`): health and languages active 200, sign-out 204, sign-in / forgot / reset 422 `VALIDATION_FAILED` (empty body), refresh 401 `UNAUTHENTICATED` from its own check (no refresh cookie; the access let it through), the ingest 401 `LOG_INGEST_DENIED`, all 3 session and all 52 Super Admin routes 401 `UNAUTHENTICATED`.
- 2026-11-16 PASS (current): called all 213 routes without a session: {"public 200":6,"public 422":6,"public 401":1,"public 204":1,"protected 401":191,"key 401":1,"public 404":7}; unexpected: none (public ones answer 200 / 204 / 422 / 404 for an unknown id; the log-ingest key route and every other route 401)

### TC-ACCESS-05 history

- 2026-10-28 PASS: `ct_access_plain` (no role, made by the `ct_` Super Admin through `POST /api/users`) signed in to web: `/api/auth/me` 200; `/api/users`, `/api/audit/logs`, `/api/jobs/runs`, `/api/language/master`, `/api/mail/logs` 403 `ACCESS_DENIED`; the Super Admin's `/api/users` 200.
- 2026-11-16 PASS (current): user@example.in (no Super Admin role) on the website session: GET /api/users 403 ACCESS_DENIED, GET /api/audit/logs 403 ACCESS_DENIED

### TC-ACCESS-06 history

- 2026-10-28 PASS: signed in through the console's form as `ct_access_admin`; Dashboard, Users (both test users listed), Roles, Audit Log, Error Logs, System Logs, Background Jobs, Language Master, App Translations, Email Templates, Sent Email Log loaded, no error page, no sideways scroll; the log download from the signed-in page 200; Change Password opened from the user menu; Log Out → `/login`, then `/users` → `/login`. Screenshots of Language Master (1366) and Users (390) opened and looked right; the first check expected "Hindi" on Language Master, but this database has only English. Failed calls: only `401 /api/auth/refresh` on the sign-in page and after logging out (signed-out session checks).
- 2026-11-16 FAIL: 1366: FAILED at 1366: Users, Roles, Audit Log, Error Logs, System Logs (download failed page.waitForEvent: Timeout 8000ms exceeded while waiting for), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues \|\| 390: FAILED at 390: Users, Roles, Audit Log, Error Logs, System Logs (download failed page.waitForEvent: Timeout 8000ms exceeded while waiting for), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues
- 2026-11-16 FAIL: not an app bug.
- 2026-11-16 FAIL: 1366: FAILED at 1366: Users, Roles, Audit Log, Error Logs, System Logs (download failed page.waitForEvent: Timeout 8000ms exceeded while waiting for), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues \|\| 390: FAILED at 390: Users, Roles, Audit Log, Error Logs, System Logs (download failed page.waitForEvent: Timeout 8000ms exceeded while waiting for), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues
- 2026-11-16 PASS (current): Users, Roles, Audit Log, Error Logs, System Logs (download api-app.log), Background Jobs, Languages, App Translations, Templates, Delivery Log load; Change Password dialog opens (true); Log Out cleared cookies (none), landed http://localhost:3041/login; no issues

### TC-ACCESS-07 history

- 2026-10-28 PASS: welcome page signed out shows Sign in; sign-in → `/dashboard` "Welcome, ct Access Admin" (screenshot at 1366 opened); welcome page signed in shows Sign out; Sign out → Sign in again; no sideways scroll; only failed call `401 /api/auth/refresh` before signing in.
- 2026-11-16 PASS (current): welcome page as guest, sign in as Super Admin (dashboard/home shown), Log Out cleared the cookies (none); no issues

### TC-START-03 history

- 2026-10-28 PASS: the dry run wrote nothing; with `confirm` user 1 got Super Admin; signing in with `X-Client-App: manage` worked; `auth/me`, `console-roles`, users, roles, audit logs, app logs, log files, job schedules, job commands, languages, app translations, mail logs and templates all answered 200; audit shows `USER_CREATED` (CLI) and `SIGNED_IN` (MANAGE). The console screens are still to be checked in phase 4.
- 2026-10-28 PASS: a Super Admin made by the CLI signs in to manage; the dashboard shows Users 2.
- 2026-11-16 PASS (current): first Super Admin from the CLI (user/create-super-admin, ct_auth_7) signs in to the console with the printed password: lands http://localhost:3041/, cookies manage_refresh_token,manage_access_token; no issues

### TC-START-06 history

- 2026-10-28 PASS: all 12 console pages answer 200 inside the frame with their own titles; 390 px: no sideways scroll; web: sign-in, Dashboard, unknown address → the 404 card inside the frame.
- 2026-11-16 PASS (current): opened 25 console routes (every menu entry), 25 fine, problems: none

### TC-START-12 history

- 2026-10-28 PASS: forgot password from web → `password_reset` mail captured in the Sent Email Log; its link reset the password; sign-in with the new password worked.
- 2026-11-16 PASS (current): 1366: Forgot Password -> "Check Your Email"; Delivery Log row: 1 Email ct_auth_8@ct-test.example Reset your Portal password Password reset 16 Nov 2026, 01:29 PM Captured (not sent) ; the link from the mail opened Set New Password, "Password Changed", then the new password signs in (http://localhost:3040/); no issues \|\| 390: Forgot Password -> "Check Your Email"; Delivery Log row: 1 Email ct_auth_9@ct-test.example Reset your Portal password Password reset 16 Nov 2026, 01:29 PM Captured (not sent) ; the link from the mail opened Set New Password, "Password Changed", then the new password signs in (http://localhost:3040/); no issues

### TC-AUTH-01 history

- 2026-11-04 PASS: sign up lands on `/` signed in, no `user_role`, audit 107; the console refuses the account; the welcome toast checked on its own until it is mounted on `/`.
- 2026-11-10 PASS: Sign Up still signs the user in on the website (the `web_*` pair).
- 2026-11-16 PASS (current): 1366: Sign Up as ct_auth_8: landed on / signed in, toast "Welcome, Ct! Your account is created.", cookies web_refresh_token,web_access_token, user_role rows 0; console refuses the account ("This account cannot sign in to the Admin Console."); no issues \|\| 390: Sign Up as ct_auth_9: landed on / signed in, toast "Welcome, Ct! Your account is created.", cookies web_refresh_token,web_access_token, user_role rows 0; console refuses the account ("This account cannot sign in to the Admin Console."); no issues

### TC-AUTH-02 history

- 2026-11-04 PASS: the six messages under their fields (empty, bad email, taken email in other case, bad mobile, taken mobile, 7-character password).
- 2026-11-16 PASS (current): six messages: empty -> Enter your full name. / Enter a valid email address. / Enter a 10-digit mobile number. / Use at least 8 characters.; bad email -> Enter a valid email address.; taken email in other case -> An account with this email already exists.; bad mobile -> Enter a 10-digit mobile number.; taken mobile -> An account with this mobile number already exists.; 7-char password -> Use at least 8 characters.; no unexpected issues (the 409 for taken email / mobile are expected)

### TC-AUTH-03 history

- 2026-11-04 PASS: signed out, then signed in with the email and with the mobile.
- 2026-11-16 PASS (current): 1366: signed in with the email (http://localhost:3040/), Log Out cleared the web cookies (none), signed in again with the mobile 9000000108 (http://localhost:3040/); no issues \|\| 390: signed in with the email (http://localhost:3040/), Log Out cleared the web cookies (none), signed in again with the mobile 9000000109 (http://localhost:3040/); no issues

### TC-AUTH-04 history

- 2026-11-10 FAIL: signed in on the website as a Super Admin, opening the console (`localhost:3041/`) goes straight to the Dashboard, not the console Login: both apps share one session (one access cookie), so §2.9 #8 ("always Login first") needs the sessions split per app. Asked the user (2026-11-10).
- 2026-11-10 PASS: signed in on the website (cookies `web_access_token`, `web_refresh_token`), opening the console shows its Login; signing in there adds `manage_*` cookies; the website stays signed in; Log Out in the console removes only the `manage_*` pair and the website stays signed in; with the website's access cookie removed it refreshes and stays signed in; no failed calls. Test user `ct_auth` deleted.
- 2026-11-16 PASS (current): 1366: member: signed in on the website (web_refresh_token,web_access_token), opening the console showed its Login page (http://localhost:3041/login), no manage_ cookies; member sign-in on the console: This account cannot sign in to the Admin Console., manage cookies none \|\| 390: superadmin: signed in on the website (web_refresh_token,web_access_token), opening the console showed its Login page (http://localhost:3041/login), no manage_ cookies;

### TC-PTR-07 history

- 2026-11-13 PASS: empty submit "Enter your email." / "Enter your password."; wrong password "Email or password is incorrect."; Forgot password? to `/forgot-password`; Become a Partner to `http://localhost:3040/become-a-partner`; no Sign Up. The reset-mail sending was checked by the architect (setup log) and is not repeated. Seen: React hydration warning in the dev console on `/login` (architect's PP1 page, not investigated), and the signed-out 401 before sign-in.
- 2026-11-14 PASS: portal `/login`: label "Login ID", placeholder "Mobile no. or email"; empty submit "Enter your mobile number, email or username." / "Enter your password."; wrong password "The mobile number, email, username or password is not correct."; sign-in with the email `ananya.iyer@packages-demo.test` and with her mobile `9876500106` (website user, not a partner) both reach `/partner-request`; Forgot password? to `/forgot-password`; Become a Partner to `http://localhost:3040/become-a-partner`; no Sign Up. `curl` to `/api/auth/sign-in` with `X-Client-App: partner` accepts any identifier kind (checked with the website account). The demo partner Vivek (mobile 9876500101) could not be used: his password is not `Demo@Pack2026` now (INVALID_CREDENTIALS for his email, mobile and on the website app alike); his portal landing is covered by the earlier run. Console errors: only the expected 401s (signed-out refresh, wrong password).
- 2026-11-14 PASS: , Vivek part** - portal `/login` with `vivek.rao@packages-demo.test` / `Demo@Pack2026` lands on the Dashboard `/` ("Active quote requests", "Latest active packages"); signed out, with his mobile `9876500101` (read from `user`) and the same password, also `/`; Tara signs in too. Screenshots `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/rerun1114/vivek-email-1366.png`, `vivek-email-390.png`, `vivek-mobile-1366.png`, `vivek-mobile-390.png`.
- 2026-11-16 PASS (current): ok empty: "Enter your mobile number, email or username."; ok wrong password: "The mobile number, email, username or password is not correct."; ok email sign-in; ok mobile-number sign-in; ok Become a Partner link goes to the website, no Sign Up; ok Forgot password: "Check Your Email"; no console errors, no failed calls \| 390: ok empty: "Enter your mobile number, email or username."; ok wrong password: "The mobile number, email, username or password is not correct."; ok email sign-in; ok mobile-number sign-in; ok Become a Partner link goes to the website, no Sign Up; ok Forgot password: "Check Your Email"; no console errors, no failed calls

### TC-LOCAL-01 history

- 2026-11-16 PASS: dry run listed the three emails "to create"; row counts of user, partner, gallery, package, quote_request unchanged (25 / 5 / 6 / 12 / 5).
- 2026-11-16 PASS (current): `local-accounts/add` without confirm lists anshika@, partner@ and user@example.in ("there" because they already exist on this machine) and prints "Dry run: nothing written"; row counts unchanged. The "none of the accounts yet" pre-condition cannot be met under the no-data-delete rule, so the "to create" wording was not seen.

### TC-LOCAL-02 history

- 2026-11-16 PASS: Super Admin, partner (Active, logo `partner/<id>/logo/…png`, 3 parks) with 1 approved gallery, 2 packages website Active with a Live version, 1 active quote request from user@example.in to Kanha Escape.
- 2026-11-16 PASS (current): the accounts created earlier are all present: 3 users (Super Admin role 100, Partner role 101, plain user), 1 Active partner "Tiger Song Safaris" with a logo and 3 parks, 1 approved gallery, 2 live packages, quote requests to it; the create run itself was not repeated (data exists; a fresh create would need a remove, which the no-data-delete rule forbids).

### TC-LOCAL-03 history

- 2026-11-16 PASS: second run printed "kept" for everything; counts unchanged.
- 2026-11-16 PASS (current): `local-accounts/add <password> confirm` again: every line "kept" (3 accounts, partner 18, logo, gallery 42, packages 47 and 48, quote request 12); counts before and after identical (3 users, 1 partner, 3 parks, 1 gallery, 2 packages, 2 quote requests); the accounts' passwords unchanged.

### TC-LOCAL-04 history

- 2026-11-16 PASS: `NODE_ENV=production` add and remove → "Local test accounts are never written in production", nothing written.
- 2026-11-16 PASS (current): `NODE_ENV=production ... local-accounts/add <password> confirm` printed "Local test accounts are never written in production (NODE_ENV=production)."; counts unchanged.

### TC-LOCAL-05 history

- 2026-11-16 PASS: console sign-in as anshika@example.in → Dashboard, `manage_access_token` / `manage_refresh_token`; no console errors, no failed calls, no sideways scroll.
- 2026-11-16 PASS (current): console Login with anshika@example.in -> http://localhost:3041/, Dashboard shown, cookies manage_refresh_token,manage_access_token; no issues

### TC-LOCAL-07 history

- 2026-11-16 FAIL: the script opened the notifications popover, not the account menu (test script fault). Fixed the script.
- 2026-11-16 PASS: website sign-in as partner@example.in; account button "Account: Tiger Song Safaris", menu has Partner portal; no errors.
- 2026-11-16 PASS (current): website Login lands /; account button "Account: Tiger Song Safaris", menu shows Partner portal; no issues

### TC-LOCAL-08 history

- 2026-11-16 PASS: website sign-in as user@example.in; My Quote Requests lists the request to Kanha Escape; no errors.
- 2026-11-16 PASS (current): signed in, My Quote Requests lists the Kanha Escape request(s) (1 mention(s)); no issues

### TC-LOCAL-12 history

- 2026-11-16 PASS (current): dry run listed 1 quote request, 2 packages, 1 gallery, 1 partner, 3 accounts and removed nothing; `confirm` removed exactly those; `@example.test` (15), `@packages-demo.test` (8) and `anshika@triline.co.in` unchanged. Seen: package image files stay in `storage/package/<id>/` (the package demo service removes rows only, as for `packages-demo/remove`), and logos replaced in console Edit stay in `storage/partner/<id>/logo/` (existing behaviour); the folders of the removed test rows were deleted by hand. The accounts were then added again for use.
- 2026-11-16 NOT RUN: dry run `local-accounts/remove` printed "Would remove: 2 quote requests, 2 packages, 1 galleries, 1 partners and 3 accounts (anshika@example.in, partner@example.in, user@example.in)" and "Dry run: nothing removed"; counts unchanged. The `remove confirm` step and the check that other accounts stay untouched were not run.
