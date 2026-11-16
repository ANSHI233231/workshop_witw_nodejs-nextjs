# Test document: Shared Safari

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-04-shared-safari.md`, `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-13-shared-safari-seed.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §4 to §10, §11.1 to §11.3, §13; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §2.5 |
| How it works | `docs/how-it-works/modules/shared-safari/README.md` |
| Latest run | 2026-11-14 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 57 | 57 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-SS-01 | List as guest | — | PASS | 2026-11-10 |
| TC-SS-02 | Card | — | PASS | 2026-11-10 |
| TC-SS-03 | Filters | — | PASS | 2026-11-10 |
| TC-SS-04 | Sort | — | PASS | 2026-11-10 |
| TC-SS-05 | Empty list | — | PASS | 2026-11-10 |
| TC-SS-06 | Organise (3 steps) | — | PASS | 2026-11-10 |
| TC-SS-07 | Organise errors | — | PASS | 2026-11-10 |
| TC-SS-08 | Display image | — | PASS | 2026-11-10 |
| TC-SS-09 | Edit | — | PASS | 2026-11-10 |
| TC-SS-10 | Edit dates of a started safari | — | PASS | 2026-11-10 |
| TC-SS-11 | Change status | — | PASS | 2026-11-10 |
| TC-SS-12 | Host delete | — | PASS | 2026-11-10 |
| TC-SS-13 | View page | — | PASS | 2026-11-10 |
| TC-SS-14 | Plan masking | — | PASS | 2026-11-10 |
| TC-SS-15 | Not available | — | PASS | 2026-11-10 |
| TC-SS-16 | Ended safari | — | PASS | 2026-11-10 |
| TC-SS-17 | Join | — | PASS | 2026-11-10 |
| TC-SS-18 | Leave and join again | — | PASS | 2026-11-10 |
| TC-SS-19 | Join refused | — | PASS | 2026-11-10 |
| TC-SS-20 | Join a started safari | — | PASS | 2026-11-10 |
| TC-SS-21 | Interested | — | PASS | 2026-11-10 |
| TC-SS-22 | Guest actions | — | PASS | 2026-11-10 |
| TC-SS-23 | Comment and reply | — | PASS | 2026-11-10 |
| TC-SS-24 | Who can comment | — | PASS | 2026-11-10 |
| TC-SS-25 | Edit own comment | — | PASS | 2026-11-10 |
| TC-SS-26 | Delete own comment / reply | — | PASS | 2026-11-10 |
| TC-SS-27 | Own comments after leaving | — | PASS | 2026-11-10 |
| TC-SS-28 | Flag | — | PASS | 2026-11-10 |
| TC-SS-29 | Flag errors | — | PASS | 2026-11-10 |
| TC-SS-30 | Deactivated host | — | PASS | 2026-11-10 |
| TC-SS-31 | Deactivated member | — | PASS | 2026-11-10 |
| TC-SS-32 | My Shared Safaris | — | PASS | 2026-11-10 |
| TC-SS-33 | Notifications | — | PASS | 2026-11-10 |
| TC-SS-34 | Portal entry | — | PASS | 2026-11-10 |
| TC-SS-35 | Console list | — | PASS | 2026-11-04 |
| TC-SS-36 | Pin | — | PASS | 2026-11-04 |
| TC-SS-37 | Console detail | — | PASS | 2026-11-04 |
| TC-SS-38 | Delete with reason and make active | — | PASS | 2026-11-04 |
| TC-SS-39 | Host-deleted in console | — | PASS | 2026-11-04 |
| TC-SS-40 | Admin deletes a comment / reply | — | PASS | 2026-11-04 |
| TC-SS-41 | Flagged Comments | — | PASS | 2026-11-04 |
| TC-SS-42 | Access | — | PASS | 2026-11-04 |
| TC-SS-43 | IST dates | — | PASS | 2026-11-04 |
| TC-SS-44 | Audit | — | PASS | 2026-11-04 |
| TC-PKSS-02 | Partner and shared safaris | — | PASS | 2026-11-14 |
| TC-SEED-01 | Dry run writes nothing | — | PASS | 2026-11-13 |
| TC-SEED-02 | Seed | — | PASS | 2026-11-13 |
| TC-SEED-03 | No delivery while seeding | — | PASS | 2026-11-13 |
| TC-SEED-04 | Run twice | — | PASS | 2026-11-13 |
| TC-SEED-05 | Production refused | — | PASS | 2026-11-13 |
| TC-SEED-06 | Remove | — | PASS | 2026-11-13 |
| TC-SEED-07 | Seed again after remove | — | PASS | 2026-11-13 |
| TC-SEED-08 | Website list like W1 | — | PASS | 2026-11-13 |
| TC-SEED-09 | Safari page | — | PASS | 2026-11-13 |
| TC-SEED-10 | Console list like C1 | — | PASS | 2026-11-13 |
| TC-SEED-11 | Console actions | — | PASS | 2026-11-13 |
| TC-SEED-12 | Prototype beside local | — | PASS | 2026-11-13 |

