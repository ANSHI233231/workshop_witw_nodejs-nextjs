# Test document: Parks

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md`, `docs/planning/features/2026-11-12-safari-packages.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §3, §11.5; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §10 |
| How it works | `docs/how-it-works/modules/park/README.md` |
| Latest run | 2026-11-14 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 12 | 12 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PARK-01 | Parks list | — | PASS | 2026-11-04 |
| TC-PARK-02 | Add Park | — | PASS | 2026-11-04 |
| TC-PARK-03 | Park errors | — | PASS | 2026-11-04 |
| TC-PARK-04 | Edit and status | — | PASS | 2026-11-04 |
| TC-PARK-05 | Park detail | — | PASS | 2026-11-04 |
| TC-PARK-06 | Edit a safari whose park is inactive | — | PASS | 2026-11-10 |
| TC-PARK-07 | Park form | — | PASS | 2026-11-14 |
| TC-PARK-08 | Average price | — | PASS | 2026-11-14 |
| TC-PARK-09 | Parks list | — | PASS | 2026-11-14 |
| TC-PARK-10 | Park page Overview | — | PASS | 2026-11-14 |
| TC-PARK-11 | Park page Packages | — | PASS | 2026-11-14 |
| TC-PARK-12 | Park page Shared Safaris | — | PASS | 2026-11-14 |

## Cases

### TC-PARK-01 Parks list

| | |
|---|---|
| Title | Parks list |
| Role | — |
| Pre-condition | console |
| Steps | open Parks; search, Region, Status, Clear filters; page 2 |
| Expected result | 55 rows, S.No, alternate rows, 20 per page; Upcoming safaris = Active + Seat full starting today or later |
| Actual result | 55 parks, 20 per page, S.No, alternate rows (cards on phone), upcoming count 3 from six test safaris, search / region / status filters, Clear filters, page 2 "Showing 21–40 of 55". |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-02 Add Park

| | |
|---|---|
| Title | Add Park |
| Role | — |
| Pre-condition | console |
| Steps | add with name, region, prices |
| Expected result | Active; shows at once in the Organise form and the W1 Safari Park filter |
| Actual result | Add park without status switch, toast, Active with the price range, at once in `/api/park/active`. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-03 Park errors

| | |
|---|---|
| Title | Park errors |
| Role | — |
| Pre-condition | console |
| Steps | empty name; existing name; no region; max < min; one price only; over ₹10,00,000 |
| Expected result | the six workflow messages |
| Actual result | the six park messages (duplicate name from the API, case-insensitive). |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-04 Edit and status

| | |
|---|---|
| Title | Edit and status |
| Role | — |
| Pre-condition | console |
| Steps | edit name and prices; switch Inactive in Edit; Make active / inactive icon |
| Expected result | saved; inactive gone from the Organise form and the filter; its safaris unchanged |
| Actual result | Edit prefilled, inactive leaves `/api/park/active`, icon actions with tooltips and toasts, a park's safaris unchanged when it is made inactive. |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-05 Park detail

| | |
|---|---|
| Title | Park detail |
| Role | — |
| Pre-condition | console |
| Steps | open a park |
| Expected result | all fields, upcoming shared safaris, Edit, Make active / inactive |
| Actual result | detail with all fields and "Upcoming shared safaris (3)", Edit, Make inactive / active. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-06 Edit a safari whose park is inactive

| | |
|---|---|
| Title | Edit a safari whose park is inactive |
| Role | — |
| Pre-condition | a safari in a park made inactive |
| Steps | host opens Edit, saves |
| Expected result | the current park shown; "This park is no longer active. Select an active park."; saves after picking an active one |
| Actual result | Edit shows the inactive park; "This park is no longer active. Select an active park."; saves after picking an active one (`PARK_INACTIVE`). |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PARK-07 Park form

| | |
|---|---|
| Title | Park form |
| Role | — |
| Pre-condition | console |
| Steps | C5 Add / C6 Edit: description 1,001; lat 91; one coordinate only; image WebP / over 250 KB; valid |
| Expected result | the board's messages; saved; image shown on C6 and P5 |
| Actual result | Add dialog has no min / max; description 1,001 → "Use up to 1,000 characters.", latitude 91, one coordinate only, longitude 181, WebP and 750 KB image refused with the board's messages; edit of park 59 saved (toast), C6 shows the image and description; the park's image is served publicly (200 `image/png`) for P5. |
| Result | PASS |
| Method | browser, 1366 + 390 px, manage |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-08 Average price

