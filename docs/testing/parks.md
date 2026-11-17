# Test document: Parks

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md`, `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §3, §11.5; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §10 |
| How it works | `docs/how-it-works/modules/park/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 13 | 13 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PARK-01 | Parks list | Super Admin | PASS | 2026-11-16 |
| TC-PARK-02 | Add Park | Super Admin | PASS | 2026-11-16 |
| TC-PARK-03 | Park errors | Super Admin | PASS | 2026-11-16 |
| TC-PARK-04 | Edit and status | Super Admin | PASS | 2026-11-16 |
| TC-PARK-05 | Park detail | Super Admin | PASS | 2026-11-16 |
| TC-PARK-06 | Edit a safari whose park is inactive | User (host) | PASS | 2026-11-16 |
| TC-PARK-07 | Park form | Super Admin | PASS | 2026-11-16 |
| TC-PARK-08 | Average price | Guest, Super Admin | PASS | 2026-11-16 |
| TC-PARK-09 | Parks list | Guest | PASS | 2026-11-16 |
| TC-PARK-10 | Park page Overview | Guest | PASS | 2026-11-16 |
| TC-PARK-11 | Park page Packages | Guest | PASS | 2026-11-16 |
| TC-PARK-12 | Park page Shared Safaris | Guest, User (ct_ss_5) | PASS | 2026-11-16 |
| TC-FIX-09 | A park with one price shows a single amount | visitor/partner | PASS | 2026-11-16 |

## Cases

### TC-PARK-01 Parks list

| | |
|---|---|
| Title | Parks list |
| Role | Super Admin |
| Pre-condition | console |
| Steps | open Parks; search, Region, Status, Clear filters; page 2 |
| Expected result | 55 rows, S.No, alternate rows, 20 per page; Upcoming safaris = Active + Seat full starting today or later |
| Actual result | Parks list: Showing 1–20 of 55/56 (other builders add ct parks), S.No, 20 per page, page 2 starts at 21; search by park name (Bandhavgarh = 1), Region and Status filters, Clear filters; the sample row Bandhavgarh shows ₹4,000–60,000 (calculated average price) and Upcoming safaris 1 = the API count (Active + Seat full starting today or later); cards on 390 px; no console errors (the 409 on a duplicate name is expected). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-01-1366.png, tc-park-01-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-02 Add Park

| | |
|---|---|
| Title | Add Park |
| Role | Super Admin |
| Pre-condition | console |
| Steps | add with name, region, prices |
| Expected result | Active; shows at once in the Organise form and the W1 Safari Park filter |
| Actual result | Add Park with name, region, description, coordinates and a PNG: toast "Park "ct_ss_park_<w>" added.", Active, in the active park list used by the Organise form and the W1 Safari Park filter at once; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-02-1366.png, tc-park-02-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-03 Park errors

| | |
|---|---|
| Title | Park errors |
| Role | Super Admin |
| Pre-condition | console |
| Steps | empty name; existing name; no region; max < min; one price only; over ₹10,00,000 |
| Expected result | the six workflow messages (2026-11-16: the price steps are superseded, Console › Parks has no price fields since the Packages workflow §10; name and region messages remain) |
| Actual result | empty name and region -> "Enter the park name." / "Select a region."; an existing name -> "A park with this name already exists." (API 409). The price messages of the original case no longer apply: the park has no price fields since 14 Nov (average price is calculated, TC-PARK-07 / 08); no console errors apart from the expected 409. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-07-errors-1366.png, tc-park-07-errors-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-04 Edit and status

| | |
|---|---|
| Title | Edit and status |
| Role | Super Admin |
| Pre-condition | console |
| Steps | edit name and prices; switch Inactive in Edit; Make active / inactive icon |
| Expected result | saved; inactive gone from the Organise form and the filter; its safaris unchanged |
| Actual result | row Edit renames the park; the row icon "Make inactive" and the Edit dialog status switch both make it Inactive (status 2); it leaves the Organise park list and the W1 Safari Park filter; its safari stays Active with the same park; "Make active" brings it back; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-04-1366.png, tc-park-04-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-05 Park detail

| | |
|---|---|
| Title | Park detail |
| Role | Super Admin |
| Pre-condition | console |
| Steps | open a park |
| Expected result | all fields, upcoming shared safaris, Edit, Make active / inactive |
| Actual result | park detail shows Region, Slug, Average safari price, Location, Feature image, Website, Description, "Upcoming shared safaris (1)" with the safari row, plus Edit and Make active / inactive; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-05-1366.png, tc-park-05-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-06 Edit a safari whose park is inactive

| | |
|---|---|
| Title | Edit a safari whose park is inactive |
| Role | User (host) |
| Pre-condition | a safari in a park made inactive |
| Steps | host opens Edit, saves |
| Expected result | the current park shown; "This park is no longer active. Select an active park."; saves after picking an active one |
| Actual result | safari in a park made inactive: host Edit shows the current park and Next gives "This park is no longer active. Select an active park."; after choosing an active park the save works ("Safari updated."); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-06-1366.png, tc-park-06-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-07 Park form

| | |
|---|---|
| Title | Park form |
| Role | Super Admin |
| Pre-condition | console |
| Steps | C5 Add / C6 Edit: description 1,001; lat 91; one coordinate only; image WebP / over 250 KB; valid |
| Expected result | the board's messages; saved; image shown on C6 and P5 |
| Actual result | form: latitude 91 -> "Enter a latitude from -90 to 90."; longitude 181 -> "Enter a longitude from -180 to 180."; one coordinate only -> "Enter both latitude and longitude, or leave both empty."; WebP -> "Use a JPG, JPEG or PNG image."; 260 KB -> "Use an image up to 250 KB."; description 1,001: the textarea stops at 1,000 (maxlength) and the API answers 422 "Use up to 1,000 characters."; a valid form saves, the image shows on the detail and on the website Parks list; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-07-errors-1366.png, tc-park-07-errors-390.png, tc-park-07-p5-1366.png, tc-park-07-p5-390.png, tc-park-05-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-08 Average price

| | |
|---|---|
| Title | Average price |
| Role | Guest, Super Admin |
| Pre-condition | parks with and without packages |
| Steps | open C6, P5, P6 |
| Expected result | lowest – highest price per person of the park's shown packages; changes when a package is approved, made inactive or deleted; "Price not set" with none |
| Actual result | Bandhavgarh (4 shown packages): console list / detail, website P5 card and P6 banner all show ₹4,000 – ₹60,000 = the API avgSafariPriceMin / Max; a park without packages shows "Price not set" (P5, P6) and an empty price in the console. The part "changes when a package is approved, made inactive or deleted" was not run (packages belong to the Packages group and no package data may be changed here); no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-08-1366.png, tc-park-08-390.png, tc-park-08-p5-1366.png, tc-park-05-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-09 Parks list

| | |
|---|---|
| Title | Parks list |
| Role | Guest |
| Pre-condition | website |
| Steps | P5 (also via Plan Safari): search, region, Z–A, scroll |
| Expected result | active parks only; 12, then more |
| Actual result | Plan Safari opens /parks: 12 parks then "Showing 12 of 56 · more load as you scroll" and all load on scroll; inactive ct parks are absent; search (Bandhavgarh = 1), Region (8), Sort Z–A (Valmiki first); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-09-1366.png, tc-park-09-390.png, tc-park-09-za-1366.png, tc-park-09-za-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-10 Park page Overview

| | |
|---|---|
| Title | Park page Overview |
| Role | Guest |
| Pre-condition | park with location |
| Steps | P6 Overview |
| Expected result | description, map with pin, location, official website |
| Actual result | Bandhavgarh P6 Overview: banner with region and price, tabs Overview / Packages 4 / Shared Safaris 1, description, Leaflet map with a pin, Location and Official website rows; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-10-1366.png, tc-park-10-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-11 Park page Packages

| | |
|---|---|
| Title | Park page Packages |
| Role | Guest |
| Pre-condition | park with packages |
| Steps | P6 Packages: filters, sort |
| Expected result | that park's shown packages; no park or search filter |
| Actual result | ?tab=packages lists that park's 4 shown packages (390 px list seen) with the P1 filters (cost, duration, safaris, stay, features) and Sort, with no Park filter and no search box; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-11-1366.png, tc-park-11-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-12 Park page Shared Safaris

| | |
|---|---|
| Title | Park page Shared Safaris |
| Role | Guest, User (ct_ss_5) |
| Pre-condition | park with shared safaris |
| Steps | P6 Shared Safaris; Join / Leave |
| Expected result | the Shared Safari list's set for the park; Join / Leave as W1 |
| Actual result | ?tab=safaris lists the park's shared safaris with the W1 card (Bandhavgarh: Tigers of Bandhavgarh; ct park: ct_ss_fx_pkd); Join Safari -> Leave Safari with "You've joined this safari.", Leave gives "You've left this safari."; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-park-12-1366.png, tc-park-12-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-FIX-09 A park with one price shows a single amount

| | |
|---|---|
| Title | A park with one price shows a single amount |
| Role | visitor/partner |
| Pre-condition | Corbett has one package at 18,500 |
| Steps | 1. Open /parks. 2. Open the park page. |
| Expected result | "₹18,500 average safari price" on card and banner; a park with different prices still shows a range |
| Actual result | /parks Corbett card "₹18,500 average safari price"; the other priced park still "₹99,000 – ₹1,55,000 average safari price"; park page banner "North India · ₹18,500 average safari price"; console /parks row "₹18,500". |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-09-1366.png, tc-fix-09-390.png, tc-fix-09b-1366.png, tc-fix-09b-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PARK-01 history

- 2026-11-04 PASS: 55 parks, 20 per page, S.No, alternate rows (cards on phone), upcoming count 3 from six test safaris, search / region / status filters, Clear filters, page 2 "Showing 21–40 of 55".
- 2026-11-16 PASS (current): Parks list: Showing 1–20 of 55/56 (other builders add ct parks), S.No, 20 per page, page 2 starts at 21; search by park name (Bandhavgarh = 1), Region and Status filters, Clear filters; the sample row Bandhavgarh shows ₹4,000–60,000 (calculated average price) and Upcoming safaris 1 = the API count (Active + Seat full starting today or later); cards on 390 px; no console errors (the 409 on a duplicate name is expected).

### TC-PARK-02 history

- 2026-11-04 PASS: Add park without status switch, toast, Active with the price range, at once in `/api/park/active`.
- 2026-11-16 PASS (current): Add Park with name, region, description, coordinates and a PNG: toast "Park "ct_ss_park_<w>" added.", Active, in the active park list used by the Organise form and the W1 Safari Park filter at once; no console errors.

### TC-PARK-03 history

- 2026-11-04 PASS: the six park messages (duplicate name from the API, case-insensitive).
- 2026-11-16 PASS (current): empty name and region -> "Enter the park name." / "Select a region."; an existing name -> "A park with this name already exists." (API 409). The price messages of the original case no longer apply: the park has no price fields since 14 Nov (average price is calculated, TC-PARK-07 / 08); no console errors apart from the expected 409.

### TC-PARK-04 history

- 2026-11-04 PASS: Edit prefilled, inactive leaves `/api/park/active`, icon actions with tooltips and toasts, a park's safaris unchanged when it is made inactive.
- 2026-11-16 PASS (current): row Edit renames the park; the row icon "Make inactive" and the Edit dialog status switch both make it Inactive (status 2); it leaves the Organise park list and the W1 Safari Park filter; its safari stays Active with the same park; "Make active" brings it back; no console errors.

### TC-PARK-05 history

- 2026-11-04 PASS: detail with all fields and "Upcoming shared safaris (3)", Edit, Make inactive / active.
- 2026-11-16 PASS (current): park detail shows Region, Slug, Average safari price, Location, Feature image, Website, Description, "Upcoming shared safaris (1)" with the safari row, plus Edit and Make active / inactive; no console errors.

### TC-PARK-06 history

- 2026-11-10 PASS: Edit shows the inactive park; "This park is no longer active. Select an active park."; saves after picking an active one (`PARK_INACTIVE`).
- 2026-11-16 PASS (current): safari in a park made inactive: host Edit shows the current park and Next gives "This park is no longer active. Select an active park."; after choosing an active park the save works ("Safari updated."); no console errors.

### TC-PARK-07 history

- 2026-11-14 PASS: Add dialog has no min / max; description 1,001 → "Use up to 1,000 characters.", latitude 91, one coordinate only, longitude 181, WebP and 750 KB image refused with the board's messages; edit of park 59 saved (toast), C6 shows the image and description; the park's image is served publicly (200 `image/png`) for P5.
- 2026-11-16 PASS (current): form: latitude 91 -> "Enter a latitude from -90 to 90."; longitude 181 -> "Enter a longitude from -180 to 180."; one coordinate only -> "Enter both latitude and longitude, or leave both empty."; WebP -> "Use a JPG, JPEG or PNG image."; 260 KB -> "Use an image up to 250 KB."; description 1,001: the textarea stops at 1,000 (maxlength) and the API answers 422 "Use up to 1,000 characters."; a valid form saves, the image shows on the detail and on the website Parks list; no console errors.

### TC-PARK-08 history

- 2026-11-14 PASS: C5 / C6 / P5 / P6 show the calculated range ("Price not set" / "–" without packages): Corbett ₹18,500 – ₹18,500; Kanha ₹10,000 – ₹1,03,640 from 5 packages, equal to the API's package list for that park (it was ₹75,480 – ₹1,03,640 before the Phase 5 test packages went live, so the range follows the shown packages).
- 2026-11-16 PASS (current): Bandhavgarh (4 shown packages): console list / detail, website P5 card and P6 banner all show ₹4,000 – ₹60,000 = the API avgSafariPriceMin / Max; a park without packages shows "Price not set" (P5, P6) and an empty price in the console. The part "changes when a package is approved, made inactive or deleted" was not run (packages belong to the Packages group and no package data may be changed here); no console errors.

### TC-PARK-09 history

- 2026-11-14 PASS: Plan Safari opens `/parks`, 12 cards then more on scroll, search, region West (West India only), Z–A (Valmiki first), "No parks match your search.", Clear filters.
- 2026-11-14 PASS: `/parks` 12 cards, more on scroll (24 / 44), search "tiger" right after a scroll: 12 cards, none without "tiger"; no console errors, failed calls or sideways scroll. **TC-PKG-19 PASS (re-run)**: `/packages` 9 cards. **TC-PARK-11 PASS (re-run)**: Kanha `?tab=packages` 3 cards (the Phase 5 builder's test packages changed the set since the first run).
- 2026-11-16 PASS (current): Plan Safari opens /parks: 12 parks then "Showing 12 of 56 · more load as you scroll" and all load on scroll; inactive ct parks are absent; search (Bandhavgarh = 1), Region (8), Sort Z–A (Valmiki first); no console errors.

### TC-PARK-10 history

- 2026-11-14 PASS: Corbett page: hero with region and price, description, Leaflet map with pin and coordinates (OpenStreetMap tiles loaded), Location and Official website link; an unknown slug gives the 404 page.
- 2026-11-16 PASS (current): Bandhavgarh P6 Overview: banner with region and price, tabs Overview / Packages 4 / Shared Safaris 1, description, Leaflet map with a pin, Location and Official website rows; no console errors.

### TC-PARK-11 history

- 2026-11-14 PASS: the Packages tab lists only that park's packages (Corbett 1; Kanha 5 with `?tab=packages`), no search box and no Park filter, sort works, count in the tab.
- 2026-11-16 PASS (current): ?tab=packages lists that park's 4 shown packages (390 px list seen) with the P1 filters (cost, duration, safaris, stay, features) and Sort, with no Park filter and no search box; no console errors.

### TC-PARK-12 history

- 2026-11-14 PASS: Corbett Shared Safaris tab shows W1's card (Corbett birding trail, button "Seat Full"), count in the tab; Join / Leave were not clicked (the card component is W1's, unchanged; clicking would write shared-safari rows, not allowed in this run).
- 2026-11-14 PASS: as a guest, Kaziranga `?tab=safaris` › Join Safari goes to `/login` (as W1); signed up a new user `ct_park12_207988@example.com` through `/sign-up` (→ `/`), then on `/parks/kaziranga-tiger-reserve?tab=safaris` Join Safari → toast "You've joined this safari.", button Leave Safari, "2 joined"; after a reload the tab stays Shared Safaris and the button is still Leave Safari; Leave Safari → "You've left this safari.", button Join Safari; the same at 390 px. Only console errors: the guest's signed-out `/api/auth/refresh` 401s. No sideways scroll. DB: `shared_safari_member` 164 (user 95, safari 107) status 2 left.
- 2026-11-16 PASS (current): ?tab=safaris lists the park's shared safaris with the W1 card (Bandhavgarh: Tigers of Bandhavgarh; ct park: ct_ss_fx_pkd); Join Safari -> Leave Safari with "You've joined this safari.", Leave gives "You've left this safari."; no console errors.