## Cases

### TC-SS-01 List as guest

| | |
|---|---|
| Title | List as guest |
| Role | — |
| Pre-condition | safaris in every status and date state |
| Steps | open `/` |
| Expected result | banner; "There are currently N active shared safaris" (Active + Seat full, end date not passed); started ones listed, ended ones not; no Organize button; infinite scroll; back-to-top |
| Actual result | banner, "There are currently N active shared safaris" equal to the API's activeTotal and the SQL count; started listed, ended and inactive not; no Organize for guests; 12 per page then more on scroll, no duplicates; back-to-top. |
| Result | PASS |
| Method | browser 1366 + 390 + SQL |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-02 Card

| | |
|---|---|
| Title | Card |
| Role | — |
| Pre-condition | list |
| Steps | look at cards as guest, member, joined member, host; a Seat full one |
| Expected result | date badge, strip Safaris N · Seats X of Y (grey when full), host line, park, initials (+N), "N joined"; the button per viewer as §6.1 |
| Actual result | date badge, strip Safaris / Seats X of Y (grey when full), host line, park, initials with names, +N, "N joined"; buttons per viewer (guest Join → Login, Join, Leave, View Safari, Seat Full → view). |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-03 Filters

| | |
|---|---|
| Title | Filters |
| Role | — |
| Pre-condition | list |
| Steps | each filter; chips ✕; Clear all; Filters button on mobile |
| Expected result | the list matches; Month = start month; "No shared safaris match your filters." |
| Actual result | park, month, both sliders, theme and stay checkboxes match the API totals; chips ✕, Clear all, "No shared safaris match your filters."; phone Filters sheet with count. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-04 Sort

| | |
|---|---|
| Title | Sort |
| Role | — |
| Pre-condition | list |
| Steps | each of the six sorts |
| Expected result | ordered as named; started ones included by start date |
| Actual result | the six sorts in the API's order, started safaris included. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-05 Empty list

| | |
|---|---|
| Title | Empty list |
| Role | — |
| Pre-condition | no safaris |
| Steps | open `/` |
| Expected result | "No shared safaris yet." |
| Actual result | "No shared safaris yet." |
| Result | PASS |
| Method | browser, empty answer mocked because other rows existed |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-06 Organise (3 steps)

| | |
|---|---|
| Title | Organise (3 steps) |
| Role | — |
| Pre-condition | signed in |
| Steps | Organize; steps 1–3; Back keeps values; Cancel |
| Expected result | Active, on the list at once; lands on the view, "Your safari is live."; bottom sheet on mobile |
| Actual result | three steps with dots, Back keeps values, Cancel closes, bottom sheet on phone, create lands on the view with "Your safari is live." and is listed at once. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-07 Organise errors

| | |
|---|---|
| Title | Organise errors |
| Role | — |
| Pre-condition | signed in |
| Steps | each §4 rule: title, park, dates, safaris, theme, seats, prices (₹0 allowed), plan at 1,000 words |
| Expected result | each message under its field; Next stays on the step |
| Actual result | every §4 message under its field, Next stays; ₹0 allowed; 999 words saves, 1000 refused. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-08 Display image

| | |
|---|---|
| Title | Display image |
| Role | — |
| Pre-condition | organising |
| Steps | PNG, JPG, JPEG; a GIF; a 6 MB file; none |
| Expected result | shown on card and view (also to a guest); "Use a PNG, JPG or JPEG image."; "Use an image up to 5 MB."; default cover when none; file stored as uploaded |
| Actual result | GIF and 6 MB refused with their messages; PNG / JPEG accepted with preview; the picture shown to a guest (`?app=web`, 200 image/png); default cover without one. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-09 Edit

