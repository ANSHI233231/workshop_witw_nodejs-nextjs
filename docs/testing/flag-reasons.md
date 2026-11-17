# Test document: Flag Reasons

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §8, §11.4 |
| How it works | `docs/how-it-works/modules/flag-reason/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 3 | 3 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-FR-01 | Flag Reasons list | Super Admin | PASS | 2026-11-16 |
| TC-FR-02 | Add / edit reason | Super Admin, User (ct_ss_3) | PASS | 2026-11-16 |
| TC-FR-03 | Past flags keep their reason | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-FR-01 Flag Reasons list

| | |
|---|---|
| Title | Flag Reasons list |
| Role | Super Admin |
| Pre-condition | console |
| Steps | open; search; Status filter |
| Expected result | 8 reasons in added order; S.No; Used in flags counts open and closed |
| Actual result | Flag Reasons list: the 8 reasons in added order (Abusive or Illegal … Other) then later ct ones, S.No, Used in flags counts (24 / 10 / 8 for the first three), search by reason (Spam), Status filter; cards on 390 px; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fr-01-1366.png, tc-fr-01-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-FR-02 Add / edit reason

| | |
|---|---|
| Title | Add / edit reason |
| Role | Super Admin, User (ct_ss_3) |
| Pre-condition | console |
| Steps | add; add the same in another case; 61 characters; edit; switch Inactive |
| Expected result | new one last and Active; "This reason already exists."; length refused; inactive hidden from the Flag dialog |
| Actual result | Add reason ct_ss_rsb_<w>: toast "Reason "…" added.", new one last and Active; empty -> "Enter the reason."; the same name in another case -> "This reason already exists."; the input stops at 60 characters (maxlength) and the API answers 422 "Use up to 60 characters." for 61; it shows in the website Flag dialog; Edit (rename) plus the status switch to Inactive saves ("Reason … updated.") and it leaves the Flag dialog; no console errors. Script fault noted: my first run typed 61 characters, the box cut them to 60 and saved a junk reason (id 10), renamed to ct_ss_rs_junk and made inactive; ct_ss_rs_1366 (id 9) also inactive (my own rows). |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fr-02-1366.png, tc-fr-02-390.png, tc-fr-02-edit-1366.png, tc-fr-02-edit-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-FR-03 Past flags keep their reason

| | |
|---|---|
| Title | Past flags keep their reason |
| Role | Super Admin |
| Pre-condition | a flag with reason X |
| Steps | rename X; make it inactive |
| Expected result | the flag still shows the old name |
| Actual result | a flag made with reason ct_ss_rsb_<w>, then the reason renamed (…_renamed) and made inactive: Flagged Comments (Reasons column) and View flags still show the old name ct_ss_rsb_<w>; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fr-03-1366.png, tc-fr-03-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §8, §11.4 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-FR-01 history

- 2026-11-04 PASS: 8 reasons in added order with S.No, Used in flags counts open and closed flags, search and status filters, Clear filters, cards on phone.
- 2026-11-16 PASS (current): Flag Reasons list: the 8 reasons in added order (Abusive or Illegal … Other) then later ct ones, S.No, Used in flags counts (24 / 10 / 8 for the first three), search by reason (Spam), Status filter; cards on 390 px; no console errors.

### TC-FR-02 history

- 2026-11-04 PASS: "Enter the reason.", duplicate in other case "This reason already exists.", 61 characters refused "Use up to 60 characters.", new reason last and Active, edit with status switch, inactive leaves `/api/flag-reason/active`.
- 2026-11-16 PASS (current): Add reason ct_ss_rsb_<w>: toast "Reason "…" added.", new one last and Active; empty -> "Enter the reason."; the same name in another case -> "This reason already exists."; the input stops at 60 characters (maxlength) and the API answers 422 "Use up to 60 characters." for 61; it shows in the website Flag dialog; Edit (rename) plus the status switch to Inactive saves ("Reason … updated.") and it leaves the Flag dialog; no console errors. Script fault noted: my first run typed 61 characters, the box cut them to 60 and saved a junk reason (id 10), renamed to ct_ss_rs_junk and made inactive; ct_ss_rs_1366 (id 9) also inactive (my own rows).

### TC-FR-03 history

- 2026-11-04 PASS: a flag keeps `reason_name` after its reason is renamed and made inactive; Used in flags still counts it.
- 2026-11-16 PASS (current): a flag made with reason ct_ss_rsb_<w>, then the reason renamed (…_renamed) and made inactive: Flagged Comments (Reasons column) and View flags still show the old name ct_ss_rsb_<w>; no console errors.
