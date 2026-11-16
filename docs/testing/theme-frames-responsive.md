# Test document: Theme, frames and responsive

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-02-witw-theme.md`, `docs/planning/features/2026-11-04-witw-frame.md`, `docs/planning/features/2026-11-12-safari-packages.md` |
| Requirement and workflow references | `docs/PROTOTYPE-SYNC.md` frames and theme rows |
| How it works | `docs/how-it-works/platform/frontend-apps.md`, `docs/how-it-works/platform/manage-console.md` |
| Latest run | 2026-11-14 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-THEME-01 | Console tokens | — | PASS | 2026-11-02 |
| TC-THEME-02 | Portal tokens | — | PASS | 2026-11-02 |
| TC-THEME-03 | Console boards, screen by screen | — | PASS | 2026-11-02 |
| TC-THEME-04 | Portal boards, screen by screen | — | PASS | 2026-11-02 |
| TC-THEME-05 | States | — | PASS | 2026-11-02 |
| TC-THEME-06 | Delete / danger button | — | PASS | 2026-11-02 |
| TC-THEME-07 | Reset email colours | — | PASS | 2026-11-02 |
| TC-THEME-08 | Build and checks | — | PASS | 2026-11-02 |
| TC-FRAME-01 | Console tokens and rules | — | PASS | 2026-11-04 |
| TC-FRAME-02 | Website tokens and rules | — | PASS | 2026-11-04 |
| TC-FRAME-03 | Console header | — | PASS | 2026-11-04 |
| TC-FRAME-04 | Console sign-in panels | — | PASS | 2026-11-04 |
| TC-FRAME-05 | Website frame, guest | — | PASS | 2026-11-04 |
| TC-FRAME-06 | Website frame, signed in | — | PASS | 2026-11-04 |
| TC-FRAME-07 | Not-Found | — | PASS | 2026-11-04 |
| TC-FRAME-08 | Every board, screen by screen | — | PASS | 2026-11-04 |
| TC-FRAME-09 | Build and checks | — | PASS | 2026-11-04 |
| TC-PKSS-03 | Narrow windows | — | PASS | 2026-11-14 |

## Cases

### TC-THEME-01 Console tokens

| | |
|---|---|
| Title | Console tokens |
| Role | — |
| Pre-condition | manage signed in |
| Steps | read computed `--color-*`, font and radius on a page |
| Expected result | every token equals the Console values in §2; text renders in Roboto |
| Actual result | manage tokens read on the page: primary #09422d, hover #073a28, soft #e7efeb, ground #f5f5f5, text #1e1e1e / #4b4b4b / #6b6b6b, danger #b91c1c, success #047857, warning #b45309, info #1d4ed8, overlay #1e1e1e73, radius 8 / 12; body in Roboto, the face loaded (`document.fonts`). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-02 Portal tokens

| | |
|---|---|
| Title | Portal tokens |
| Role | — |
| Pre-condition | web |
| Steps | same on web pages |
| Expected result | every token equals the Portal values; page titles use the display stack |
| Actual result | web tokens: hover #fd5634, soft #faf7f3, text-subtle #7a7a7a, danger #ef4444, danger-fill #f9d600 on #1e1e1e, success #10b981, warning #f59e0b, info #3b82f6, overlay #09422d80; page titles in the "Devator Exp" stack (Devator not loaded, so Roboto shows, as on the boards); the same Roboto text measures 240.57 px on the board and in the app. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-03 Console boards, screen by screen

| | |
|---|---|
| Title | Console boards, screen by screen |
| Role | — |
| Pre-condition | manage signed in |
| Steps | open each of the 16 Admin boards and its app route at 1366 and 390 px; compare the colours used on the page and the screenshot |
| Expected result | the app uses only the board's colours (sample data aside); no console errors, failed calls or sideways scroll |
| Actual result | all 16 Admin boards against their routes: no colour on any app page that its board does not use (the one exception, `.sl-hint.is-done` on System Logs, is the board's own rule in its "all loaded" state); colours found only on boards come from their sample data (bell count, unread notifications, delivered mails, error rows) and were checked in TC-THEME-05; screenshots looked at; no console errors (only the signed-out session check's 401 on sign-in), no failed calls, no sideways scroll. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-04 Portal boards, screen by screen

| | |
|---|---|
| Title | Portal boards, screen by screen |
| Role | — |
| Pre-condition | web |
| Steps | same for the 6 Web boards |
| Expected result | same |
| Actual result | all 6 Web boards: no colour difference in either direction; fonts the same (Roboto, the Devator Exp stack on the headings); no errors, no sideways scroll. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-05 States

| | |
|---|---|
| Title | States |
| Role | — |
| Pre-condition | both apps |
| Steps | open a dialog with field errors, a toast, the bell popover, the user menu, the phone menu; look at badges and the bell count |
| Expected result | dialog radius 12, error ring red, badges round, bell count orange with dark number, overlay as the theme |
| Actual result | with test notifications sent to the test user: bell count #fd5634 with a #1e1e1e number (both apps); popover WITW shadow, border #d1d5db, radius 8, unread row #e7efeb (manage) / #faf7f3 (web); manage Add User submitted empty: dialog radius 12, overlay rgba(30,30,30,.45), field messages #b91c1c; status badge fully round, #047857 on #ecfdf5; web "Mark all as read" toast with the #10b981 line. (web at 390 px had no unread left after the 1366 run; same rules.) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-06 Delete / danger button

| | |
|---|---|
| Title | Delete / danger button |
| Role | — |
| Pre-condition | web and manage |
| Steps | find `btn-danger` |
| Expected result | web: yellow with dark text; manage: red with white text |
| Actual result | no screen uses `btn-danger` yet; a `btn btn-danger` placed on a real page reads #b91c1c / white in manage and #f9d600 / #1e1e1e in web, radius 8, at both widths. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-07 Reset email colours

| | |
|---|---|
| Title | Reset email colours |
| Role | — |
| Pre-condition | API running |
| Steps | `npm run cli mail/witw-colours`, then `… confirm`, then again; open the template on Email Templates |
| Expected result | dry run lists the changes and writes nothing; confirm updates the body and records audit 701; a second run says nothing to change; the preview shows the green button |
| Actual result | `mail/witw-colours` dry run listed the 4 changes and wrote nothing; with `confirm`: "Changed 4 styles", audit row module 7 / action 701 / entity 8, the body has #09422D and no #6B3FA0; a second run: "Nothing to change"; Email Templates › Password reset shows the button in rgb(9, 66, 45). |
| Result | PASS |
| Method | CLI + browser |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-08 Build and checks

| | |
|---|---|
| Title | Build and checks |
| Role | — |
| Pre-condition | — |
| Steps | `tsc`, `lint`, `build` in manage and web; `tsc` and `lint` in api |
| Expected result | all pass |
| Actual result | `tsc --noEmit` and `npm run lint` clean in api, manage and web; `npm run build` passes in manage and web; dev servers still answer 200 after the builds. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-02 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-FRAME-01 Console tokens and rules

| | |
|---|---|
| Title | Console tokens and rules |
| Role | — |
| Pre-condition | manage |
| Steps | collect every stylesheet rule from every console route and diff with `console-app.css` of 450bcc4 |
| Expected result | no difference other than notation, the app's own font loading and prototype-only rules |
| Actual result | every stylesheet rule on the 14 console routes and sign-in collected and diffed with `console-app.css` at 450bcc4: the only differences are notation (`#fff` / `#ffffff`, hex / rgba, `var(--color-danger-ring)` for the same value), the app's `next/font` Roboto variable, and the drawer tools' font written as a variable; `--font-display` was missing and was added. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-02 Website tokens and rules

