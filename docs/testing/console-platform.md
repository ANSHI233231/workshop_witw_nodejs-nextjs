# Test document: Console platform

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-28-api-response-lint.md`, `docs/planning/features/2026-10-28-starter-core.md`, `docs/planning/features/2026-10-30-prototype-sync.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/technical-document.md` starter modules |
| How it works | `docs/how-it-works/platform/manage-console.md`, `docs/how-it-works/modules/audit/README.md`, `docs/how-it-works/modules/system-log/README.md`, `docs/how-it-works/modules/jobs/README.md`, `docs/how-it-works/modules/language/README.md`, `docs/how-it-works/modules/mail/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 19 | 18 | 0 | 1 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-RESP-01 | Lint passes on the starter | none | PASS | 2026-11-16 |
| TC-RESP-02 | Lint catches a made-up response | none | PASS | 2026-11-16 |
| TC-RESP-03 | Log file download still works | Super Admin | PASS | 2026-11-16 |
| TC-RESP-04 | Envelopes unchanged | Super Admin | PASS | 2026-11-16 |
| TC-START-01 | Blank database | — | NOT RUN | 2026-11-16 |
| TC-START-02 | API starts | none | PASS | 2026-11-16 |
| TC-START-04 | Checks | none | PASS | 2026-11-16 |
| TC-START-05 | No source names | none | PASS | 2026-11-16 |
| TC-START-07 | Audit | Super Admin | PASS | 2026-11-16 |
| TC-START-08 | Error Logs | Super Admin | PASS | 2026-11-16 |
| TC-START-09 | Background Jobs | Super Admin | PASS | 2026-11-16 |
| TC-START-10 | Languages | Super Admin | PASS | 2026-11-16 |
| TC-START-11 | Tech Documentation | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-01 | Failure toasts are red | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-02 | Duplicate language name / code | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-03 | Duplicate English text | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-04 | English switch locked | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-05 | Other switches still work | Super Admin | PASS | 2026-11-16 |
| TC-SYNC-06 | Phone width | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-RESP-01 Lint passes on the starter

| | |
|---|---|
| Title | Lint passes on the starter |
| Role | none |
| Pre-condition | the change applied |
| Steps | `npm run verify` in `apps/api` |
| Expected result | no errors |
| Actual result | `npm run verify` in apps/api exit 0, no lint errors. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-02 Lint catches a made-up response

| | |
|---|---|
| Title | Lint catches a made-up response |
| Role | none |
| Pre-condition | a scratch controller line `res.json({ items: [] })`, then `res.status(404).send('x')`, then `stream.pipe(res)` |
| Steps | `npm run lint` |
| Expected result | each fails with the rule's message; scratch lines removed after |
| Actual result | scratch `res.json({ items: [] })`, `res.status(404).send('x')` and `stream.pipe(res)` each failed `npm run lint` with "Respond through core/http: ok(), created(), ..."; scratch removed. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-03 Log file download still works

| | |
|---|---|
| Title | Log file download still works |
| Role | Super Admin |
| Pre-condition | API running, Super Admin signed in |
| Steps | download a log file from System Logs (`GET /api/system-log/:app/:name/download`) |
| Expected result | 200, `text/plain`, `attachment; filename=…`, `no-store`, the file's content |
| Actual result | GET /api/system-log/api/error.log/download -> 200, text/plain; charset=utf-8, attachment; filename="api-error.log", private, no-store, 38249 bytes of the file |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-04 Envelopes unchanged

| | |
|---|---|
| Title | Envelopes unchanged |
| Role | Super Admin |
| Pre-condition | API running |
| Steps | `GET /api/health`, a list (`GET /api/users`), an unknown route |
| Expected result | `{ success: true, message, data }`, `meta` on the list, `{ success: false, code: … }` on the 404 |
| Actual result | GET /api/health 200 keys success,message,data; GET /api/users keys success,message,data,meta meta page,limit,total,totalPages; unknown route 404 {success:false, code:ENDPOINT_NOT_FOUND} |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-START-01 Blank database

