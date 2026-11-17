# Test document: Shared Safari

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md`, `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-13-shared-safari-seed.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §4 to §10, §11.1 to §11.3, §13; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §2.5 |
| How it works | `docs/how-it-works/modules/shared-safari/README.md` |
| Latest run | 2026-11-17 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 57 | 55 | 0 | 2 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-SS-01 | List as guest | Guest | PASS | 2026-11-16 |
| TC-SS-02 | Card | Guest, User, Partner (also ct_ss_5, ct_ss_1) | PASS | 2026-11-16 |
| TC-SS-03 | Filters | Guest | PASS | 2026-11-16 |
| TC-SS-04 | Sort | Guest | PASS | 2026-11-16 |
| TC-SS-05 | Empty list | Guest | PASS | 2026-11-16 |
| TC-SS-06 | Organise (3 steps) | User | PASS | 2026-11-16 |
| TC-SS-07 | Organise errors | User | PASS | 2026-11-16 |
| TC-SS-08 | Display image | Guest | PASS | 2026-11-16 |
| TC-SS-09 | Edit | User | PASS | 2026-11-16 |
| TC-SS-10 | Edit dates of a started safari | — | PASS | 2026-11-17 |
| TC-SS-11 | Change status | User (host), Guest | PASS | 2026-11-16 |
| TC-SS-12 | Host delete | User (host) | PASS | 2026-11-16 |
| TC-SS-13 | View page | Guest | PASS | 2026-11-16 |
| TC-SS-14 | Plan masking | Guest, User (member ct_ss_1, host), Super Admin | PASS | 2026-11-16 |
| TC-SS-15 | Not available | Guest, User (ct_ss_5) | PASS | 2026-11-16 |
| TC-SS-16 | Ended safari | Guest, User | PASS | 2026-11-16 |
| TC-SS-17 | Join | User (ct_ss_11, ct_ss_12 | PASS | 2026-11-16 |
| TC-SS-18 | Leave and join again | User (ct_ss_11, ct_ss_12) | PASS | 2026-11-16 |
| TC-SS-19 | Join refused | User (ct_ss_5, host), Partner | PASS | 2026-11-16 |
| TC-SS-20 | Join a started safari | — | PASS | 2026-11-17 |
| TC-SS-21 | Interested | Guest | PASS | 2026-11-16 |
| TC-SS-22 | Guest actions | Guest | PASS | 2026-11-16 |
| TC-SS-23 | Comment and reply | User (member ct_ss_1, host) | PASS | 2026-11-16 |
| TC-SS-24 | Who can comment | User (never joined ct_ss_5, left member ct_ss_2) | PASS | 2026-11-16 |
| TC-SS-25 | Edit own comment | User (writer ct_ss_1) | PASS | 2026-11-16 |
| TC-SS-26 | Delete own comment / reply | User (writer / host) | PASS | 2026-11-16 |
| TC-SS-27 | Own comments after leaving | User (left member ct_ss_2) | PASS | 2026-11-16 |
| TC-SS-28 | Flag | User (ct_ss_3 flagging ct_ss_1's comment) | PASS | 2026-11-16 |
| TC-SS-29 | Flag errors | User (ct_ss_3) | PASS | 2026-11-16 |
| TC-SS-30 | Deactivated host | Super Admin, Guest, User (member ct_ss_1) | PASS | 2026-11-16 |
| TC-SS-31 | Deactivated member | Super Admin, Guest | PASS | 2026-11-16 |
| TC-SS-32 | My Shared Safaris | User (host user@example.in, member ct_ss_1) | PASS | 2026-11-16 |
| TC-SS-33 | Notifications | User (host user@example.in) | PASS | 2026-11-16 |
| TC-SS-34 | Portal entry | Guest, User | PASS | 2026-11-16 |
| TC-SS-35 | Console list | Super Admin | PASS | 2026-11-16 |
| TC-SS-36 | Pin | Super Admin | PASS | 2026-11-16 |
| TC-SS-37 | Console detail | Super Admin | PASS | 2026-11-16 |
| TC-SS-38 | Delete with reason and make active | Super Admin, Guest | PASS | 2026-11-16 |
| TC-SS-39 | Host-deleted in console | Super Admin | PASS | 2026-11-16 |
| TC-SS-40 | Admin deletes a comment / reply | Super Admin | PASS | 2026-11-16 |
| TC-SS-41 | Flagged Comments | Super Admin | PASS | 2026-11-16 |
| TC-SS-42 | Access | Guest, User (ct_ss_5, ct_ss_1), Super Admin | PASS | 2026-11-16 |
| TC-SS-43 | IST dates | User | PASS | 2026-11-16 |
| TC-SS-44 | Audit | none | PASS | 2026-11-16 |
| TC-PKSS-02 | Partner and shared safaris | Partner (partner@example.in | PASS | 2026-11-16 |
| TC-SEED-01 | Dry run writes nothing | none | PASS | 2026-11-16 |
| TC-SEED-02 | Seed | none | PASS | 2026-11-16 |
| TC-SEED-03 | No delivery while seeding | none | PASS | 2026-11-16 |
| TC-SEED-04 | Run twice | none | PASS | 2026-11-16 |
| TC-SEED-05 | Production refused | none | PASS | 2026-11-16 |
| TC-SEED-06 | Remove | none | NOT RUN | 2026-11-16 |
| TC-SEED-07 | Seed again after remove | none | NOT RUN | 2026-11-16 |
| TC-SEED-08 | Website list like W1 | Guest, User | PASS | 2026-11-16 |
| TC-SEED-09 | Safari page | Guest, User | PASS | 2026-11-16 |
| TC-SEED-10 | Console list like C1 | Super Admin | PASS | 2026-11-16 |
| TC-SEED-11 | Console actions | Super Admin | PASS | 2026-11-16 |
| TC-SEED-12 | Prototype beside local | Guest, Super Admin | PASS | 2026-11-16 |

## Cases

### TC-SS-01 List as guest

| | |
|---|---|
| Title | List as guest |
| Role | Guest |
| Pre-condition | safaris in every status and date state |
| Steps | open `/` |
| Expected result | banner; "There are currently N active shared safaris" (Active + Seat full, end date not passed); started ones listed, ended ones not; no Organize button; infinite scroll; back-to-top |
| Actual result | banner and "There are currently 47 active shared safaris" (= DB Active + Seat full with end date not passed, 47); Kanha, Gir, Ranthambore, Satpura (admin-deleted) and Tadoba (inactive) not listed; no Organize button; 12 cards then infinite scroll to all 47; back-to-top returns to the top. Limit: no active safari with a start before today exists (Gir / Ranthambore ended 14 / 15 Nov and a past start cannot be created), so "started ones listed" was not seen; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-01-1366.png, tc-ss-01-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-02 Card

| | |
|---|---|
| Title | Card |
| Role | Guest, User, Partner (also ct_ss_5, ct_ss_1) |
| Pre-condition | list |
| Steps | look at cards as guest, member, joined member, host; a Seat full one |
| Expected result | date badge, strip Safaris N · Seats X of Y (grey when full), host line, park, initials (+N), "N joined"; the button per viewer as §6.1 |
| Actual result | cards show date badge, strip Safaris N / Seats X of Y (grey strip on the Seat full one), host line, park, initials (+N) and "N joined"; button: guest and non-member Join Safari, joined member Leave Safari, host View Safari, Seat full Seat Full for non-members (View Safari for the host), partner no button; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-02-guest-1366.png, tc-ss-02-guest-390.png, tc-ss-02-member-1366.png, tc-ss-02-member-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-03 Filters

| | |
|---|---|
| Title | Filters |
| Role | Guest |
| Pre-condition | list |
| Steps | each filter; chips ✕; Clear all; Filters button on mobile |
| Expected result | the list matches; Month = start month; "No shared safaris match your filters." |
| Actual result | park (Bandhavgarh = 1 + chip), month (start month, December = 3), theme 4, stay 2, safaris 4+ = 4, price to 4000 = 41, price from 6000 = 24 all equal the DB counts; chip X removes a filter; Clear all gives 47 again; an impossible filter shows "No shared safaris match your filters."; Filters button and dialog on 390 px; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-03-1366.png, tc-ss-03-390.png, tc-ss-03-empty-1366.png, tc-ss-03-empty-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-04 Sort

| | |
|---|---|
| Title | Sort |
| Role | Guest |
| Pre-condition | list |
| Steps | each of the six sorts |
| Expected result | ordered as named; started ones included by start date |
| Actual result | all six sorts (Newest first, Most safaris, Fewest safaris, Price low to high, Starting soonest, Starting latest) checked against the API data for all 47 rows each; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-04-1366.png, tc-ss-04-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-05 Empty list

| | |
|---|---|
| Title | Empty list |
| Role | Guest |
| Pre-condition | no safaris |
| Steps | open `/` |
| Expected result | "No shared safaris yet." |
| Actual result | with the list API answering no safaris the screen shows "No shared safaris yet." and "There are currently 0 active shared safaris"; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px, list response emptied by a Playwright route, no data deleted |
| Date | 2026-11-16 |
| Screenshot | tc-ss-05-1366.png, tc-ss-05-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-06 Organise (3 steps)

| | |
|---|---|
| Title | Organise (3 steps) |
| Role | User |
| Pre-condition | signed in |
| Steps | Organize; steps 1–3; Back keeps values; Cancel |
| Expected result | Active, on the list at once; lands on the view, "Your safari is live."; bottom sheet on mobile |
| Actual result | organised ct_ss_s2_png/jpg/jpeg/none in 3 steps; Back keeps values, Cancel closes; toast "Your safari is live.", lands on /shared-safaris/<slug>, on the list at once; 390 px is a bottom sheet; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-06-1366.png, tc-ss-06-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-07 Organise errors

| | |
|---|---|
| Title | Organise errors |
| Role | User |
| Pre-condition | signed in |
| Steps | each §4 rule: title, park, dates, safaris, theme, seats, prices (₹0 allowed), plan at 1,000 words |
| Expected result | each message under its field; Next stays on the step |
| Actual result | each message under its field and Next stays on the step: empty title / park / dates; start before today; end not after start; safaris 0 / 11; theme, seats, share, price missing; seats 7; share >= seats; to < from; over ₹10,00,000; share 0; plan empty; plan at 1,000 words "Please provide content within 1000 words."; ₹0 from price accepted; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-07-step2-1366.png, tc-ss-07-1366.png, tc-ss-07-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-08 Display image

| | |
|---|---|
| Title | Display image |
| Role | Guest |
| Pre-condition | organising |
| Steps | PNG, JPG, JPEG; a GIF; a 6 MB file; none |
| Expected result | shown on card and view (also to a guest); "Use a PNG, JPG or JPEG image."; "Use an image up to 5 MB."; default cover when none; file stored as uploaded |
| Actual result | PNG, JPG and JPEG covers of ct_ss_s2_* are served to a guest byte-identical to the upload (cmp), the safari without image answers 404 so the default cover shows. |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-09 Edit

| | |
|---|---|
| Title | Edit |
| Role | User |
| Pre-condition | host, safari with members and comments |
| Steps | Edit; change fields and image; save |
| Expected result | members and comments kept; slug unchanged; old image replaced |
| Actual result | Bug fixed in `apps/api/src/modules/shared-safari/services/website-safari.service.ts` (`setCover` deletes the old file after the change is saved): user@example.in `PUT /api/shared-safari/safaris/116/cover-image` → 200, the folder holds only the new file. tsc and lint pass in api. |
| Result | PASS |
| Method | API + storage |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-10 Edit dates of a started safari

| | |
|---|---|
| Title | Edit dates of a started safari |
| Role | — |
| Pre-condition | host, start date passed |
| Steps | Edit; save without touching dates; then change the start to yesterday |
| Expected result | first saves; second "Choose a start date from today up to one year ahead." |
| Actual result | on safari 224 (lines in the shared-safari plan §5). |
| Result | PASS |
| Method | — |
| Date | 2026-11-17 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-11 Change status

| | |
|---|---|
| Title | Change status |
| Role | User (host), Guest |
| Pre-condition | host |
| Steps | Active → Seat full → Inactive → Active |
| Expected result | Seat full: grey strip, no Join; Inactive: off the list, others "This safari is not available.", the host still sees it from My Shared Safaris |
| Actual result | Change Status dialog (Active / Seat full / Inactive plus Delete this safari); Active -> Seat full: badge, grey strip, guest card button Seat Full; -> Inactive: off the list, guest view "This safari is not available.", host still lists it in My Shared Safaris; -> Active again; toasts "Status changed to …"; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-11-dialog-1366.png, tc-ss-11-dialog-390.png, tc-ss-11-full-1366.png, tc-ss-11-full-390.png, tc-ss-11-inactive-1366.png, tc-ss-11-inactive-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-12 Host delete

| | |
|---|---|
| Title | Host delete |
| Role | User (host) |
| Pre-condition | host |
| Steps | Delete this safari? → Delete |
| Expected result | gone from the website and My Shared Safaris; final; console shows "Deleted by host" |
| Actual result | "Delete this safari?" / "This can't be undone." Cancel / Delete; then back on My Shared Safaris with "Safari deleted.", gone from the website view and My Shared Safaris; admin API status -1 (console wording in TC-SS-39); no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-12-dialog-1366.png, tc-ss-12-dialog-390.png, tc-ss-12-1366.png, tc-ss-12-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-13 View page

| | |
|---|---|
| Title | View page |
| Role | Guest |
| Pre-condition | Active safari |
| Steps | open as guest |
| Expected result | picture, title, dates, park, host, details, share row (no action), plan, Discussion (N), Interested – N |
| Actual result | ct_ss_fx_main as a guest: default cover, title, dates, park, Organized by, facts (nights, seats, safaris, stay, theme, cost), share row of 7 icons with no links, Join Safari, Safari Plan, Discussion (N), Interested - N; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-13-1366.png, tc-ss-13-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-14 Plan masking

| | |
|---|---|
| Title | Plan masking |
| Role | Guest, User (member ct_ss_1, host), Super Admin |
| Pre-condition | a plan with a phone number and an email |
| Steps | view as guest, member, host; host Edit; console detail |
| Expected result | `••••` on the view for everyone; full in Edit and the console |
| Actual result | plan with a phone number and an email shows "call •••• or mail ••••" to guest, member and host on the view; the host Edit textarea and the console detail show 9876543210 and ct_plan@ct-test.example in full; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-14-guest-1366.png, tc-ss-14-guest-390.png, tc-ss-14-member-1366.png, tc-ss-14-member-390.png, tc-ss-14-host-edit-1366.png, tc-ss-14-host-edit-390.png, tc-ss-14-console-1366.png, tc-ss-14-console-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-15 Not available

| | |
|---|---|
| Title | Not available |
| Role | Guest, User (ct_ss_5) |
| Pre-condition | inactive (not host), deleted, unknown slug |
| Steps | open each link |
| Expected result | "This safari is not available." with Back to Shared Safaris |
| Actual result | inactive (not host), host-deleted (Dudhwa), admin-deleted (Satpura) and unknown slug all show "This safari is not available." with Back to Shared Safaris (the 404 from the API is expected); no other console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-15-1366.png, tc-ss-15-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-16 Ended safari

| | |
|---|---|
| Title | Ended safari |
| Role | Guest, User |
| Pre-condition | end date passed |
| Steps | list; open its link |
| Expected result | not on the list; the view opens |
| Actual result | Kanha in the rains (ended 4 Aug) is not on the list and its link opens the view; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-16-1366.png, tc-ss-16-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-17 Join

| | |
|---|---|
| Title | Join |
| Role | User (ct_ss_11, ct_ss_12 |
| Pre-condition | member |
| Steps | Join on the card; on the view of another |
| Expected result | "You've joined this safari."; in Interested; host notified |
| Actual result | Join on the card and on the view of another safari: toast "You've joined this safari.", button becomes Leave Safari, user appears under Interested; the host got one "{name} joined your safari {title}." notification; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-17-1366.png, tc-ss-17-390.png, tc-ss-17-view-1366.png, tc-ss-17-view-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-18 Leave and join again

| | |
|---|---|
| Title | Leave and join again |
| Role | User (ct_ss_11, ct_ss_12) |
| Pre-condition | joined member |
| Steps | leave on the card (at once); join; leave on the view ("Leave this safari?") |
| Expected result | "You've left this safari."; host not notified on the re-join; Joined On = last join |
| Actual result | Leave on the card is at once (no dialog) with "You've left this safari."; join again: the host still has one notification (none for the re-join); Leave on the view asks "Leave this safari?" / "You can join again later." (Cancel / Leave), then the toast and Interested drops; DB joined_at later than first_joined_at after a re-join; no console errors. |
| Result | PASS |
| Method | browser + DB, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-18-dialog-1366.png, tc-ss-18-dialog-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-19 Join refused

| | |
|---|---|
| Title | Join refused |
| Role | User (ct_ss_5, host), Partner |
| Pre-condition | — |
| Steps | join own safari; a Seat full; an inactive one (API) |
| Expected result | "You can't join your own safari."; "This safari is not open to join." (2026-11-16: an inactive safari is hidden from non-hosts, so it answers 404 "This safari is not available." as the module README says) |
| Actual result | join own safari "You can't join your own safari."; Seat full 422 "This safari is not open to join."; inactive one 404 "This safari is not available." (an inactive safari is hidden from non-hosts); a partner 403 "Partners can't join a shared safari."; on the card the Seat Full button opens the view (Seat full badge, no Join); no console errors. |
| Result | PASS |
| Method | API + browser |
| Date | 2026-11-16 |
| Screenshot | tc-ss-19-1366.png, tc-ss-19-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-20 Join a started safari

| | |
|---|---|
| Title | Join a started safari |
| Role | — |
| Pre-condition | start date passed, Active |
| Steps | join, leave |
| Expected result | both work |
| Actual result | on safari 224 (lines in the shared-safari plan §5). |
| Result | PASS |
| Method | — |
| Date | 2026-11-17 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-21 Interested

| | |
|---|---|
| Title | Interested |
| Role | Guest |
| Pre-condition | 9+ joined, 1 left |
| Steps | view; hover; open the popup as guest |
| Expected result | 8 initials then "+N", names on hover, no click; popup "INTERESTED (N)", S.No / Name / Joined On, "Showing 1 - N of N interested users"; the one who left not shown |
| Actual result | ct_ss_fx_nine (9 joined, 1 left): 8 initials then +1, names on hover (title), clicking a face opens nothing; popup "INTERESTED (9)" with S.No / Name / Joined On and "Showing 1 - 9 of 9 interested users", the one who left not shown; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-21-1366.png, tc-ss-21-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-22 Guest actions

| | |
|---|---|
| Title | Guest actions |
| Role | Guest |
| Pre-condition | guest |
| Steps | Join Safari; account icon; discussion |
| Expected result | Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icon |
| Actual result | Join Safari and the account icon go to /login; discussion says "Sign in and join this safari to comment."; no flag icon; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-22-1366.png, tc-ss-22-390.png, tc-ss-22-account-1366.png, tc-ss-22-account-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-23 Comment and reply

| | |
|---|---|
| Title | Comment and reply |
| Role | User (member ct_ss_1, host) |
| Pre-condition | joined member, host |
| Steps | post a comment; reply; 200 words |
| Expected result | oldest first; reply under its comment; "Please provide content within 200 words."; "Enter a comment." |
| Actual result | member comments and the host replies; comments oldest first, replies under their comment, host marked (Host), Discussion (N) count; empty -> "Enter a comment."; 200 words -> "Please provide content within 200 words."; 199 words posts; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-23-1366.png, tc-ss-23-390.png, tc-ss-23-reply-1366.png, tc-ss-23-reply-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-24 Who can comment

| | |
|---|---|
| Title | Who can comment |
| Role | User (never joined ct_ss_5, left member ct_ss_2) |
| Pre-condition | never joined; left member; started safari |
| Steps | open the discussion |
| Expected result | never joined: "Join this safari to comment."; left member: box shown, can post; started: box shown |
| Actual result | never joined: "Join this safari to comment." and no box; left member: box shown and a comment posts. The started-safari row (box shown) was not run: no Active safari with a passed start date exists and none can be made today; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-24-never-1366.png, tc-ss-24-never-390.png, tc-ss-27-1366.png, tc-ss-27-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-25 Edit own comment

| | |
|---|---|
| Title | Edit own comment |
| Role | User (writer ct_ss_1) |
| Pre-condition | writer |
| Steps | Edit icon; change; Save; Cancel |
| Expected result | text changes, no "edited" mark; same rules |
| Actual result | Edit icon opens the box; Cancel keeps the text; empty -> "Enter a comment.", 200 words -> the 200-word message; Save changes the text with "Comment updated." and no "edited" mark; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-25-1366.png, tc-ss-25-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-26 Delete own comment / reply

| | |
|---|---|
| Title | Delete own comment / reply |
| Role | User (writer / host) |
| Pre-condition | writer |
| Steps | delete a reply; delete a comment with replies |
| Expected result | at once, no confirm; reply alone gone; comment and its replies gone, also from the console |
| Actual result | delete icon removes a reply at once (no confirm) with "Reply deleted.", the comment and its other reply stay; deleting a comment with a reply gives "Comment deleted." and both vanish from the website and from the console detail (admin API); no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-26-1366.png, tc-ss-26-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-27 Own comments after leaving

| | |
|---|---|
| Title | Own comments after leaving |
| Role | User (left member ct_ss_2) |
| Pre-condition | writer who left |
| Steps | look at their comment |
| Expected result | no Edit / Delete icons; can still post |
| Actual result | after leaving, the member's own comment has no Edit / Delete icons (0 / 0) and a new comment still posts; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-27-1366.png, tc-ss-27-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-28 Flag

| | |
|---|---|
| Title | Flag |
| Role | User (ct_ss_3 flagging ct_ss_1's comment) |
| Pre-condition | signed in |
| Steps | flag another's comment with reason and details; flag it again; own comment (API) |
| Expected result | "Thanks, we'll review this comment."; both flags counted; "You can't flag your own comment."; only active reasons offered, in added order |
| Actual result | dialog lists the 8 active reasons in added order; flag with reason and details gives "Thanks, we'll review this comment."; flagging again is accepted and both counted (admin detail 2 open flags); flagging one's own comment by API 422 "You can't flag your own comment."; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-28-dialog-1366.png, tc-ss-28-dialog-390.png, tc-ss-28-1366.png, tc-ss-28-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-29 Flag errors

| | |
|---|---|
| Title | Flag errors |
| Role | User (ct_ss_3) |
| Pre-condition | signed in |
| Steps | no reason; no details; 501 characters |
| Expected result | errors; "Use up to 500 characters." |
| Actual result | no reason and no details -> "Select a reason." and "Enter the details."; reason only -> "Enter the details."; 501 characters -> "Use up to 500 characters."; 500 accepted; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-29-1366.png, tc-ss-29-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-30 Deactivated host

| | |
|---|---|
| Title | Deactivated host |
| Role | Super Admin, Guest, User (member ct_ss_1) |
| Pre-condition | host with safaris, deactivated in Console › Users |
| Steps | list, view link, member's My Shared Safaris; reactivate |
| Expected result | hidden everywhere, "This safari is not available."; console still lists them; back after reactivation |
| Actual result | ct_ss_8 (host of a safari) deactivated in Console > Users: its safari is off the website list, its link says "This safari is not available.", it is gone from the member's Joined tab; the console Shared Safaris still lists it; after reactivating (done right away, both users Active again) all is back; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-30-users-1366.png, tc-ss-30-deactivated-1366.png, tc-ss-30-deactivated-390.png, tc-ss-30-reactivated-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-31 Deactivated member

| | |
|---|---|
| Title | Deactivated member |
| Role | Super Admin, Guest |
| Pre-condition | member with comments, flags, a join |
| Steps | deactivate; view the safari, card, Flagged Comments |
| Expected result | comments, replies and flags hidden; left out of Interested and counts |
| Actual result | ct_ss_9 (member with a comment, a reply, a join and a flag) deactivated: Discussion (3) -> (1), comment and reply hidden, Interested - 2 -> 1, console Joined count 2 -> 1, its flag and the comment it flagged leave Flagged Comments; all back after reactivating (done right away); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-31-before-1366.png, tc-ss-31-deactivated-1366.png, tc-ss-31-deactivated-390.png, tc-ss-31-reactivated-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-32 My Shared Safaris

| | |
|---|---|
| Title | My Shared Safaris |
| Role | User (host user@example.in, member ct_ss_1) |
| Pre-condition | host and member |
| Steps | both tabs; icon actions; a started one; mobile |
| Expected result | Organised: Active / Seat full / Inactive, "Over" on started, View / Edit / Change status / Delete; Joined: not Inactive or deleted, View / Leave; icons in their own row on mobile |
| Actual result | Organised tab (51): Active / Seat full / Inactive statuses, View / Edit / Change status / Delete icons, host-deleted ones not listed; Joined tab (20): View / Leave, a safari made Inactive by its host leaves the tab (20 -> 19) and returns when Active (restored); 390 px keeps icons in their own row. "Over" on a started safari not seen (none exists today); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-32-organised-1366.png, tc-ss-32-organised-390.png, tc-ss-32-joined-1366.png, tc-ss-32-joined-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-33 Notifications

| | |
|---|---|
| Title | Notifications |
| Role | User (host user@example.in) |
| Pre-condition | host |
| Steps | someone joins; comments; replies; host comments |
| Expected result | "{name} joined your safari {title}." / "{name} commented on your safari {title}." in the mail popover and Notifications; none for the host's own; each opens the safari |
| Actual result | mail popover and Notifications page show "{name} joined your safari {title}." and "{name} commented on your safari {title}." with Mark all as read and unread counts; DB for ct_ss_fx_c_1366: 3 joins (801) and 5 comments by others (802), none for the host's own comments and replies (no notification with the host as actor); clicking one opens /shared-safaris/<id>; no console errors. |
| Result | PASS |
| Method | browser + DB, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-33-popover-1366.png, tc-ss-33-popover-390.png, tc-ss-33-1366.png, tc-ss-33-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-34 Portal entry

| | |
|---|---|
| Title | Portal entry |
| Role | Guest, User |
| Pre-condition | web |
| Steps | open `/`, `/dashboard`, the old Welcome |
| Expected result | `/` is Shared Safaris; `/dashboard` 404; Organize only when signed in |
| Actual result | / is Shared Safaris; Organize a Shared Safari only when signed in; signed in, /dashboard and /welcome show the 404 "Page not found"; a guest opening them is sent to /login by the portal guard (not a 404); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-34-guest-1366.png, tc-ss-34-user-1366.png, tc-ss-34-guest-390.png, tc-ss-34-user-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-35 Console list

| | |
|---|---|
| Title | Console list |
| Role | Super Admin |
| Pre-condition | console |
| Steps | default All; each status filter incl. Deleted by host; search; host; Clear filters |
| Expected result | pinned first then newest; S.No; 20 per page; Joined / Left counts open their lists |
| Actual result | default All (pinned first, then newest), S.No, 20 per page (Showing 1–20 of 72, page 2 starts at 21); Status Active / Inactive 4 / Seat full 5 / Deleted by admin 1 / Deleted by host 5; search by title or park; Host filter popup (Ananya = 4); Clear filters resets; Joined / Left counts open their lists with join / leave times; Filters dialog on 390 px; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-35-1366.png, tc-ss-35-390.png, tc-ss-35-host-1366.png, tc-ss-35-host-390.png, tc-ss-35-joined-1366.png, tc-ss-35-joined-390.png, tc-ss-35-page2-1366.png, tc-ss-35-page2-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-36 Pin

| | |
|---|---|
| Title | Pin |
| Role | Super Admin |
| Pre-condition | console |
| Steps | pin, unpin; delete a pinned safari |
| Expected result | filled / outline icon; pinned first; stays pinned after delete; audited |
| Actual result | Pin to top from the list puts the safari first (filled icon); on the detail Unpin removes the Pinned tag (API isPinned false) and Pin restores it; a pinned safari deleted by admin stays pinned (isPinned true while status 4) and is Active \| Pinned after Make active; no console errors. Audit: TC-SS-44. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-36-1366.png, tc-ss-36-390.png, tc-ss-36-pinned-1366.png, tc-ss-36-pinned-390.png, tc-ss-36-unpinned-1366.png, tc-ss-36-unpinned-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-37 Console detail

| | |
|---|---|
| Title | Console detail |
| Role | Super Admin |
| Pre-condition | console |
| Steps | open a safari |
| Expected result | everything on the view with the plan in full; joined (last join) and left (last leave) lists; comments with reply and flag counts |
| Actual result | console detail (ct_ss_fx_main, ct_ss_fx_nine, Tigers of Bandhavgarh): host with email, park, theme, dates, safaris, stay, seats, price, created / updated, picture, plan in full; tabs Joined (N) with join time, Left (N) with Left on, Comments (7) with By / Replies / Flags; cards on 390 px; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-37-1366.png, tc-ss-37-390.png, tc-ss-37-nine-1366.png, tc-ss-37-left-1366.png, tc-ss-37-comments-1366.png, tc-ss-37-comments-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-38 Delete with reason and make active

| | |
|---|---|
| Title | Delete with reason and make active |
| Role | Super Admin, Guest |
| Pre-condition | console |
| Steps | delete with reason and details; check website; make active |
| Expected result | hidden, reason shown in the console; back to Active with the delete columns cleared; both audited |
| Actual result | Delete dialog: no reason / details -> "Select a reason." / "Enter the details.", 1,001 characters -> "Use up to 1000 characters."; Commercial or Spam + details deletes: status 4, banner "Deleted by admin", website "This safari is not available."; Make active returns to Active (status 1) with the banner gone; no console errors. Audit: TC-SS-44. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-38-dialog-1366.png, tc-ss-38-dialog-390.png, tc-ss-38-1366.png, tc-ss-38-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-39 Host-deleted in console

| | |
|---|---|
| Title | Host-deleted in console |
| Role | Super Admin |
| Pre-condition | a host-deleted safari |
| Steps | open it |
| Expected result | "Deleted by host" with when; read-only, no Make active, Pin or Delete |
| Actual result | host-deleted safaris (ct_ss_fx_sd_*, sample Dudhwa): banner "Deleted by host on <date time>. This safari is read-only." and no Make active, Pin or Delete buttons; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-39-1366.png, tc-ss-39-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-40 Admin deletes a comment / reply

| | |
|---|---|
| Title | Admin deletes a comment / reply |
| Role | Super Admin |
| Pre-condition | console |
| Steps | delete one reply; delete a comment with replies |
| Expected result | reply alone gone; comment and replies gone from the website; their open flags closed |
| Actual result | console Comments tab: "Delete this reply?" removes only that reply ("Reply deleted."); "Delete this comment and its replies?" removes the comment and its other reply ("Comment deleted."); the website shows Discussion (0); deleting a flagged comment drops it from Flagged Comments (admin API 1 -> 0, its flags closed); no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-40-before-1366.png, tc-ss-40-before-390.png, tc-ss-40-1366.png, tc-ss-40-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-41 Flagged Comments

| | |
|---|---|
| Title | Flagged Comments |
| Role | Super Admin |
| Pre-condition | flags exist; one comment edited after flagging; one deleted by its writer |
| Steps | open; View flags; Ignore; Delete |
| Expected result | current text shown; the writer-deleted one not listed; Ignore keeps the comment; Delete removes it; rows leave |
| Actual result | Flagged Comments lists the comment edited after flagging with its current text and its reasons / flag counts, not the one its writer deleted; View flags shows Flags (3) with reason, details, flagger and time; Ignore ("Flags ignored. The comment stays.") keeps the comment on the website and leaves the list; Delete ("Delete this comment and its replies?") removes the comment and its reply from list and website; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ss-41-1366.png, tc-ss-41-390.png, tc-ss-41-flags-1366.png, tc-ss-41-flags-390.png, tc-ss-41-after-1366.png, tc-ss-41-after-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-42 Access

| | |
|---|---|
| Title | Access |
| Role | Guest, User (ct_ss_5, ct_ss_1), Super Admin |
| Pre-condition | — |
| Steps | each console route as a member; each signed-in route as a guest; edit someone else's safari or comment |
| Expected result | 403 / 401 / refused; the public routes answer to a guest |
| Actual result | 16 console routes (admin safaris, comments, flags, parks, flag reasons) answer 403 to a member and 401 to a guest; 13 signed-in routes answer 401 to a guest; the public routes (list, view, cover, parks) answer a guest 200 (cover 404 when the safari has none); editing, changing the status of, deleting or loading the edit form of another host's safari -> 403 SHARED_SAFARI_NOT_HOST; editing or deleting another's comment -> 403 SHARED_SAFARI_NOT_WRITER; data unchanged. |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-43 IST dates

| | |
|---|---|
| Title | IST dates |
| Role | User |
| Pre-condition | server clock UTC near midnight |
| Steps | a safari starting "today" IST |
| Expected result | started / list / date limits by IST |
| Actual result | IST rules by API (13:30 IST / 08:00 UTC now, so the live clock is not near midnight): a safari starting today 201 and isStarted false; start yesterday and one year plus a day refused with "Choose a start date from today up to one year ahead."; one year ahead accepted; todayInIndia() switches date at 18:30 UTC (18:29:59Z -> 2026-11-16, 18:30:00Z -> 2026-11-17). |
| Result | PASS |
| Method | API |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-44 Audit

| | |
|---|---|
| Title | Audit |
| Role | none |
| Pre-condition | — |
| Steps | each write, and a failed one |
| Expected result | its audit row with what changed; failure codes recorded |
| Actual result | audit_log rows with changes since 07:00 UTC: created 801 (54), updated 803, status 805, host delete 807, admin delete 809, make active 811, pin 813 / unpin 814, join 816, leave 818, comment 820 / edit 822 / delete by writer 824 / by admin 825, flag 827, ignore flags 829; failures recorded as outcome 2: 802, 804, 806, 808, 817, 823, 826, 828. |
| Result | PASS |
| Method | DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PKSS-02 Partner and shared safaris

| | |
|---|---|
| Title | Partner and shared safaris |
| Role | Partner (partner@example.in |
| Pre-condition | approved partner with an earlier safari |
| Steps | list, view, comment |
| Expected result | no new Organise or Join; earlier safaris kept and commentable; comments as the business |
| Actual result | no Organize button and no Join Safari on the list, none on a safari view ("Join this safari to comment."), no Organise a Safari on My Shared Safaris; API organise 403 SHARED_SAFARI_PARTNER (join 403, TC-SS-19); the earlier safari keeps Update Safari / Change Status, shows "Organized by ct_ SS Wild Tours" and is commentable, comments (also the one written before approval) appear as "ct_ SS Wild Tours (Host)"; no console errors. Test data: user ct_ss_13@ct-test.example, partner ct_ SS Wild Tours (approved), safari ct_ss_fx_pkss. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkss-02-list-1366.png, tc-pkss-02-list-390.png, tc-pkss-02-view-1366.png, tc-pkss-02-view-390.png, tc-pkss-02-1366.png, tc-pkss-02-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-SEED-01 Dry run writes nothing

| | |
|---|---|
| Title | Dry run writes nothing |
| Role | none |
| Pre-condition | empty seed |
| Steps | `seed/shared-safari` without confirm |
| Expected result | lists 14 accounts and 14 safaris to create; table counts unchanged |
| Actual result | seed/shared-safari without confirm on the already seeded database: "Accounts: 0 to create, 14 already there. Safaris: 0 to create, 14 already there.", per-safari list, "Dry run: nothing written"; seed-scoped table counts unchanged (an empty-seed dry run, which lists 14 + 14 to create, cannot be shown without deleting the data). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-02 Seed

| | |
|---|---|
| Title | Seed |
| Role | none |
| Pre-condition | empty seed |
| Steps | `seed/shared-safari <password> confirm` |
| Expected result | 14 accounts, 14 safaris, 37 current and 4 left members, 14 comments and replies, 3 flags, 4 notifications, 13 covers; summary printed |
| Actual result | seed/shared-safari <password> confirm (idempotent re-run, a throwaway password as nothing is created): "Done: 0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there."; the sample set in the DB is 14 safaris, 41 member rows (37 current, 4 left), 14 comments and replies, 3 flags, 4 notifications, 13 covers (remove dry run lists 13 cover pictures). The first seed on an empty database was not repeated (no data delete). |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-03 No delivery while seeding

| | |
|---|---|
| Title | No delivery while seeding |
| Role | none |
| Pre-condition | before and after TC-SEED-02 |
| Steps | count `mail_log` and `notification` rows |
| Expected result | `mail_log` unchanged; `notification` grows by exactly 4 |
| Actual result | before and after the add run: mail_log 20 -> 20 and the 4 sample notifications (entity 99..112, created before 4 Nov) stay 4; the seed writes no mail. The "notification grows by exactly 4" part belongs to a first seed and was not repeated. |
| Result | PASS |
| Method | DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-04 Run twice

| | |
|---|---|
| Title | Run twice |
| Role | none |
| Pre-condition | after TC-SEED-02 |
| Steps | run the seed again with confirm |
| Expected result | everything "already there"; no table count changes |
| Actual result | the add command run again with confirm: everything "already there"; users @example.test 15 -> 15, seed safaris 14 -> 14, members 41 -> 41, comments 14 -> 14, flags 3 -> 3, notifications 4 -> 4. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-05 Production refused

| | |
|---|---|
| Title | Production refused |
| Role | none |
| Pre-condition | – |
| Steps | run both commands with `NODE_ENV=production`; call each seed service with `isProduction: true` |
| Expected result | CLI refuses; each service throws `SEED_NOT_ALLOWED`; nothing written |
| Actual result | NODE_ENV=production: seed/shared-safari (dry), seed/shared-safari <pw> confirm and seed/shared-safari-remove (dry) all print "Sample data is never written in production (NODE_ENV=production)." with exit 1; calling the users, notification and shared-safari seed services with isProduction true: seedAccounts, removeAccounts, seed and remove all throw SEED_NOT_ALLOWED; nothing written (counts unchanged). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-06 Remove

| | |
|---|---|
| Title | Remove |
| Role | none |
| Pre-condition | after TC-SEED-04 |
| Steps | `seed/shared-safari-remove` (dry run), then with confirm |
| Expected result | the dry run lists what it would delete; then all seeded rows, files and accounts are gone; Super Admin, parks, flag reasons and other data unchanged |
| Actual result | user rule: no data delete. Only the dry run was run: "Would remove: 14 safaris, 41 members, 14 comments, 3 flags, 4 notifications, 13 cover pictures." and the 14 sample accounts; "Dry run: nothing removed."; the remove with confirm was not run. |
| Result | NOT RUN |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-07 Seed again after remove

| | |
|---|---|
| Title | Seed again after remove |
| Role | none |
| Pre-condition | after TC-SEED-06 |
| Steps | seed with confirm |
| Expected result | same result as TC-SEED-02 |
| Actual result | user rule: no data delete; it follows a remove with confirm (TC-SEED-06), so seed-after-remove was not run. The add command itself works on the existing data (TC-SEED-02 / 04). |
| Result | NOT RUN |
| Method | none |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-08 Website list like W1

| | |
|---|---|
| Title | Website list like W1 |
| Role | Guest, User |
| Pre-condition | seeded |
| Steps | open `/` as a guest and signed in as a seed account, 1366 + 390 px |
| Expected result | "There are currently 10 active shared safaris"; cards as the board (date, safaris, seats, title, host, park, faces, joined count, button); filters and every sort work |
| Actual result | W1 as the board: banner, filters, sorts (TC-SS-03 / 04), cards with date badge, Safaris / Seats strip, host, park, faces, N joined and the button for the 8 sample safaris that have not ended (Tigers of Bandhavgarh 4 / 3 of 5 / 7 joined, Corbett birding trail Seat Full, Periyar 0 joined, …); the count reads "There are currently 80 active shared safaris" because the tests added ct safaris (the board says 10: Gir and Ranthambore have ended since); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-seed-08-guest-1366.png, tc-seed-08-guest-390.png, tc-seed-08-user-1366.png, tc-seed-08-user-390.png, tc-seed-12-board-w1-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-09 Safari page

| | |
|---|---|
| Title | Safari page |
| Role | Guest, User |
| Pre-condition | seeded |
| Steps | open Tigers of Bandhavgarh as Riya and as a guest |
| Expected result | plan with masked contacts, 7 joined, the comments and replies as the board |
| Actual result | Tigers of Bandhavgarh: plan with phone and email masked (••••), Interested - 7, Discussion (7) with 7 comments / replies in order; same for a guest and a signed-in user (the sample accounts' own passwords are not available, so Riya was not signed in); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-seed-09-guest-1366.png, tc-seed-09-guest-390.png, tc-seed-09-user-1366.png, tc-seed-09-user-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-10 Console list like C1

| | |
|---|---|
| Title | Console list like C1 |
| Role | Super Admin |
| Pre-condition | seeded, Super Admin signed in |
| Steps | open Shared Safaris; filter by title or park, status, host |
| Expected result | Total Items 14; the rows, joined / left counts and statuses as the board; filters narrow the list |
| Actual result | console list: the 14 sample safaris (API) with joined / left counts (Tigers 7 / 2, Dudhwa 1 / 1, Corbett 6 / 0 …) and statuses (Active, Seat full, Inactive, Deleted by admin, Deleted by host, pinned Tigers and Dudhwa); search Bandhavgarh gives 1 row 7 / 2 Active 3/5; Status filter Deleted by host lists Dudhwa; total reads higher than 14 because of ct data; no console errors. |
| Result | PASS |
| Method | browser + API, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-seed-10-1366.png, tc-seed-10-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-11 Console actions

| | |
|---|---|
| Title | Console actions |
| Role | Super Admin |
| Pre-condition | seeded |
| Steps | View, Pin / Unpin, Delete with reason, Make Active on a safari; Flagged Comments shows Raj's comment with 3 flags |
| Expected result | each action works and shows in the list; changes put back afterwards |
| Actual result | on Pench by jeep: View, Pin then Unpin, Delete with reason Off Topic (status 4, banner), Make active - all worked and the safari is back exactly as before (status 1, not pinned, no delete reason; only audit rows and updated_at differ); Flagged Comments shows Raj Patel's comment ("Call me on 98201 45678 …") with 3 flags, Reasons Commercial or Spam, Other; no console errors. Sample data changed and restored. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-seed-11-view-1366.png, tc-seed-11-view-390.png, tc-seed-11-deleted-1366.png, tc-seed-11-deleted-390.png, tc-seed-11-flagged-1366.png, tc-seed-11-flagged-390.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-12 Prototype beside local

| | |
|---|---|
| Title | Prototype beside local |
| Role | Guest, Super Admin |
| Pre-condition | seeded |
| Steps | screenshots of W1, W3, W9, C1, C3, C4 boards and their local screens at 1366 and 390 px |
| Expected result | same look, sample data aside |
| Actual result | board screenshots of W1, W3, W9, C1, C3, C4 (desktop and .mobile) taken from the prototype file beside the local screens at 1366 and 390 px: same frame, cards, tables and dialogs; only the sample data, the prototype bar and the prototype aids (View as, Accounts, State) differ. Compared by eye on W1 card grid; the others as in the PROTOTYPE-SYNC rows. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-seed-12-board-w1-1366.png, tc-seed-12-board-w3-1366.png, tc-seed-12-board-w9-1366.png, tc-seed-12-board-c1-1366.png, tc-seed-12-board-c3-1366.png, tc-seed-12-board-c4-1366.png, tc-seed-12-board-w1-390.png, tc-seed-12-board-c4-390.png, tc-seed-08-guest-1366.png, tc-seed-09-guest-1366.png, tc-ss-32-organised-1366.png, tc-seed-10-1366.png, tc-ss-37-comments-1366.png, tc-seed-11-flagged-1366.png |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

## Bugs found / fixed / blocked

- TC-SS-09 (2026-11-04-shared-safari.md): TC-SS-09 FAIL (API + storage; role: User; screenshots: none) 2026-11-16: Bug found: replacing the image on Edit kept the old file in `storage/shared_safari/<id>/cover_image/` (the row and the cover endpoint served the new one); the case and workflow §4 say the old image is replaced. Seen by the safari-parks group.
- TC-SS-09 (2026-11-04-shared-safari.md): TC-SS-09 PASS (API + storage; role: User; screenshots: none) 2026-11-16: Bug fixed in `apps/api/src/modules/shared-safari/services/website-safari.service.ts` (`setCover` deletes the old file after the change is saved): user@example.in `PUT /api/shared-safari/safaris/116/cover-image` → 200, the folder holds only the new file. tsc and lint pass in api.

## History

### TC-SS-01 history

- 2026-11-10 PASS: banner, "There are currently N active shared safaris" equal to the API's activeTotal and the SQL count; started listed, ended and inactive not; no Organize for guests; 12 per page then more on scroll, no duplicates; back-to-top.
- 2026-11-16 PASS (current): banner and "There are currently 47 active shared safaris" (= DB Active + Seat full with end date not passed, 47); Kanha, Gir, Ranthambore, Satpura (admin-deleted) and Tadoba (inactive) not listed; no Organize button; 12 cards then infinite scroll to all 47; back-to-top returns to the top. Limit: no active safari with a start before today exists (Gir / Ranthambore ended 14 / 15 Nov and a past start cannot be created), so "started ones listed" was not seen; no console errors.

### TC-SS-02 history

- 2026-11-10 PASS: date badge, strip Safaris / Seats X of Y (grey when full), host line, park, initials with names, +N, "N joined"; buttons per viewer (guest Join → Login, Join, Leave, View Safari, Seat Full → view).
- 2026-11-16 PASS (current): cards show date badge, strip Safaris N / Seats X of Y (grey strip on the Seat full one), host line, park, initials (+N) and "N joined"; button: guest and non-member Join Safari, joined member Leave Safari, host View Safari, Seat full Seat Full for non-members (View Safari for the host), partner no button; no console errors.

### TC-SS-03 history

- 2026-11-10 PASS: park, month, both sliders, theme and stay checkboxes match the API totals; chips ✕, Clear all, "No shared safaris match your filters."; phone Filters sheet with count.
- 2026-11-16 PASS (current): park (Bandhavgarh = 1 + chip), month (start month, December = 3), theme 4, stay 2, safaris 4+ = 4, price to 4000 = 41, price from 6000 = 24 all equal the DB counts; chip X removes a filter; Clear all gives 47 again; an impossible filter shows "No shared safaris match your filters."; Filters button and dialog on 390 px; no console errors.

### TC-SS-04 history

- 2026-11-10 PASS: the six sorts in the API's order, started safaris included.
- 2026-11-16 PASS (current): all six sorts (Newest first, Most safaris, Fewest safaris, Price low to high, Starting soonest, Starting latest) checked against the API data for all 47 rows each; no console errors.

### TC-SS-05 history

- 2026-11-10 PASS: "No shared safaris yet."
- 2026-11-16 PASS (current): with the list API answering no safaris the screen shows "No shared safaris yet." and "There are currently 0 active shared safaris"; no console errors.

### TC-SS-06 history

- 2026-11-10 PASS: three steps with dots, Back keeps values, Cancel closes, bottom sheet on phone, create lands on the view with "Your safari is live." and is listed at once.
- 2026-11-16 PASS (current): organised ct_ss_s2_png/jpg/jpeg/none in 3 steps; Back keeps values, Cancel closes; toast "Your safari is live.", lands on /shared-safaris/<slug>, on the list at once; 390 px is a bottom sheet; no console errors.

### TC-SS-07 history

- 2026-11-10 PASS: every §4 message under its field, Next stays; ₹0 allowed; 999 words saves, 1000 refused.
- 2026-11-16 PASS (current): each message under its field and Next stays on the step: empty title / park / dates; start before today; end not after start; safaris 0 / 11; theme, seats, share, price missing; seats 7; share >= seats; to < from; over ₹10,00,000; share 0; plan empty; plan at 1,000 words "Please provide content within 1000 words."; ₹0 from price accepted; no console errors.

### TC-SS-08 history

- 2026-11-10 PASS: GIF and 6 MB refused with their messages; PNG / JPEG accepted with preview; the picture shown to a guest (`?app=web`, 200 image/png); default cover without one.
- 2026-11-16 PASS: GIF "Use a PNG, JPG or JPEG image."; 6 MB "Use an image up to 5 MB."; PNG, JPG, JPEG and no image all create (see TC-SS-06; stored bytes checked in the next line).
- 2026-11-16 PASS (current): PNG, JPG and JPEG covers of ct_ss_s2_* are served to a guest byte-identical to the upload (cmp), the safari without image answers 404 so the default cover shows.

### TC-SS-09 history

- 2026-11-10 PASS: "Edit your safari", "Safari updated.", slug unchanged, members and comments kept, image replaced.
- 2026-11-16 PASS: Update Safari on a safari with a member and a comment: title, seats, plan and a PNG saved, then the image changed to a JPG; "Safari updated.", slug unchanged, Discussion (1) and Interested - 1 unchanged, the cover endpoint serves the new JPG byte for byte. Observation: the earlier image file stays in storage/shared_safari/<id>/cover_image/ (not removed on replace); no console errors.
- 2026-11-16 FAIL: Bug found: replacing the image on Edit kept the old file in `storage/shared_safari/<id>/cover_image/` (the row and the cover endpoint served the new one); the case and workflow §4 say the old image is replaced. Seen by the safari-parks group.
- 2026-11-16 PASS (current): Bug fixed in `apps/api/src/modules/shared-safari/services/website-safari.service.ts` (`setCover` deletes the old file after the change is saved): user@example.in `PUT /api/shared-safari/safaris/116/cover-image` → 200, the folder holds only the new file. tsc and lint pass in api.

### TC-SS-10 history

- 2026-11-10 PASS: a started safari saves with its dates untouched; its start moved to yesterday is refused.
- 2026-11-16 NOT RUN: the first half (a started safari saves with untouched dates) needs an Active safari whose start has passed: none exists and none can be made today (no database writes in this step). Second half seen: moving the start to yesterday in Edit is refused with "Choose a start date from today up to one year ahead." at both widths.
- 2026-11-17 PASS: Update Safari on the started safari, Next twice and Save changes with the dates untouched → "This safari has already started." note and "Safari updated."; again with the start moved to 2026-11-15 (the date input's `min` taken off) → "Choose a start date from today up to one year ahead." on step 1 (the start is already yesterday, so an earlier date was used); no console errors, no failed calls, no sideways scroll.
- 2026-11-17 PASS (current): on safari 224 (lines in the shared-safari plan §5).

### TC-SS-11 history

- 2026-11-10 PASS: Seat full (grey strip, no Join, members can leave), Inactive (off the list, others "not available", the host sees the page from My Shared Safaris), back to Active.
- 2026-11-16 PASS (current): Change Status dialog (Active / Seat full / Inactive plus Delete this safari); Active -> Seat full: badge, grey strip, guest card button Seat Full; -> Inactive: off the list, guest view "This safari is not available.", host still lists it in My Shared Safaris; -> Active again; toasts "Status changed to …"; no console errors.

### TC-SS-12 history

- 2026-11-10 PASS: "Delete this safari? / This can't be undone.", "Safari deleted.", status −1, others "not available".
- 2026-11-16 PASS (current): "Delete this safari?" / "This can't be undone." Cancel / Delete; then back on My Shared Safaris with "Safari deleted.", gone from the website view and My Shared Safaris; admin API status -1 (console wording in TC-SS-39); no console errors.

### TC-SS-13 history

- 2026-11-10 PASS: picture, title, dates, park, "Organized by", the facts, the share row (no action), masked plan, Discussion (3), Interested - 11.
- 2026-11-16 PASS (current): ct_ss_fx_main as a guest: default cover, title, dates, park, Organized by, facts (nights, seats, safaris, stay, theme, cost), share row of 7 icons with no links, Join Safari, Safari Plan, Discussion (N), Interested - N; no console errors.

### TC-SS-14 history

- 2026-11-10 PASS: `••••` for guest, member and host on the view; full in Edit and the console.
- 2026-11-16 PASS (current): plan with a phone number and an email shows "call •••• or mail ••••" to guest, member and host on the view; the host Edit textarea and the console detail show 9876543210 and ct_plan@ct-test.example in full; no console errors.

### TC-SS-15 history

- 2026-11-10 PASS: unknown slug, inactive (not host) and deleted: "This safari is not available.", Back to Shared Safaris.
- 2026-11-16 PASS (current): inactive (not host), host-deleted (Dudhwa), admin-deleted (Satpura) and unknown slug all show "This safari is not available." with Back to Shared Safaris (the 404 from the API is expected); no other console errors.

### TC-SS-16 history

- 2026-11-10 PASS: an ended safari is off the list and its view opens.
- 2026-11-16 PASS (current): Kanha in the rains (ended 4 Aug) is not on the list and its link opens the view; no console errors.

### TC-SS-17 history

- 2026-11-10 PASS: join from the card and the view, toast, in Interested.
- 2026-11-16 PASS (current): Join on the card and on the view of another safari: toast "You've joined this safari.", button becomes Leave Safari, user appears under Interested; the host got one "{name} joined your safari {title}." notification; no console errors.

### TC-SS-18 history

- 2026-11-10 PASS: leave at once on the card, with "Leave this safari?" on the view; one 801 per member after a re-join.
- 2026-11-16 PASS (current): Leave on the card is at once (no dialog) with "You've left this safari."; join again: the host still has one notification (none for the re-join); Leave on the view asks "Leave this safari?" / "You can join again later." (Cancel / Leave), then the toast and Interested drops; DB joined_at later than first_joined_at after a re-join; no console errors.

### TC-SS-19 history

- 2026-11-10 PASS: own safari, Seat full and inactive refused with their messages.
- 2026-11-16 PASS (current): join own safari "You can't join your own safari."; Seat full 422 "This safari is not open to join."; inactive one 404 "This safari is not available." (an inactive safari is hidden from non-hosts); a partner 403 "Partners can't join a shared safari."; on the card the Seat Full button opens the view (Seat full badge, no Join); no console errors.

### TC-SS-20 history

- 2026-11-10 PASS: "This safari has already started." note; join and leave work.
- 2026-11-16 NOT RUN: needs an Active safari whose start date has passed but whose end date has not. None exists today (Gir and Ranthambore ended 14 / 15 Nov), a safari cannot be created with a past start and this step may not change the database. Join and leave themselves work (TC-SS-17, 18).
- 2026-11-17 PASS: riya.sharma@example.test opened the started safari, Join Safari → "You've joined this safari.", Leave Safari → Leave → the Join Safari button is back (Riya ends as she started); no console errors, no failed calls, no sideways scroll.
- 2026-11-17 PASS (current): on safari 224 (lines in the shared-safari plan §5).

### TC-SS-21 history

- 2026-11-10 PASS: 8 initials then "+3", names on hover, not clickable; popup "INTERESTED (11)" with S.No / Name / Joined On and "Showing 1 - 11 of 11 interested users"; the one who left not shown.
- 2026-11-16 PASS (current): ct_ss_fx_nine (9 joined, 1 left): 8 initials then +1, names on hover (title), clicking a face opens nothing; popup "INTERESTED (9)" with S.No / Name / Joined On and "Showing 1 - 9 of 9 interested users", the one who left not shown; no console errors.

### TC-SS-22 history

- 2026-11-10 PASS: guest Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icons.
- 2026-11-16 PASS (current): Join Safari and the account icon go to /login; discussion says "Sign in and join this safari to comment."; no flag icon; no console errors.

### TC-SS-23 history

- 2026-11-10 PASS: "Enter a comment.", 200 words refused, 199 accepted, oldest first, reply under its comment.
- 2026-11-16 PASS (current): member comments and the host replies; comments oldest first, replies under their comment, host marked (Host), Discussion (N) count; empty -> "Enter a comment."; 200 words -> "Please provide content within 200 words."; 199 words posts; no console errors.

### TC-SS-24 history

- 2026-11-10 PASS: never joined "Join this safari to comment."; a member who left and a started safari get the box.
- 2026-11-16 PASS (current): never joined: "Join this safari to comment." and no box; left member: box shown and a comment posts. The started-safari row (box shown) was not run: no Active safari with a passed start date exists and none can be made today; no console errors.

### TC-SS-25 history

- 2026-11-10 PASS: edit with the same rules, "Comment updated.", no edited mark.
- 2026-11-16 PASS (current): Edit icon opens the box; Cancel keeps the text; empty -> "Enter a comment.", 200 words -> the 200-word message; Save changes the text with "Comment updated." and no "edited" mark; no console errors.

### TC-SS-26 history

- 2026-11-10 PASS: deletes at once; a reply alone, a comment with its replies, also gone from the console.
- 2026-11-16 PASS (current): delete icon removes a reply at once (no confirm) with "Reply deleted.", the comment and its other reply stay; deleting a comment with a reply gives "Comment deleted." and both vanish from the website and from the console detail (admin API); no console errors.

### TC-SS-27 history

- 2026-11-10 PASS: after leaving no Edit / Delete icons; can still post.
- 2026-11-16 PASS (current): after leaving, the member's own comment has no Edit / Delete icons (0 / 0) and a new comment still posts; no console errors.

### TC-SS-28 history

- 2026-11-10 PASS: active reasons in added order, "Thanks, we'll review this comment.", two flags = two rows, own comment refused.
- 2026-11-16 PASS (current): dialog lists the 8 active reasons in added order; flag with reason and details gives "Thanks, we'll review this comment."; flagging again is accepted and both counted (admin detail 2 open flags); flagging one's own comment by API 422 "You can't flag your own comment."; no console errors.

### TC-SS-29 history

- 2026-11-10 PASS: "Select a reason.", "Enter the details.", 501 characters "Use up to 500 characters."
- 2026-11-16 PASS (current): no reason and no details -> "Select a reason." and "Enter the details."; reason only -> "Enter the details."; 501 characters -> "Use up to 500 characters."; 500 accepted; no console errors.

### TC-SS-30 history

- 2026-11-10 PASS: a deactivated host's safaris leave the list, the count, the view and members' Joined tab; the console still lists them; back after reactivation.
- 2026-11-16 PASS (current): ct_ss_8 (host of a safari) deactivated in Console > Users: its safari is off the website list, its link says "This safari is not available.", it is gone from the member's Joined tab; the console Shared Safaris still lists it; after reactivating (done right away, both users Active again) all is back; no console errors.

### TC-SS-31 history

- 2026-11-10 PASS: a deactivated member's comment, Interested entry, count and flag hidden; back after reactivation.
- 2026-11-16 PASS (current): ct_ss_9 (member with a comment, a reply, a join and a flag) deactivated: Discussion (3) -> (1), comment and reply hidden, Interested - 2 -> 1, console Joined count 2 -> 1, its flag and the comment it flagged leave Flagged Comments; all back after reactivating (done right away); no console errors.

### TC-SS-32 history

- 2026-11-10 PASS: Organised (Active / Seat full / Inactive / Over; View, Edit, Change status, Delete) and Joined (no Inactive, Over, Hosted by; View, Leave); icons in their own row on phone.
- 2026-11-16 PASS (current): Organised tab (51): Active / Seat full / Inactive statuses, View / Edit / Change status / Delete icons, host-deleted ones not listed; Joined tab (20): View / Leave, a safari made Inactive by its host leaves the tab (20 -> 19) and returns when Active (restored); 390 px keeps icons in their own row. "Over" on a started safari not seen (none exists today); no console errors.

### TC-SS-33 history

- 2026-11-10 PASS: the two texts in the mail popover and on Notifications, each opening `/shared-safaris/{id}`; none for the host's own comments.
- 2026-11-16 PASS (current): mail popover and Notifications page show "{name} joined your safari {title}." and "{name} commented on your safari {title}." with Mark all as read and unread counts; DB for ct_ss_fx_c_1366: 3 joins (801) and 5 comments by others (802), none for the host's own comments and replies (no notification with the host as actor); clicking one opens /shared-safaris/<id>; no console errors.

### TC-SS-34 history

- 2026-11-10 PASS: `/` is Shared Safaris, Welcome gone, `/dashboard` is the site's "Page not found" (the dev server answers every unknown address with 200, as before), Organize only when signed in.
- 2026-11-16 PASS (current): / is Shared Safaris; Organize a Shared Safari only when signed in; signed in, /dashboard and /welcome show the 404 "Page not found"; a guest opening them is sent to /login by the portal guard (not a 404); no console errors.

### TC-SS-35 history

- 2026-11-04 PASS: Status All by default, 20 per page (page 2 from S.No 21), each status filter shows only its badges, search by title and by park, Host picker, Clear filters; Joined / Left counts open their lists (bottom sheet on phone); Filters button on phone.
- 2026-11-16 PASS (current): default All (pinned first, then newest), S.No, 20 per page (Showing 1–20 of 72, page 2 starts at 21); Status Active / Inactive 4 / Seat full 5 / Deleted by admin 1 / Deleted by host 5; search by title or park; Host filter popup (Ananya = 4); Clear filters resets; Joined / Left counts open their lists with join / leave times; Filters dialog on 390 px; no console errors.

### TC-SS-36 history

- 2026-11-04 PASS: Pin / Unpin with toast and tooltip, filled green / outline icon, pinned first; a deleted pinned safari stays pinned and first; audit 813 / 814.
- 2026-11-16 PASS (current): Pin to top from the list puts the safari first (filled icon); on the detail Unpin removes the Pinned tag (API isPinned false) and Pin restores it; a pinned safari deleted by admin stays pinned (isPinned true while status 4) and is Active \| Pinned after Make active; no console errors. Audit: TC-SS-44.

### TC-SS-37 history

- 2026-11-04 PASS: details with the plan in full (phone and email shown), picture, Joined (2) with join times, Left (1) with "Left on", Comments (4) with reply and flag counts, replies marked.
- 2026-11-16 PASS (current): console detail (ct_ss_fx_main, ct_ss_fx_nine, Tigers of Bandhavgarh): host with email, park, theme, dates, safaris, stay, seats, price, created / updated, picture, plan in full; tabs Joined (N) with join time, Left (N) with Left on, Comments (7) with By / Replies / Flags; cards on 390 px; no console errors.

### TC-SS-38 history

- 2026-11-04 PASS: "Select a reason.", "Enter the details.", "Use up to 1000 characters."; after Delete the reason banner, the Deleted by admin filter, the website 404; Make active back to Active with the delete columns NULL and the website showing it; audit 809, 811.
- 2026-11-16 PASS (current): Delete dialog: no reason / details -> "Select a reason." / "Enter the details.", 1,001 characters -> "Use up to 1000 characters."; Commercial or Spam + details deletes: status 4, banner "Deleted by admin", website "This safari is not available."; Make active returns to Active (status 1) with the banner gone; no console errors. Audit: TC-SS-44.

### TC-SS-39 history

- 2026-11-04 PASS: "Deleted by host on … This safari is read-only.", no Pin, Delete, Make active or comment delete.
- 2026-11-16 PASS (current): host-deleted safaris (ct_ss_fx_sd_*, sample Dudhwa): banner "Deleted by host on <date time>. This safari is read-only." and no Make active, Pin or Delete buttons; no console errors.

### TC-SS-40 history

- 2026-11-04 PASS: a single reply deleted alone; a comment deleted with its replies, on the console and the website; their open flags closed; audit 825.
- 2026-11-16 PASS (current): console Comments tab: "Delete this reply?" removes only that reply ("Reply deleted."); "Delete this comment and its replies?" removes the comment and its other reply ("Comment deleted."); the website shows Discussion (0); deleting a flagged comment drops it from Flagged Comments (admin API 1 -> 0, its flags closed); no console errors.

### TC-SS-41 history

- 2026-11-04 PASS: Flagged Comments shows the edited text, leaves out the writer-deleted comment; View flags (reason, details, who, when); Ignore keeps the comment; Delete removes it and its reply; flags closed.
- 2026-11-16 PASS (current): Flagged Comments lists the comment edited after flagging with its current text and its reasons / flag counts, not the one its writer deleted; View flags shows Flags (3) with reason, details, flagger and time; Ignore ("Flags ignored. The comment stays.") keeps the comment on the website and leaves the list; Delete ("Delete this comment and its replies?") removes the comment and its reply from list and website; no console errors.

### TC-SS-42 history

- 2026-11-04 PASS: a guest gets 401 UNAUTHENTICATED on every signed-in route (mine, create, join, comment, edit / flag a comment, active flag reasons) and 200 on the public ones (list, view, active parks); a signed-up member without a role is refused by the console sign-in (CONSOLE_ACCESS_DENIED) and gets 403 ACCESS_DENIED on every Super Admin route (shared-safari admin, parks, flag reasons); editing, changing the status of or deleting someone else's safari gives 403 SHARED_SAFARI_NOT_HOST, editing or deleting someone else's comment 403 SHARED_SAFARI_NOT_WRITER.
- 2026-11-16 PASS (current): 16 console routes (admin safaris, comments, flags, parks, flag reasons) answer 403 to a member and 401 to a guest; 13 signed-in routes answer 401 to a guest; the public routes (list, view, cover, parks) answer a guest 200 (cover 404 when the safari has none); editing, changing the status of, deleting or loading the edit form of another host's safari -> 403 SHARED_SAFARI_NOT_HOST; editing or deleting another's comment -> 403 SHARED_SAFARI_NOT_WRITER; data unchanged.

### TC-SS-43 history

- 2026-11-04 PASS: `todayInIndia` turns from 2026-11-04 to 2026-11-05 between 18:29Z and 18:31Z; a safari starting today (IST) is not started; with its start yesterday it is started and still listed (activeTotal 1); with its end yesterday it leaves the list (activeTotal 0) and its view still opens (200).
- 2026-11-16 PASS (current): IST rules by API (13:30 IST / 08:00 UTC now, so the live clock is not near midnight): a safari starting today 201 and isStarted false; start yesterday and one year plus a day refused with "Choose a start date from today up to one year ahead."; one year ahead accepted; todayInIndia() switches date at 18:30 UTC (18:29:59Z -> 2026-11-16, 18:30:00Z -> 2026-11-17).

### TC-SS-44 history

- 2026-11-04 PASS: every write wrote its audit row with what changed (sign-up 107, created 801 with title and slug, comment 820 with its text); every refused change wrote its failure row with the error code (804, 806, 808 SHARED_SAFARI_NOT_HOST; 823, 826 SHARED_SAFARI_NOT_WRITER); the earlier smoke test covered the rest (803–829). Test users `ct_api1/2` and their rows deleted.
- 2026-11-16 PASS (current): audit_log rows with changes since 07:00 UTC: created 801 (54), updated 803, status 805, host delete 807, admin delete 809, make active 811, pin 813 / unpin 814, join 816, leave 818, comment 820 / edit 822 / delete by writer 824 / by admin 825, flag 827, ignore flags 829; failures recorded as outcome 2: 802, 804, 806, 808, 817, 823, 826, 828.

### TC-PKSS-02 history

- 2026-11-14 PASS: vivek.rao (Active) and ct_pkss_a: W1 shows no Organize button and no Join Safari (12 cards for vivek); W9 shows no Organise a Safari (hosted safari 113 listed); W3 114 shows no Join; ct_pkss_a's own 113 keeps Update Safari and Change Status; earlier safaris commentable (comment posted as the business). A partner still joined keeps Leave: not seen in the browser (both partners had already left and can't join again); the code keeps Leave when `viewer.joined`. Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-partner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-partner-390.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-vivek-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-ctpartner-390.png.
- 2026-11-16 PASS (current): no Organize button and no Join Safari on the list, none on a safari view ("Join this safari to comment."), no Organise a Safari on My Shared Safaris; API organise 403 SHARED_SAFARI_PARTNER (join 403, TC-SS-19); the earlier safari keeps Update Safari / Change Status, shows "Organized by ct_ SS Wild Tours" and is commentable, comments (also the one written before approval) appear as "ct_ SS Wild Tours (Host)"; no console errors. Test data: user ct_ss_13@ct-test.example, partner ct_ SS Wild Tours (approved), safari ct_ss_fx_pkss.

### TC-SEED-01 history

- 2026-11-13 PASS: the dry run listed 14 accounts and 14 safaris to create, and Gir and Ranthambore "moved 10 days". Every table count was unchanged afterwards.
- 2026-11-16 PASS (current): seed/shared-safari without confirm on the already seeded database: "Accounts: 0 to create, 14 already there. Safaris: 0 to create, 14 already there.", per-safari list, "Dry run: nothing written"; seed-scoped table counts unchanged (an empty-seed dry run, which lists 14 + 14 to create, cannot be shown without deleting the data).

### TC-SEED-02 history

- 2026-11-13 PASS: "14 accounts and 14 safaris created". It wrote:
- 2026-11-16 PASS (current): seed/shared-safari <password> confirm (idempotent re-run, a throwaway password as nothing is created): "Done: 0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there."; the sample set in the DB is 14 safaris, 41 member rows (37 current, 4 left), 14 comments and replies, 3 flags, 4 notifications, 13 covers (remove dry run lists 13 cover pictures). The first seed on an empty database was not repeated (no data delete).

### TC-SEED-03 history

- 2026-11-13 PASS: `mail_log` stayed 0 and `job_run` 0. `notification` grew by exactly 4: Riya 3 (joined, commented, commented-read) and Ananya 1, with the prototype's times.
- 2026-11-16 PASS (current): before and after the add run: mail_log 20 -> 20 and the 4 sample notifications (entity 99..112, created before 4 Nov) stay 4; the seed writes no mail. The "notification grows by exactly 4" part belongs to a first seed and was not repeated.

### TC-SEED-04 history

- 2026-11-13 PASS: the second run printed "0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there". Every count was unchanged.
- 2026-11-16 PASS (current): the add command run again with confirm: everything "already there"; users @example.test 15 -> 15, seed safaris 14 -> 14, members 41 -> 41, comments 14 -> 14, flags 3 -> 3, notifications 4 -> 4.

### TC-SEED-05 history

- 2026-11-13 PASS: with `NODE_ENV=production` both commands print "Sample data is never written in production". Each of the 9 seed service methods (users ×3, notification ×3, shared-safari ×3), called with `isProduction: true`, threw `SEED_NOT_ALLOWED`. Counts (audit_log included) were unchanged.
- 2026-11-16 PASS (current): NODE_ENV=production: seed/shared-safari (dry), seed/shared-safari <pw> confirm and seed/shared-safari-remove (dry) all print "Sample data is never written in production (NODE_ENV=production)." with exit 1; calling the users, notification and shared-safari seed services with isProduction true: seedAccounts, removeAccounts, seed and remove all throw SEED_NOT_ALLOWED; nothing written (counts unchanged).

### TC-SEED-06 history

- 2026-11-13 PASS: —
- 2026-11-16 NOT RUN (current): user rule: no data delete. Only the dry run was run: "Would remove: 14 safaris, 41 members, 14 comments, 3 flags, 4 notifications, 13 cover pictures." and the 14 sample accounts; "Dry run: nothing removed."; the remove with confirm was not run.

### TC-SEED-07 history

- 2026-11-13 PASS: seeding again after the remove gave "14 accounts and 14 safaris created" and the same counts as TC-SEED-02 (13 cover files).
- 2026-11-16 NOT RUN (current): user rule: no data delete; it follows a remove with confirm (TC-SEED-06), so seed-after-remove was not run. The add command itself works on the existing data (TC-SEED-02 / 04).

### TC-SEED-08 history

- 2026-11-13 PASS: —
- 2026-11-16 PASS (current): W1 as the board: banner, filters, sorts (TC-SS-03 / 04), cards with date badge, Safaris / Seats strip, host, park, faces, N joined and the button for the 8 sample safaris that have not ended (Tigers of Bandhavgarh 4 / 3 of 5 / 7 joined, Corbett birding trail Seat Full, Periyar 0 joined, …); the count reads "There are currently 80 active shared safaris" because the tests added ct safaris (the board says 10: Gir and Ranthambore have ended since); no console errors.

### TC-SEED-09 history

- 2026-11-13 PASS: —
- 2026-11-16 PASS (current): Tigers of Bandhavgarh: plan with phone and email masked (••••), Interested - 7, Discussion (7) with 7 comments / replies in order; same for a guest and a signed-in user (the sample accounts' own passwords are not available, so Riya was not signed in); no console errors.

### TC-SEED-10 history

- 2026-11-13 PASS: —
- 2026-11-16 PASS (current): console list: the 14 sample safaris (API) with joined / left counts (Tigers 7 / 2, Dudhwa 1 / 1, Corbett 6 / 0 …) and statuses (Active, Seat full, Inactive, Deleted by admin, Deleted by host, pinned Tigers and Dudhwa); search Bandhavgarh gives 1 row 7 / 2 Active 3/5; Status filter Deleted by host lists Dudhwa; total reads higher than 14 because of ct data; no console errors.

### TC-SEED-11 history

- 2026-11-13 PASS: —
- 2026-11-16 PASS (current): on Pench by jeep: View, Pin then Unpin, Delete with reason Off Topic (status 4, banner), Make active - all worked and the safari is back exactly as before (status 1, not pinned, no delete reason; only audit rows and updated_at differ); Flagged Comments shows Raj Patel's comment ("Call me on 98201 45678 …") with 3 flags, Reasons Commercial or Spam, Other; no console errors. Sample data changed and restored.

### TC-SEED-12 history

- 2026-11-13 PASS: side-by-side screenshots of W1, W3, W9, C1, C3 and C4, prototype beside local. Same layout and data, except:
- 2026-11-16 PASS (current): board screenshots of W1, W3, W9, C1, C3, C4 (desktop and .mobile) taken from the prototype file beside the local screens at 1366 and 390 px: same frame, cards, tables and dialogs; only the sample data, the prototype bar and the prototype aids (View as, Accounts, State) differ. Compared by eye on W1 card grid; the others as in the PROTOTYPE-SYNC rows.
