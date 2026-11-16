# Test document: Galleries

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §7, §7.1, §7.2, §12.6, §12.7 |
| How it works | `docs/how-it-works/modules/gallery/README.md` |
| Latest run | 2026-11-14 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 8 | 8 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-GAL-01 | Create gallery | — | PASS | 2026-11-14 |
| TC-GAL-02 | Gallery errors | — | PASS | 2026-11-14 |
| TC-GAL-03 | Photo actions | — | PASS | 2026-11-14 |
| TC-GAL-04 | Send, move back, approve, reject | — | PASS | 2026-11-14 |
| TC-GAL-05 | Edit an approved gallery | — | PASS | 2026-11-14 |
| TC-GAL-06 | Gallery copy in a package | — | PASS | 2026-11-14 |
| TC-GAL-07 | Super Admin delete | — | PASS | 2026-11-14 |
| TC-GAL-08 | Only approved galleries offered | — | PASS | 2026-11-14 |

## Cases

### TC-GAL-01 Create gallery

| | |
|---|---|
| Title | Create gallery |
| Role | — |
| Pre-condition | Active partner |
| Steps | PP7: title, park, photos; save |
| Expected result | "Gallery saved as a draft."; In Draft; first photo is the thumbnail |
| Actual result | partner vivek.rao, `/gallery/new`: title `ct_Gala` / `ct_Galb`, park (own active parks only: Bandhavgarh, Corbett, Jhalana, Kanha), two photos, Save draft: toast "Gallery saved as a draft.", opened `/gallery/<id>` as In Draft with 2 photos, the first with the Thumbnail badge; listed on the In Draft tab. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-02 Gallery errors

| | |
|---|---|
| Title | Gallery errors |
| Role | — |
| Pre-condition | PP7 |
| Steps | empty title; no park; GIF; photo over 8 MB; Send with no photos |
| Expected result | "Enter the gallery title." / "Choose the park." / "Choose JPG, JPEG or PNG files." / "{file} is bigger than 8 MB." / "Add at least one photo first." |
| Actual result | empty Save: "Enter the gallery title." and "Choose the park."; a GIF: "Choose JPG, JPEG or PNG files."; a 9 MB `ct_big.png`: "ct_big.png is bigger than 8 MB."; a 256-character title: "Use up to 255 characters."; a saved draft with no photos, Send: "Add at least one photo first." (API 422, the only failed call), then Delete: "Draft discarded.". No console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-03 Photo actions

| | |
|---|---|
| Title | Photo actions |
| Role | — |
| Pre-condition | draft with photos |
| Steps | reorder, replace, set thumbnail, remove; remove the thumbnail |
| Expected result | applied; thumbnail can't be removed |
| Actual result | draft with 3 photos: Move left reordered, Set as thumbnail moved the badge, the thumbnail's Remove is disabled with the tip "The thumbnail can't be removed", Replace changed the picture, Remove dropped a photo, title / caption typed; after Save draft and a reload: 2 photos, the chosen one the thumbnail, the title and caption kept. At 1366 px the photo action row overflowed its card and hid Remove (the board's own overflow): fixed with `flex-wrap` (recorded in Decisions taken). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-04 Send, move back, approve, reject

| | |
|---|---|
| Title | Send, move back, approve, reject |
| Role | — |
| Pre-condition | draft |
| Steps | Send; Move back to draft; Send; PC7 reject with reason; Send; approve |
| Expected result | tabs follow; Super Admins notified; reason shown; Approved |
| Actual result | Send: "Gallery sent for approval." (Waiting tab, banner "This gallery is waiting for approval. Move it back to draft to change it.", only Move back to draft), Move back: "The gallery is back in draft.", Send again; the console Notifications page shows "Jungle Trails Safaris sent the gallery ct_Gal… for approval." (tag Gallery, link `/gallery-approvals`); PC7 lists it as "New gallery" with 2 photos, View photos opens 2 pictures; Reject empty: "Enter the reason.", 513 characters: "Use up to 512 characters.", valid: "Gallery rejected. It is back in draft with your reason."; the partner sees "Rejected: …" on the card and the red banner with the reason; Send again, Approve: "ct_Gal… is approved."; it is on the Approved tab. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-05 Edit an approved gallery

| | |
|---|---|
| Title | Edit an approved gallery |
| Role | — |
| Pre-condition | approved gallery used by a live package |
| Steps | Edit; change photos; check P2; Delete draft |
| Expected result | approved photos stay in use; "Draft discarded. The approved photos are back." |
| Actual result | Edit on the approved gallery: "A draft is made. The approved photos stay in use." and the blue banner; title changed and a photo added, saved; the Approved tab still shows the approved title and 2 photos with "Approved (live)" and "You have unsent changes in draft."; Delete draft dialog "Delete the draft?": "Draft discarded. The approved photos are back." and the page shows the approved title and 2 photos with the Edit button. "Check P2" (a live package keeps the copy) needs packages: Phase 5 (TC-GAL-06). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-06 Gallery copy in a package

| | |
|---|---|
| Title | Gallery copy in a package |
| Role | — |
| Pre-condition | approved gallery attached to a package and a day |
| Steps | change the gallery and get it approved |
| Expected result | the package keeps its copy until saved and approved again |
| Actual result | 1366: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs  \| 390: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs . The new version 2 was not sent on to approval in this case (the approval path is TC-PKG-11). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-07 Super Admin delete

| | |
|---|---|
| Title | Super Admin delete |
| Role | — |
| Pre-condition | approved gallery |
| Steps | PC8 Delete empty, 513, valid |
| Expected result | the messages; gone from the partner's Gallery |
| Actual result | PC8 Delete: empty "Enter the reason.", 513 characters "Use up to 512 characters.", valid: "Gallery deleted."; the gallery is gone from the partner's Approved tab and its address is the not-found page. No console errors or failed calls other than the expected 422 above (two API restarts during the first runs gave connection-refused errors; the runs were repeated and are clean). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-08 Only approved galleries offered

| | |
|---|---|
| Title | Only approved galleries offered |
| Role | — |
| Pre-condition | partner with draft and approved galleries |
| Steps | PP5 gallery pickers |
| Expected result | approved ones only, any park |
| Actual result | 1366: approved 4 [ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 4; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs  \| 390: approved 5 [ct_Gal Copy 1366, ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 5; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs . |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-GAL-06 history

- 2026-11-14 NOT RUN: Phase 5 (needs packages).
- 2026-11-14 PASS (current): 1366: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs  \| 390: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs . The new version 2 was not sent on to approval in this case (the approval path is TC-PKG-11).

### TC-GAL-08 history

- 2026-11-14 NOT RUN: Phase 5 (needs the package form pickers).
- 2026-11-14 PASS (current): 1366: approved 4 [ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 4; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs  \| 390: approved 5 [ct_Gal Copy 1366, ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 5; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs .
