# Test document: Console platform

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-28-api-response-lint.md`, `docs/planning/features/2026-10-28-starter-core.md`, `docs/planning/features/2026-10-30-prototype-sync.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/technical-document.md` starter modules |
| How it works | `docs/how-it-works/platform/manage-console.md`, `docs/how-it-works/modules/audit/README.md`, `docs/how-it-works/modules/system-log/README.md`, `docs/how-it-works/modules/jobs/README.md`, `docs/how-it-works/modules/language/README.md`, `docs/how-it-works/modules/mail/README.md` |
| Latest run | 2026-10-30 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 19 | 19 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-RESP-01 | Lint passes on the starter | — | PASS | 2026-10-28 |
| TC-RESP-02 | Lint catches a made-up response | — | PASS | 2026-10-28 |
| TC-RESP-03 | Log file download still works | — | PASS | 2026-10-28 |
| TC-RESP-04 | Envelopes unchanged | — | PASS | 2026-10-28 |
| TC-START-01 | Blank database | — | PASS | 2026-10-28 |
| TC-START-02 | API starts | — | PASS | 2026-10-28 |
| TC-START-04 | Checks | — | PASS | 2026-10-28 |
| TC-START-05 | No source names | — | PASS | 2026-10-28 |
| TC-START-07 | Audit | — | PASS | 2026-10-28 |
| TC-START-08 | Error Logs | — | PASS | 2026-10-28 |
| TC-START-09 | Background Jobs | — | PASS | 2026-10-28 |
| TC-START-10 | Languages | — | PASS | 2026-10-28 |
| TC-START-11 | Tech Documentation | — | PASS | 2026-10-28 |
| TC-SYNC-01 | Failure toasts are red | — | PASS | 2026-10-30 |
| TC-SYNC-02 | Duplicate language name / code | — | PASS | 2026-10-30 |
| TC-SYNC-03 | Duplicate English text | — | PASS | 2026-10-30 |
| TC-SYNC-04 | English switch locked | — | PASS | 2026-10-30 |
| TC-SYNC-05 | Other switches still work | — | PASS | 2026-10-30 |
| TC-SYNC-06 | Phone width | — | PASS | 2026-10-30 |

## Cases

### TC-RESP-01 Lint passes on the starter

| | |
|---|---|
| Title | Lint passes on the starter |
| Role | — |
| Pre-condition | the change applied |
| Steps | `npm run verify` in `apps/api` |
| Expected result | no errors |
| Actual result | `npm run verify` exit 0 (the `boundaries` deprecation warning about `mode` was there before). |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-02 Lint catches a made-up response

| | |
|---|---|
| Title | Lint catches a made-up response |
| Role | — |
| Pre-condition | a scratch controller line `res.json({ items: [] })`, then `res.status(404).send('x')`, then `stream.pipe(res)` |
| Steps | `npm run lint` |
| Expected result | each fails with the rule's message; scratch lines removed after |
| Actual result | scratch lines in the health controller, `res.json({ items: [] })`, `response.status(404).send('x')`, `stream.pipe(res)`: three errors with the rule's message; the file restored. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-03 Log file download still works

| | |
|---|---|
| Title | Log file download still works |
| Role | — |
| Pre-condition | API running, Super Admin signed in |
| Steps | download a log file from System Logs (`GET /api/system-log/:app/:name/download`) |
| Expected result | 200, `text/plain`, `attachment; filename=…`, `no-store`, the file's content |
| Actual result | `GET /api/system-log/api/error.log/download` as a Super Admin: 200, `text/plain`, `attachment; filename="api-error.log"`, `private, no-store`, `Content-Length` 2283, content identical to `logs/error.log`. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-api-response-lint.md |

### TC-RESP-04 Envelopes unchanged

| | |
|---|---|
| Title | Envelopes unchanged |
| Role | — |
| Pre-condition | API running |
| Steps | `GET /api/health`, a list (`GET /api/users`), an unknown route |
| Expected result | `{ success: true, message, data }`, `meta` on the list, `{ success: false, code: … }` on the 404 |
| Actual result | health `{ success, message, data }`; `GET /api/users?page=1&limit=2` with `meta` `{ page, limit, total, totalPages }`; `GET /api/nope` 404 `{ success: false, code: "ENDPOINT_NOT_FOUND", requestId }`. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
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
| Actual result | a blank database `starter_check` built from the six files, 15 tables, no error. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-02 API starts

| | |
|---|---|
| Title | API starts |
| Role | — |
| Pre-condition | `.env` from `.env.example` |
| Steps | `npm run dev` in `apps/api` |
| Expected result | `GET /api/health` 200 |
| Actual result | `npm run dev` on 8030, `GET /api/health` 200, database up. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-04 Checks

| | |
|---|---|
| Title | Checks |
| Role | — |
| Pre-condition | — |
| Steps | `tsc`, `lint` in api, manage, web; `build` in manage, web |
| Expected result | pass |
| Actual result | `tsc` and `lint` in api, manage, web; `build` in manage and web. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-05 No source names

| | |
|---|---|
| Title | No source names |
| Role | — |
| Pre-condition | — |
| Steps | search the repo for the source project's names, domains and business words |
| Expected result | nothing found |
| Actual result | no source project name, domain, hostname, port or business word left in the repo (the plan describes what was removed in general words). |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-07 Audit

| | |
|---|---|
| Title | Audit |
| Role | — |
| Pre-condition | — |
| Steps | add a user, edit a role |
| Expected result | both in the Audit Log with their changes |
| Actual result | Add User `ct_audit`, then Edit (name, Super Admin role) → audit `USER_CREATED`, `USER_UPDATED` from MANAGE. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-08 Error Logs

| | |
|---|---|
| Title | Error Logs |
| Role | — |
| Pre-condition | — |
| Steps | cause a server error in web |
| Expected result | it shows in Error Logs with method, URL, IP |
| Actual result | a browser error raised in web → Error Logs row, source web (3), category `browser.console`, with the IP. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-09 Background Jobs

| | |
|---|---|
| Title | Background Jobs |
| Role | — |
| Pre-condition | worker enabled |
| Steps | run `health` from Run Command |
| Expected result | run Done with its output |
| Actual result | Run Command `health/check` → run Done, exit 0, output "Database: up". |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-10 Languages

| | |
|---|---|
| Title | Languages |
| Role | — |
| Pre-condition | — |
| Steps | add Hindi, translate "Save", publish |
| Expected result | the console's switch shows हि; Save shows in Hindi |
| Actual result | add Hindi (its `hi_text` column added by the API), translate "Dashboard", Publish → `hi.json` and `languages.json` in manage and web; web's switch shows EN / हि, and हि shows डैशबोर्ड. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-START-11 Tech Documentation

| | |
|---|---|
| Title | Tech Documentation |
| Role | — |
| Pre-condition | — |
| Steps | open it, search, Download .md |
| Expected result | the docs tree shows; the file downloads unchanged |
| Actual result | Tech Documentation lists the docs; a doc opens; Download .md gives the file byte for byte. |
| Result | PASS |
| Method | — |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-28-starter-core.md |

### TC-SYNC-01 Failure toasts are red

| | |
|---|---|
| Title | Failure toasts are red |
| Role | — |
| Pre-condition | console signed in |
| Steps | make each of the six failures happen (request blocked in the browser) |
| Expected result | each shows the toast with the red line (`toast is-error`) |
| Actual result | with the API blocked in the browser, all five console failures and the portal's Mark all as read show `toast is-error` with their messages. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-02 Duplicate language name / code

| | |
|---|---|
| Title | Duplicate language name / code |
| Role | — |
| Pre-condition | Language Master |
| Steps | Add Language with the name "English", then code "en" |
| Expected result | under Name: "This name is already in use."; under Code: "This code is already in use." |
| Actual result | Add Language with the name "English": "This name is already in use."; with the code "en": "This code is already in use." Nothing saved. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-03 Duplicate English text

| | |
|---|---|
| Title | Duplicate English text |
| Role | — |
| Pre-condition | App Translations with one row |
| Steps | Add Translation with the same English text |
| Expected result | under English Text: "This text is already in use." |
| Actual result | adding "ct sync test" twice: "Translation added.", then "This text is already in use." under the field. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-04 English switch locked

| | |
|---|---|
| Title | English switch locked |
| Role | — |
| Pre-condition | Language Master |
| Steps | look at the English row; try to click its switch |
| Expected result | the switch is shown, on, disabled; tooltip "English is the base language"; nothing changes |
| Actual result | the English row has one switch, on, disabled, tooltip "English is the base language"; a click changes nothing, no toast. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-05 Other switches still work

| | |
|---|---|
| Title | Other switches still work |
| Role | — |
| Pre-condition | Users list |
| Steps | switch a user off and on (the same `MasterSwitch`; a second language would change the translation table) |
| Expected result | toasts "… marked inactive." / "… marked active." |
| Actual result | ct Notify Member switched off and on: "marked inactive." / "marked active." |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

### TC-SYNC-06 Phone width

| | |
|---|---|
| Title | Phone width |
| Role | — |
| Pre-condition | the screens above |
| Steps | 390 px |
| Expected result | same results, no sideways scroll |
| Actual result | no sideways scroll on Language Master or App Translations; no page errors. |
| Result | PASS |
| Method | browser, 390 px |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | technical-document starter modules |
| Planning file | docs/planning/features/2026-10-30-prototype-sync.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
