# Test document: Repo tooling

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-28-browser-test-cases.md`, `docs/planning/features/2026-10-30-prototype-repo-in-init.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/platform/prototype.md` whole file |
| How it works | `docs/how-it-works/platform/prototype.md`, `docs/how-it-works/platform/browser-testing.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 11 | 7 | 0 | 4 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-BTEST-01 | Template says it | Super Admin | PASS | 2026-11-16 |
| TC-BTEST-02 | Docs agree | none | PASS | 2026-11-16 |
| TC-PROTO-01 | New project, empty prototype repo | — | NOT RUN | 2026-11-16 |
| TC-PROTO-02 | New project, prototype with content | — | NOT RUN | 2026-11-16 |
| TC-PROTO-03 | No prototype URL | — | NOT RUN | 2026-11-16 |
| TC-PROTO-04 | Add later | — | NOT RUN | 2026-11-16 |
| TC-PROTO-05 | New machine | none | PASS | 2026-11-16 |
| TC-PROTO-06 | Dry run | none | PASS | 2026-11-16 |
| TC-FIX-16 | Packages workflow: accepted proposals written as decided; the four limits marked | none | PASS | 2026-11-16 |
| TC-FIX-17 | technical-document.md, AGENTS.md and the witw-theme tokens updated; Word files current | none | PASS | 2026-11-16 |
| TC-FIX-18 | Deployment docs name the partner host | none | PASS | 2026-11-16 |

## Cases

### TC-BTEST-01 Template says it

| | |
|---|---|
| Title | Template says it |
| Role | Super Admin |
| Pre-condition | the change applied, manage running, signed in as a `ct_` Super Admin |
| Steps | open Tech Documentation in the console, open the planning template |
| Expected result | §3 shows the "Checked in" column and the browser rule, §5 the one-line-per-case format and the shipped condition; its link to browser-testing opens the doc |
| Actual result | Tech Documentation > planning template: §3 has the "Checked in" column (true), the browser rule and the one-line-per-case §5 / shipped condition are shown; its link to browser testing opened /docs/how-it-works/platform/browser-testing.md; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-btest-01-1366.png, tc-btest-01-390.png |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-28-browser-test-cases.md |

### TC-BTEST-02 Docs agree

| | |
|---|---|
| Title | Docs agree |
| Role | none |
| Pre-condition | the change applied |
| Steps | read `AGENTS.md`, `browser-testing.md`, the platform README |
| Expected result | the same rule in all three; the doc is listed in the platform README; Tech Documentation shows it |
| Actual result | AGENTS.md ("Every test case is run in the browser and its result written", line 85, and the Sync discipline rule), docs/how-it-works/platform/browser-testing.md ("The rule") and docs/planning/TEMPLATE.md state the same rule (Playwright on the real screens; curl / CLI / query only for cases with no screen; a result line per case before `shipped`); browser-testing.md is listed in docs/how-it-works/platform/README.md (line 19) and shows in Tech Documentation (opened in TC-BTEST-01 / TC-START-11). |
| Result | PASS |
| Method | read |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-28-browser-test-cases.md |

### TC-PROTO-01 New project, empty prototype repo

| | |
|---|---|
| Title | New project, empty prototype repo |
| Role | — |
| Pre-condition | an empty test repository |
| Steps | `node init.js`, answer with its URL |
| Expected result | template pushed as its first commit; `docs/prototype` is a submodule at that commit |
| Actual result | only the read-only checks below. |
| Result | NOT RUN |
| Method | needs an empty test repository and a push |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-02 New project, prototype with content

| | |
|---|---|
| Title | New project, prototype with content |
| Role | — |
| Pre-condition | a test repository with a commit |
| Steps | `node init.js` with its URL |
| Expected result | nothing pushed to it; added as the submodule |
| Actual result | no init.js run that adds a submodule. |
| Result | NOT RUN |
| Method | needs a test repository with a commit |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-03 No prototype URL