| | |
|---|---|
| Title | Edit |
| Role | — |
| Pre-condition | host, safari with members and comments |
| Steps | Edit; change fields and image; save |
| Expected result | members and comments kept; slug unchanged; old image replaced |
| Actual result | "Edit your safari", "Safari updated.", slug unchanged, members and comments kept, image replaced. |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-10 |
| Screenshot | — |
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
| Actual result | a started safari saves with its dates untouched; its start moved to yesterday is refused. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-11 Change status

| | |
|---|---|
| Title | Change status |
| Role | — |
| Pre-condition | host |
| Steps | Active → Seat full → Inactive → Active |
| Expected result | Seat full: grey strip, no Join; Inactive: off the list, others "This safari is not available.", the host still sees it from My Shared Safaris |
| Actual result | Seat full (grey strip, no Join, members can leave), Inactive (off the list, others "not available", the host sees the page from My Shared Safaris), back to Active. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-12 Host delete

| | |
|---|---|
| Title | Host delete |
| Role | — |
| Pre-condition | host |
| Steps | Delete this safari? → Delete |
| Expected result | gone from the website and My Shared Safaris; final; console shows "Deleted by host" |
| Actual result | "Delete this safari? / This can't be undone.", "Safari deleted.", status −1, others "not available". |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-13 View page

| | |
|---|---|
| Title | View page |
| Role | — |
| Pre-condition | Active safari |
| Steps | open as guest |
| Expected result | picture, title, dates, park, host, details, share row (no action), plan, Discussion (N), Interested – N |
| Actual result | picture, title, dates, park, "Organized by", the facts, the share row (no action), masked plan, Discussion (3), Interested - 11. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-14 Plan masking

| | |
|---|---|
| Title | Plan masking |
| Role | — |
| Pre-condition | a plan with a phone number and an email |
| Steps | view as guest, member, host; host Edit; console detail |
| Expected result | `••••` on the view for everyone; full in Edit and the console |
| Actual result | `••••` for guest, member and host on the view; full in Edit and the console. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-15 Not available

| | |
|---|---|
| Title | Not available |
| Role | — |
| Pre-condition | inactive (not host), deleted, unknown slug |
| Steps | open each link |
| Expected result | "This safari is not available." with Back to Shared Safaris |
| Actual result | unknown slug, inactive (not host) and deleted: "This safari is not available.", Back to Shared Safaris. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-16 Ended safari

| | |
|---|---|
| Title | Ended safari |
| Role | — |
| Pre-condition | end date passed |
| Steps | list; open its link |
| Expected result | not on the list; the view opens |
| Actual result | an ended safari is off the list and its view opens. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-17 Join

| | |
|---|---|
| Title | Join |
| Role | — |
| Pre-condition | member |
| Steps | Join on the card; on the view of another |
| Expected result | "You've joined this safari."; in Interested; host notified |
| Actual result | join from the card and the view, toast, in Interested. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-18 Leave and join again

| | |
|---|---|
| Title | Leave and join again |
| Role | — |
| Pre-condition | joined member |
| Steps | leave on the card (at once); join; leave on the view ("Leave this safari?") |
| Expected result | "You've left this safari."; host not notified on the re-join; Joined On = last join |
| Actual result | leave at once on the card, with "Leave this safari?" on the view; one 801 per member after a re-join. |
| Result | PASS |
| Method | browser + SQL |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-19 Join refused

| | |
|---|---|
| Title | Join refused |
| Role | — |
| Pre-condition | — |
| Steps | join own safari; a Seat full; an inactive one (API) |
| Expected result | "You can't join your own safari."; "This safari is not open to join." |
| Actual result | own safari, Seat full and inactive refused with their messages. |
| Result | PASS |
| Method | API |
| Date | 2026-11-10 |
| Screenshot | — |
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
| Actual result | "This safari has already started." note; join and leave work. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-21 Interested