| | |
|---|---|
| Title | Blank database |
| Role | — |
| Pre-condition | MySQL 8 |
| Steps | create a database, apply every base migration in order |
| Expected result | no error; every table created |
| Actual result | the base migrations are already applied here; nothing created. |
| Result | NOT RUN |
| Method | user rule: no DDL / no new database: a blank database would have to be created and the base migrations applied |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-02 API starts

| | |
|---|---|
| Title | API starts |
| Role | none |
| Pre-condition | `.env` from `.env.example` |
| Steps | `npm run dev` in `apps/api` |
| Expected result | `GET /api/health` 200 |
| Actual result | the API is running under pm2 (`npm run dev`); `GET /api/health` -> 200 {"success":true,"message":"API is healthy.","data":{"status":"ok","database":"up"}}; a start from a fresh `.env.example` was not repeated (no .env changes allowed). |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-04 Checks

| | |
|---|---|
| Title | Checks |
| Role | none |
| Pre-condition | — |
| Steps | `tsc`, `lint` in api, manage, web; `build` in manage, web |
| Expected result | pass |
| Actual result | `npx tsc --noEmit` clean in api, manage, web and partner; `npm run lint` 0 errors (api none, manage 6 warnings, web 3, partner 3, all `no-img-element` warnings); `npm run build` passes in manage and web (exit 0). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-05 No source names

