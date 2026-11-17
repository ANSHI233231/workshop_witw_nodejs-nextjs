# Test document: Quote requests

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §9.1 to §9.3, §11, §12.8 |
| How it works | `docs/how-it-works/modules/quote-request/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 8 | 8 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-QR-01 | Request a quote | User | PASS | 2026-11-16 |
| TC-QR-02 | Quote errors | User | PASS | 2026-11-16 |
| TC-QR-03 | Who can request | Guest, Partner | PASS | 2026-11-16 |
| TC-QR-04 | Partner's list and marks | Partner | PASS | 2026-11-16 |
| TC-QR-05 | Console quote requests | Super Admin | PASS | 2026-11-16 |
| TC-QR-06 | Send a notification | Super Admin, Partner | PASS | 2026-11-16 |
| TC-QR-07 | Quote after the package goes inactive | Partner | PASS | 2026-11-16 |
| TC-LOCAL-10 | Guest Request a quote asks to sign in | Guest | PASS | 2026-11-16 |

## Cases

### TC-QR-01 Request a quote

| | |
|---|---|
| Title | Request a quote |
| Role | User |
| Pre-condition | user, shown package |
| Steps | P2 form |
| Expected result | "Your quote request is sent to {business}."; partner notified; on P3 |
| Actual result | ok "Your quote request is sent to ct_ptr_Safaris One."; ok partner notified (1301); ok on My Quote Requests; no console errors, no failed calls \| 390: ok "Your quote request is sent to ct_ptr_Safaris One."; ok partner notified (1301); ok on My Quote Requests; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-01-1366.png, tc-qr-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-02 Quote errors

| | |
|---|---|
| Title | Quote errors |
| Role | User |
| Pre-condition | P2 |
| Steps | travellers empty / 0 / 101; no date; yesterday; empty notes; 1,001 characters |
| Expected result | the board's messages |
| Actual result | ok empty: 3 messages; ok travellers 0; ok travellers 101; ok yesterday "Choose today or a later date."; ok 1,001 characters; no console errors, no failed calls \| 390: ok empty: 3 messages; ok travellers 0; ok travellers 101; ok yesterday "Choose today or a later date."; ok 1,001 characters; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-02-1366.png, tc-qr-02-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-03 Who can request

| | |
|---|---|
| Title | Who can request |
| Role | Guest, Partner |
| Pre-condition | guest; partner |
| Steps | open P2 |
| Expected result | guest: sign-in prompt; partner: note with Partner portal link |
| Actual result | ok guest: "Log in to send a quote request to this operator." + Login; ok partner: note with Partner portal link, no form; no console errors, no failed calls \| 390: ok guest: "Log in to send a quote request to this operator." + Login; ok partner: note with Partner portal link, no form; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-03-1366.png, tc-qr-03-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-04 Partner's list and marks

| | |
|---|---|
| Title | Partner's list and marks |
| Role | Partner |
| Pre-condition | quotes for a partner |
| Steps | PP8 Hot, Cold |
| Expected result | "Marked Hot." / "Marked Cold."; name always, phone per TC-PTR-10, version shown |
| Actual result | ok name always shown, phone and email hidden, package version shown; ok "Marked Hot."; ok "Marked Cold."; no console errors, no failed calls \| 390: ok name always shown, phone and email hidden, package version shown; ok "Marked Hot."; ok "Marked Cold."; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-04-1366.png, tc-qr-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-05 Console quote requests

| | |
|---|---|
| Title | Console quote requests |
| Role | Super Admin |
| Pre-condition | console |
| Steps | PC9 list, status filter, View, make inactive, make active |
| Expected result | inactive hidden from partner (PP8) and user (P3); View shows email and mobile |
| Actual result | ok list shows the request; ok View shows email and mobile; ok status filter Active / Inactive; ok inactive: hidden from the partner (PP8) and the user (P3); ok active again: back for both; no console errors, no failed calls \| 390: ok list shows the request; ok View shows email and mobile; ok status filter Active / Inactive; ok inactive: hidden from the partner (PP8) and the user (P3); ok active again: back for both; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-05-1366.png, tc-qr-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-06 Send a notification

| | |
|---|---|
| Title | Send a notification |
| Role | Super Admin, Partner |
| Pre-condition | console |
| Steps | PC9 empty, 256 characters, valid |
| Expected result | "Enter the message." / "Use up to 255 characters." (was 501 / 500 until 2026-11-14); partner's bell and PP10 |
| Actual result | ok empty "Enter the message."; ok 256 characters "Use up to 255 characters."; ok sent (1302 to the partner); ok partner PP10 shows "From the Super Admin about … request"; no console errors, no failed calls \| 390: ok empty "Enter the message."; ok 256 characters "Use up to 255 characters."; ok sent (1302 to the partner); ok partner PP10 shows "From the Super Admin about … request"; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-06-1366.png, tc-qr-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-QR-07 Quote after the package goes inactive

| | |
|---|---|
| Title | Quote after the package goes inactive |
| Role | Partner |
| Pre-condition | active quote |
| Steps | partner makes the package inactive |
| Expected result | still on PP8 (#7) |
| Actual result | ok quote still on PP8 while the package is inactive (package made active again); no console errors, no failed calls \| 390: ok quote still on PP8 while the package is inactive (package made active again); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-qr-07-1366.png, tc-qr-07-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-10 Guest Request a quote asks to sign in

| | |
|---|---|
| Title | Guest Request a quote asks to sign in |
| Role | Guest |
| Pre-condition | signed out |
| Steps | package page › Request a quote, then Login in the quote box |
| Expected result | the quote box shows "Log in to send a quote request to this operator." (as board P2); Login goes to `/login?next=/packages/<slug>` |
| Actual result | quote box says "Log in to send a quote request to this operator."; Login goes to /login?next=%2Fpackages%2Ftiger-song-kanha-escape; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-10-1366.png, tc-local-10-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §9.1 to §9.3, §11, §12.8 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-QR-01 history

- 2026-11-14 PASS: Ananya Iyer on Creeks & Crocodiles: travellers 3, today's date, notes `ct_ quote request {1366\|390} browser`, Request a quote: toast "Your quote request is sent to Tiger Trail Tours.", the form cleared and the banner "Your quote request is sent. My Quote Requests"; its link opened `/my-quote-requests` with the new request first (package link to the package page, Tiger Trail Tours, travellers, start date, notes, sent on 14 Nov 2026 02:0x); partner notified: `GET /api/notification` as Tara Nambiar (partner app) lists 1301 rows 273 / 274 ("Creeks & Crocodiles - Bhitarkanika", actor Ananya Iyer, entity the new request). The portal screen for it comes with PP3 / PP8. No console errors or failed calls (the sign-in page's one 401 from `/auth/refresh` aside); no sideways scroll.
- 2026-11-16 PASS (current): ok "Your quote request is sent to ct_ptr_Safaris One."; ok partner notified (1301); ok on My Quote Requests; no console errors, no failed calls \| 390: ok "Your quote request is sent to ct_ptr_Safaris One."; ok partner notified (1301); ok on My Quote Requests; no console errors, no failed calls

### TC-QR-02 history

- 2026-11-14 PASS: empty form: "Enter the number of travellers." / "Choose a start date." / "Enter your notes." under the fields; travellers 0, 101 and 2.5: "Enter a number from 1 to 100."; date 2020-01-01: "Choose today or a later date."; notes of 1,001 characters (the box's `maxlength` removed in the test, since the real box stops at 1,000): "Use up to 1,000 characters." with the counter "1,001 / 1,000". The API's own messages for the same inputs were checked by the architect (curl); nothing was sent by these steps.
- 2026-11-16 PASS (current): ok empty: 3 messages; ok travellers 0; ok travellers 101; ok yesterday "Choose today or a later date."; ok 1,001 characters; no console errors, no failed calls \| 390: ok empty: 3 messages; ok travellers 0; ok travellers 101; ok yesterday "Choose today or a later date."; ok 1,001 characters; no console errors, no failed calls

### TC-QR-03 history

- 2026-11-14 PASS: guest on P2: "Log in to send a quote request to this operator." with a Login button and no form; Login opened `/login?next=%2Fpackages%2Fcreeks-and-crocodiles-bhitarkanika` and after signing in as Ananya Iyer the page was back on the package (plan decision Q9); partner (Vivek Rao, Active): the note "Partners can't send quote requests. Your own packages and quote requests are in the Partner portal." with a Partner portal button to `http://localhost:3042`, no form; P3 as that partner: the card "Quote requests are in the Partner portal" with Open Partner portal. The price box's Request a quote button scrolled the form to the top of the viewport (below the sticky header) at both widths.
- 2026-11-14 PASS: guest on Creeks & Crocodiles: Login link `/login?next=%2Fpackages%2Fcreeks-and-crocodiles-bhitarkanika`; signing in as Ananya Iyer returned to the package with the form; signed in, `/login?next=` with `/%09/evil.example`, `/./..//evil.example`, `//evil.example`, `https://evil.example` and `/\evil.example` all stayed on `http://localhost:3040/`; a guest signing in from `/login?next=%2F%09%2Fevil.example` landed on `/`. Console: only the guest session refresh 401 on `/login` (expected). Screenshots `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/review-next-1366.png`, `review-next-390.png`, `review-next-bad-1366.png`, `review-next-bad-390.png` (same folder).
- 2026-11-16 PASS (current): ok guest: "Log in to send a quote request to this operator." + Login; ok partner: note with Partner portal link, no form; no console errors, no failed calls \| 390: ok guest: "Log in to send a quote request to this operator." + Login; ok partner: note with Partner portal link, no form; no console errors, no failed calls