| | |
|---|---|
| Title | Interested |
| Role | — |
| Pre-condition | 9+ joined, 1 left |
| Steps | view; hover; open the popup as guest |
| Expected result | 8 initials then "+N", names on hover, no click; popup "INTERESTED (N)", S.No / Name / Joined On, "Showing 1 - N of N interested users"; the one who left not shown |
| Actual result | 8 initials then "+3", names on hover, not clickable; popup "INTERESTED (11)" with S.No / Name / Joined On and "Showing 1 - 11 of 11 interested users"; the one who left not shown. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-22 Guest actions

| | |
|---|---|
| Title | Guest actions |
| Role | — |
| Pre-condition | guest |
| Steps | Join Safari; account icon; discussion |
| Expected result | Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icon |
| Actual result | guest Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icons. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-23 Comment and reply

| | |
|---|---|
| Title | Comment and reply |
| Role | — |
| Pre-condition | joined member, host |
| Steps | post a comment; reply; 200 words |
| Expected result | oldest first; reply under its comment; "Please provide content within 200 words."; "Enter a comment." |
| Actual result | "Enter a comment.", 200 words refused, 199 accepted, oldest first, reply under its comment. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-24 Who can comment

| | |
|---|---|
| Title | Who can comment |
| Role | — |
| Pre-condition | never joined; left member; started safari |
| Steps | open the discussion |
| Expected result | never joined: "Join this safari to comment."; left member: box shown, can post; started: box shown |
| Actual result | never joined "Join this safari to comment."; a member who left and a started safari get the box. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-25 Edit own comment

| | |
|---|---|
| Title | Edit own comment |
| Role | — |
| Pre-condition | writer |
| Steps | Edit icon; change; Save; Cancel |
| Expected result | text changes, no "edited" mark; same rules |
| Actual result | edit with the same rules, "Comment updated.", no edited mark. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-26 Delete own comment / reply

| | |
|---|---|
| Title | Delete own comment / reply |
| Role | — |
| Pre-condition | writer |
| Steps | delete a reply; delete a comment with replies |
| Expected result | at once, no confirm; reply alone gone; comment and its replies gone, also from the console |
| Actual result | deletes at once; a reply alone, a comment with its replies, also gone from the console. |
| Result | PASS |
| Method | browser + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-27 Own comments after leaving

| | |
|---|---|
| Title | Own comments after leaving |
| Role | — |
| Pre-condition | writer who left |
| Steps | look at their comment |
| Expected result | no Edit / Delete icons; can still post |
| Actual result | after leaving no Edit / Delete icons; can still post. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-28 Flag

| | |
|---|---|
| Title | Flag |
| Role | — |
| Pre-condition | signed in |
| Steps | flag another's comment with reason and details; flag it again; own comment (API) |
| Expected result | "Thanks, we'll review this comment."; both flags counted; "You can't flag your own comment."; only active reasons offered, in added order |
| Actual result | active reasons in added order, "Thanks, we'll review this comment.", two flags = two rows, own comment refused. |
| Result | PASS |
| Method | browser + SQL + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-29 Flag errors

| | |
|---|---|
| Title | Flag errors |
| Role | — |
| Pre-condition | signed in |
| Steps | no reason; no details; 501 characters |
| Expected result | errors; "Use up to 500 characters." |
| Actual result | "Select a reason.", "Enter the details.", 501 characters "Use up to 500 characters." |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-30 Deactivated host

| | |
|---|---|
| Title | Deactivated host |
| Role | — |
| Pre-condition | host with safaris, deactivated in Console › Users |
| Steps | list, view link, member's My Shared Safaris; reactivate |
| Expected result | hidden everywhere, "This safari is not available."; console still lists them; back after reactivation |
| Actual result | a deactivated host's safaris leave the list, the count, the view and members' Joined tab; the console still lists them; back after reactivation. |
| Result | PASS |
| Method | browser + SQL |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-31 Deactivated member

| | |
|---|---|
| Title | Deactivated member |
| Role | — |
| Pre-condition | member with comments, flags, a join |
| Steps | deactivate; view the safari, card, Flagged Comments |
| Expected result | comments, replies and flags hidden; left out of Interested and counts |
| Actual result | a deactivated member's comment, Interested entry, count and flag hidden; back after reactivation. |
| Result | PASS |
| Method | browser + SQL + API |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-32 My Shared Safaris

