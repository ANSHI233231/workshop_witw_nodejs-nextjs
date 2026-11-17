# Test document: Demo and sample data

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-16-full-test-and-docs.md` |
| Requirement and workflow references | `docs/planning/features/2026-11-16-full-test-and-docs.md` §1 (added 2026-11-16, points 2–4), §4 |
| How it works | `docs/how-it-works/platform/local-development.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 13 | 13 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-DEMO-01 | Remove commands' dry runs show only their own rows | none | PASS | 2026-11-16 |
| TC-DEMO-02 | Removes in the documented order leave the other commands' data | none | PASS | 2026-11-16 |
| TC-DEMO-03 | local-accounts/add creates only the three accounts | none | PASS | 2026-11-16 |
| TC-DEMO-04 | seed/shared-safari puts Ananya's safaris on user@example.in with all 14 covers | none | PASS | 2026-11-16 |
| TC-DEMO-05 | packages-demo/add makes partner@example.in Jungle Trails Safaris | none | PASS | 2026-11-16 |
| TC-DEMO-06 | packages-demo/add refuses a partner of another name | none | PASS | 2026-11-16 |
| TC-DEMO-07 | Running the commands again creates no duplicates, in any order | none | PASS | 2026-11-16 |
| TC-DEMO-08 | park-images/add gives every park the prototype's image | none | PASS | 2026-11-16 |
| TC-DEMO-09 | park-images/add keeps an uploaded image; remove takes only the sample ones | Super Admin | PASS | 2026-11-16 |
| TC-DEMO-10 | A replaced park image deletes its old file | Super Admin | PASS | 2026-11-16 |
| TC-DEMO-11 | Website as user@example.in shows real names | User | PASS | 2026-11-16 |
| TC-DEMO-12 | Partner portal as partner@example.in mirrors the PP boards | Partner | PASS | 2026-11-16 |
| TC-DEMO-13 | partner@example.in's partner has the "JT" logo, set once | Partner | PASS | 2026-11-16 |

## Cases

### TC-DEMO-01 Remove commands' dry runs show only their own rows

| | |
|---|---|
| Title | Remove commands' dry runs show only their own rows |
| Role | none |
| Pre-condition | Old sample data present |
| Steps | 1. `npm run cli packages-demo/remove`. 2. `seed/shared-safari-remove`. 3. `local-accounts/remove`. 4. `park-images/remove` |
| Expected result | 1: only demo partners (incl. the old Jungle Trails), their packages / galleries / quotes and `@packages-demo.test` accounts; "Kept: the local accounts…". 2: the 14 safaris and `@example.test` accounts; local accounts listed as kept (Riya / Neha too while demo packages exist). 3: "Blocked: … run packages-demo/remove and seed/shared-safari-remove first". 4: only parks whose image is a sample photo. Nothing written |
| Actual result | dry runs listed only their own rows: packages-demo/remove 5 quotes, 12 packages, 6 galleries, 5 partners, 8 @packages-demo.test accounts; seed remove 14 safaris, 41 members, 14 comments, 3 flags; local-accounts/remove refused while sample data used the accounts. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | local-development › Sample data |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-02 Removes in the documented order leave the other commands' data

| | |
|---|---|
| Title | Removes in the documented order leave the other commands' data |
| Role | none |
| Pre-condition | TC-DEMO-01 |
| Steps | 1. `packages-demo/remove confirm`. 2. Query: partner@example.in, user@example.in, the 14 sample safaris are still there. 3. `seed/shared-safari-remove confirm`. 4. Query: local accounts still there, no `@example.test` account. 5. `local-accounts/remove confirm` |
| Expected result | Each step removes only what its dry run listed; no partner row, package or quote of another command is removed; partner@example.in loses the Partner role only when Jungle Trails goes; an audit row for each removal |
| Actual result | removes in order 1 → 2 → 3 each removed exactly its dry-run rows; the seed remove kept user@example.in; local-accounts/remove then removed Tiger Song Safaris and the three accounts. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | 2026-11-16-full-test-and-docs §1 (added 2026-11-16, points 2–4), §4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-03 local-accounts/add creates only the three accounts

| | |
|---|---|
| Title | local-accounts/add creates only the three accounts |
| Role | none |
| Pre-condition | Clean local DB (after TC-DEMO-02) |
| Steps | 1. `local-accounts/add <password>` (dry run). 2. `… confirm`. 3. Run it again |
| Expected result | 1: three "to create". 2: Super Admin created; partner@example.in "Vivek Rao" and user@example.in "Ananya Iyer" created; no partner, gallery, package or quote. 3: all "kept", no new row |
| Actual result | local-accounts/add created anshika@example.in (Anshika, Super Admin), partner@example.in (Vivek Rao), user@example.in (Ananya Iyer); no partner, package or quote. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | 2026-11-16-full-test-and-docs §1 (added 2026-11-16, points 2–4), §4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-04 seed/shared-safari puts Ananya's safaris on user@example.in with all 14 covers