| | |
|---|---|
| Title | No prototype URL |
| Role | — |
| Pre-condition | — |
| Steps | `node init.js`, leave the question empty |
| Expected result | no submodule; the command to add it later is printed |
| Actual result | not run. |
| Result | NOT RUN |
| Method | interactive answer |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-04 Add later

| | |
|---|---|
| Title | Add later |
| Role | — |
| Pre-condition | a project made without a prototype |
| Steps | run the printed command with an empty test repository |
| Expected result | same result as TC-PROTO-01 |
| Actual result | not run. |
| Result | NOT RUN |
| Method | needs an empty test repository and a push |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-05 New machine

| | |
|---|---|
| Title | New machine |
| Role | none |
| Pre-condition | a project with the submodule, cloned fresh |
| Steps | `node init.js` (development) |
| Expected result | `docs/prototype` checked out at the pinned commit |
| Actual result | `git submodule status` shows docs/prototype checked out at the pinned commit 868d62b with no "+" (no drift); a fresh-clone run of init.js was not done. |
| Result | PASS |
| Method | read-only |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-06 Dry run

| | |
|---|---|
| Title | Dry run |
| Role | none |
| Pre-condition | — |
| Steps | `node init.js --dry-run` with a prototype URL |
| Expected result | prints what it would do; nothing created or pushed |
| Actual result | `node init.js --dry-run --yes` on this set-up copy says nothing to do; `node init.js --dry-run --yes --prototype=<current submodule URL>` prints "Prototype setup (dry run: nothing is written)" and "docs/prototype is already a submodule: left as it is"; `git status` of docs/prototype, .gitmodules and the pin unchanged. |
| Result | PASS |
| Method | CLI dry run |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-FIX-16 Packages workflow: accepted proposals written as decided; the four limits marked

| | |
|---|---|
| Title | Packages workflow: accepted proposals written as decided; the four limits marked |
| Role | none |
| Pre-condition | — |
| Steps | grep the workflow for "proposed" |
| Expected result | Only the four limits (day image 20 MB, About 2,000, caption 1,000, 20 photos per upload) and the intro say "(proposed, client confirm)"; §16 #2–7, 9, 11–16 say Decided 2026-11-12; §7 has Send needs a photo |
| Actual result | "proposed" appears 5 times in the workflow, all "client confirm" (the four limits and the intro); §16 #2–7, 9, 11–16 "Decided 2026-11-12, accepted by the user"; new §16 #18 and §7 row "Add at least one photo first."; #3 also gets the built behaviour (coordinator). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §16 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-17 technical-document.md, AGENTS.md and the witw-theme tokens updated; Word files current

| | |
|---|---|
| Title | technical-document.md, AGENTS.md and the witw-theme tokens updated; Word files current |
| Role | none |
| Pre-condition | — |
| Steps | `npm run check` in docs/tools/docx-generator; `generate.js --check`; read the diff |
| Expected result | Both checks pass; AGENTS.md has the partner app, "manage, web and partner", the test documents; theme plan values match the apps' globals.css |
| Actual result | docx-generator `npm run check` and `generate.js --check` exit 0; AGENTS.md diff holds only points (a)–(e); theme plan §2/§3 show radius-xl 16, overlay rgba(9,66,45,.5), console danger #DC2626 (and info #2563EB, as the console's globals.css), dated note. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | AGENTS.md Word documents |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-18 Deployment docs name the partner host

| | |
|---|---|
| Title | Deployment docs name the partner host |
| Role | none |
| Pre-condition | — |
| Steps | grep the deployment docs and environments/ for "TBD" and the hosts |
| Expected result | `stag-partner.<domain>` / `partner.<domain>` with "(team confirm)", as init.js; no TBD left |
| Actual result | no "TBD" in docs/how-it-works or environments/; staging and production docs use stag-partner.<domain> / partner.<domain> with "(team confirm)" in the .env lines, nginx and certbot. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | staging-deployment.md, production-deployment.md |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-BTEST-01 history