| | |
|---|---|
| Title | My Shared Safaris |
| Role | — |
| Pre-condition | host and member |
| Steps | both tabs; icon actions; a started one; mobile |
| Expected result | Organised: Active / Seat full / Inactive, "Over" on started, View / Edit / Change status / Delete; Joined: not Inactive or deleted, View / Leave; icons in their own row on mobile |
| Actual result | Organised (Active / Seat full / Inactive / Over; View, Edit, Change status, Delete) and Joined (no Inactive, Over, Hosted by; View, Leave); icons in their own row on phone. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-33 Notifications

| | |
|---|---|
| Title | Notifications |
| Role | — |
| Pre-condition | host |
| Steps | someone joins; comments; replies; host comments |
| Expected result | "{name} joined your safari {title}." / "{name} commented on your safari {title}." in the mail popover and Notifications; none for the host's own; each opens the safari |
| Actual result | the two texts in the mail popover and on Notifications, each opening `/shared-safaris/{id}`; none for the host's own comments. |
| Result | PASS |
| Method | browser + SQL |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-34 Portal entry

| | |
|---|---|
| Title | Portal entry |
| Role | — |
| Pre-condition | web |
| Steps | open `/`, `/dashboard`, the old Welcome |
| Expected result | `/` is Shared Safaris; `/dashboard` 404; Organize only when signed in |
| Actual result | `/` is Shared Safaris, Welcome gone, `/dashboard` is the site's "Page not found" (the dev server answers every unknown address with 200, as before), Organize only when signed in. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-10 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-35 Console list

| | |
|---|---|
| Title | Console list |
| Role | — |
| Pre-condition | console |
| Steps | default All; each status filter incl. Deleted by host; search; host; Clear filters |
| Expected result | pinned first then newest; S.No; 20 per page; Joined / Left counts open their lists |
| Actual result | Status All by default, 20 per page (page 2 from S.No 21), each status filter shows only its badges, search by title and by park, Host picker, Clear filters; Joined / Left counts open their lists (bottom sheet on phone); Filters button on phone. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-36 Pin

| | |
|---|---|
| Title | Pin |
| Role | — |
| Pre-condition | console |
| Steps | pin, unpin; delete a pinned safari |
| Expected result | filled / outline icon; pinned first; stays pinned after delete; audited |
| Actual result | Pin / Unpin with toast and tooltip, filled green / outline icon, pinned first; a deleted pinned safari stays pinned and first; audit 813 / 814. |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-37 Console detail

| | |
|---|---|
| Title | Console detail |
| Role | — |
| Pre-condition | console |
| Steps | open a safari |
| Expected result | everything on the view with the plan in full; joined (last join) and left (last leave) lists; comments with reply and flag counts |
| Actual result | details with the plan in full (phone and email shown), picture, Joined (2) with join times, Left (1) with "Left on", Comments (4) with reply and flag counts, replies marked. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-38 Delete with reason and make active

| | |
|---|---|
| Title | Delete with reason and make active |
| Role | — |
| Pre-condition | console |
| Steps | delete with reason and details; check website; make active |
| Expected result | hidden, reason shown in the console; back to Active with the delete columns cleared; both audited |
| Actual result | "Select a reason.", "Enter the details.", "Use up to 1000 characters."; after Delete the reason banner, the Deleted by admin filter, the website 404; Make active back to Active with the delete columns NULL and the website showing it; audit 809, 811. |
| Result | PASS |
| Method | browser + API + DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-39 Host-deleted in console

| | |
|---|---|
| Title | Host-deleted in console |
| Role | — |
| Pre-condition | a host-deleted safari |
| Steps | open it |
| Expected result | "Deleted by host" with when; read-only, no Make active, Pin or Delete |
| Actual result | "Deleted by host on … This safari is read-only.", no Pin, Delete, Make active or comment delete. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-40 Admin deletes a comment / reply

| | |
|---|---|
| Title | Admin deletes a comment / reply |
| Role | — |
| Pre-condition | console |
| Steps | delete one reply; delete a comment with replies |
| Expected result | reply alone gone; comment and replies gone from the website; their open flags closed |
| Actual result | a single reply deleted alone; a comment deleted with its replies, on the console and the website; their open flags closed; audit 825. |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-41 Flagged Comments