| | |
|---|---|
| Title | Website tokens and rules |
| Role | — |
| Pre-condition | web |
| Steps | the same against `web-app.css` / `web-auth.css` and the frame styles of the four web boards |
| Expected result | no difference other than notation and prototype-only rules |
| Actual result | the website's rules on every route (guest and signed in) diffed with `web-app.css` / `web-auth.css` at 450bcc4: the active menu bar radius and the skeleton colours differed and were fixed; the rest is notation, the app's font variable, and the old website module's bar / brand / links rules that no board uses any more. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-03 Console header

| | |
|---|---|
| Title | Console header |
| Role | — |
| Pre-condition | manage signed in |
| Steps | open Dashboard at 1366 and 390 px; open the user menu, the bell, switch language |
| Expected result | dark green header, logo image, white controls, chosen language in #99FF33; screenshots match the board |
| Actual result | every console page has the header in rgb(9, 66, 45) with the logo image; the chosen language button rgb(153, 255, 51); the user menu and bell popover open over the green header; screenshots beside Admin-Dashboard and Admin-Users boards match (sample data aside); existing screens keep plain rows. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-04 Console sign-in panels

| | |
|---|---|
| Title | Console sign-in panels |
| Role | — |
| Pre-condition | manage signed out |
| Steps | open `/login`, `/forgot-password` |
| Expected result | the logo on the panel |
| Actual result | the logo on the console Login and Forgot Password panels. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-05 Website frame, guest