| | |
|---|---|
| Title | Average price |
| Role | — |
| Pre-condition | parks with and without packages |
| Steps | open C6, P5, P6 |
| Expected result | lowest – highest price per person of the park's shown packages; changes when a package is approved, made inactive or deleted; "Price not set" with none |
| Actual result | C5 / C6 / P5 / P6 show the calculated range ("Price not set" / "–" without packages): Corbett ₹18,500 – ₹18,500; Kanha ₹10,000 – ₹1,03,640 from 5 packages, equal to the API's package list for that park (it was ₹75,480 – ₹1,03,640 before the Phase 5 test packages went live, so the range follows the shown packages). |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-09 Parks list

| | |
|---|---|
| Title | Parks list |
| Role | — |
| Pre-condition | website |
| Steps | P5 (also via Plan Safari): search, region, Z–A, scroll |
| Expected result | active parks only; 12, then more |
| Actual result | `/parks` 12 cards, more on scroll (24 / 44), search "tiger" right after a scroll: 12 cards, none without "tiger"; no console errors, failed calls or sideways scroll. **TC-PKG-19 PASS (re-run)**: `/packages` 9 cards. **TC-PARK-11 PASS (re-run)**: Kanha `?tab=packages` 3 cards (the Phase 5 builder's test packages changed the set since the first run). |
| Result | PASS |
| Method | browser, 1366 + 390 px, re-run after the fix |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-10 Park page Overview

| | |
|---|---|
| Title | Park page Overview |
| Role | — |
| Pre-condition | park with location |
| Steps | P6 Overview |
| Expected result | description, map with pin, location, official website |
| Actual result | Corbett page: hero with region and price, description, Leaflet map with pin and coordinates (OpenStreetMap tiles loaded), Location and Official website link; an unknown slug gives the 404 page. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-11 Park page Packages

| | |
|---|---|
| Title | Park page Packages |
| Role | — |
| Pre-condition | park with packages |
| Steps | P6 Packages: filters, sort |
| Expected result | that park's shown packages; no park or search filter |
| Actual result | the Packages tab lists only that park's packages (Corbett 1; Kanha 5 with `?tab=packages`), no search box and no Park filter, sort works, count in the tab. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PARK-12 Park page Shared Safaris

| | |
|---|---|
| Title | Park page Shared Safaris |
| Role | — |
| Pre-condition | park with shared safaris |
| Steps | P6 Shared Safaris; Join / Leave |
| Expected result | the Shared Safari list's set for the park; Join / Leave as W1 |
| Actual result | as a guest, Kaziranga `?tab=safaris` › Join Safari goes to `/login` (as W1); signed up a new user `ct_park12_207988@example.com` through `/sign-up` (→ `/`), then on `/parks/kaziranga-tiger-reserve?tab=safaris` Join Safari → toast "You've joined this safari.", button Leave Safari, "2 joined"; after a reload the tab stays Shared Safaris and the button is still Leave Safari; Leave Safari → "You've left this safari.", button Join Safari; the same at 390 px. Only console errors: the guest's signed-out `/api/auth/refresh` 401s. No sideways scroll. DB: `shared_safari_member` 164 (user 95, safari 107) status 2 left. |
| Result | PASS |
| Method | browser, 1366 + 390 px, Join / Leave part |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §3, §11.5; WITW-Packages-Workflow §10 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PARK-09 history

- 2026-11-14 PASS: Plan Safari opens `/parks`, 12 cards then more on scroll, search, region West (West India only), Z–A (Valmiki first), "No parks match your search.", Clear filters.
- 2026-11-14 PASS (current): `/parks` 12 cards, more on scroll (24 / 44), search "tiger" right after a scroll: 12 cards, none without "tiger"; no console errors, failed calls or sideways scroll. **TC-PKG-19 PASS (re-run)**: `/packages` 9 cards. **TC-PARK-11 PASS (re-run)**: Kanha `?tab=packages` 3 cards (the Phase 5 builder's test packages changed the set since the first run).

### TC-PARK-12 history

- 2026-11-14 PASS: Corbett Shared Safaris tab shows W1's card (Corbett birding trail, button "Seat Full"), count in the tab; Join / Leave were not clicked (the card component is W1's, unchanged; clicking would write shared-safari rows, not allowed in this run).
- 2026-11-14 PASS (current): as a guest, Kaziranga `?tab=safaris` › Join Safari goes to `/login` (as W1); signed up a new user `ct_park12_207988@example.com` through `/sign-up` (→ `/`), then on `/parks/kaziranga-tiger-reserve?tab=safaris` Join Safari → toast "You've joined this safari.", button Leave Safari, "2 joined"; after a reload the tab stays Shared Safaris and the button is still Leave Safari; Leave Safari → "You've left this safari.", button Join Safari; the same at 390 px. Only console errors: the guest's signed-out `/api/auth/refresh` 401s. No sideways scroll. DB: `shared_safari_member` 164 (user 95, safari 107) status 2 left.