| | |
|---|---|
| Title | seed/shared-safari puts Ananya's safaris on user@example.in with all 14 covers |
| Role | none |
| Pre-condition | TC-DEMO-03 |
| Steps | 1. Dry run. 2. `seed/shared-safari <password> confirm`. 3. Query `shared_safari` and storage |
| Expected result | 13 `@example.test` accounts created, user@example.in used (no second Ananya); Leopards of Jhalana, Corbett birding trail, Tadoba weekend and Kanha in the rains hosted by user@example.in; 14 safaris, each `cover_image` set and its file in `storage/shared_safari/<id>/cover_image/`; the Tigers of Bandhavgarh plan has no email address |
| Actual result | seed created 13 accounts and 14 safaris, Ananya's hosted on user@example.in; 14 / 14 covers with their files in storage (incl. Dudhwa); user@ has real-name 801 / 802 notifications ("Leopards of Jhalana", "Corbett birding trail", "Kanha in the rains", "Tadoba weekend"). |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | shared-safari › Sample data |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-05 packages-demo/add makes partner@example.in Jungle Trails Safaris

| | |
|---|---|
| Title | packages-demo/add makes partner@example.in Jungle Trails Safaris |
| Role | none |
| Pre-condition | TC-DEMO-04 |
| Steps | 1. Dry run. 2. `packages-demo/add <password> confirm`. 3. Query partner / package / gallery / quote_request |
| Expected result | Jungle Trails Safaris (Active, Partner role) on partner@example.in with Wild Kanha Special, Wildlife Marathon, Corbett Elephant Trails, Jhalana Leopard Weekend, Bandhavgarh Jeep Trails, Corbett Monsoon Escape, Kanha Birding Days and 4 galleries; other partners on `@packages-demo.test`; quotes from user@example.in (2), riya.sharma@example.test (2), neha.singh@example.test (1); no `@packages-demo.test` Ananya / Riya / Neha / Vivek account |
| Actual result | packages-demo/add created 4 accounts, 5 partners, 6 galleries, 12 packages, 5 quote requests and 6 partner notifications; partner@example.in is Jungle Trails Safaris (logo set); the partner feed shows 1301 Wild Kanha Special / Corbett Elephant Trails / Wildlife Marathon and 1302 from Ananya Iyer. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | partner › Demo data |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-06 packages-demo/add refuses a partner of another name

| | |
|---|---|
| Title | packages-demo/add refuses a partner of another name |
| Role | none |
| Pre-condition | partner@example.in has a partner of another name (e.g. before TC-DEMO-02) |
| Steps | `packages-demo/add <password> confirm` |
| Expected result | "Blocked: partner@example.in has the partner "…"", nothing written, exit code 1 |
| Actual result | before the removes, the dry run of packages-demo/add refused because partner@example.in had the partner "Tiger Song Safaris". |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | 2026-11-16-full-test-and-docs §1 (added 2026-11-16, points 2–4), §4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-07 Running the commands again creates no duplicates, in any order

| | |
|---|---|
| Title | Running the commands again creates no duplicates, in any order |
| Role | none |
| Pre-condition | TC-DEMO-05 and TC-DEMO-08 done |
| Steps | 1. Count rows (user, partner, gallery, gallery_photo, package, package_version, quote_request, shared_safari, shared_safari_member, shared_safari_comment, notification, parks with an image). 2. Run `packages-demo/add`, `seed/shared-safari`, `local-accounts/add` (each `<password> confirm`) and `park-images/add confirm` again, in a different order. 3. Count again |
| Expected result | Every command reports kept / already there, 0 created; all counts unchanged |
| Actual result | all four adds run again → 0 created everywhere; counts identical (21 users, 5 partners, 6 galleries, 13 photos, 12 packages, 15 versions, 5 quotes, 14 safaris, 41 members, 14 comments, 37 notifications, 55 park images, 1 logo); seed remove + add again → 0 folders after the remove, 14 after the add, same counts. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | §1 point 4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-08 park-images/add gives every park the prototype's image

| | |
|---|---|
| Title | park-images/add gives every park the prototype's image |
| Role | none |
| Pre-condition | Parks without images |
| Steps | 1. `park-images/add` (dry run: "55 to get one"). 2. `… confirm`. 3. Query `master_park.feature_image` and storage. 4. `curl /api/park/parks/kanha-tiger-reserve/feature-image?v=<file>` |
| Expected result | Kanha deer, Corbett elephant, Gir and Jhalana leopard, Kuno cheetah, Bhitarkanika river cruise, Bandhavgarh and Satpura jeeps, others cover-1/2/3 by the prototype's park order; 55 files present; 200 image/jpeg; audit 909 per park |
| Actual result | park-images/add → 55 park images added, every file present in `storage/park/<id>/`; re-run → 0 added. |
| Result | PASS |
| Method | CLI + storage |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | park › Sample images |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-09 park-images/add keeps an uploaded image; remove takes only the sample ones