| | |
|---|---|
| Title | Flagged Comments |
| Role | — |
| Pre-condition | flags exist; one comment edited after flagging; one deleted by its writer |
| Steps | open; View flags; Ignore; Delete |
| Expected result | current text shown; the writer-deleted one not listed; Ignore keeps the comment; Delete removes it; rows leave |
| Actual result | Flagged Comments shows the edited text, leaves out the writer-deleted comment; View flags (reason, details, who, when); Ignore keeps the comment; Delete removes it and its reply; flags closed. |
| Result | PASS |
| Method | browser + DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-42 Access

| | |
|---|---|
| Title | Access |
| Role | — |
| Pre-condition | — |
| Steps | each console route as a member; each signed-in route as a guest; edit someone else's safari or comment |
| Expected result | 403 / 401 / refused; the public routes answer to a guest |
| Actual result | a guest gets 401 UNAUTHENTICATED on every signed-in route (mine, create, join, comment, edit / flag a comment, active flag reasons) and 200 on the public ones (list, view, active parks); a signed-up member without a role is refused by the console sign-in (CONSOLE_ACCESS_DENIED) and gets 403 ACCESS_DENIED on every Super Admin route (shared-safari admin, parks, flag reasons); editing, changing the status of or deleting someone else's safari gives 403 SHARED_SAFARI_NOT_HOST, editing or deleting someone else's comment 403 SHARED_SAFARI_NOT_WRITER. |
| Result | PASS |
| Method | API |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-43 IST dates

| | |
|---|---|
| Title | IST dates |
| Role | — |
| Pre-condition | server clock UTC near midnight |
| Steps | a safari starting "today" IST |
| Expected result | started / list / date limits by IST |
| Actual result | `todayInIndia` turns from 2026-11-04 to 2026-11-05 between 18:29Z and 18:31Z; a safari starting today (IST) is not started; with its start yesterday it is started and still listed (activeTotal 1); with its end yesterday it leaves the list (activeTotal 0) and its view still opens (200). |
| Result | PASS |
| Method | API + CLI |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-SS-44 Audit

| | |
|---|---|
| Title | Audit |
| Role | — |
| Pre-condition | — |
| Steps | each write, and a failed one |
| Expected result | its audit row with what changed; failure codes recorded |
| Actual result | every write wrote its audit row with what changed (sign-up 107, created 801 with title and slug, comment 820 with its text); every refused change wrote its failure row with the error code (804, 806, 808 SHARED_SAFARI_NOT_HOST; 823, 826 SHARED_SAFARI_NOT_WRITER); the earlier smoke test covered the rest (803–829). Test users `ct_api1/2` and their rows deleted. |
| Result | PASS |
| Method | DB |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-04-shared-safari.md |

### TC-PKSS-02 Partner and shared safaris

| | |
|---|---|
| Title | Partner and shared safaris |
| Role | — |
| Pre-condition | approved partner with an earlier safari |
| Steps | list, view, comment |
| Expected result | no new Organise or Join; earlier safaris kept and commentable; comments as the business |
| Actual result | vivek.rao (Active) and ct_pkss_a: W1 shows no Organize button and no Join Safari (12 cards for vivek); W9 shows no Organise a Safari (hosted safari 113 listed); W3 114 shows no Join; ct_pkss_a's own 113 keeps Update Safari and Change Status; earlier safaris commentable (comment posted as the business). A partner still joined keeps Leave: not seen in the browser (both partners had already left and can't join again); the code keeps Leave when `viewer.joined`. Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-partner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-partner-390.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-vivek-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W9-ctpartner-390.png. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-SEED-01 Dry run writes nothing

| | |
|---|---|
| Title | Dry run writes nothing |
| Role | — |
| Pre-condition | empty seed |
| Steps | `seed/shared-safari` without confirm |
| Expected result | lists 14 accounts and 14 safaris to create; table counts unchanged |
| Actual result | the dry run listed 14 accounts and 14 safaris to create, and Gir and Ranthambore "moved 10 days". Every table count was unchanged afterwards. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-02 Seed

| | |
|---|---|
| Title | Seed |
| Role | — |
| Pre-condition | empty seed |
| Steps | `seed/shared-safari <password> confirm` |
| Expected result | 14 accounts, 14 safaris, 37 current and 4 left members, 14 comments and replies, 3 flags, 4 notifications, 13 covers; summary printed |
| Actual result | "14 accounts and 14 safaris created". It wrote: |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-03 No delivery while seeding