### TC-QR-04 history

- 2026-11-14 PASS: Vivek Rao (phone on) on PP8: "Active requests: 4", names with phones, packages as "Wild Kanha Special - Kanha (v2)", no email anywhere, no hidden-phones note; Hot on request 7: toast "Marked Hot." and Hot pressed (Cold not); Cold: "Marked Cold." and still Cold after a reload; each row has only the Hot and Cold buttons (no clear). Tara Nambiar (phone off): "Phone numbers are hidden for your account." and no phone. No console errors or failed calls. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-hot-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-hot-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-hidden-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-hidden-390.png`; boards `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-board-desktop.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-board-mobile.png`.
- 2026-11-16 PASS (current): ok name always shown, phone and email hidden, package version shown; ok "Marked Hot."; ok "Marked Cold."; no console errors, no failed calls \| 390: ok name always shown, phone and email hidden, package version shown; ok "Marked Hot."; ok "Marked Cold."; no console errors, no failed calls

### TC-QR-05 history

- 2026-11-14 PASS: Riya Sharma on P3: 1 active quote request (Mangrove Majesty, request 2); her inactive request 4 (Wild Kanha Special) is not listed, at table and card layouts; Neha Singh sees only request 5; a guest on `/my-quote-requests` goes to `/login`. The console and portal parts (PC9, PP8) wait for those screens.
- 2026-11-14 PASS: PC9 as ct_partner_admin: 9 requests with S.No, user with email and mobile, package (vN) with partner, mark, status; Status Inactive: Total Items 1; Clear filters shows and resets to 9; search "riya" 2, "tiger" 4, "zzzz-none": "No quote requests match."; View (request 7) shows Email ananya.iyer@packages-demo.test, Mobile 9876500106, notes, partner, mark, status; Make inactive: toast "Request is now hidden from the partner and the user.", row Inactive, Vivek's PP8 then "Active requests: 3" without it, Ananya's P3 (web) without it; Make active: "Request is active again.", row Active. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-filter-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-filter-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-view-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-view-390.png`; boards `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-board-desktop.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-board-mobile.png`.
- 2026-11-16 PASS (current): ok list shows the request; ok View shows email and mobile; ok status filter Active / Inactive; ok inactive: hidden from the partner (PP8) and the user (P3); ok active again: back for both; no console errors, no failed calls \| 390: ok list shows the request; ok View shows email and mobile; ok status filter Active / Inactive; ok inactive: hidden from the partner (PP8) and the user (P3); ok active again: back for both; no console errors, no failed calls