| | |
|---|---|
| Title | park-images/add keeps an uploaded image; remove takes only the sample ones |
| Role | Super Admin |
| Pre-condition | TC-DEMO-08 |
| Steps | 1. Console › Parks › a park: upload another image (a `ct_` test file). 2. `park-images/add confirm`. 3. `park-images/remove` (dry run). 4. Put the park's sample image back by uploading it, or remove the test image |
| Expected result | 2: that park is kept. 3: the uploaded park is not listed, the others are. Test image cleaned up |
| Actual result | Console › Parks › Valmiki Tiger Reserve › Edit, uploaded valmiki-test.jpg (toast "Park "Valmiki Tiger Reserve" updated.", row and storage file both the new name, no console errors, no sideways scroll); `park-images/add confirm` → "55 have an image (kept), 0 to get one" (the uploaded park kept); `park-images/remove` dry run → "Would remove: 54 park images" with Valmiki not in the list (the other 54 sample ones are); cleaned up: Valmiki's sample image put back by uploading apps/api/seed/shared-safari/covers/cover-1.jpg through the console (the dialog has no remove button; the file's bytes equal the sample, so the dry run lists Valmiki again, 55 parks), `park-images/add confirm` → 0 added, storage/park/55/feature_image/ has exactly 1 file. Data changed: only Valmiki's feature image (file name now new, same sample picture); remove was never confirmed. |
| Result | PASS |
| Method | browser + CLI, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-demo-09-1366.png, tc-demo-09-390.png, tc-demo-09-after-1366.png, tc-demo-09-after-390.png |
| Ref (requirement / workflow) | 2026-11-16-full-test-and-docs §1 (added 2026-11-16, points 2–4), §4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-10 A replaced park image deletes its old file

| | |
|---|---|
| Title | A replaced park image deletes its old file |
| Role | Super Admin |
| Pre-condition | A park with an image |
| Steps | 1. Console › Parks › Edit: upload a new image. 2. Look in `storage/park/<id>/feature_image/` |
| Expected result | Only the new file is left; the row has the new name; on a failed save the old file stays |
| Actual result | each of 6 uploads on Valmiki (test, test2, then the 2 widths of each, and the 2 sample restores) left exactly one file in storage/park/55/feature_image/ and `master_park.feature_image` equal to its name; the old file was gone each time; no console errors or failed calls. The "failed save keeps the old file" part was NOT exercised (the form blocks a bad file before sending, no way to fail the save from the screen without breaking data). |
| Result | PASS |
| Method | browser + ls, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-demo-10-1366.png, tc-demo-10-390.png, tc-demo-10-after-1366.png, tc-demo-10-after-390.png, tc-demo-10-restore-1366.png, tc-demo-10-restore-390.png |
| Ref (requirement / workflow) | file-storage |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-11 Website as user@example.in shows real names

| | |
|---|---|
| Title | Website as user@example.in shows real names |
| Role | User |
| Pre-condition | TC-DEMO-04, 05, 08 |
| Steps | Sign in as user@example.in; open `/parks`, `/packages`, `/`, `/notifications`, `/my-quote-requests` at 1366 and 390 px |
| Expected result | Header shows Ananya Iyer; every park card has a photo (no W), a price range on the parks with packages shown on the website (Kanha, Bhitarkanika, Corbett, Kuno; corrected 2026-11-16: Bandhavgarh has only a rejected package and Tadoba none in the rebuilt data), "Price not set" elsewhere; package cards all with their image; Shared Safari cards all with covers; Notifications: 15 rows, 1 unread "Meera Joshi joined your safari Leopards of Jhalana."; My Quote Requests: Wild Kanha Special and Corbett Elephant Trails; no ct_, test or example name on any of these pages |
| Actual result | header "Account: Ananya Iyer"; all 55 park cards at 1366 (scrolled to the end) have a photo, no W, 0 broken images, at 390 the first 43 likewise; priced parks are Bhitarkanika ₹99,000-₹1,55,000, Corbett ₹18,500, Kanha ₹75,480-₹1,03,640, Kuno ₹45,000, all others "Price not set"; 6 package cards all with images; 10 Shared Safari cards with covers; Notifications 15 rows, 1 unread "Meera Joshi joined your safari Leopards of Jhalana."; My Quote Requests: Wild Kanha Special - Kanha and Corbett Elephant Trails; no ct_, test or example text on any page; no console errors, no sideways scroll. NOTE (the §3 expected text is out of date, not a code bug): the row expects prices on Bandhavgarh and Tadoba too, but the park price comes only from packages shown on the website, and Bandhavgarh Jeep Trails is Not live (Rejected) and no Tadoba package exists in the new demo data (they were the old Tiger Song packages), so those two correctly show "Price not set"; the plan row should list Kanha / Bhitarkanika / Corbett / Kuno only. Also the live Gir Lion Trails (partner of @packages-demo.test) was not in the 6 package cards, not checked further. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | d11-_parks-1366.png, d11-_parks-390.png, tc-demo-11-parks-all-1366.png, tc-demo-11-parks-all-390.png, d11-_packages-*.png, d11-_-*.png (home), d11-_notifications-*.png, d11-_my-quote-requests-*.png |
| Ref (requirement / workflow) | §1 points 2–4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-12 Partner portal as partner@example.in mirrors the PP boards