| | |
|---|---|
| Title | No source names |
| Role | none |
| Pre-condition | — |
| Steps | search the repo for the source project's names, domains and business words |
| Expected result | nothing found |
| Actual result | `git grep -iE "niwasi\|indiaeventually"` outside docs/planning and docs/prototype finds nothing (the one planning-file hit is the user's own quoted instruction, not code). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-07 Audit

| | |
|---|---|
| Title | Audit |
| Role | Super Admin |
| Pre-condition | — |
| Steps | add a user, edit a role |
| Expected result | both in the Audit Log with their changes |
| Actual result | 1366: Add User (audit 101 with email / mobile) and Edit User (audit 103, changes {"name": {"to": "Ct Auth User10 Edited", "from": "Ct Auth User10"}}) both recorded for user 142 (actions 101,103) and listed in the Audit Log (6 rows for the name); the Roles page is a read-only list of the 2 system roles (no role edit exists, so the user edit stands for "edit a role"); no issues \|\| 390: Add User (audit 101 with email / mobile) and Edit User (audit 103, changes {"name": {"to": "Ct Auth User11 Edited", "from": "Ct Auth User11"}}) both recorded for user 143 (actions 101,103) and listed in the Audit Log (6 rows for the name); the Roles page is a read-only list of the 2 system roles (no role edit exists, so the user edit stands for "edit a role"); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-07-1366.png, tc-start-07-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-08 Error Logs

| | |
|---|---|
| Title | Error Logs |
| Role | Super Admin |
| Pre-condition | — |
| Steps | cause a server error in web |
| Expected result | it shows in Error Logs with method, URL, IP |
| Actual result | 1366: browser console error raised on the website -> Error Logs row: 1 16 Nov 2026, 01:30 PM Web Error browser.console ct_auth browser error ct_auth_err_1366_1794816018192 tab-570bbe75-02ec-4c2b-bc70-d28ef260bee1 – ::1 ; detail: Error Details #146 ct_auth browser error ct_auth_err_1366_1794816018192 Level Error App Web Category browser.console Date & Time 16 Nov 2026, 01:30 PM User – IP address ::1 Page / Route / Request ID C; no issues \|\| 390: browser console error raised on the website -> Error Logs row: 1 16 Nov 2026, 01:30 PM Web Error browser.console ct_auth browser error ct_auth_err_390_1794816034166 tab-b6a39a0a-5ff6-4b13-9889-28b05b0237c5 – ::1 ; detail: Error Details #147 ct_auth browser error ct_auth_err_390_1794816034166 Level Error App Web Category browser.console Date & Time 16 Nov 2026, 01:30 PM User – IP address ::1 Page / Route / Request ID Co; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-08-1366.png, tc-start-08-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-09 Background Jobs

| | |
|---|---|
| Title | Background Jobs |
| Role | Super Admin |
| Pre-condition | worker enabled |
| Steps | run `health` from Run Command |
| Expected result | run Done with its output |
| Actual result | 1366: Run Command health/check: Job Run #9 Done exit 0; Output Copy Database: up Error Copy — Close Scheduled One-time Logs Status: All Active Ina; no issues \|\| 390: Run Command health/check: Job Run #11 Done exit 0; Output Copy Database: up Error Copy — Close Scheduled One-time Logs Status: All Active Ina; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-09-1366.png, tc-start-09-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-10 Languages

| | |
|---|---|
| Title | Languages |
| Role | Super Admin |
| Pre-condition | — |
| Steps | add Hindi, translate "Save", publish |
| Expected result | the console's switch shows हि; Save shows in Hindi |
| Actual result | language "ct_Hindi" (code hi, short हि; re-activated, it had been added earlier in this run) and the translation Save = सहेजें published (Last published: 16 Nov 2026, 01:33 PM); the console switch lists हि (1); after choosing it the Add User dialog's Save button reads "सहेजें"; restored afterwards: ct_Hindi, "Save" and every ct_sync row set Inactive and translations published again; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-10-1366.png, tc-start-10-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-11 Tech Documentation

| | |
|---|---|
| Title | Tech Documentation |
| Role | Super Admin |
| Pre-condition | — |
| Steps | open it, search, Download .md |
| Expected result | the docs tree shows; the file downloads unchanged |
| Actual result | Tech Documentation tree shows (How it works, Planning, Screenshots, Test documents ...); search "browser testing" lists matches; Download .md gave browser-testing.md, identical to docs/how-it-works/platform/browser-testing.md: true; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-11-1366.png, tc-start-11-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-SYNC-01 Failure toasts are red

| | |
|---|---|
| Title | Failure toasts are red |
| Role | Super Admin |
| Pre-condition | console signed in |
| Steps | make each of the six failures happen (request blocked in the browser) |
| Expected result | each shows the toast with the red line (`toast is-error`) |
| Actual result | switch: "User "Ct Auth User10 Edited" could not be changed. Plea" red=true \| open user: "User "Ct Auth User10 Edited" could not be opened. Pleas" red=true \| audit event: "This event could not be opened. Please try again." red=true \| error entry: "The log entry could not be opened. Please try again." red=true \| mark all console: "This could not be done. Please try again." red=true \| mark all web: "This could not be done. Please try again." red=true |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-01-1366.png, tc-sync-01-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-02 Duplicate language name / code

| | |
|---|---|
| Title | Duplicate language name / code |
| Role | Super Admin |
| Pre-condition | Language Master |
| Steps | Add Language with the name "English", then code "en" |
| Expected result | under Name: "This name is already in use."; under Code: "This code is already in use." |
| Actual result | name "English" -> ["This name is already in use."]; code "en" -> ["This code is already in use."]; nothing saved (list still 2 languages: English and the inactive ct_Hindi) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-02-1366.png, tc-sync-02-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-03 Duplicate English text

| | |
|---|---|
| Title | Duplicate English text |
| Role | Super Admin |
| Pre-condition | App Translations with one row |
| Steps | Add Translation with the same English text |
| Expected result | under English Text: "This text is already in use." |
| Actual result | 1366: first add of "ct_sync_1366_96722": "Translation added."; the same text again: ["This text is already in use."] (ct row left, deactivated at the end) \|\| 390: first add of "ct_sync_390_42039": "Translation added."; the same text again: ["This text is already in use."] (ct row left, deactivated at the end) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-03-1366.png, tc-sync-03-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-04 English switch locked

| | |
|---|---|
| Title | English switch locked |
| Role | Super Admin |
| Pre-condition | Language Master |
| Steps | look at the English row; try to click its switch |
| Expected result | the switch is shown, on, disabled; tooltip "English is the base language"; nothing changes |
| Actual result | English row switch disabled true, on true, tooltip "English is the base language", label "English: English is the base language"; a click changed nothing (true), no toast |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-04-1366.png, tc-sync-04-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-05 Other switches still work

| | |
|---|---|
| Title | Other switches still work |
| Role | Super Admin |
| Pre-condition | Users list |
| Steps | switch a user off and on (the same `MasterSwitch`; a second language would change the translation table) |
| Expected result | toasts "… marked inactive." / "… marked active." |
| Actual result | ct_auth_10 switched off: "User "Ct Auth User10 Edited" marked inactive."; on: "User "Ct Auth User10 Edited" marked active." (user left Active); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-05-1366.png, tc-sync-05-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-06 Phone width

| | |
|---|---|
| Title | Phone width |
| Role | Super Admin |
| Pre-condition | the screens above |
| Steps | 390 px |
| Expected result | same results, no sideways scroll |
| Actual result | 1366: SYNC-01..05 screens at 1366px: no sideways scroll, no console errors or failed calls other than the expected 409 duplicate checks (SYNC-02 / 03) and the requests the browser blocked on purpose (SYNC-01) \|\| 390: SYNC-01..05 screens at 390px: no sideways scroll, no console errors or failed calls other than the expected 409 duplicate checks (SYNC-02 / 03) and the requests the browser blocked on purpose (SYNC-01) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-sync-06-1366.png, tc-sync-06-390.png |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-RESP-01 history

- 2026-10-28 PASS: `npm run verify` exit 0 (the `boundaries` deprecation warning about `mode` was there before).
- 2026-11-16 PASS (current): `npm run verify` in apps/api exit 0, no lint errors.

### TC-RESP-02 history

- 2026-10-28 PASS: scratch lines in the health controller, `res.json({ items: [] })`, `response.status(404).send('x')`, `stream.pipe(res)`: three errors with the rule's message; the file restored.
- 2026-11-16 PASS (current): scratch `res.json({ items: [] })`, `res.status(404).send('x')` and `stream.pipe(res)` each failed `npm run lint` with "Respond through core/http: ok(), created(), ..."; scratch removed.

### TC-RESP-03 history

- 2026-10-28 PASS: `GET /api/system-log/api/error.log/download` as a Super Admin: 200, `text/plain`, `attachment; filename="api-error.log"`, `private, no-store`, `Content-Length` 2283, content identical to `logs/error.log`.
- 2026-11-16 PASS (current): GET /api/system-log/api/error.log/download -> 200, text/plain; charset=utf-8, attachment; filename="api-error.log", private, no-store, 38249 bytes of the file

### TC-RESP-04 history

- 2026-10-28 PASS: health `{ success, message, data }`; `GET /api/users?page=1&limit=2` with `meta` `{ page, limit, total, totalPages }`; `GET /api/nope` 404 `{ success: false, code: "ENDPOINT_NOT_FOUND", requestId }`.
- 2026-11-16 PASS (current): GET /api/health 200 keys success,message,data; GET /api/users keys success,message,data,meta meta page,limit,total,totalPages; unknown route 404 {success:false, code:ENDPOINT_NOT_FOUND}

### TC-START-01 history

- 2026-10-28 PASS: a blank database `starter_check` built from the six files, 15 tables, no error.
- 2026-11-16 NOT RUN (current): the base migrations are already applied here; nothing created.

### TC-START-02 history

- 2026-10-28 PASS: `npm run dev` on 8030, `GET /api/health` 200, database up.
- 2026-11-16 PASS (current): the API is running under pm2 (`npm run dev`); `GET /api/health` -> 200 {"success":true,"message":"API is healthy.","data":{"status":"ok","database":"up"}}; a start from a fresh `.env.example` was not repeated (no .env changes allowed).

### TC-START-04 history

- 2026-10-28 PASS: `tsc` and `lint` in api, manage, web; `build` in manage and web.
- 2026-11-16 PASS (current): `npx tsc --noEmit` clean in api, manage, web and partner; `npm run lint` 0 errors (api none, manage 6 warnings, web 3, partner 3, all `no-img-element` warnings); `npm run build` passes in manage and web (exit 0).

### TC-START-05 history

- 2026-10-28 PASS: no source project name, domain, hostname, port or business word left in the repo (the plan describes what was removed in general words).
- 2026-11-16 PASS (current): `git grep -iE "niwasi\|indiaeventually"` outside docs/planning and docs/prototype finds nothing (the one planning-file hit is the user's own quoted instruction, not code).

### TC-START-07 history

- 2026-10-28 PASS: Add User `ct_audit`, then Edit (name, Super Admin role) → audit `USER_CREATED`, `USER_UPDATED` from MANAGE.
- 2026-11-16 PASS (current): 1366: Add User (audit 101 with email / mobile) and Edit User (audit 103, changes {"name": {"to": "Ct Auth User10 Edited", "from": "Ct Auth User10"}}) both recorded for user 142 (actions 101,103) and listed in the Audit Log (6 rows for the name); the Roles page is a read-only list of the 2 system roles (no role edit exists, so the user edit stands for "edit a role"); no issues \|\| 390: Add User (audit 101 with email / mobile) and Edit User (audit 103, changes {"name": {"to": "Ct Auth User11 Edited", "from": "Ct Auth User11"}}) both recorded for user 143 (actions 101,103) and listed in the Audit Log (6 rows for the name); the Roles page is a read-only list of the 2 system roles (no role edit exists, so the user edit stands for "edit a role"); no issues

### TC-START-08 history

- 2026-10-28 PASS: a browser error raised in web → Error Logs row, source web (3), category `browser.console`, with the IP.
- 2026-11-16 PASS (current): 1366: browser console error raised on the website -> Error Logs row: 1 16 Nov 2026, 01:30 PM Web Error browser.console ct_auth browser error ct_auth_err_1366_1794816018192 tab-570bbe75-02ec-4c2b-bc70-d28ef260bee1 – ::1 ; detail: Error Details #146 ct_auth browser error ct_auth_err_1366_1794816018192 Level Error App Web Category browser.console Date & Time 16 Nov 2026, 01:30 PM User – IP address ::1 Page / Route / Request ID C; no issues \|\| 390: browser console error raised on the website -> Error Logs row: 1 16 Nov 2026, 01:30 PM Web Error browser.console ct_auth browser error ct_auth_err_390_1794816034166 tab-b6a39a0a-5ff6-4b13-9889-28b05b0237c5 – ::1 ; detail: Error Details #147 ct_auth browser error ct_auth_err_390_1794816034166 Level Error App Web Category browser.console Date & Time 16 Nov 2026, 01:30 PM User – IP address ::1 Page / Route / Request ID Co; no issues

### TC-START-09 history

- 2026-10-28 PASS: Run Command `health/check` → run Done, exit 0, output "Database: up".
- 2026-11-16 PASS (current): 1366: Run Command health/check: Job Run #9 Done exit 0; Output Copy Database: up Error Copy — Close Scheduled One-time Logs Status: All Active Ina; no issues \|\| 390: Run Command health/check: Job Run #11 Done exit 0; Output Copy Database: up Error Copy — Close Scheduled One-time Logs Status: All Active Ina; no issues

### TC-START-10 history

- 2026-10-28 PASS: add Hindi (its `hi_text` column added by the API), translate "Dashboard", Publish → `hi.json` and `languages.json` in manage and web; web's switch shows EN / हि, and हि shows डैशबोर्ड.
- 2026-11-16 PASS (current): language "ct_Hindi" (code hi, short हि; re-activated, it had been added earlier in this run) and the translation Save = सहेजें published (Last published: 16 Nov 2026, 01:33 PM); the console switch lists हि (1); after choosing it the Add User dialog's Save button reads "सहेजें"; restored afterwards: ct_Hindi, "Save" and every ct_sync row set Inactive and translations published again; no issues

### TC-START-11 history

- 2026-10-28 PASS: Tech Documentation lists the docs; a doc opens; Download .md gives the file byte for byte.
- 2026-11-16 PASS (current): Tech Documentation tree shows (How it works, Planning, Screenshots, Test documents ...); search "browser testing" lists matches; Download .md gave browser-testing.md, identical to docs/how-it-works/platform/browser-testing.md: true; no issues

### TC-SYNC-01 history

- 2026-10-30 PASS: with the API blocked in the browser, all five console failures and the portal's Mark all as read show `toast is-error` with their messages.
- 2026-11-16 PASS (current): switch: "User "Ct Auth User10 Edited" could not be changed. Plea" red=true \| open user: "User "Ct Auth User10 Edited" could not be opened. Pleas" red=true \| audit event: "This event could not be opened. Please try again." red=true \| error entry: "The log entry could not be opened. Please try again." red=true \| mark all console: "This could not be done. Please try again." red=true \| mark all web: "This could not be done. Please try again." red=true

### TC-SYNC-02 history

- 2026-10-30 PASS: Add Language with the name "English": "This name is already in use."; with the code "en": "This code is already in use." Nothing saved.
- 2026-11-16 PASS (current): name "English" -> ["This name is already in use."]; code "en" -> ["This code is already in use."]; nothing saved (list still 2 languages: English and the inactive ct_Hindi)

### TC-SYNC-03 history

- 2026-10-30 PASS: adding "ct sync test" twice: "Translation added.", then "This text is already in use." under the field.
- 2026-11-16 PASS (current): 1366: first add of "ct_sync_1366_96722": "Translation added."; the same text again: ["This text is already in use."] (ct row left, deactivated at the end) \|\| 390: first add of "ct_sync_390_42039": "Translation added."; the same text again: ["This text is already in use."] (ct row left, deactivated at the end)

### TC-SYNC-04 history

- 2026-10-30 PASS: the English row has one switch, on, disabled, tooltip "English is the base language"; a click changes nothing, no toast.
- 2026-11-16 PASS (current): English row switch disabled true, on true, tooltip "English is the base language", label "English: English is the base language"; a click changed nothing (true), no toast

### TC-SYNC-05 history

- 2026-10-30 PASS: ct Notify Member switched off and on: "marked inactive." / "marked active."
- 2026-11-16 FAIL: 1366: FAILED at 1366: ct_auth_10 switched off: "User "Ct Auth User10 Edited" could not be changed. Please try again."; on: "(no toast)" (user left Active) \|\| 390: FAILED at 390: ct_auth_10 switched off: "User "Ct Auth User10 Edited" could not be changed. Please try again."; on: "(no toast)" (user left Active)
- 2026-11-16 FAIL: not an app bug.
- 2026-11-16 PASS (current): ct_auth_10 switched off: "User "Ct Auth User10 Edited" marked inactive."; on: "User "Ct Auth User10 Edited" marked active." (user left Active); no issues

### TC-SYNC-06 history

- 2026-10-30 PASS: no sideways scroll on Language Master or App Translations; no page errors.
- 2026-11-16 FAIL: 1366: FAILED at 1366: the SYNC-01..05 screens at 1366px: console / sideways problems: console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED \|\| 390: FAILED at 390: the SYNC-01..05 screens at 390px: console / sideways problems: console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED; console: Failed to load resource: net::ERR_FAILED
- 2026-11-16 FAIL: not an app bug.
- 2026-11-16 PASS (current): 1366: SYNC-01..05 screens at 1366px: no sideways scroll, no console errors or failed calls other than the expected 409 duplicate checks (SYNC-02 / 03) and the requests the browser blocked on purpose (SYNC-01) \|\| 390: SYNC-01..05 screens at 390px: no sideways scroll, no console errors or failed calls other than the expected 409 duplicate checks (SYNC-02 / 03) and the requests the browser blocked on purpose (SYNC-01)