| | |
|---|---|
| Title | Website frame, guest |
| Role | — |
| Pre-condition | web signed out |
| Steps | open `/login`, `/forgot-password`, an unknown address at 1366 and 390 px |
| Expected result | WITW header with logo and the three menu items (inert), account icon → Login, footer; Sign Up line on Login; phone: menu on its own row |
| Actual result | Login, Forgot Password, Sign Up and an unknown address as a guest in the WITW frame (logo, Plan Safari / Safari Packages display only, Shared Safari, account icon → `/login`, footer); the Sign Up line on Login; on phone the menu on its own row. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-06 Website frame, signed in

| | |
|---|---|
| Title | Website frame, signed in |
| Role | — |
| Pre-condition | web signed in |
| Steps | open `/notifications`; open the bell and the account menu; Change Password; Log Out |
| Expected result | banner "Notifications"; unread line, tabs and list; the menu with name, email, My Shared Safaris (inert), Change Password, Log Out working |
| Actual result | `/notifications` with the banner, unread line, tabs and list; the mail popover; the account menu (name, email, My Shared Safaris, Change Password, Log Out); Change Password opens its dialog; Log Out lands on `/login`. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-07 Not-Found

| | |
|---|---|
| Title | Not-Found |
| Role | — |
| Pre-condition | web |
| Steps | an unknown address, signed in and out |
| Expected result | 404 page in the frame; Go Back and the home button work |
| Actual result | the 404 in the frame signed in; Go Back returns to the previous page, the Shared Safaris button goes to `/`; a guest's unknown address goes to Login (the portal layout, as before). |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-08 Every board, screen by screen

| | |
|---|---|
| Title | Every board, screen by screen |
| Role | — |
| Pre-condition | both apps |
| Steps | each of the 20 boards and its route at 1366 and 390 px, screenshot beside the board |
| Expected result | same look; no console errors, no failed calls, no sideways scroll |
| Actual result | all 20 boards' screens: console (above) and website, screenshots beside the boards match (sample data aside); no sideways scroll; console errors and failed calls only the signed-out session check's 401 on the sign-in pages. |
| Result | PASS |
| Method | browser 1366 + 390 |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-09 Build and checks

| | |
|---|---|
| Title | Build and checks |
| Role | — |
| Pre-condition | – |
| Steps | `tsc`, `lint`, `build` in manage and web |
| Expected result | all pass |
| Actual result | `tsc --noEmit` and `npm run lint` clean in api, manage and web; `npm run build` passes in api, manage and web; the dev servers answer 200 after the builds. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-04 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-PKSS-03 Narrow windows

| | |
|---|---|
| Title | Narrow windows |
| Role | — |
| Pre-condition | every app |
| Steps | 800 px wide |
| Expected result | header menu on its own row, tabs scroll, tables scroll inside their card (B4) |
| Actual result | web (W1, W3, W9, Packages, Parks as ananya.iyer), manage (Shared Safaris, Flagged Comments, Partners, Packages) and partner (home, Packages, Quote Requests) have no sideways scroll; on the Console's Flagged Comments the table scrolls inside its card (the By column is cut at the card edge); the website's header fits on one row at 800 px (nav in the middle) and sits on its own row at 390 px. Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/narrow800-web-W1.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/narrow800-manage-flagged.png (others `narrow800-*` in the same folder). |
| Result | PASS |
| Method | browser, 800 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-FRAME-08 history

- 2026-11-04 PASS: all 14 console routes, no sideways scroll, no console errors or failed calls (only the signed-out session check's 401 on the login page).
- 2026-11-04 PASS (current): all 20 boards' screens: console (above) and website, screenshots beside the boards match (sample data aside); no sideways scroll; console errors and failed calls only the signed-out session check's 401 on the sign-in pages.
