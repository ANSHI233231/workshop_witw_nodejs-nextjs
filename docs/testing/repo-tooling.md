# Test document: Repo tooling

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-10-28-browser-test-cases.md`, `docs/planning/features/2026-10-30-prototype-repo-in-init.md` |
| Requirement and workflow references | `docs/how-it-works/platform/prototype.md` whole file |
| How it works | `docs/how-it-works/platform/prototype.md`, `docs/how-it-works/platform/browser-testing.md` |
| Latest run | 2026-10-30 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 8 | 8 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-BTEST-01 | Template says it | — | PASS | 2026-10-28 |
| TC-BTEST-02 | Docs agree | — | PASS | 2026-10-28 |
| TC-PROTO-01 | New project, empty prototype repo | — | PASS | 2026-10-30 |
| TC-PROTO-02 | New project, prototype with content | — | PASS | 2026-10-30 |
| TC-PROTO-03 | No prototype URL | — | PASS | 2026-10-30 |
| TC-PROTO-04 | Add later | — | PASS | 2026-10-30 |
| TC-PROTO-05 | New machine | — | PASS | 2026-10-30 |
| TC-PROTO-06 | Dry run | — | PASS | 2026-10-30 |

## Cases

### TC-BTEST-01 Template says it

| | |
|---|---|
| Title | Template says it |
| Role | — |
| Pre-condition | the change applied, manage running, signed in as a `ct_` Super Admin |
| Steps | open Tech Documentation in the console, open the planning template |
| Expected result | §3 shows the "Checked in" column and the browser rule, §5 the one-line-per-case format and the shipped condition; its link to browser-testing opens the doc |
| Actual result | signed in to the console through the sign-in form as `ct_btest@example.test`; Tech Documentation › the planning template shows the "Checked in" column and rule, the result-line examples and the shipped condition; its browser-testing link opens the doc; no sideways scroll; screenshots taken (the checks read the page text; the screenshots were not opened this time). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-28 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-28-browser-test-cases.md |

### TC-BTEST-02 Docs agree

| | |
|---|---|
| Title | Docs agree |
| Role | — |
| Pre-condition | the change applied |
| Steps | read `AGENTS.md`, `browser-testing.md`, the platform README |
| Expected result | the same rule in all three; the doc is listed in the platform README; Tech Documentation shows it |
| Actual result | the browser-testing doc and the platform README (listing it) open in Tech Documentation with every section; `AGENTS.md` (outside `docs/`, so read in the editor) has the same rule in its three places. Only network error: `401 /api/auth/refresh` on the sign-in page before signing in (the signed-out session check, expected). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-10-28 |
| Screenshot | — |
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
| Actual result | full new project as in the guide (name, database `ct_proto_one_db`, packages, first Super Admin "ct Proto Admin", git remote, empty prototype repository): the starter link removed, the repository got one commit "Start from the starter prototype" (33d923d, with `design-system/`), `docs/prototype` staged as a submodule at 33d923d, PROTOTYPE-SYNC row updated, `init-project.js` removed. (The first database attempt failed because the test passed the password with its quotes; re-run with `--force`: database created, Super Admin user 1 created, prototype checked out.) |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
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
| Actual result | a repository with one commit ("client prototype") added as it is; its log unchanged (nothing pushed); `docs/prototype` shows its README. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
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
| Actual result | no prototype URL: starter link removed (`.gitmodules` gone, `docs/prototype` removed), PROTOTYPE-SYNC back to "not added yet", the later command printed. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
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
| Actual result | on that set-up project, `node init.js --prototype=<empty repository>` printed "Prototype setup", copied the template (d8cc474) and added the submodule. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-05 New machine

| | |
|---|---|
| Title | New machine |
| Role | — |
| Pre-condition | a project with the submodule, cloned fresh |
| Steps | `node init.js` (development) |
| Expected result | `docs/prototype` checked out at the pinned commit |
| Actual result | the TC-01 project committed and pushed to a local origin, cloned fresh (`docs/prototype` empty), `node init.js`: "checked out at the pinned commit", `design-system/` present at 33d923d. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

### TC-PROTO-06 Dry run

| | |
|---|---|
| Title | Dry run |
| Role | — |
| Pre-condition | — |
| Steps | `node init.js --dry-run` with a prototype URL |
| Expected result | prints what it would do; nothing created or pushed |
| Actual result | `--dry-run` with an empty prototype repository lists the three steps (drop the starter link, copy and push, submodule add); afterwards `.gitmodules` unchanged, no `.git`, the repository still has 0 refs. |
| Result | PASS |
| Method | CLI |
| Date | 2026-10-30 |
| Screenshot | — |
| Ref (requirement / workflow) | prototype whole file |
| Planning file | docs/planning/features/2026-10-30-prototype-repo-in-init.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
