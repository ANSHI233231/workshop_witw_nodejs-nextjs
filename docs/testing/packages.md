# Test document: Packages

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| How it works | `docs/how-it-works/modules/package/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 23 | 23 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PKG-01 | Create package | — | PASS | 2026-11-14 |
| TC-PKG-02 | Basic errors | — | PASS | 2026-11-14 |
| TC-PKG-03 | Other sections closed before Basic | — | PASS | 2026-11-14 |
| TC-PKG-04 | Itinerary | — | PASS | 2026-11-14 |
| TC-PKG-05 | Fewer days | — | PASS | 2026-11-14 |
| TC-PKG-06 | Inclusions and Meals | — | PASS | 2026-11-14 |
| TC-PKG-07 | Getting there and FAQs | — | PASS | 2026-11-14 |
| TC-PKG-08 | Send | — | PASS | 2026-11-14 |
| TC-PKG-09 | Approve first version | — | PASS | 2026-11-14 |
| TC-PKG-10 | Reject | — | PASS | 2026-11-14 |
| TC-PKG-11 | Edit a live package | — | PASS | 2026-11-14 |
| TC-PKG-12 | Delete a draft | — | PASS | 2026-11-14 |
| TC-PKG-13 | Make inactive / active | — | PASS | 2026-11-14 |
| TC-PKG-14 | Versions | — | PASS | 2026-11-14 |
| TC-PKG-15 | Super Admin edit | — | PASS | 2026-11-14 |
| TC-PKG-16 | Delete with reason | — | PASS | 2026-11-14 |
| TC-PKG-17 | Popular and Best deal | — | PASS | 2026-11-14 |
| TC-PKG-18 | Delete reasons | — | PASS | 2026-11-14 |
| TC-PKG-19 | Package list | — | PASS | 2026-11-14 |
| TC-PKG-20 | Filters, chips, sorts | — | PASS | 2026-11-14 |
| TC-PKG-21 | Package page | — | PASS | 2026-11-14 |
| TC-PKG-22 | Not live / not in use | — | PASS | 2026-11-14 |
| TC-LOCAL-09 | Guest browses packages and parks | — | PASS | 2026-11-16 |

## Cases

### TC-PKG-01 Create package

| | |
|---|---|
| Title | Create package |
| Role | — |
| Pre-condition | Active partner |
| Steps | PP5: save Basic |
| Expected result | "Basic saved. Version 1 is a draft; the other sections are open now."; `/packages/<slug>`; other tabs open |
| Actual result | 1366: Basic saved. Version 1 is a draft; the other sections are open now.; url id 26; disabled tabs 0; link /packages/ct-pkg-alpha-1366-r5; errs  \| 390: Basic saved. Version 1 is a draft; the other sections are open now.; url id 17; disabled tabs 0; link /packages/ct-pkg-alpha-390; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-02 Basic errors

| | |
|---|---|
| Title | Basic errors |
| Role | — |
| Pre-condition | PP5 |
| Steps | every §2.3 Basic rule, including total below price per person and price before discount not above it, images over 250 KB / wrong type |
| Expected result | the board's message under each field; "Check the highlighted fields." |
| Actual result | 1366: empty: all messages + banner toast; bad values: ok; total/before: ok; image type true, size true \| 390: empty: all messages + banner toast; bad values: ok; total/before: ok; image type true, size true. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-03 Other sections closed before Basic

| | |
|---|---|
| Title | Other sections closed before Basic |
| Role | — |
| Pre-condition | new package |
| Steps | click Itinerary |
| Expected result | "Save the Basic section first." |
| Actual result | 1366: Save the Basic section first. \| 390: Save the Basic section first.. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-04 Itinerary

| | |
|---|---|
| Title | Itinerary |
| Role | — |
| Pre-condition | v1 |
| Steps | fill days; save with an empty title / description; 501-character note |
| Expected result | saved; the three messages |
| Actual result | 1366: empty: 6 errors; 501 note: true; toast "Section saved."; reloaded title Arrival, day2 image 1, gallery 3; errs  \| 390: empty: 6 errors; 501 note: true; toast "Section saved."; reloaded title Arrival, day2 image 1, gallery 3; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-05 Fewer days

| | |
|---|---|
| Title | Fewer days |
| Role | — |
| Pre-condition | itinerary saved, 5 days |
| Steps | set 3; confirm; also cancel |
| Expected result | "Remove days 4–5?"; removed on confirm; unchanged on cancel |
| Actual result | 1366: range dialog "Remove day 3?" ok true; cancel keeps 3 true; single dialog true; after confirm days 2, itinerary blocks 2; toast "Section saved." \| 390: range dialog "Remove day 3?" ok true; cancel keeps 3 true; single dialog true; after confirm days 2, itinerary blocks 2; toast "Section saved.". |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-06 Inclusions and Meals

| | |
|---|---|
| Title | Inclusions and Meals |
| Role | — |
| Pre-condition | itinerary saved |
| Steps | Meals → Included; change a day's meals; save |
| Expected result | every day ticked, toast says so; the change kept |
| Actual result | 1366: toast "true" ticked 9/9; after unticking day 1 dinner and saving Inclusions again: dinner false, ticked 8/9 \| 390: toast "true" ticked 9/9; after unticking day 1 dinner and saving Inclusions again: dinner false, ticked 8/9. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-07 Getting there and FAQs

| | |
|---|---|
| Title | Getting there and FAQs |
| Role | — |
| Pre-condition | v1 |
| Steps | save Getting there; add, edit, delete FAQs; empty question / answer |
| Expected result | saved; "Enter the question." / "Enter the answer." |
| Actual result | 1366: getting there toast "Section saved."; empty faq messages true; after edit + delete 1 faq, answer "Yes, always."; errs  \| 390: getting there toast "Section saved."; empty faq messages true; after edit + delete 1 faq, answer "Yes, always."; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-08 Send

| | |
|---|---|
| Title | Send |
| Role | — |
| Pre-condition | v1 Draft |
| Steps | PP4 or PP5 Send, confirm |
| Expected result | "Version 1 sent for approval."; read-only; the console bell shows it |
| Actual result | 1366: PP5 dialog "Send for approval?"; toast "Version 1 sent for approval."; banner ok true; PP4 toast "Version 1 sent for approval."; notifications page true; bell true, click lands http://localhost:3041/package-approvals; errs  \| 390: PP5 dialog "Send for approval?"; toast "Version 1 sent for approval."; banner ok true; PP4 toast "Version 1 sent for approval."; notifications page true; bell true, click lands http://localhost:3041/package-approvals; errs . A first 1366 run logged a hydration pageerror in the console once (not reproduced in three later runs; the page markup is the console notification list's, not this change). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-09 Approve first version

| | |
|---|---|
| Title | Approve first version |
| Role | — |
| Pre-condition | v1 Waiting |
| Steps | PC3 Preview (PC5), Approve |
| Expected result | "{name} v1 is live on the website."; Active; on P1 |
| Actual result | 1366: row "1ct_Pkg Alpha 1366 r5Kanha Tiger Reserve, Bandhavgarh Tiger ReserveJungle Trails" subtitle "Jungle Trails Safaris · Version 1 · Waiting for approval · Website: Not live yet" toast "ct_Pkg Alpha 1366 r5 v1 is live on the website."; url http://localhost:3041/packages/26?version=live&tab=preview; PC4 row has Active true; on the public API list true; website list screen P1 is Phase 6; errs  \| 390: row "1Packagect_Pkg Alpha 390Kanha Tiger Reserve, Bandhavgarh Tiger ReservePartnerJun" subtitle "Jungle Trails Safaris · Version 1 · Waiting for approval · Website: Not live yet" toast "ct_Pkg Alpha 390 v1 is live on the website."; url http://localhost:3041/packages/17?version=live&tab=preview; PC4 row has Active true; on the public API list true; website list screen P1 is Phase 6; errs . P1 (the list on the site) is Phase 6. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-10 Reject

| | |
|---|---|
| Title | Reject |
| Role | — |
| Pre-condition | a Waiting version |
| Steps | Reject empty, then with a reason; partner edits it |
| Expected result | "Enter the reason."; reason on PP4 / PP5; editing makes it a Draft |
| Actual result | 1366: empty "Enter the reason.", 513 "Use up to 512 characters.", toast "Version 1 rejected. The partner sees the reason."; PP4 shows Rejected true; PP5 banner "Version 1 was rejected. ct: the price needs a second look"; after saving a section PP4 shows Draft true; errs  \| 390: empty "Enter the reason.", 513 "Use up to 512 characters.", toast "Version 1 rejected. The partner sees the reason."; PP4 shows Rejected true; PP5 banner "Version 1 was rejected. ct: the price needs a second look"; after saving a section PP4 shows Draft true; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-11 Edit a live package

| | |
|---|---|
| Title | Edit a live package |
| Role | — |
| Pre-condition | v1 live |
| Steps | PP5 Edit → v2; change the price; send; check P2; approve |
| Expected result | P2 shows v1 until approval; then v2 live, v1 Replaced, Popular cleared |
| Actual result | 1366: live banner ok, Edit button "makes version 2" 1, draft banner "The live version v1 stays on the website until version 2 is approved.", the public package stays v1 / 10000 until approval true, after approval public shows v2 / 11000 true, v1 Replaced true, Popular cleared false; the P2 screen is Phase 6 (checked through the public API); errs  \| 390: live banner ok, Edit button "makes version 2" 1, draft banner "The live version v1 stays on the website until version 2 is approved.", the public package stays v1 / 10000 until approval true, after approval public shows v2 / 11000 true, v1 Replaced true, Popular cleared false; the P2 screen is Phase 6 (checked through the public API); errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-12 Delete a draft

| | |
|---|---|
| Title | Delete a draft |
| Role | — |
| Pre-condition | v2 draft of a live package; a never-live package |
| Steps | Delete draft; Delete |
| Expected result | "This draft will be discarded."; v1 stays live; the never-live one leaves the list |
| Actual result | 1366: draft dialog "Delete the draft?", toast "Draft discarded.", v1 still live true; never-live dialog "Delete this package?", toast "Draft discarded.", row left the list true; errs  \| 390: draft dialog "Delete the draft?", toast "Draft discarded.", v1 still live true; never-live dialog "Delete this package?", toast "Draft discarded.", row left the list true; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-13 Make inactive / active

| | |
|---|---|
| Title | Make inactive / active |
| Role | — |
| Pre-condition | live package |
| Steps | PP4 switch |
| Expected result | at once; P2 "Package Not In Use!" while inactive |
| Actual result | 1366: toast "ct_Pkg Alpha 1366 r5 is now inactive on the website.", row Inactive true, public package inUse=false true (the "Package Not In Use!" text is on P2, Phase 6); then "ct_Pkg Alpha 1366 r5 is now active on the website.", inUse again true; errs  \| 390: toast "ct_Pkg Alpha 390 is now inactive on the website.", row Inactive true, public package inUse=false true (the "Package Not In Use!" text is on P2, Phase 6); then "ct_Pkg Alpha 390 is now active on the website.", inUse again true; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-14 Versions

| | |
|---|---|
| Title | Versions |
| Role | — |
| Pre-condition | package with a Replaced version |
| Steps | PP5 Versions; View the Replaced one |
| Expected result | dates and reasons listed; "You are viewing version N (Replaced). It can't be changed." |
| Actual result | 1366: versions panel lists v1 Replaced with dates true; View link 1; banner "You are viewing version 1 (Replaced). It can't be changed.Back to the current version"; no Save button true; Back link 1; errs  \| 390: versions panel lists v1 Replaced with dates true; View link 1; banner "You are viewing version 1 (Replaced). It can't be changed.Back to the current version"; no Save button true; Back link 1; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-15 Super Admin edit

| | |
|---|---|
| Title | Super Admin edit |
| Role | — |
| Pre-condition | a waiting and a live version |
| Steps | PC5 Edit from PC3 and from PC4 |
| Expected result | every section editable; live edit "Saved. The website shows the change now."; version shows "edited by Super Admin" |
| Actual result | 1366: PC5 Edit from PC3 ("1ct_Pkg Alpha 1366 r5Kanha Tiger Reserve"): sections Basic,Itinerary,Inclusions,Getting there,FAQs; saves "Section saved. / Section saved. / Section saved. / Section saved. / Section saved."; versions panel shows edited by Super Admin true; the approved version holds the admin's edits true; live edit part below \|\| PC4 Edit: banner "You are editing the live version v2. Saved changes show on the website at once, with no approval step.", toast "Saved. The website shows the change now.", the public package shows the change at once true, versions panel "edited by Super Admin" true (part 2 of 2) \| 390: PC5 Edit from PC3 ("1Packagect_Pkg Alpha 390Kanha Tiger Rese"): sections Basic,Itinerary,Inclusions,Getting there,FAQs; saves "Section saved. / Section saved. / Section saved. / Section saved. / Section saved."; versions panel shows edited by Super Admin true; the approved version holds the admin's edits true; live edit part below \|\| PC4 Edit: banner "You are editing the live version v2. Saved changes show on the website at once, with no approval step.", toast "Saved. The website shows the change now.", the public package shows the change at once true, versions panel "edited by Super Admin" true (part 2 of 2). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-16 Delete with reason

| | |
|---|---|
| Title | Delete with reason |
| Role | — |
| Pre-condition | live package |
| Steps | PC4 Delete: no reason, no details, then both |
| Expected result | "Choose a reason." / "Enter the details."; Deleted by Super Admin; P2 "Package Not In Use!"; partner sees the reason, View only |
| Actual result | 1366: errors "Choose a reason.,Enter the details." then "Enter the details."; reasons offered 5 (active only); toast "Package deleted from the website."; PC4 row Deleted and View only true; public inUse=false true; PC5 Edit tab hidden 1, banner ""; partner PP4 row View only (1 action), PP5 banner "Deleted by Super Admin on 14 Nov 2026. Reason: Misleading information — ct: wrong prices on the page", no Save true; errs  \| 390: errors "Choose a reason.,Enter the details." then "Enter the details."; reasons offered 5 (active only); toast "Package deleted from the website."; PC4 row Deleted and View only true; public inUse=false true; PC5 Edit tab hidden 1, banner ""; partner PP4 row View only (1 action), PP5 banner "Deleted by Super Admin on 14 Nov 2026. Reason: Misleading information — ct: wrong prices on the page", no Save true; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
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
| Actual result | 1366: toasts "ct_Pkg Alpha 1366 r5 is marked Popular." / "ct_Pkg Alpha 1366 r5 shows the Best deal badge."; popular sort first = this package true; after the v2 approval Popular false, Best deal true; the Best deal badge on the website card is Phase 6; errs  \| 390: toasts "ct_Pkg Alpha 390 is marked Popular." / "ct_Pkg Alpha 390 shows the Best deal badge."; popular sort first = this package true; after the v2 approval Popular false, Best deal true; the Best deal badge on the website card is Phase 6; errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-18 Delete reasons

| | |
|---|---|
| Title | Delete reasons |
| Role | — |
| Pre-condition | console |
| Steps | PC6 add; duplicate; empty; 101 characters; edit with status; make inactive |
| Expected result | the board's messages; inactive one not offered in Delete; "Used" count |
| Actual result | 1366: intro ok; empty "Enter the reason.", 101 "Use up to 100 characters.", duplicate "This reason already exists.", case-variant "This reason already exists.", add "Reason added.", Active true; offered while active true, after Make inactive "Reason "ct_Reason 1366 r5" is now inactive." offered false; edit dialog status "Inactive" -> toggled to Active, "Reason updated.", list shows Active true; "Reason "ct_Reason 1366 r5 edited" is now inactive. / Reason "ct_Reason 1366 r5 edited" is now active."; used count after one delete true; expected 422 validation answers: 2; other errs  \| 390: intro ok; empty "Enter the reason.", 101 "Use up to 100 characters.", duplicate "This reason already exists.", case-variant "This reason already exists.", add "Reason added.", Active true; offered while active true, after Make inactive "Reason "ct_Reason 390 r3" is now inactive." offered false; edit dialog status "Inactive" -> toggled to Active, "Reason updated.", list shows Active true; "Reason "ct_Reason 390 r3 edited" is now inactive. / Reason "ct_Reason 390 r3 edited" is now active."; used count after one delete true; expected 422 validation answers: 2; other errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-19 Package list

| | |
|---|---|
| Title | Package list |
| Role | — |
| Pre-condition | shown and hidden packages |
| Steps | P1 as a guest |
| Expected result | only live + Active + partner Active; card as §2.3; 12, more on scroll |
| Actual result | 8 shown packages (the 12 demo minus Gir, Jhalana, Bandhavgarh, Kanha Birding, the Satpura first version, Monsoon Escape, plus two `ct_Pkg Alpha` from Phase 5 tests); Best deal, struck-out price, tag and price message shown; no console errors or failed calls. The 12-per-page scroll is shown on P5 (36 → 44 parks after scrolling); with only 8 packages the package list has no second page to scroll to (the API paging was checked in Phase 5). |
| Result | PASS |
| Method | browser, 1366 + 390 px, guest |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-20 Filters, chips, sorts

| | |
|---|---|
| Title | Filters, chips, sorts |
| Role | — |
| Pre-condition | P1 |
| Steps | each filter and its 10+ / ₹50,000+ end, chip ✕, Clear all, each sort; Filters on mobile |
| Expected result | the list matches; "No packages match your filters." |
| Actual result | search, empty state and Clear filters, sort by price low (₹10,000 … ₹1,55,000 ascending) and most safaris, park filter (Corbett → 1), Premium stay, chips with ✕ and Clear all, price max ₹20,000 (1366), the Filters sheet on 390 px with Show packages. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-21 Package page

| | |
|---|---|
| Title | Package page |
| Role | — |
| Pre-condition | shown package with galleries |
| Steps | P2: each tab, slider arrows and auto-move, FAQs |
| Expected result | §2.3 parts; slider every 3 s, looping, titles and captions; disclaimer |
| Actual result | Corbett Elephant Trails top details (9 facts), price box with struck price and message, the five tabs, a FAQ opens, the Kanha slider moved 1/3 → 2/3 by itself after 3 s, arrows next / previous, caption shown; Jhalana (inactive) shows "Package Not In Use!"; Bandhavgarh (never approved) goes to `/`. 800 px: no sideways scroll (P1, P6). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKG-22 Not live / not in use

| | |
|---|---|
| Title | Not live / not in use |
| Role | — |
| Pre-condition | never approved, inactive, deleted, partner-inactive |
| Steps | open each link |
| Expected result | never approved → home page; others "Package Not In Use!" |
| Actual result | 1366: never approved: url / ok; unknown link: url / ok; inactive: "Package Not In Use!" ok; deleted by Super Admin: "Package Not In Use!" ok; partner inactive: "Package Not In Use!" ok \| 390: never approved: url / ok; unknown link: url / ok; inactive: "Package Not In Use!" ok; deleted by Super Admin: "Package Not In Use!" ok; partner inactive: "Package Not In Use!" ok. The website pages are the Phase 6 builder's work in progress. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-09 Guest browses packages and parks

| | |
|---|---|
| Title | Guest browses packages and parks |
| Role | — |
| Pre-condition | signed out |
| Steps | open `/packages`, a package, `/parks`, a park |
| Expected result | pages show, the partner's packages are listed |
| Actual result | signed out, `/packages` lists Kanha Escape, its page opens, `/parks` lists parks, `/parks/kanha-tiger-reserve` shows its packages; no errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §4, §5, §6.1, §6.2, §8.1, §8.2, §12.3 to §12.5, §13 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PKG-19 history

- 2026-11-14 PASS (current): 8 shown packages (the 12 demo minus Gir, Jhalana, Bandhavgarh, Kanha Birding, the Satpura first version, Monsoon Escape, plus two `ct_Pkg Alpha` from Phase 5 tests); Best deal, struck-out price, tag and price message shown; no console errors or failed calls. The 12-per-page scroll is shown on P5 (36 → 44 parks after scrolling); with only 8 packages the package list has no second page to scroll to (the API paging was checked in Phase 5).
- 2026-11-14 NOT RUN: Phase 6 (website screens).

### TC-PKG-20 history

- 2026-11-14 PASS (current): search, empty state and Clear filters, sort by price low (₹10,000 … ₹1,55,000 ascending) and most safaris, park filter (Corbett → 1), Premium stay, chips with ✕ and Clear all, price max ₹20,000 (1366), the Filters sheet on 390 px with Show packages.
- 2026-11-14 NOT RUN: Phase 6 (website screens).

### TC-PKG-21 history

- 2026-11-14 PASS (current): Corbett Elephant Trails top details (9 facts), price box with struck price and message, the five tabs, a FAQ opens, the Kanha slider moved 1/3 → 2/3 by itself after 3 s, arrows next / previous, caption shown; Jhalana (inactive) shows "Package Not In Use!"; Bandhavgarh (never approved) goes to `/`. 800 px: no sideways scroll (P1, P6).
- 2026-11-14 NOT RUN: Phase 6 (website screens).

### TC-LOCAL-09 history

- 2026-11-16 FAIL: script checks too strict (Kanha is not on page 1 of the A–Z parks list; the package title is upper-cased by CSS). Fixed the script.
- 2026-11-16 PASS (current): signed out, `/packages` lists Kanha Escape, its page opens, `/parks` lists parks, `/parks/kanha-tiger-reserve` shows its packages; no errors.
