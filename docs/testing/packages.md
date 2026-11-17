# Test document: Packages

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| How it works | `docs/how-it-works/modules/package/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 27 | 27 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PKG-01 | Create package | Partner | PASS | 2026-11-16 |
| TC-PKG-02 | Basic errors | Partner | PASS | 2026-11-16 |
| TC-PKG-03 | Other sections closed before Basic | Partner | PASS | 2026-11-16 |
| TC-PKG-04 | Itinerary | Partner | PASS | 2026-11-16 |
| TC-PKG-05 | Fewer days | Partner | PASS | 2026-11-16 |
| TC-PKG-06 | Inclusions and Meals | Partner | PASS | 2026-11-16 |
| TC-PKG-07 | Getting there and FAQs | Partner | PASS | 2026-11-16 |
| TC-PKG-08 | Send | Partner, Super Admin | PASS | 2026-11-16 |
| TC-PKG-09 | Approve first version | Super Admin, Guest | PASS | 2026-11-16 |
| TC-PKG-10 | Reject | Super Admin, Partner | PASS | 2026-11-16 |
| TC-PKG-11 | Edit a live package | Partner, Super Admin, Guest | PASS | 2026-11-16 |
| TC-PKG-12 | Delete a draft | Partner, Guest | PASS | 2026-11-16 |
| TC-PKG-13 | Make inactive / active | Partner, Guest | PASS | 2026-11-16 |
| TC-PKG-14 | Versions | Partner, Guest | PASS | 2026-11-16 |
| TC-PKG-15 | Super Admin edit | Super Admin, Partner, Guest | PASS | 2026-11-16 |
| TC-PKG-16 | Delete with reason | Super Admin, Partner, Guest | PASS | 2026-11-16 |
| TC-PKG-17 | Popular and Best deal | — | PASS | 2026-11-16 |
| TC-PKG-18 | Delete reasons | Super Admin | PASS | 2026-11-16 |
| TC-PKG-19 | Package list | Guest | PASS | 2026-11-16 |
| TC-PKG-20 | Filters, chips, sorts | Guest | PASS | 2026-11-16 |
| TC-PKG-21 | Package page | Guest | PASS | 2026-11-16 |
| TC-PKG-22 | Not live / not in use | Guest, Partner, Super Admin | PASS | 2026-11-16 |
| TC-LOCAL-09 | Guest browses packages and parks | Guest | PASS | 2026-11-16 |
| TC-FIX-01 | Partner edit: an inactive park is marked and must be replaced | Partner | PASS | 2026-11-16 |
| TC-FIX-02 | API refuses keeping an inactive park or adding a park not the partner's own | Partner | PASS | 2026-11-16 |
| TC-FIX-03 | Send for approval refused while the version lists an inactive park; the live version stays on the website | Partner, Guest on the website | PASS | 2026-11-16 |
| TC-FIX-04 | Super Admin edit of the live package follows the same park rule | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-PKG-01 Create package

| | |
|---|---|
| Title | Create package |
| Role | Partner |
| Pre-condition | Active partner |
| Steps | PP5: save Basic |
| Expected result | "Basic saved. Version 1 is a draft; the other sections are open now."; `/packages/<slug>`; other tabs open |
| Actual result | package 60 "ct_PkgR One": "Basic saved. Version 1 is a draft; the other sections are open now.", link /packages/ct-pkgr-one, other tabs open, v1 Draft; no console errors, no failed calls \| 390: package 61 "ct_PkgR Two": "Basic saved. Version 1 is a draft; the other sections are open now.", link /packages/ct-pkgr-two, other tabs open, v1 Draft; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-01-1366.png, tc-pkg-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-02 Basic errors

| | |
|---|---|
| Title | Basic errors |
| Role | Partner |
| Pre-condition | PP5 |
| Steps | every §2.3 Basic rule, including total below price per person and price before discount not above it, images over 250 KB / wrong type |
| Expected result | the board's message under each field; "Check the highlighted fields." |
| Actual result | ok empty form: 10 messages + "Check the highlighted fields."; ok package image over 250 KB, banner GIF; ok days 16, safaris 100, price 500, place with digit / symbol; ok total below price per person, before-discount not above; no console errors, no failed calls \| 390: ok empty form: 10 messages + "Check the highlighted fields."; ok package image over 250 KB, banner GIF; ok days 16, safaris 100, price 500, place with digit / symbol; ok total below price per person, before-discount not above; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-02-1366.png, tc-pkg-02-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-03 Other sections closed before Basic

| | |
|---|---|
| Title | Other sections closed before Basic |
| Role | Partner |
| Pre-condition | new package |
| Steps | click Itinerary |
| Expected result | "Save the Basic section first." |
| Actual result | Itinerary tab on a new package: "Save the Basic section first." no console errors, no failed calls \| 390: Itinerary tab on a new package: "Save the Basic section first." no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-03-1366.png, tc-pkg-03-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-04 Itinerary

| | |
|---|---|
| Title | Itinerary |
| Role | Partner |
| Pre-condition | v1 |
| Steps | fill days; save with an empty title / description; 501-character note |
| Expected result | saved; the three messages |
| Actual result | ok errors: empty title, empty description, 501-character note; ok saved "Section saved."; ok kept after reload; no console errors, no failed calls \| 390: ok errors: empty title, empty description, 501-character note; ok saved "Section saved."; ok kept after reload; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-04-1366.png, tc-pkg-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-05 Fewer days

| | |
|---|---|
| Title | Fewer days |
| Role | Partner |
| Pre-condition | itinerary saved, 5 days |
| Steps | set 3; confirm; also cancel |
| Expected result | "Remove days 4–5?"; removed on confirm; unchanged on cancel |
| Actual result | ok 5 days saved; ok dialog "Remove days 4–5?"; ok cancel: still 5 days; ok confirm: days 4–5 removed; no console errors, no failed calls \| 390: ok 5 days saved; ok dialog "Remove days 4–5?"; ok cancel: still 5 days; ok confirm: days 4–5 removed; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-05-1366.png, tc-pkg-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-06 Inclusions and Meals

| | |
|---|---|
| Title | Inclusions and Meals |
| Role | Partner |
| Pre-condition | itinerary saved |
| Steps | Meals → Included; change a day's meals; save |
| Expected result | every day ticked, toast says so; the change kept |
| Actual result | ok toast says every day is ticked; ok every day Breakfast / Lunch / Dinner ticked; ok a day's meal change kept (day 2 dinner off); no console errors, no failed calls \| 390: ok toast says every day is ticked; ok every day Breakfast / Lunch / Dinner ticked; ok a day's meal change kept (day 2 dinner off); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-06-1366.png, tc-pkg-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-07 Getting there and FAQs

| | |
|---|---|
| Title | Getting there and FAQs |
| Role | Partner |
| Pre-condition | v1 |
| Steps | save Getting there; add, edit, delete FAQs; empty question / answer |
| Expected result | saved; "Enter the question." / "Enter the answer." |
| Actual result | ok Getting there saved; ok "Enter the question." / "Enter the answer."; ok add, edit, delete kept; no console errors, no failed calls \| 390: ok Getting there saved; ok "Enter the question." / "Enter the answer."; ok add, edit, delete kept; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-07-1366.png, tc-pkg-07-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-08 Send

| | |
|---|---|
| Title | Send |
| Role | Partner, Super Admin |
| Pre-condition | v1 Draft |
| Steps | PP4 or PP5 Send, confirm |
| Expected result | "Version 1 sent for approval."; read-only; the console bell shows it |
| Actual result | ok confirm dialog; ok "Version 1 sent for approval."; ok read-only; ok Super Admins notified (4 rows), the console bell shows it; no console errors, no failed calls \| 390: ok confirm dialog; ok "Version 1 sent for approval."; ok read-only; ok Super Admins notified (4 rows), the console bell shows it; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-08-1366.png, tc-pkg-08-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-09 Approve first version

| | |
|---|---|
| Title | Approve first version |
| Role | Super Admin, Guest |
| Pre-condition | v1 Waiting |
| Steps | PC3 Preview (PC5), Approve |
| Expected result | "{name} v1 is live on the website."; Active; on P1 |
| Actual result | PC3 list Approve; ok toast "ct_PkgR One v1 is live on the website."; ok website status Active; ok on the website list (guest); no console errors, no failed calls \| 390: ok PC5 Preview opened; ok toast "ct_PkgR Two v1 is live on the website."; ok website status Active; ok on the website list (guest); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-09-1366.png, tc-pkg-09-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-10 Reject

| | |
|---|---|
| Title | Reject |
| Role | Super Admin, Partner |
| Pre-condition | a Waiting version |
| Steps | Reject empty, then with a reason; partner edits it |
| Expected result | "Enter the reason."; reason on PP4 / PP5; editing makes it a Draft |
| Actual result | ok empty "Enter the reason."; ok partner sees the reason on PP5; ok PP4 shows Rejected; ok editing makes it a Draft; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok partner sees the reason on PP5; ok PP4 shows Rejected; ok editing makes it a Draft; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-10-1366.png, tc-pkg-10-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-11 Edit a live package

| | |
|---|---|
| Title | Edit a live package |
| Role | Partner, Super Admin, Guest |
| Pre-condition | v1 live |
| Steps | PP5 Edit → v2; change the price; send; check P2; approve |
| Expected result | P2 shows v1 until approval; then v2 live, v1 Replaced, Popular cleared |
| Actual result | ok Popular on before the edit; ok "A new draft is made from the live version." v2 Draft, banner "live version v1 stays…"; ok P2 shows v1 price 12,000 while v2 waits; ok PC3 row v2 "Live now: v1"; ok approve: "… v2 is live on the website."; ok P2 shows v2 price 13,000; ok v1 Replaced; ok Popular cleared by the approval; no console errors, no failed calls \| 390: ok Popular on before the edit; ok "A new draft is made from the live version." v2 Draft, banner "live version v1 stays…"; ok P2 shows v1 price 12,000 while v2 waits; ok PC3 row v2 "Live now: v1"; ok approve: "… v2 is live on the website."; ok P2 shows v2 price 13,000; ok v1 Replaced; ok Popular cleared by the approval; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-11-1366.png, tc-pkg-11-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-12 Delete a draft

| | |
|---|---|
| Title | Delete a draft |
| Role | Partner, Guest |
| Pre-condition | v2 draft of a live package; a never-live package |
| Steps | Delete draft; Delete |
| Expected result | "This draft will be discarded."; v1 stays live; the never-live one leaves the list |
| Actual result | ok "This draft will be discarded. The live version stays on the website."; ok live version stays, P2 still shows it; ok never-live: "Delete this package?" … leaves your list too; ok the never-live package left the list; no console errors, no failed calls \| 390: ok "This draft will be discarded. The live version stays on the website."; ok live version stays, P2 still shows it; ok never-live: "Delete this package?" … leaves your list too; ok the never-live package left the list; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-12-1366.png, tc-pkg-12-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-13 Make inactive / active

| | |
|---|---|
| Title | Make inactive / active |
| Role | Partner, Guest |
| Pre-condition | live package |
| Steps | PP4 switch |
| Expected result | at once; P2 "Package Not In Use!" while inactive |
| Actual result | ok Make inactive: at once; ok P2 "Package Not In Use!"; ok Make active: P2 shows it again; no console errors, no failed calls \| 390: ok Make inactive: at once; ok P2 "Package Not In Use!"; ok Make active: P2 shows it again; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-13-1366.png, tc-pkg-13-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-14 Versions

| | |
|---|---|
| Title | Versions |
| Role | Partner, Guest |
| Pre-condition | package with a Replaced version |
| Steps | PP5 Versions; View the Replaced one |
| Expected result | dates and reasons listed; "You are viewing version N (Replaced). It can't be changed." |
| Actual result | ok Versions card lists v1 Replaced and v2 with made / sent / approved dates; ok "You are viewing version 1 (Replaced). It can't be changed.", no Save; no console errors, no failed calls \| 390: ok Versions card lists v1 Replaced and v2 with made / sent / approved dates; ok "You are viewing version 1 (Replaced). It can't be changed.", no Save; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-14-1366.png, tc-pkg-14-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-15 Super Admin edit

| | |
|---|---|
| Title | Super Admin edit |
| Role | Super Admin, Partner, Guest |
| Pre-condition | a waiting and a live version |
| Steps | PC5 Edit from PC3 and from PC4 |
| Expected result | every section editable; live edit "Saved. The website shows the change now."; version shows "edited by Super Admin" |
| Actual result | the FAIL lines above are script faults (the first runs read the "Section saved." toast too early, and the test package ct_Pkg Nine had an empty day 2 so the Itinerary save was rightly refused). Re-run: 390 on ct_Pkg One: Edit from PC3 opens the waiting version, all five sections editable and saved, "edited by Super Admin" on the version; live edit from PC4 shows "Saved. The website shows the change now.", P2 shows the change at once, live version "edited by Super Admin". 1366 on new package ct_PkgR Three (complete itinerary): all five sections saved by the Super Admin (checked in the DB), "edited by Super Admin"; live edit on ct_Pkg Four as above; no console errors, no failed calls. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-15-1366.png, tc-pkg-15-390.png, tc-pkg-15-waiting-rerun-1366.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-16 Delete with reason

| | |
|---|---|
| Title | Delete with reason |
| Role | Super Admin, Partner, Guest |
| Pre-condition | live package |
| Steps | PC4 Delete: no reason, no details, then both |
| Expected result | "Choose a reason." / "Enter the details."; Deleted by Super Admin; P2 "Package Not In Use!"; partner sees the reason, View only |
| Actual result | ok none: "Choose a reason." + "Enter the details."; ok reason only: "Enter the details."; ok details only: "Choose a reason."; ok deleted (Deleted by Super Admin); ok P2 "Package Not In Use!"; ok partner sees "Deleted by Super Admin … Reason", view only; no console errors, no failed calls \| 390: ok none: "Choose a reason." + "Enter the details."; ok reason only: "Enter the details."; ok details only: "Choose a reason."; ok deleted (Deleted by Super Admin); ok P2 "Package Not In Use!"; ok partner sees "Deleted by Super Admin … Reason", view only; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-16-1366.png, tc-pkg-16-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-17 Popular and Best deal

| | |
|---|---|
| Title | Popular and Best deal |
| Role | — |
| Pre-condition | live packages |
| Steps | PC4 switches; approve a new version |
| Expected result | Popular first in the Popular sort; Best deal badge; Popular cleared by the approval |
| Actual result | the first FAIL line is a script fault (the script toggled "Best deal" off on ct_Pkg Four, which an earlier run had already turned on); the re-run set the state first. |
| Result | PASS |
| Method | see the second PKG-17 line above |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-18 Delete reasons

| | |
|---|---|
| Title | Delete reasons |
| Role | Super Admin |
| Pre-condition | console |
| Steps | PC6 add; duplicate; empty; 101 characters; edit with status; make inactive |
| Expected result | the board's messages; inactive one not offered in Delete; "Used" count |
| Actual result | ok empty "Enter the reason."; ok 101 characters "Use up to 100 characters."; ok added "ct_ Reason R1"; ok duplicate "This reason already exists."; ok edit name + status Inactive; ok the inactive reason is not offered in Delete; ok active again: offered in Delete; ok "Used in deletes" = 1; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok 101 characters "Use up to 100 characters."; ok added "ct_ Reason R2"; ok duplicate "This reason already exists."; ok edit name + status Inactive; ok the inactive reason is not offered in Delete; ok active again: offered in Delete; ok "Used in deletes" = 1; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-18-1366.png, tc-pkg-18-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-19 Package list

| | |
|---|---|
| Title | Package list |
| Role | Guest |
| Pre-condition | shown and hidden packages |
| Steps | P1 as a guest |
| Expected result | only live + Active + partner Active; card as §2.3; 12, more on scroll |
| Actual result | ok first page 12 cards, more load on scroll (13 in all); ok only live + Active + partner Active packages (equals the DB set); ok inactive, deleted and never-live packages are not listed; ok card shows tag, name, park, nights / days, activity, price per person, struck-out price, Total Price, price message; no console errors, no failed calls \| 390: ok first page 12 cards, more load on scroll (13 in all); ok only live + Active + partner Active packages (equals the DB set); ok inactive, deleted and never-live packages are not listed; ok card shows tag, name, park, nights / days, activity, price per person, struck-out price, Total Price, price message; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-19-1366.png, tc-pkg-19-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-20 Filters, chips, sorts

| | |
|---|---|
| Title | Filters, chips, sorts |
| Role | Guest |
| Pre-condition | P1 |
| Steps | each filter and its 10+ / ₹50,000+ end, chip ✕, Clear all, each sort; Filters on mobile |
| Expected result | the list matches; "No packages match your filters." |
| Actual result | ok park Bandhavgarh -> 4; ok price 10,000-20,000 -> 4; ok chip ✕ removes its filter; ok price 50,000+ end -> 6; ok nights 7 to 10+ -> 1; ok nights 10+ -> 0; ok safaris 10+ -> 1; ok safaris 1-2 -> 4; ok stay Premium -> 8; ok feature Shared Safari -> 1; ok included Meals -> 8; ok Clear all restores the list; ok "No packages match your filters."; ok sort "Sort by: Popular"; ok sort "Newest"; ok sort "Fewest safaris"; ok sort "Most safaris"; ok sort "Price low to high"; no console errors, no failed calls \| 390: ok park Bandhavgarh -> 4; ok price 10,000-20,000 -> 4; ok chip ✕ removes its filter; ok price 50,000+ end -> 6; ok nights 7 to 10+ -> 1; ok nights 10+ -> 0; ok safaris 10+ -> 1; ok safaris 1-2 -> 4; ok stay Premium -> 8; ok feature Shared Safari -> 1; ok included Meals -> 8; ok Clear all restores the list; ok "No packages match your filters."; ok sort "Sort by: Popular"; ok sort "Newest"; ok sort "Fewest safaris"; ok sort "Most safaris"; ok sort "Price low to high"; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-20-1366.png, tc-pkg-20-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-21 Package page

| | |
|---|---|
| Title | Package page |
| Role | Guest |
| Pre-condition | shown package with galleries |
| Steps | P2: each tab, slider arrows and auto-move, FAQs |
| Expected result | §2.3 parts; slider every 3 s, looping, titles and captions; disclaimer |
| Actual result | the FAIL line above is a script fault ("BAD top": the page upper-cases its labels, the check was case-sensitive). Re-checked: top details (name, Trip Duration, Vehicle, Stay, Theme), price box (price per person, Total Price) and the quote form are all there; the other checks in the run passed (five tabs, FAQs, Disclaimer, slider moves every 3 s and loops 1/2 -> 2/2 -> 1/2, arrows work); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-21-1366.png, tc-pkg-21-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-22 Not live / not in use

| | |
|---|---|
| Title | Not live / not in use |
| Role | Guest, Partner, Super Admin |
| Pre-condition | never approved, inactive, deleted, partner-inactive |
| Steps | open each link |
| Expected result | never approved → home page; others "Package Not In Use!" |
| Actual result | ok never approved (ct-pkg-five) -> home page; ok deleted by Super Admin (ct-pkgr-one) -> "Package Not In Use!"; ok inactive (ct-pkg-nine) -> "Package Not In Use!"; ok made active again; ok partner inactive (ct-pkg-four) -> "Package Not In Use!"; no console errors, no failed calls \| 390: ok never approved (ct-pkg-five) -> home page; ok deleted by Super Admin (ct-pkgr-one) -> "Package Not In Use!"; ok inactive (ct-pkg-nine) -> "Package Not In Use!"; ok made active again; ok partner inactive (ct-pkg-four) -> "Package Not In Use!"; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkg-22-1366.png, tc-pkg-22-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-09 Guest browses packages and parks

| | |
|---|---|
| Title | Guest browses packages and parks |
| Role | Guest |
| Pre-condition | signed out |
| Steps | open `/packages`, a package, `/parks`, a park |
| Expected result | pages show, the partner's packages are listed |
| Actual result | guest: /packages lists the partner's Kanha Escape, its package page opens, /parks and the Kanha park page show; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-09-1366.png, tc-local-09-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-FIX-01 Partner edit: an inactive park is marked and must be replaced

| | |
|---|---|
| Title | Partner edit: an inactive park is marked and must be replaced |
| Role | Partner |
| Pre-condition | A `ct_fix1` partner with two `ct_` parks; a draft package using park A; park A then made inactive in the console |
| Steps | 1. Sign in to the portal as the `ct_fix1` partner. 2. Open the package (Basic). 3. Look at Parks. 4. Click Save Basic. 5. Untick park A, tick park B, Save Basic |
| Expected result | Step 3: park A is ticked and marked "Not available", the field shows "Untick the park marked Not available and choose one of your active parks.", and the list offers park B (the partner's own active park) but no other inactive or foreign park. Step 4: refused with the same field error, nothing saved. Step 5: "Section saved."; Parks shows only park B, no error |
| Actual result | 1366px: labels ["ct_fix1 Park B","ct_fix1 Park A\nNot available"], A ticked true, error shown true; Save refused (error kept, DB parks 63); after untick A + tick B: A gone from list true, "Section saved." true, DB parks 64; 390px: labels ["ct_fix1 Park B","ct_fix1 Park A\nNot available"], A ticked true, error shown true; Save refused (error kept, DB parks 63); after untick A + tick B: A gone from list true, "Section saved." true, DB parks 64; no console errors, no failed calls. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-01-1366.png, tc-fix-01-390.png, tc-fix-01-1366-saved.png, tc-fix-01-390-saved.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §16 #3, §4.1 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-02 API refuses keeping an inactive park or adding a park not the partner's own

| | |
|---|---|
| Title | API refuses keeping an inactive park or adding a park not the partner's own |
| Role | Partner |
| Pre-condition | As TC-FIX-01 (park A inactive, a draft on park A); a third active park C not on the partner |
| Steps | 1. `PUT …/versions/:id/basic` with the saved Basic and parks [A]. 2. Same with [A, B]. 3. Same with [C]. 4. Same with [B] |
| Expected result | 1 and 2: 422 `PACKAGE_PARK_NO_LONGER_AVAILABLE` on `masterParkIds` with the message above; 3: 422 `PACKAGE_PARK_NOT_AVAILABLE`; 4: 200 and the version's parks are [B] (query) |
| Actual result | PUT basic of ct_fix1 Api Draft (park A ct_fix1 Park A inactive, B active own, C Kanha not the partner's): [A] 422 PACKAGE_PARK_NO_LONGER_AVAILABLE [{"field":"masterParkIds","message":"Untick the park marked Not available and choose one of your active parks."}] \| [A,B] 422 PACKAGE_PARK_NO_LONGER_AVAILABLE [{"field":"masterParkIds","message":"Untick the park marked Not available and choose one of your active parks."}] \| [C] 422 PACKAGE_PARK_NOT_AVAILABLE [{"field":"masterParkIds","message":"This park is not available. Choose another park."}] \| [B] 200 \| db parks 64; message "Untick the park marked Not available and choose one of your active parks.". |
| Result | PASS |
| Method | API, Playwright request context signed in as the ct_fix1 partner, plus a DB query |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §16 #3, §4.1 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-03 Send for approval refused while the version lists an inactive park; the live version stays on the website

| | |
|---|---|
| Title | Send for approval refused while the version lists an inactive park; the live version stays on the website |
| Role | Partner, Guest on the website |
| Pre-condition | A live `ct_fix1` package on park A with a new draft (Edit), then park A made inactive |
| Steps | 1. On the website open the package page. 2. In the portal, Packages › Send on the draft. 3. Replace park A with park B in Basic, save, Send |
| Expected result | 1: the package page is shown unchanged (live version, park A). 2: refused with "A park in Basic is no longer one of your active parks. Replace it in Basic, then send.", the version stays a Draft. 3: "Version 2 sent for approval." |
| Actual result | script check fixed (textContent): the website pages of ct_fix1 Live Three / Four show the live v1 with "ct_fix1 Park A", not "Not In Use"; Send for approval on v2 refused with the toast "A park in Basic is no longer one of your active parks. Replace it in Basic, then send." (v2 stays Draft, failure audited 1210); after unticking Park A, ticking Park B and Save section, Send gives "Version 2 sent for approval." (status 2); the live v1 keeps Park A; no console errors, no failed calls other than the expected 422 on Send. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-03-1366.png, tc-fix-03-390.png, tc-fix-03-1366-website.png, tc-fix-03-390-website.png, tc-fix-03-1366-sent.png, tc-fix-03-390-sent.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §16 #3, §5 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-04 Super Admin edit of the live package follows the same park rule

| | |
|---|---|
| Title | Super Admin edit of the live package follows the same park rule |
| Role | Super Admin |
| Pre-condition | The live `ct_fix1` package on park A (inactive) |
| Steps | 1. Console › Packages › Edit the live package. 2. Look at Parks. 3. Save Basic. 4. Untick A, tick B, save |
| Expected result | 2: park A ticked, marked "Not available", with the field error; the list offers only the partner's own active parks. 3: refused. 4: "Saved. The website shows the change now."; the website page shows park B |
| Actual result | 1366px (ct-fix1-live-one live v1): labels ["ct_fix1 Park B","ct_fix1 Park A\nNot available"], error shown true; Save refused (DB parks 65); after untick A + tick B: "Saved. The website shows the change now." true, DB parks 66, website page shows Park B true and no Park A true; 390px (ct-fix1-live-two live v1): labels ["ct_fix1 Park B","ct_fix1 Park A\nNot available"], error shown true; Save refused (DB parks 65); after untick A + tick B: "Saved. The website shows the change now." true, DB parks 66, website page shows Park B true and no Park A true; no console errors, no failed calls. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-04-1366.png, tc-fix-04-390.png, tc-fix-04-1366-saved.png, tc-fix-04-390-saved.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §16 #3, §12.4 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PKG-01 history

- 2026-11-14 PASS: 1366: Basic saved. Version 1 is a draft; the other sections are open now.; url id 26; disabled tabs 0; link /packages/ct-pkg-alpha-1366-r5; errs  \| 390: Basic saved. Version 1 is a draft; the other sections are open now.; url id 17; disabled tabs 0; link /packages/ct-pkg-alpha-390; errs .
- 2026-11-16 PASS (current): package 60 "ct_PkgR One": "Basic saved. Version 1 is a draft; the other sections are open now.", link /packages/ct-pkgr-one, other tabs open, v1 Draft; no console errors, no failed calls \| 390: package 61 "ct_PkgR Two": "Basic saved. Version 1 is a draft; the other sections are open now.", link /packages/ct-pkgr-two, other tabs open, v1 Draft; no console errors, no failed calls

### TC-PKG-02 history

- 2026-11-14 PASS: 1366: empty: all messages + banner toast; bad values: ok; total/before: ok; image type true, size true \| 390: empty: all messages + banner toast; bad values: ok; total/before: ok; image type true, size true.
- 2026-11-16 PASS (current): ok empty form: 10 messages + "Check the highlighted fields."; ok package image over 250 KB, banner GIF; ok days 16, safaris 100, price 500, place with digit / symbol; ok total below price per person, before-discount not above; no console errors, no failed calls \| 390: ok empty form: 10 messages + "Check the highlighted fields."; ok package image over 250 KB, banner GIF; ok days 16, safaris 100, price 500, place with digit / symbol; ok total below price per person, before-discount not above; no console errors, no failed calls

### TC-PKG-03 history

- 2026-11-14 PASS: 1366: Save the Basic section first. \| 390: Save the Basic section first..
- 2026-11-16 PASS (current): Itinerary tab on a new package: "Save the Basic section first." no console errors, no failed calls \| 390: Itinerary tab on a new package: "Save the Basic section first." no console errors, no failed calls

### TC-PKG-04 history

- 2026-11-14 PASS: 1366: empty: 6 errors; 501 note: true; toast "Section saved."; reloaded title Arrival, day2 image 1, gallery 3; errs  \| 390: empty: 6 errors; 501 note: true; toast "Section saved."; reloaded title Arrival, day2 image 1, gallery 3; errs .
- 2026-11-16 PASS (current): ok errors: empty title, empty description, 501-character note; ok saved "Section saved."; ok kept after reload; no console errors, no failed calls \| 390: ok errors: empty title, empty description, 501-character note; ok saved "Section saved."; ok kept after reload; no console errors, no failed calls

### TC-PKG-05 history

- 2026-11-14 PASS: 1366: range dialog "Remove day 3?" ok true; cancel keeps 3 true; single dialog true; after confirm days 2, itinerary blocks 2; toast "Section saved." \| 390: range dialog "Remove day 3?" ok true; cancel keeps 3 true; single dialog true; after confirm days 2, itinerary blocks 2; toast "Section saved.".
- 2026-11-16 PASS (current): ok 5 days saved; ok dialog "Remove days 4–5?"; ok cancel: still 5 days; ok confirm: days 4–5 removed; no console errors, no failed calls \| 390: ok 5 days saved; ok dialog "Remove days 4–5?"; ok cancel: still 5 days; ok confirm: days 4–5 removed; no console errors, no failed calls

### TC-PKG-06 history

- 2026-11-14 PASS: 1366: toast "true" ticked 9/9; after unticking day 1 dinner and saving Inclusions again: dinner false, ticked 8/9 \| 390: toast "true" ticked 9/9; after unticking day 1 dinner and saving Inclusions again: dinner false, ticked 8/9.
- 2026-11-16 PASS (current): ok toast says every day is ticked; ok every day Breakfast / Lunch / Dinner ticked; ok a day's meal change kept (day 2 dinner off); no console errors, no failed calls \| 390: ok toast says every day is ticked; ok every day Breakfast / Lunch / Dinner ticked; ok a day's meal change kept (day 2 dinner off); no console errors, no failed calls

### TC-PKG-07 history

- 2026-11-14 PASS: 1366: getting there toast "Section saved."; empty faq messages true; after edit + delete 1 faq, answer "Yes, always."; errs  \| 390: getting there toast "Section saved."; empty faq messages true; after edit + delete 1 faq, answer "Yes, always."; errs .
- 2026-11-16 PASS (current): ok Getting there saved; ok "Enter the question." / "Enter the answer."; ok add, edit, delete kept; no console errors, no failed calls \| 390: ok Getting there saved; ok "Enter the question." / "Enter the answer."; ok add, edit, delete kept; no console errors, no failed calls

### TC-PKG-08 history

- 2026-11-14 PASS: 1366: PP5 dialog "Send for approval?"; toast "Version 1 sent for approval."; banner ok true; PP4 toast "Version 1 sent for approval."; notifications page true; bell true, click lands http://localhost:3041/package-approvals; errs  \| 390: PP5 dialog "Send for approval?"; toast "Version 1 sent for approval."; banner ok true; PP4 toast "Version 1 sent for approval."; notifications page true; bell true, click lands http://localhost:3041/package-approvals; errs . A first 1366 run logged a hydration pageerror in the console once (not reproduced in three later runs; the page markup is the console notification list's, not this change).
- 2026-11-16 PASS (current): ok confirm dialog; ok "Version 1 sent for approval."; ok read-only; ok Super Admins notified (4 rows), the console bell shows it; no console errors, no failed calls \| 390: ok confirm dialog; ok "Version 1 sent for approval."; ok read-only; ok Super Admins notified (4 rows), the console bell shows it; no console errors, no failed calls

### TC-PKG-09 history

- 2026-11-14 PASS: 1366: row "1ct_Pkg Alpha 1366 r5Kanha Tiger Reserve, Bandhavgarh Tiger ReserveJungle Trails" subtitle "Jungle Trails Safaris · Version 1 · Waiting for approval · Website: Not live yet" toast "ct_Pkg Alpha 1366 r5 v1 is live on the website."; url http://localhost:3041/packages/26?version=live&tab=preview; PC4 row has Active true; on the public API list true; website list screen P1 is Phase 6; errs  \| 390: row "1Packagect_Pkg Alpha 390Kanha Tiger Reserve, Bandhavgarh Tiger ReservePartnerJun" subtitle "Jungle Trails Safaris · Version 1 · Waiting for approval · Website: Not live yet" toast "ct_Pkg Alpha 390 v1 is live on the website."; url http://localhost:3041/packages/17?version=live&tab=preview; PC4 row has Active true; on the public API list true; website list screen P1 is Phase 6; errs . P1 (the list on the site) is Phase 6.
- 2026-11-16 PASS (current): PC3 list Approve; ok toast "ct_PkgR One v1 is live on the website."; ok website status Active; ok on the website list (guest); no console errors, no failed calls \| 390: ok PC5 Preview opened; ok toast "ct_PkgR Two v1 is live on the website."; ok website status Active; ok on the website list (guest); no console errors, no failed calls

### TC-PKG-10 history

- 2026-11-14 PASS: 1366: empty "Enter the reason.", 513 "Use up to 512 characters.", toast "Version 1 rejected. The partner sees the reason."; PP4 shows Rejected true; PP5 banner "Version 1 was rejected. ct: the price needs a second look"; after saving a section PP4 shows Draft true; errs  \| 390: empty "Enter the reason.", 513 "Use up to 512 characters.", toast "Version 1 rejected. The partner sees the reason."; PP4 shows Rejected true; PP5 banner "Version 1 was rejected. ct: the price needs a second look"; after saving a section PP4 shows Draft true; errs .
- 2026-11-16 PASS (current): ok empty "Enter the reason."; ok partner sees the reason on PP5; ok PP4 shows Rejected; ok editing makes it a Draft; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok partner sees the reason on PP5; ok PP4 shows Rejected; ok editing makes it a Draft; no console errors, no failed calls

### TC-PKG-11 history

- 2026-11-14 PASS: 1366: live banner ok, Edit button "makes version 2" 1, draft banner "The live version v1 stays on the website until version 2 is approved.", the public package stays v1 / 10000 until approval true, after approval public shows v2 / 11000 true, v1 Replaced true, Popular cleared false; the P2 screen is Phase 6 (checked through the public API); errs  \| 390: live banner ok, Edit button "makes version 2" 1, draft banner "The live version v1 stays on the website until version 2 is approved.", the public package stays v1 / 10000 until approval true, after approval public shows v2 / 11000 true, v1 Replaced true, Popular cleared false; the P2 screen is Phase 6 (checked through the public API); errs .
- 2026-11-16 PASS (current): ok Popular on before the edit; ok "A new draft is made from the live version." v2 Draft, banner "live version v1 stays…"; ok P2 shows v1 price 12,000 while v2 waits; ok PC3 row v2 "Live now: v1"; ok approve: "… v2 is live on the website."; ok P2 shows v2 price 13,000; ok v1 Replaced; ok Popular cleared by the approval; no console errors, no failed calls \| 390: ok Popular on before the edit; ok "A new draft is made from the live version." v2 Draft, banner "live version v1 stays…"; ok P2 shows v1 price 12,000 while v2 waits; ok PC3 row v2 "Live now: v1"; ok approve: "… v2 is live on the website."; ok P2 shows v2 price 13,000; ok v1 Replaced; ok Popular cleared by the approval; no console errors, no failed calls

### TC-PKG-12 history

- 2026-11-14 PASS: 1366: draft dialog "Delete the draft?", toast "Draft discarded.", v1 still live true; never-live dialog "Delete this package?", toast "Draft discarded.", row left the list true; errs  \| 390: draft dialog "Delete the draft?", toast "Draft discarded.", v1 still live true; never-live dialog "Delete this package?", toast "Draft discarded.", row left the list true; errs .
- 2026-11-16 PASS (current): ok "This draft will be discarded. The live version stays on the website."; ok live version stays, P2 still shows it; ok never-live: "Delete this package?" … leaves your list too; ok the never-live package left the list; no console errors, no failed calls \| 390: ok "This draft will be discarded. The live version stays on the website."; ok live version stays, P2 still shows it; ok never-live: "Delete this package?" … leaves your list too; ok the never-live package left the list; no console errors, no failed calls

### TC-PKG-13 history

- 2026-11-14 PASS: 1366: toast "ct_Pkg Alpha 1366 r5 is now inactive on the website.", row Inactive true, public package inUse=false true (the "Package Not In Use!" text is on P2, Phase 6); then "ct_Pkg Alpha 1366 r5 is now active on the website.", inUse again true; errs  \| 390: toast "ct_Pkg Alpha 390 is now inactive on the website.", row Inactive true, public package inUse=false true (the "Package Not In Use!" text is on P2, Phase 6); then "ct_Pkg Alpha 390 is now active on the website.", inUse again true; errs .
- 2026-11-16 PASS (current): ok Make inactive: at once; ok P2 "Package Not In Use!"; ok Make active: P2 shows it again; no console errors, no failed calls \| 390: ok Make inactive: at once; ok P2 "Package Not In Use!"; ok Make active: P2 shows it again; no console errors, no failed calls

### TC-PKG-14 history

- 2026-11-14 PASS: 1366: versions panel lists v1 Replaced with dates true; View link 1; banner "You are viewing version 1 (Replaced). It can't be changed.Back to the current version"; no Save button true; Back link 1; errs  \| 390: versions panel lists v1 Replaced with dates true; View link 1; banner "You are viewing version 1 (Replaced). It can't be changed.Back to the current version"; no Save button true; Back link 1; errs .
- 2026-11-16 PASS (current): ok Versions card lists v1 Replaced and v2 with made / sent / approved dates; ok "You are viewing version 1 (Replaced). It can't be changed.", no Save; no console errors, no failed calls \| 390: ok Versions card lists v1 Replaced and v2 with made / sent / approved dates; ok "You are viewing version 1 (Replaced). It can't be changed.", no Save; no console errors, no failed calls

### TC-PKG-15 history

- 2026-11-14 PASS: 1366: PC5 Edit from PC3 ("1ct_Pkg Alpha 1366 r5Kanha Tiger Reserve"): sections Basic,Itinerary,Inclusions,Getting there,FAQs; saves "Section saved. / Section saved. / Section saved. / Section saved. / Section saved."; versions panel shows edited by Super Admin true; the approved version holds the admin's edits true; live edit part below \|\| PC4 Edit: banner "You are editing the live version v2. Saved changes show on the website at once, with no approval step.", toast "Saved. The website shows the change now.", the public package shows the change at once true, versions panel "edited by Super Admin" true (part 2 of 2) \| 390: PC5 Edit from PC3 ("1Packagect_Pkg Alpha 390Kanha Tiger Rese"): sections Basic,Itinerary,Inclusions,Getting there,FAQs; saves "Section saved. / Section saved. / Section saved. / Section saved. / Section saved."; versions panel shows edited by Super Admin true; the approved version holds the admin's edits true; live edit part below \|\| PC4 Edit: banner "You are editing the live version v2. Saved changes show on the website at once, with no approval step.", toast "Saved. The website shows the change now.", the public package shows the change at once true, versions panel "edited by Super Admin" true (part 2 of 2).
- 2026-11-16 FAIL: ok Edit from PC3 opens the waiting version; BAD sections true,true,false,true,true; ok version shows "edited by Super Admin"; ok Edit from PC4 opens the live package; ok "Saved. The website shows the change now."; ok P2 shows the change at once; ok live version "edited by Super Admin"; no console errors, no failed calls \| 390: ok Edit from PC3 opens the waiting version; BAD sections true,true,false,true,true; ok version shows "edited by Super Admin"; ok Edit from PC4 opens the live package; ok "Saved. The website shows the change now."; ok P2 shows the change at once; ok live version "edited by Super Admin"; no console errors, no failed calls
- 2026-11-16 FAIL: ok Edit from PC3 opens the waiting version; BAD sections true,false,true,true,false; ok version shows "edited by Super Admin"; ok Edit from PC4 opens the live package; ok "Saved. The website shows the change now."; ok P2 shows the change at once; ok live version "edited by Super Admin"; no console errors, no failed calls \| 390: ok Edit from PC3 opens the waiting version; ok all five sections editable and saved; ok version shows "edited by Super Admin"; ok Edit from PC4 opens the live package; ok "Saved. The website shows the change now."; ok P2 shows the change at once; ok live version "edited by Super Admin"; no console errors, no failed calls
- 2026-11-16 PASS (current): the FAIL lines above are script faults (the first runs read the "Section saved." toast too early, and the test package ct_Pkg Nine had an empty day 2 so the Itinerary save was rightly refused). Re-run: 390 on ct_Pkg One: Edit from PC3 opens the waiting version, all five sections editable and saved, "edited by Super Admin" on the version; live edit from PC4 shows "Saved. The website shows the change now.", P2 shows the change at once, live version "edited by Super Admin". 1366 on new package ct_PkgR Three (complete itinerary): all five sections saved by the Super Admin (checked in the DB), "edited by Super Admin"; live edit on ct_Pkg Four as above; no console errors, no failed calls.

### TC-PKG-16 history

- 2026-11-14 PASS: 1366: errors "Choose a reason.,Enter the details." then "Enter the details."; reasons offered 5 (active only); toast "Package deleted from the website."; PC4 row Deleted and View only true; public inUse=false true; PC5 Edit tab hidden 1, banner ""; partner PP4 row View only (1 action), PP5 banner "Deleted by Super Admin on 14 Nov 2026. Reason: Misleading information — ct: wrong prices on the page", no Save true; errs  \| 390: errors "Choose a reason.,Enter the details." then "Enter the details."; reasons offered 5 (active only); toast "Package deleted from the website."; PC4 row Deleted and View only true; public inUse=false true; PC5 Edit tab hidden 1, banner ""; partner PP4 row View only (1 action), PP5 banner "Deleted by Super Admin on 14 Nov 2026. Reason: Misleading information — ct: wrong prices on the page", no Save true; errs .
- 2026-11-16 PASS (current): ok none: "Choose a reason." + "Enter the details."; ok reason only: "Enter the details."; ok details only: "Choose a reason."; ok deleted (Deleted by Super Admin); ok P2 "Package Not In Use!"; ok partner sees "Deleted by Super Admin … Reason", view only; no console errors, no failed calls \| 390: ok none: "Choose a reason." + "Enter the details."; ok reason only: "Enter the details."; ok details only: "Choose a reason."; ok deleted (Deleted by Super Admin); ok P2 "Package Not In Use!"; ok partner sees "Deleted by Super Admin … Reason", view only; no console errors, no failed calls

### TC-PKG-17 history

- 2026-11-14 PASS: 1366: toasts "ct_Pkg Alpha 1366 r5 is marked Popular." / "ct_Pkg Alpha 1366 r5 shows the Best deal badge."; popular sort first = this package true; after the v2 approval Popular false, Best deal true; the Best deal badge on the website card is Phase 6; errs  \| 390: toasts "ct_Pkg Alpha 390 is marked Popular." / "ct_Pkg Alpha 390 shows the Best deal badge."; popular sort first = this package true; after the v2 approval Popular false, Best deal true; the Best deal badge on the website card is Phase 6; errs .
- 2026-11-16 FAIL: BAD switches; ok Popular sort: ct_PkgR One among the popular ones first; BAD badge; ok Popular cleared by approving the new version; no console errors, no failed calls \| 390: ok Popular and Best deal switches saved; ok Popular sort: ct_PkgR Two among the popular ones first; ok Best deal badge on ct_Pkg Ten; ok Popular cleared by approving the new version; no console errors, no failed calls
- 2026-11-16 PASS: ok Popular and Best deal switches saved; ok Popular sort: ct_Pkg Nine among the popular ones first; ok Best deal badge on ct_Pkg Four; ok Popular cleared by approving the new version; no console errors, no failed calls \| 390: ok Popular and Best deal switches saved; ok Popular sort: ct_Pkg One among the popular ones first; ok Best deal badge on ct_Pkg Ten; ok Popular cleared by approving the new version; no console errors, no failed calls
- 2026-11-16 PASS (current): the first FAIL line is a script fault (the script toggled "Best deal" off on ct_Pkg Four, which an earlier run had already turned on); the re-run set the state first.

### TC-PKG-18 history

- 2026-11-14 PASS: 1366: intro ok; empty "Enter the reason.", 101 "Use up to 100 characters.", duplicate "This reason already exists.", case-variant "This reason already exists.", add "Reason added.", Active true; offered while active true, after Make inactive "Reason "ct_Reason 1366 r5" is now inactive." offered false; edit dialog status "Inactive" -> toggled to Active, "Reason updated.", list shows Active true; "Reason "ct_Reason 1366 r5 edited" is now inactive. / Reason "ct_Reason 1366 r5 edited" is now active."; used count after one delete true; expected 422 validation answers: 2; other errs  \| 390: intro ok; empty "Enter the reason.", 101 "Use up to 100 characters.", duplicate "This reason already exists.", case-variant "This reason already exists.", add "Reason added.", Active true; offered while active true, after Make inactive "Reason "ct_Reason 390 r3" is now inactive." offered false; edit dialog status "Inactive" -> toggled to Active, "Reason updated.", list shows Active true; "Reason "ct_Reason 390 r3 edited" is now inactive. / Reason "ct_Reason 390 r3 edited" is now active."; used count after one delete true; expected 422 validation answers: 2; other errs .
- 2026-11-16 PASS (current): ok empty "Enter the reason."; ok 101 characters "Use up to 100 characters."; ok added "ct_ Reason R1"; ok duplicate "This reason already exists."; ok edit name + status Inactive; ok the inactive reason is not offered in Delete; ok active again: offered in Delete; ok "Used in deletes" = 1; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok 101 characters "Use up to 100 characters."; ok added "ct_ Reason R2"; ok duplicate "This reason already exists."; ok edit name + status Inactive; ok the inactive reason is not offered in Delete; ok active again: offered in Delete; ok "Used in deletes" = 1; no console errors, no failed calls

### TC-PKG-19 history

- 2026-11-14 PASS: 8 shown packages (the 12 demo minus Gir, Jhalana, Bandhavgarh, Kanha Birding, the Satpura first version, Monsoon Escape, plus two `ct_Pkg Alpha` from Phase 5 tests); Best deal, struck-out price, tag and price message shown; no console errors or failed calls. The 12-per-page scroll is shown on P5 (36 → 44 parks after scrolling); with only 8 packages the package list has no second page to scroll to (the API paging was checked in Phase 5).
- 2026-11-14 NOT RUN: Phase 6 (website screens).
- 2026-11-16 PASS (current): ok first page 12 cards, more load on scroll (13 in all); ok only live + Active + partner Active packages (equals the DB set); ok inactive, deleted and never-live packages are not listed; ok card shows tag, name, park, nights / days, activity, price per person, struck-out price, Total Price, price message; no console errors, no failed calls \| 390: ok first page 12 cards, more load on scroll (13 in all); ok only live + Active + partner Active packages (equals the DB set); ok inactive, deleted and never-live packages are not listed; ok card shows tag, name, park, nights / days, activity, price per person, struck-out price, Total Price, price message; no console errors, no failed calls

### TC-PKG-20 history

- 2026-11-14 PASS: search, empty state and Clear filters, sort by price low (₹10,000 … ₹1,55,000 ascending) and most safaris, park filter (Corbett → 1), Premium stay, chips with ✕ and Clear all, price max ₹20,000 (1366), the Filters sheet on 390 px with Show packages.
- 2026-11-14 NOT RUN: Phase 6 (website screens).
- 2026-11-16 PASS (current): ok park Bandhavgarh -> 4; ok price 10,000-20,000 -> 4; ok chip ✕ removes its filter; ok price 50,000+ end -> 6; ok nights 7 to 10+ -> 1; ok nights 10+ -> 0; ok safaris 10+ -> 1; ok safaris 1-2 -> 4; ok stay Premium -> 8; ok feature Shared Safari -> 1; ok included Meals -> 8; ok Clear all restores the list; ok "No packages match your filters."; ok sort "Sort by: Popular"; ok sort "Newest"; ok sort "Fewest safaris"; ok sort "Most safaris"; ok sort "Price low to high"; no console errors, no failed calls \| 390: ok park Bandhavgarh -> 4; ok price 10,000-20,000 -> 4; ok chip ✕ removes its filter; ok price 50,000+ end -> 6; ok nights 7 to 10+ -> 1; ok nights 10+ -> 0; ok safaris 10+ -> 1; ok safaris 1-2 -> 4; ok stay Premium -> 8; ok feature Shared Safari -> 1; ok included Meals -> 8; ok Clear all restores the list; ok "No packages match your filters."; ok sort "Sort by: Popular"; ok sort "Newest"; ok sort "Fewest safaris"; ok sort "Most safaris"; ok sort "Price low to high"; no console errors, no failed calls

### TC-PKG-21 history

- 2026-11-14 PASS: Corbett Elephant Trails top details (9 facts), price box with struck price and message, the five tabs, a FAQ opens, the Kanha slider moved 1/3 → 2/3 by itself after 3 s, arrows next / previous, caption shown; Jhalana (inactive) shows "Package Not In Use!"; Bandhavgarh (never approved) goes to `/`. 800 px: no sideways scroll (P1, P6).
- 2026-11-14 NOT RUN: Phase 6 (website screens).
- 2026-11-16 FAIL: BAD top; ok tabs Overview (+1 slider), Itinerary, Inclusions, Getting there, FAQs; ok FAQs shown; ok Disclaimer shown; ok slider moves every ~3 s and loops (1 / 2 -> 2 / 2 -> 1 / 2); ok arrows move the photo; ok slider has titles / captions area; no console errors, no failed calls \| 390: BAD top; ok tabs Overview (+1 slider), Itinerary, Inclusions, Getting there, FAQs; ok FAQs shown; ok Disclaimer shown; ok slider moves every ~3 s and loops (1 / 2 -> 2 / 2 -> 1 / 2); ok arrows move the photo; ok slider has titles / captions area; no console errors, no failed calls
- 2026-11-16 PASS (current): the FAIL line above is a script fault ("BAD top": the page upper-cases its labels, the check was case-sensitive). Re-checked: top details (name, Trip Duration, Vehicle, Stay, Theme), price box (price per person, Total Price) and the quote form are all there; the other checks in the run passed (five tabs, FAQs, Disclaimer, slider moves every 3 s and loops 1/2 -> 2/2 -> 1/2, arrows work); no console errors.

### TC-PKG-22 history

- 2026-11-14 PASS: 1366: never approved: url / ok; unknown link: url / ok; inactive: "Package Not In Use!" ok; deleted by Super Admin: "Package Not In Use!" ok; partner inactive: "Package Not In Use!" ok \| 390: never approved: url / ok; unknown link: url / ok; inactive: "Package Not In Use!" ok; deleted by Super Admin: "Package Not In Use!" ok; partner inactive: "Package Not In Use!" ok. The website pages are the Phase 6 builder's work in progress.
- 2026-11-16 PASS (current): ok never approved (ct-pkg-five) -> home page; ok deleted by Super Admin (ct-pkgr-one) -> "Package Not In Use!"; ok inactive (ct-pkg-nine) -> "Package Not In Use!"; ok made active again; ok partner inactive (ct-pkg-four) -> "Package Not In Use!"; no console errors, no failed calls \| 390: ok never approved (ct-pkg-five) -> home page; ok deleted by Super Admin (ct-pkgr-one) -> "Package Not In Use!"; ok inactive (ct-pkg-nine) -> "Package Not In Use!"; ok made active again; ok partner inactive (ct-pkg-four) -> "Package Not In Use!"; no console errors, no failed calls

### TC-LOCAL-09 history

- 2026-11-16 FAIL: script checks too strict (Kanha is not on page 1 of the A–Z parks list; the package title is upper-cased by CSS). Fixed the script.
- 2026-11-16 PASS: signed out, `/packages` lists Kanha Escape, its page opens, `/parks` lists parks, `/parks/kanha-tiger-reserve` shows its packages; no errors.
- 2026-11-16 PASS (current): guest: /packages lists the partner's Kanha Escape, its package page opens, /parks and the Kanha park page show; no issues

### TC-FIX-03 history

- 2026-11-16 FAIL: not a product bug, the test script read the page title with innerText while the website shows it uppercased by CSS, so its website check was false; 1366px: website page of ct-fix1-live-three shown with ct_fix1 Park A false; Send refused with "A park in Basic is no longer one of your active parks. Replace it in Basic, then send." true (version status 1); after replacing A with B and saving, Send: "Version 2 sent for approval." true (status 2); live v1 parks still 65; 390px: website page of ct-fix1-live-four shown with ct_fix1 Park A false; Send refused with "A park in Basic is no longer one of your active parks. Replace it in Basic, then send." true (version status 1); after replacing A with B and saving, Send: "Version 2 sent for approval." true (status 2); live v1 parks still 65; no console errors, no failed calls other than the expected 422 on Send.
- 2026-11-16 PASS (current): script check fixed (textContent): the website pages of ct_fix1 Live Three / Four show the live v1 with "ct_fix1 Park A", not "Not In Use"; Send for approval on v2 refused with the toast "A park in Basic is no longer one of your active parks. Replace it in Basic, then send." (v2 stays Draft, failure audited 1210); after unticking Park A, ticking Park B and Save section, Send gives "Version 2 sent for approval." (status 2); the live v1 keeps Park A; no console errors, no failed calls other than the expected 422 on Send.