| | |
|---|---|
| Title | No delivery while seeding |
| Role | — |
| Pre-condition | before and after TC-SEED-02 |
| Steps | count `mail_log` and `notification` rows |
| Expected result | `mail_log` unchanged; `notification` grows by exactly 4 |
| Actual result | `mail_log` stayed 0 and `job_run` 0. `notification` grew by exactly 4: Riya 3 (joined, commented, commented-read) and Ananya 1, with the prototype's times. |
| Result | PASS |
| Method | DB |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-04 Run twice

| | |
|---|---|
| Title | Run twice |
| Role | — |
| Pre-condition | after TC-SEED-02 |
| Steps | run the seed again with confirm |
| Expected result | everything "already there"; no table count changes |
| Actual result | the second run printed "0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there". Every count was unchanged. |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-05 Production refused

| | |
|---|---|
| Title | Production refused |
| Role | — |
| Pre-condition | – |
| Steps | run both commands with `NODE_ENV=production`; call each seed service with `isProduction: true` |
| Expected result | CLI refuses; each service throws `SEED_NOT_ALLOWED`; nothing written |
| Actual result | with `NODE_ENV=production` both commands print "Sample data is never written in production". Each of the 9 seed service methods (users ×3, notification ×3, shared-safari ×3), called with `isProduction: true`, threw `SEED_NOT_ALLOWED`. Counts (audit_log included) were unchanged. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-06 Remove

| | |
|---|---|
| Title | Remove |
| Role | — |
| Pre-condition | after TC-SEED-04 |
| Steps | `seed/shared-safari-remove` (dry run), then with confirm |
| Expected result | the dry run lists what it would delete; then all seeded rows, files and accounts are gone; Super Admin, parks, flag reasons and other data unchanged |
| Actual result | — |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-07 Seed again after remove

| | |
|---|---|
| Title | Seed again after remove |
| Role | — |
| Pre-condition | after TC-SEED-06 |
| Steps | seed with confirm |
| Expected result | same result as TC-SEED-02 |
| Actual result | seeding again after the remove gave "14 accounts and 14 safaris created" and the same counts as TC-SEED-02 (13 cover files). |
| Result | PASS |
| Method | CLI + DB |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-08 Website list like W1

| | |
|---|---|
| Title | Website list like W1 |
| Role | — |
| Pre-condition | seeded |
| Steps | open `/` as a guest and signed in as a seed account, 1366 + 390 px |
| Expected result | "There are currently 10 active shared safaris"; cards as the board (date, safaris, seats, title, host, park, faces, joined count, button); filters and every sort work |
| Actual result | — |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-09 Safari page

| | |
|---|---|
| Title | Safari page |
| Role | — |
| Pre-condition | seeded |
| Steps | open Tigers of Bandhavgarh as Riya and as a guest |
| Expected result | plan with masked contacts, 7 joined, the comments and replies as the board |
| Actual result | — |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-10 Console list like C1

| | |
|---|---|
| Title | Console list like C1 |
| Role | — |
| Pre-condition | seeded, Super Admin signed in |
| Steps | open Shared Safaris; filter by title or park, status, host |
| Expected result | Total Items 14; the rows, joined / left counts and statuses as the board; filters narrow the list |
| Actual result | — |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-11 Console actions

| | |
|---|---|
| Title | Console actions |
| Role | — |
| Pre-condition | seeded |
| Steps | View, Pin / Unpin, Delete with reason, Make Active on a safari; Flagged Comments shows Raj's comment with 3 flags |
| Expected result | each action works and shows in the list; changes put back afterwards |
| Actual result | — |
| Result | PASS |
| Method | browser 1366 |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

### TC-SEED-12 Prototype beside local

| | |
|---|---|
| Title | Prototype beside local |
| Role | — |
| Pre-condition | seeded |
| Steps | screenshots of W1, W3, W9, C1, C3, C4 boards and their local screens at 1366 and 390 px |
| Expected result | same look, sample data aside |
| Actual result | side-by-side screenshots of W1, W3, W9, C1, C3 and C4, prototype beside local. Same layout and data, except: |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Shared-Safari-Workflow §4 to §10, §11.1 to §11.3, §13; WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-13-shared-safari-seed.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
