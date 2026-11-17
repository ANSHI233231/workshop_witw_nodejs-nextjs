# Test document: Galleries

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §7, §7.1, §7.2, §12.6, §12.7 |
| How it works | `docs/how-it-works/modules/gallery/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 8 | 8 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-GAL-01 | Create gallery | Partner | PASS | 2026-11-16 |
| TC-GAL-02 | Gallery errors | Partner | PASS | 2026-11-16 |
| TC-GAL-03 | Photo actions | Partner | PASS | 2026-11-16 |
| TC-GAL-04 | Send, move back, approve, reject | Partner, Super Admin | PASS | 2026-11-16 |
| TC-GAL-05 | Edit an approved gallery | Partner, Guest | PASS | 2026-11-16 |
| TC-GAL-06 | Gallery copy in a package | Partner, Super Admin, Guest | PASS | 2026-11-16 |
| TC-GAL-07 | Super Admin delete | Super Admin, Partner | PASS | 2026-11-16 |
| TC-GAL-08 | Only approved galleries offered | Partner | PASS | 2026-11-16 |

## Cases

### TC-GAL-01 Create gallery

| | |
|---|---|
| Title | Create gallery |
| Role | Partner |
| Pre-condition | Active partner |
| Steps | PP7: title, park, photos; save |
| Expected result | "Gallery saved as a draft."; In Draft; first photo is the thumbnail |
| Actual result | gallery 50 "ct_GalR 1366": 3 photos, first is the Thumbnail true, In Draft, listed on the In Draft tab true; no console errors, no failed calls \| 390: gallery 52 "ct_GalR 390": 3 photos, first is the Thumbnail true, In Draft, listed on the In Draft tab true; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-01-1366.png, tc-gal-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-02 Gallery errors

| | |
|---|---|
| Title | Gallery errors |
| Role | Partner |
| Pre-condition | PP7 |
| Steps | empty title; no park; GIF; photo over 8 MB; Send with no photos |
| Expected result | "Enter the gallery title." / "Choose the park." / "Choose JPG, JPEG or PNG files." / "{file} is bigger than 8 MB." / "Add at least one photo first." |
| Actual result | ok empty: "Enter the gallery title." "Choose the park."; ok GIF "Choose JPG, JPEG or PNG files."; ok 9 MB "gal_9mb.jpg is bigger than 8 MB."; ok Send with no photos "Add at least one photo first."; no console errors, no failed calls (422 on the empty Send is expected) \| 390: ok empty: "Enter the gallery title." "Choose the park."; ok GIF "Choose JPG, JPEG or PNG files."; ok 9 MB "gal_9mb.jpg is bigger than 8 MB."; ok Send with no photos "Add at least one photo first."; no console errors, no failed calls (422 on the empty Send is expected) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-02-1366.png, tc-gal-02-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-03 Photo actions

| | |
|---|---|
| Title | Photo actions |
| Role | Partner |
| Pre-condition | draft with photos |
| Steps | reorder, replace, set thumbnail, remove; remove the thumbnail |
| Expected result | applied; thumbnail can't be removed |
| Actual result | ok reorder; ok set thumbnail; ok the thumbnail can't be removed; ok replace; ok remove + saved: 2 photos kept, thumbnail unchanged after reload; no console errors, no failed calls \| 390: ok reorder; ok set thumbnail; ok the thumbnail can't be removed; ok replace; ok remove + saved: 2 photos kept, thumbnail unchanged after reload; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-03-1366.png, tc-gal-03-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-04 Send, move back, approve, reject

| | |
|---|---|
| Title | Send, move back, approve, reject |
| Role | Partner, Super Admin |
| Pre-condition | draft |
| Steps | Send; Move back to draft; Send; PC7 reject with reason; Send; approve |
| Expected result | tabs follow; Super Admins notified; reason shown; Approved |
| Actual result | ok Send -> Waiting; ok Super Admins notified (4 rows); ok Move back to draft; ok reject empty "Enter the reason."; ok rejected: reason shown, back to draft; ok approve: on the Approved tab; no console errors, no failed calls \| 390: ok Send -> Waiting; ok Super Admins notified (4 rows); ok Move back to draft; ok approve: on the Approved tab; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-04-1366.png, tc-gal-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-05 Edit an approved gallery

| | |
|---|---|
| Title | Edit an approved gallery |
| Role | Partner, Guest |
| Pre-condition | approved gallery used by a live package |
| Steps | Edit; change photos; check P2; Delete draft |
| Expected result | approved photos stay in use; "Draft discarded. The approved photos are back." |
| Actual result | rerun at 390 on ct_Pkg Four with gallery ct_Gal One 390 (the first 390 FAIL was a script fault: that package had no gallery attached): ok P2 slider starts with the approved 3 photos; ok Edit makes a draft; "The approved photos stay in use until your changes are approved."; ok P2 still shows the approved photos while the draft exists; ok dialog "This draft will be discarded. The approved photos stay as they are."; ok draft discarded, approved gallery back on the Approved tab; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 390 px (1366 passed in the earlier run) |
| Date | 2026-11-16 |
| Screenshot | tc-gal-05-1366.png, tc-gal-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-06 Gallery copy in a package

| | |
|---|---|
| Title | Gallery copy in a package |
| Role | Partner, Super Admin, Guest |
| Pre-condition | approved gallery attached to a package and a day |
| Steps | change the gallery and get it approved |
| Expected result | the package keeps its copy until saved and approved again |
| Actual result | rerun at 390 on ct_Pkg Four with gallery ct_Gal One 390 (the first 390 FAIL was a script fault: that package had no gallery attached): ok PC7 lists it as "Edit of an approved gallery"; ok after the gallery is approved, the package still shows its own copy (3 photos); ok still 3 photos until the new package version is approved; ok after the package is saved and approved again it shows the new 4 photos; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 390 px (1366 passed in the earlier run) |
| Date | 2026-11-16 |
| Screenshot | tc-gal-06-1366.png, tc-gal-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-07 Super Admin delete

| | |
|---|---|
| Title | Super Admin delete |
| Role | Super Admin, Partner |
| Pre-condition | approved gallery |
| Steps | PC8 Delete empty, 513, valid |
| Expected result | the messages; gone from the partner's Gallery |
| Actual result | ok empty "Enter the reason."; ok 513 characters "Use up to 512 characters."; ok deleted: gone from PC8 and the partner's Gallery; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok 513 characters "Use up to 512 characters."; ok deleted: gone from PC8 and the partner's Gallery; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-07-1366.png, tc-gal-07-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-GAL-08 Only approved galleries offered

| | |
|---|---|
| Title | Only approved galleries offered |
| Role | Partner |
| Pre-condition | partner with draft and approved galleries |
| Steps | PP5 gallery pickers |
| Expected result | approved ones only, any park |
| Actual result | ok Basic picker offers approved galleries of any park (Kanha, Corbett) and not the draft; no console errors, no failed calls \| 390: ok Basic picker offers approved galleries of any park (Kanha, Corbett) and not the draft; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-gal-08-1366.png, tc-gal-08-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §7, §7.1, §7.2, §12.6, §12.7 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-GAL-01 history

- 2026-11-14 PASS: partner vivek.rao, `/gallery/new`: title `ct_Gala` / `ct_Galb`, park (own active parks only: Bandhavgarh, Corbett, Jhalana, Kanha), two photos, Save draft: toast "Gallery saved as a draft.", opened `/gallery/<id>` as In Draft with 2 photos, the first with the Thumbnail badge; listed on the In Draft tab.
- 2026-11-16 PASS (current): gallery 50 "ct_GalR 1366": 3 photos, first is the Thumbnail true, In Draft, listed on the In Draft tab true; no console errors, no failed calls \| 390: gallery 52 "ct_GalR 390": 3 photos, first is the Thumbnail true, In Draft, listed on the In Draft tab true; no console errors, no failed calls

### TC-GAL-02 history

- 2026-11-14 PASS: empty Save: "Enter the gallery title." and "Choose the park."; a GIF: "Choose JPG, JPEG or PNG files."; a 9 MB `ct_big.png`: "ct_big.png is bigger than 8 MB."; a 256-character title: "Use up to 255 characters."; a saved draft with no photos, Send: "Add at least one photo first." (API 422, the only failed call), then Delete: "Draft discarded.". No console errors.
- 2026-11-16 PASS (current): ok empty: "Enter the gallery title." "Choose the park."; ok GIF "Choose JPG, JPEG or PNG files."; ok 9 MB "gal_9mb.jpg is bigger than 8 MB."; ok Send with no photos "Add at least one photo first."; no console errors, no failed calls (422 on the empty Send is expected) \| 390: ok empty: "Enter the gallery title." "Choose the park."; ok GIF "Choose JPG, JPEG or PNG files."; ok 9 MB "gal_9mb.jpg is bigger than 8 MB."; ok Send with no photos "Add at least one photo first."; no console errors, no failed calls (422 on the empty Send is expected)

### TC-GAL-03 history

- 2026-11-14 PASS: draft with 3 photos: Move left reordered, Set as thumbnail moved the badge, the thumbnail's Remove is disabled with the tip "The thumbnail can't be removed", Replace changed the picture, Remove dropped a photo, title / caption typed; after Save draft and a reload: 2 photos, the chosen one the thumbnail, the title and caption kept. At 1366 px the photo action row overflowed its card and hid Remove (the board's own overflow): fixed with `flex-wrap` (recorded in Decisions taken).
- 2026-11-16 PASS (current): ok reorder; ok set thumbnail; ok the thumbnail can't be removed; ok replace; ok remove + saved: 2 photos kept, thumbnail unchanged after reload; no console errors, no failed calls \| 390: ok reorder; ok set thumbnail; ok the thumbnail can't be removed; ok replace; ok remove + saved: 2 photos kept, thumbnail unchanged after reload; no console errors, no failed calls

### TC-GAL-04 history

- 2026-11-14 PASS: Send: "Gallery sent for approval." (Waiting tab, banner "This gallery is waiting for approval. Move it back to draft to change it.", only Move back to draft), Move back: "The gallery is back in draft.", Send again; the console Notifications page shows "Jungle Trails Safaris sent the gallery ct_Gal… for approval." (tag Gallery, link `/gallery-approvals`); PC7 lists it as "New gallery" with 2 photos, View photos opens 2 pictures; Reject empty: "Enter the reason.", 513 characters: "Use up to 512 characters.", valid: "Gallery rejected. It is back in draft with your reason."; the partner sees "Rejected: …" on the card and the red banner with the reason; Send again, Approve: "ct_Gal… is approved."; it is on the Approved tab.
- 2026-11-16 PASS (current): ok Send -> Waiting; ok Super Admins notified (4 rows); ok Move back to draft; ok reject empty "Enter the reason."; ok rejected: reason shown, back to draft; ok approve: on the Approved tab; no console errors, no failed calls \| 390: ok Send -> Waiting; ok Super Admins notified (4 rows); ok Move back to draft; ok approve: on the Approved tab; no console errors, no failed calls

### TC-GAL-05 history

- 2026-11-14 PASS: Edit on the approved gallery: "A draft is made. The approved photos stay in use." and the blue banner; title changed and a photo added, saved; the Approved tab still shows the approved title and 2 photos with "Approved (live)" and "You have unsent changes in draft."; Delete draft dialog "Delete the draft?": "Draft discarded. The approved photos are back." and the page shows the approved title and 2 photos with the Edit button. "Check P2" (a live package keeps the copy) needs packages: Phase 5 (TC-GAL-06).
- 2026-11-16 FAIL: ok P2 slider starts with the approved 2 photos; ok Edit makes a draft; "The approved photos stay in use until your changes are approved."; ok P2 still shows the approved photos while the draft exists; ok dialog "This draft will be discarded. The approved photos stay as they are."; ok draft discarded, approved gallery back on the Approved tab; no console errors, no failed calls \| 390: BAD base ; ok Edit makes a draft; "The approved photos stay in use until your changes are approved."; ok P2 still shows the approved photos while the draft exists; ok dialog "This draft will be discarded. The approved photos stay as they are."; ok draft discarded, approved gallery back on the Approved tab; no console errors, no failed calls
- 2026-11-16 PASS (current): rerun at 390 on ct_Pkg Four with gallery ct_Gal One 390 (the first 390 FAIL was a script fault: that package had no gallery attached): ok P2 slider starts with the approved 3 photos; ok Edit makes a draft; "The approved photos stay in use until your changes are approved."; ok P2 still shows the approved photos while the draft exists; ok dialog "This draft will be discarded. The approved photos stay as they are."; ok draft discarded, approved gallery back on the Approved tab; no console errors, no failed calls

### TC-GAL-06 history

- 2026-11-14 NOT RUN: Phase 5 (needs packages).
- 2026-11-14 PASS: 1366: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs  \| 390: package + day 1 attached to the approved gallery: copies 1/1 photo; the gallery then changed (approved photos 2); live package copies still 1/1, website copies 1/1; saving Basic and Itinerary of the new version 2 on PP5 refreshes its copies to 2/2 while the website copies stay 1/1; errs . The new version 2 was not sent on to approval in this case (the approval path is TC-PKG-11).
- 2026-11-16 FAIL: ok PC7 lists it as "Edit of an approved gallery"; ok after the gallery is approved, the package still shows its own copy (2 photos); ok still 2 photos until the new package version is approved; ok after the package is saved and approved again it shows the new 3 photos; no console errors, no failed calls \| 390: ok PC7 lists it as "Edit of an approved gallery"; BAD package copy changed; BAD early change; BAD no refresh: ; no console errors, no failed calls
- 2026-11-16 PASS (current): rerun at 390 on ct_Pkg Four with gallery ct_Gal One 390 (the first 390 FAIL was a script fault: that package had no gallery attached): ok PC7 lists it as "Edit of an approved gallery"; ok after the gallery is approved, the package still shows its own copy (3 photos); ok still 3 photos until the new package version is approved; ok after the package is saved and approved again it shows the new 4 photos; no console errors, no failed calls

### TC-GAL-07 history

- 2026-11-14 PASS: PC8 Delete: empty "Enter the reason.", 513 characters "Use up to 512 characters.", valid: "Gallery deleted."; the gallery is gone from the partner's Approved tab and its address is the not-found page. No console errors or failed calls other than the expected 422 above (two API restarts during the first runs gave connection-refused errors; the runs were repeated and are clean).
- 2026-11-16 PASS (current): ok empty "Enter the reason."; ok 513 characters "Use up to 512 characters."; ok deleted: gone from PC8 and the partner's Gallery; no console errors, no failed calls \| 390: ok empty "Enter the reason."; ok 513 characters "Use up to 512 characters."; ok deleted: gone from PC8 and the partner's Gallery; no console errors, no failed calls

### TC-GAL-08 history

- 2026-11-14 NOT RUN: Phase 5 (needs the package form pickers).
- 2026-11-14 PASS: 1366: approved 4 [ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 4; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs  \| 390: approved 5 [ct_Gal Copy 1366, ct_Galb, ct_GalReview, Corbett Elephant Camp, Saccharum Safari Lodge] = offered 5; draft or waiting-only galleries [Bandhavgarh Zones, Jhalana Hills] not offered true; offered from 3 parks (any park); errs .
- 2026-11-16 PASS (current): ok Basic picker offers approved galleries of any park (Kanha, Corbett) and not the draft; no console errors, no failed calls \| 390: ok Basic picker offers approved galleries of any park (Kanha, Corbett) and not the draft; no console errors, no failed calls