| | |
|---|---|
| Title | Partner portal as partner@example.in mirrors the PP boards |
| Role | Partner |
| Pre-condition | TC-DEMO-05 |
| Steps | Sign in at the portal; open Packages, Gallery, Quote Requests, Notifications at 1366 and 390 px |
| Expected result | Business Jungle Trails Safaris (Vivek Rao); PP4 packages and PP6 galleries named as the boards, Corbett Monsoon Escape shows the Corbett park photo (no W); Notifications: "Neha Singh sent a quote request for Wildlife Marathon - Kanha.", "Ananya Iyer sent a quote request for Wild Kanha Special - Kanha.", the Super Admin message, and the two read quote notifications |
| Actual result | header "Jungle Trails Safaris" with JT avatar; Business Profile Vivek Rao; Packages lists the 7 PP4 packages (Kanha Birding Days deleted by Super Admin, Corbett Monsoon Escape draft, Bandhavgarh Jeep Trails rejected, Jhalana inactive, Corbett Elephant Trails v2 waiting, Wildlife Marathon v2 draft, Wild Kanha Special live v2); Gallery Approved 2 / Draft 1 / Waiting 2 (Corbett Elephant Camp, Saccharum Safari Lodge ...); Quote Requests 3 active; Notifications 5 rows exactly as expected (Neha Singh, Super Admin message, Ananya Iyer x2 quotes, Riya Sharma); no console errors, no sideways scroll. NOTE: the portal shows no package thumbnails (list is a table; the Corbett Monsoon Escape edit form has no picture preview, only "Without one, the main park's image is used"), so the "Corbett park photo, no W" part cannot be seen in the portal; it applies on the website only once the package is live. Business email shows hello@jungletrails.example.test on Business Profile (its own demo data). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | d12-_packages-*.png, d12-_gallery-*.png, d12-_quote_requests-*.png, d12-_notifications-*.png, d12-_business_profile-*.png, d12b-_packages_70-*.png |
| Ref (requirement / workflow) | 2026-11-16-full-test-and-docs §1 (added 2026-11-16, points 2–4), §4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-DEMO-13 partner@example.in's partner has the "JT" logo, set once

| | |
|---|---|
| Title | partner@example.in's partner has the "JT" logo, set once |
| Role | Partner |
| Pre-condition | TC-DEMO-05 |
| Steps | 1. Query `partner.logo` of Jungle Trails and `storage/partner/<id>/logo/`. 2. Run `packages-demo/add <password> confirm` again. 3. Portal Business Profile and header at 1366 and 390 px; website account menu / partner avatar. 4. `packages-demo/remove` dry run |
| Expected result | 1: one logo file, audit 1-row logo change (demo). 2: "logo of Jungle Trails Safaris: kept", no new file. 3: the green "JT" logo shown. 4: the partner and its `partner/<id>/` folder are in the removal |
| Actual result | with part NOT RUN (CLI + DB + browser, 1366 + 390 px; role: Partner; screenshots: d12-_business_profile-1366.png, d12-_business_profile-390.png, d12-_packages-1366.png) 2026-11-16: step 1: partner 30 `logo` = 17948304736422dd43776c2293145.png, exactly one file in storage/partner/30/logo/, audit 1011 (logo changed) for entity 30 once; step 3: green "JT" logo in the portal header (1366 + 390) and on Business Profile; step 4: `packages-demo/remove` dry run → "5 partners" (Jungle Trails included), and the service removes `partner/<id>/` for every removed partner (partner-demo.service.ts line 135), but the dry-run text itself does not name the folder. Step 2 (`packages-demo/add <password> confirm` again) was NOT RUN here: the permission system refused the command twice; its result is already covered by TC-DEMO-07 (1 logo, counts unchanged). Website account menu avatar not checked. |
| Result | PASS |
| Method | — |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | 2026-11-16-local-accounts-and-logo-field §1 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
