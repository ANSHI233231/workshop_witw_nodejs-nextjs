# Test document: Flag Reasons

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §8, §11.4 |
| How it works | `docs/how-it-works/modules/flag-reason/README.md` |
| Latest run | 2026-11-04 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 3 | 3 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-FR-01 | Flag Reasons list | — | PASS | 2026-11-04 |
| TC-FR-02 | Add / edit reason | — | PASS | 2026-11-04 |
| TC-FR-03 | Past flags keep their reason | — | PASS | 2026-11-04 |

## Cases

### TC-FR-01 Flag Reasons list

| | |
|---|---|
| Title | Flag Reasons list |
| Role | — |
| Pre-condition | console |
| Steps | open; search; Status filter |
| Expected result | 8 reasons in added order; S.No; Used in flags counts open and closed |
| Actual result | 8 reasons in added order with S.No, Used in flags counts open and closed flags, search and status filters, Clear filters, cards on phone. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-FR-02 Add / edit reason

| | |
|---|---|
| Title | Add / edit reason |
| Role | — |
| Pre-condition | console |
| Steps | add; add the same in another case; 61 characters; edit; switch Inactive |
| Expected result | new one last and Active; "This reason already exists."; length refused; inactive hidden from the Flag dialog |
| Actual result | "Enter the reason.", duplicate in other case "This reason already exists.", 61 characters refused "Use up to 60 characters.", new reason last and Active, edit with status switch, inactive leaves `/api/flag-reason/active`. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-FR-03 Past flags keep their reason

| | |
|---|---|
| Title | Past flags keep their reason |
| Role | — |
| Pre-condition | a flag with reason X |
| Steps | rename X; make it inactive |
| Expected result | the flag still shows the old name |
| Actual result | a flag keeps `reason_name` after its reason is renamed and made inactive; Used in flags still counts it. |
| Result | PASS |
| Method | API + DB + browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