- 2026-10-28 PASS: signed in to the console through the sign-in form as `ct_btest@example.test`; Tech Documentation › the planning template shows the "Checked in" column and rule, the result-line examples and the shipped condition; its browser-testing link opens the doc; no sideways scroll; screenshots taken (the checks read the page text; the screenshots were not opened this time).
- 2026-11-16 PASS (current): Tech Documentation > planning template: §3 has the "Checked in" column (true), the browser rule and the one-line-per-case §5 / shipped condition are shown; its link to browser testing opened /docs/how-it-works/platform/browser-testing.md; no issues

### TC-BTEST-02 history

- 2026-10-28 PASS: the browser-testing doc and the platform README (listing it) open in Tech Documentation with every section; `AGENTS.md` (outside `docs/`, so read in the editor) has the same rule in its three places. Only network error: `401 /api/auth/refresh` on the sign-in page before signing in (the signed-out session check, expected).
- 2026-11-16 PASS (current): AGENTS.md ("Every test case is run in the browser and its result written", line 85, and the Sync discipline rule), docs/how-it-works/platform/browser-testing.md ("The rule") and docs/planning/TEMPLATE.md state the same rule (Playwright on the real screens; curl / CLI / query only for cases with no screen; a result line per case before `shipped`); browser-testing.md is listed in docs/how-it-works/platform/README.md (line 19) and shows in Tech Documentation (opened in TC-BTEST-01 / TC-START-11).

### TC-PROTO-01 history

- 2026-10-30 PASS: full new project as in the guide (name, database `ct_proto_one_db`, packages, first Super Admin "ct Proto Admin", git remote, empty prototype repository): the starter link removed, the repository got one commit "Start from the starter prototype" (33d923d, with `design-system/`), `docs/prototype` staged as a submodule at 33d923d, PROTOTYPE-SYNC row updated, `init-project.js` removed. (The first database attempt failed because the test passed the password with its quotes; re-run with `--force`: database created, Super Admin user 1 created, prototype checked out.)
- 2026-11-16 NOT RUN (current): only the read-only checks below.

### TC-PROTO-02 history

- 2026-10-30 PASS: a repository with one commit ("client prototype") added as it is; its log unchanged (nothing pushed); `docs/prototype` shows its README.
- 2026-11-16 NOT RUN (current): no init.js run that adds a submodule.

### TC-PROTO-03 history

- 2026-10-30 PASS: no prototype URL: starter link removed (`.gitmodules` gone, `docs/prototype` removed), PROTOTYPE-SYNC back to "not added yet", the later command printed.
- 2026-11-16 NOT RUN (current): not run.

### TC-PROTO-04 history

- 2026-10-30 PASS: on that set-up project, `node init.js --prototype=<empty repository>` printed "Prototype setup", copied the template (d8cc474) and added the submodule.
- 2026-11-16 NOT RUN (current): not run.

### TC-PROTO-05 history

- 2026-10-30 PASS: the TC-01 project committed and pushed to a local origin, cloned fresh (`docs/prototype` empty), `node init.js`: "checked out at the pinned commit", `design-system/` present at 33d923d.
- 2026-11-16 PASS (current): `git submodule status` shows docs/prototype checked out at the pinned commit 868d62b with no "+" (no drift); a fresh-clone run of init.js was not done.

### TC-PROTO-06 history

- 2026-10-30 PASS: `--dry-run` with an empty prototype repository lists the three steps (drop the starter link, copy and push, submodule add); afterwards `.gitmodules` unchanged, no `.git`, the repository still has 0 refs.
- 2026-11-16 PASS (current): `node init.js --dry-run --yes` on this set-up copy says nothing to do; `node init.js --dry-run --yes --prototype=<current submodule URL>` prints "Prototype setup (dry run: nothing is written)" and "docs/prototype is already a submodule: left as it is"; `git status` of docs/prototype, .gitmodules and the pin unchanged.