### TC-QR-06 history

- 2026-11-14 PASS: Send a notification on request 7: text "An in-app notification to Jungle Trails Safaris about the request from Ananya Iyer.", empty: "Enter the message."; 501 characters (maxlength removed in the browser so it could be typed): "Use up to 500 characters."; valid `ct_ Please call the user today …`: toast "Notification sent to Jungle Trails Safaris."; Vivek's bell shows avatar SA and "From the Super Admin about Ananya Iyer's request: …" opening `/notifications`; PP10 lists it first with the message; the 1301 item has avatar Q and opens `/quote-requests`. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-notify-error-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PC9-notify-error-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP-bell-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP-bell-390.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP10-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP10-390.png`.
- 2026-11-14 PASS: PC9 as ct_partner_admin, Send a notification: helper "Up to 255 characters", textarea `maxlength` 255; empty: "Enter the message."; 256 characters (`maxlength` removed in the browser): "Use up to 255 characters."; valid `ct_ re-run 2026-11-14 {1366\|390} px: please call the user.`: toast "Notification sent to Tiger Trail Tours.", dialog closes; `notification` rows 294 and 295 exist with those texts. Not seen in a partner's bell: the demo partner `vivek.rao@packages-demo.test` no longer signs in with `Demo@Pack2026` (his and Tara's password hashes differ from the other demo accounts; the other demo users and ct_partner_admin sign in), and the request used belongs to Tiger Trail Tours; the bell and PP10 display of this message was passed in the first run and the display code is unchanged. Console errors: only the expected 401 of the signed-out refresh. Cleanup: notifications 294 and 295 (`ct_ re-run`) are left for the clean-up step.
- 2026-11-14 PASS: , Vivek part** - PC9 as ct_partner_admin, Send a notification on the request of Jungle Trails Safaris (Ananya Iyer's): valid `ct_ re-run vivek {1366\|390} px: please call the user.`, toast "Notification sent to Jungle Trails Safaris.", dialog closes; signed in on the portal as vivek.rao: the bell and `/notifications` show "From the Super Admin about Ananya Iyer's request: ct_ re-run vivek ...". Console: only the expected 401s of the signed-out refresh. Screenshots in `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/rerun1114/` (qr06-toast-1366.png, qr06-toast-390.png, bell-1366.png, bell-390.png, notifications-1366.png, notifications-390.png). Cleanup: notifications 296-299 (`ct_ re-run vivek`) are left for the clean-up step.
- 2026-11-16 PASS (current): ok empty "Enter the message."; ok 256 characters "Use up to 255 characters."; ok sent (1302 to the partner); ok partner PP10 shows "From the Super Admin about … request"; no console errors, no failed calls \| 390: ok empty "Enter the message."; ok 256 characters "Use up to 255 characters."; ok sent (1302 to the partner); ok partner PP10 shows "From the Super Admin about … request"; no console errors, no failed calls

### TC-QR-07 history

- 2026-11-14 PASS: curl: Vivek made Wild Kanha Special inactive; requests 1 and 7 on it stayed on his `GET /portal/requests` and on the user's `GET /requests/mine`; a new send on it → 404; made active again. The screen part (PP8) waits for the builder.
- 2026-11-14 PASS: Vivek made Wild Kanha Special inactive in PP4 ("Wild Kanha Special - Kanha is now inactive on the website."); PP8 still "Active requests: 4" with its two requests (v2); made active again. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-pkg-inactive-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-pkg-inactive-390.png`. (The first run failed only on my check counting three requests; there are two on that package.)
- 2026-11-16 PASS (current): ok quote still on PP8 while the package is inactive (package made active again); no console errors, no failed calls \| 390: ok quote still on PP8 while the package is inactive (package made active again); no console errors, no failed calls

### TC-LOCAL-10 history

- 2026-11-16 FAIL: expected a direct redirect; the page shows the quote box's Login prompt instead (board P2). Case steps corrected (§4).
- 2026-11-16 PASS: Request a quote shows "Log in to send a quote request to this operator."; Login → `/login?next=%2Fpackages%2Ftiger-song-kanha-escape`; no errors.
- 2026-11-16 PASS (current): quote box says "Log in to send a quote request to this operator."; Login goes to /login?next=%2Fpackages%2Ftiger-song-kanha-escape; no issues
