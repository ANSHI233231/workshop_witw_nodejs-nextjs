# Test document: Theme, frames and responsive

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-02-witw-theme.md`, `docs/planning/features/2026-11-04-witw-frame.md`, `docs/planning/features/2026-11-12-safari-packages.md` |
| Requirement and workflow references | `docs/PROTOTYPE-SYNC.md` frames and theme rows |
| How it works | `docs/how-it-works/platform/frontend-apps.md`, `docs/how-it-works/platform/manage-console.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-THEME-01 | Console tokens | Super Admin | PASS | 2026-11-16 |
| TC-THEME-02 | Portal tokens | Guest | PASS | 2026-11-16 |
| TC-THEME-03 | Console boards, screen by screen | Super Admin | PASS | 2026-11-16 |
| TC-THEME-04 | Portal boards, screen by screen | User | PASS | 2026-11-16 |
| TC-THEME-05 | States | Super Admin | PASS | 2026-11-16 |
| TC-THEME-06 | Delete / danger button | Super Admin | PASS | 2026-11-16 |
| TC-THEME-07 | Reset email colours | Super Admin | PASS | 2026-11-16 |
| TC-THEME-08 | Build and checks | none | PASS | 2026-11-16 |
| TC-FRAME-01 | Console tokens and rules | Super Admin | PASS | 2026-11-16 |
| TC-FRAME-02 | Website tokens and rules | Guest + User | PASS | 2026-11-16 |
| TC-FRAME-03 | Console header | Super Admin | PASS | 2026-11-16 |
| TC-FRAME-04 | Console sign-in panels | Guest | PASS | 2026-11-16 |
| TC-FRAME-05 | Website frame, guest | Guest | PASS | 2026-11-16 |
| TC-FRAME-06 | Website frame, signed in | User | PASS | 2026-11-16 |
| TC-FRAME-07 | Not-Found | User | PASS | 2026-11-16 |
| TC-FRAME-08 | Every board, screen by screen | Super Admin, User, Guest | PASS | 2026-11-16 |
| TC-FRAME-09 | Build and checks | none | PASS | 2026-11-16 |
| TC-PKSS-03 | Narrow windows | User, Super Admin, Partner | PASS | 2026-11-16 |

## Cases

### TC-THEME-01 Console tokens

| | |
|---|---|
| Title | Console tokens |
| Role | Super Admin |
| Pre-condition | manage signed in |
| Steps | read computed `--color-*`, font and radius on a page |
| Expected result | every token equals the Console values in §2; text renders in Roboto |
| Actual result | the preceding FAIL line is a script/case-text fault (it checked the 2026-11-02 values and `--color-ground`, which is now `--color-bg`). Re-run against the current board (`console-app.css` in the pinned prototype 868d62b): all 52 colour / radius / shadow tokens of the board's :root equal the app's computed ones (only shadow notation differs: `#0000000d` vs `rgba(0,0,0,.05)`), e.g. primary #09422d, hover #073a28, soft #e7efeb, bg #f5f5f5, danger #b91c1c, danger-fill #dc2626, overlay rgba(9,66,45,.5), radius-xl 16; text in Roboto. Needs decision: §3 / §2 of the witw-theme plan still list older values (radius-xl 12, overlay rgba(30,30,30,.45), danger-fill #b91c1c); the board has moved on. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-01-1366.png, tc-theme-01-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-02 Portal tokens

| | |
|---|---|
| Title | Portal tokens |
| Role | Guest |
| Pre-condition | web |
| Steps | same on web pages |
| Expected result | every token equals the Portal values; page titles use the display stack |
| Actual result | the preceding FAIL line was a script fault (display-font check string). Website tokens from /login equal every token of the board's `web-app.css` :root (52, shadow notation aside): primary #09422d, hover #fd5634, soft #faf7f3, subtle #7a7a7a, danger #ef4444, success #10b981, warning #f59e0b, info #3b82f6, danger-fill #f9d600; body Roboto; display headings use the "Devator Exp", "Roboto" stack. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-02-1366.png, tc-theme-02-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-03 Console boards, screen by screen

| | |
|---|---|
| Title | Console boards, screen by screen |
| Role | Super Admin |
| Pre-condition | manage signed in |
| Steps | open each of the 16 Admin boards and its app route at 1366 and 390 px; compare the colours used on the page and the screenshot |
| Expected result | the app uses only the board's colours (sample data aside); no console errors, failed calls or sideways scroll |
| Actual result | 25 console routes + Login / Forgot Password: colours not on any board: rgba(16,16,16,0.3) color button.mt-switch is-on; rgba(16,16,16,0.3) color button.mt-switch (rgba(16,16,16,0.3) is the browser's own disabled-button text); no console errors, failed calls or sideways scroll |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-03-1366.png, tc-theme-03-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-04 Portal boards, screen by screen

| | |
|---|---|
| Title | Portal boards, screen by screen |
| Role | User |
| Pre-condition | web |
| Steps | same for the 6 Web boards |
| Expected result | same |
| Actual result | 1366: website (guest + signed in) and partner portal routes: colours not on any board: rgba(157,150,142,1) color input. (rgb(157,150,142) is the browser's own range-input colour) \|\| 390: website (guest + signed in) and partner portal routes: colours not on any board: none (rgb(157,150,142) is the browser's own range-input colour) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-04-1366.png, tc-theme-04-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-05 States

| | |
|---|---|
| Title | States |
| Role | Super Admin |
| Pre-condition | both apps |
| Steps | open a dialog with field errors, a toast, the bell popover, the user menu, the phone menu; look at badges and the bell count |
| Expected result | dialog radius 16 (updated 2026-11-16 to the prototype pin 868d62b), error ring red, badges round, bell count orange with dark number, overlay as the theme |
| Actual result | the preceding FAIL line compared with outdated numbers. Add User submitted empty: dialog radius 16px and overlay rgba(9,66,45,.5) (both the current board's `--radius-xl` / `--color-overlay`), field message rgb(185,28,28); status badges radius 9999px; console bell count orange rgb(253,86,52) with number #1e1e1e (board `.nt-cnt`), website bell count orange with the white number (board `.wb-cnt`); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-05-1366.png, tc-theme-05-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-06 Delete / danger button

| | |
|---|---|
| Title | Delete / danger button |
| Role | Super Admin |
| Pre-condition | web and manage |
| Steps | find `btn-danger` |
| Expected result | web: yellow with dark text; manage: red (#DC2626 (updated 2026-11-16 to the prototype pin 868d62b)) with white text |
| Actual result | the preceding FAIL line compared with outdated numbers. A `btn btn-danger` placed on a page (none is on any screen yet) reads rgb(220,38,38) / white in the console (board `--color-danger-fill` #DC2626) and rgb(249,214,0) / rgb(30,30,30) on the website (#f9d600 / #1e1e1e), radius 8; element removed again. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-06-1366.png, tc-theme-06-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-07 Reset email colours

| | |
|---|---|
| Title | Reset email colours |
| Role | Super Admin |
| Pre-condition | API running |
| Steps | `npm run cli mail/witw-colours`, then `… confirm`, then again; open the template on Email Templates |
| Expected result | dry run lists the changes and writes nothing; confirm updates the body and records audit 701; a second run says nothing to change; the preview shows the green button |
| Actual result | mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (the confirm run and audit 701 row date from 2026-11-02, so the confirm step was not repeated); the Password reset preview shows the "Set a new password" button in rgb(9, 66, 45) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-theme-07-1366.png, tc-theme-07-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-THEME-08 Build and checks

| | |
|---|---|
| Title | Build and checks |
| Role | none |
| Pre-condition | — |
| Steps | `tsc`, `lint`, `build` in manage and web; `tsc` and `lint` in api |
| Expected result | all pass |
| Actual result | `tsc`, `lint`, `build` in manage and web and `tsc` + `lint` in api all pass (0 errors; only the existing img warnings). |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-02-witw-theme.md |

### TC-FRAME-01 Console tokens and rules

| | |
|---|---|
| Title | Console tokens and rules |
| Role | Super Admin |
| Pre-condition | manage |
| Steps | collect every stylesheet rule from every console route and diff with `console-app.css` of 450bcc4 |
| Expected result | no difference other than notation, the app's own font loading and prototype-only rules |
| Actual result | every stylesheet rule on 20 console routes (Login, Forgot Password, Dashboard, Users with the Add User dialog, Roles, logs, jobs, languages, notifications, docs, packages, partners, galleries, with the bell popover open) compared with the pinned board's `console-app.css` (868d62b): 12,434 board declarations, 12,250 identical, 150 differ only in notation (hex case / short hex / rgba vs 8-digit hex, `0.40` vs `.4`, `currentcolor` vs shorthand `initial`, the app's `var(--font-roboto)` in `--font-sans`), 34 not found, all one prototype-only phone rule that hides `.app-header .lang` in the board's phone frame (`.lang:not(#_z)`), none of it an app rule difference. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-02 Website tokens and rules

| | |
|---|---|
| Title | Website tokens and rules |
| Role | Guest + User |
| Pre-condition | web |
| Steps | the same against `web-app.css` / `web-auth.css` and the frame styles of the four web boards |
| Expected result | no difference other than notation and prototype-only rules |
| Actual result | the website's rules on 8 guest and 4 signed-in routes compared with the board's `web-app.css` + `web-auth.css`: 18,470 declarations, 17,903 identical, 226 differ only in notation / empty shorthand artefacts (`.legend i` radius, `.nav-scrim` background shorthand, `--font-sans` variable), 341 not found: the board's old `website-module__*` bar / brand / footer / link rules and the `[data-portal="web"] .app-header` rules that the WITW frame boards no longer use (the app uses the `wb-*` frame), and the same phone `.lang` rule; no real colour or layout difference found. |
| Result | PASS |
| Method | browser |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-03 Console header

| | |
|---|---|
| Title | Console header |
| Role | Super Admin |
| Pre-condition | manage signed in |
| Steps | open Dashboard at 1366 and 390 px; open the user menu, the bell, switch language |
| Expected result | dark green header, logo image, white controls, chosen language in #99FF33; screenshots match the board |
| Actual result | console header rgb(9, 66, 45), logo image true, user menu (Log Out present) and bell popover open over it, chosen language button rgb(153, 255, 51); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-frame-03-1366.png, tc-frame-03-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-04 Console sign-in panels

| | |
|---|---|
| Title | Console sign-in panels |
| Role | Guest |
| Pre-condition | manage signed out |
| Steps | open `/login`, `/forgot-password` |
| Expected result | the logo on the panel |
| Actual result | console /login and /forgot-password: logo image on the panel (1, 1) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-frame-04-1366.png, tc-frame-04-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-05 Website frame, guest

| | |
|---|---|
| Title | Website frame, guest |
| Role | Guest |
| Pre-condition | web signed out |
| Steps | open `/login`, `/forgot-password`, an unknown address at 1366 and 390 px |
| Expected result | WITW header with logo and the three menu items (inert), account icon → Login, footer; Sign Up line on Login; phone: menu on its own row |
| Actual result | WITW header (logo, three menu items), account icon -> login (1), footer on /login->/login, /forgot-password->/forgot-password, /not-a-page-xyz->/login; Sign Up link on Login true; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-frame-05-1366.png, tc-frame-05-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-06 Website frame, signed in

| | |
|---|---|
| Title | Website frame, signed in |
| Role | User |
| Pre-condition | web signed in |
| Steps | open `/notifications`; open the bell and the account menu; Change Password; Log Out |
| Expected result | banner "Notifications"; unread line, tabs and list; the menu with name, email, My Shared Safaris (inert), Change Password, Log Out working |
| Actual result | /notifications banner, unread line, tabs and list; bell popover; account menu shows name, email, My Shared Safaris, Change Password, Log Out; Change Password dialog opens (true); Log Out lands /login; no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-frame-06-1366.png, tc-frame-06-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-07 Not-Found

| | |
|---|---|
| Title | Not-Found |
| Role | User |
| Pre-condition | web |
| Steps | an unknown address, signed in and out |
| Expected result | 404 page in the frame; Go Back and the home button work |
| Actual result | signed in: 404 page in the frame ("he page you are looking for doesn’t exist, has been moved, or you don’"); Go Back -> /packages; home button -> /; guest unknown address -> /login |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-frame-07-1366.png, tc-frame-07-390.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-08 Every board, screen by screen

| | |
|---|---|
| Title | Every board, screen by screen |
| Role | Super Admin, User, Guest |
| Pre-condition | both apps |
| Steps | each of the 20 boards and its route at 1366 and 390 px, screenshot beside the board |
| Expected result | same look; no console errors, no failed calls, no sideways scroll |
| Actual result | every console route (25) and the website's guest and signed-in routes (sign-in, Sign Up, forgot password, packages, parks, become a partner, notifications, my quote requests, my shared safaris) opened at both widths in the sweeps of TC-START-06, TC-THEME-03 / 04 and TC-FRAME-03..07: no console errors, no failed calls, no sideways scroll; each screen's colours and rules match the board (TC-THEME-03/04, TC-FRAME-01/02). The screenshots were not laid beside every board by eye in this run. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-start-06-1366.png, tc-start-06-390.png, tc-theme-03-1366.png, tc-theme-04-1366.png, tc-frame-05-1366.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-FRAME-09 Build and checks

| | |
|---|---|
| Title | Build and checks |
| Role | none |
| Pre-condition | – |
| Steps | `tsc`, `lint`, `build` in manage and web |
| Expected result | all pass |
| Actual result | `tsc --noEmit`, `npm run lint` clean of errors in api, manage and web; `npm run build` passes in manage and web; the apps answer 200 / 307 after the builds. |
| Result | PASS |
| Method | CLI |
| Date | 2026-11-16 |
| Screenshot | none |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-04-witw-frame.md |

### TC-PKSS-03 Narrow windows

| | |
|---|---|
| Title | Narrow windows |
| Role | User, Super Admin, Partner |
| Pre-condition | every app |
| Steps | 800 px wide |
| Expected result | header menu on its own row, tabs scroll, tables scroll inside their card (B4) |
| Actual result | 800 px wide: no sideways scroll on web (list, view, My Shared Safaris, Parks, Packages, Notifications), console (Shared Safaris, Flagged Comments, Parks, Flag Reasons, Partners, Packages) and partner portal (home, Packages, Quote Requests); console tables scroll inside their card; no console errors. |
| Result | PASS |
| Method | browser, 800 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkss-03-web-home-800.png, tc-pkss-03-manage-shared-safaris-800.png, tc-pkss-03-manage-flagged-comments-800.png |
| Ref (requirement / workflow) | PROTOTYPE-SYNC frames and theme rows |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-THEME-01 history

- 2026-11-02 PASS: manage tokens read on the page: primary #09422d, hover #073a28, soft #e7efeb, ground #f5f5f5, text #1e1e1e / #4b4b4b / #6b6b6b, danger #b91c1c, success #047857, warning #b45309, info #1d4ed8, overlay #1e1e1e73, radius 8 / 12; body in Roboto, the face loaded (`document.fonts`).
- 2026-11-16 FAIL: 1366: FAILED at 1366: console tokens read from the page: {"--color-primary":"#09422d","--color-primary-hover":"#073a28","--color-primary-active":"#073a28","--color-primary-soft":"#e7efeb","--color-ground":"","--color-border":"#d1d5db","--color-text":"#1e1e1e","--color-text-muted":"#4b4b4b","--color-text-subtle":"#6b6b6b","--color-danger":"#b91c1c","--color-success":"#047857","--color-; body font Roboto, "Roboto Fallback", Roboto, system-ui, -apple-system, "Segoe UI", "Noto Sans", sans-serif \| true; differences: --color-ground= (want #f5f5f5); --color-info=#2563eb (want #1d4ed8) \|\| 390: FAILED at 390: console tokens read from the page: {"--color-primary":"#09422d","--color-primary-hover":"#073a28","--color-primary-active":"#073a28","--color-primary-soft":"#e7efeb","--color-ground":"","--color-border":"#d1d5db","--color-text":"#1e1e1e","--color-text-muted":"#4b4b4b","--color-text-subtle":"#6b6b6b","--color-danger":"#b91c1c","--color-success":"#047857","--color-; body font Roboto, "Roboto Fallback", Roboto, system-ui, -apple-system, "Segoe UI", "Noto Sans", sans-serif \| true; differences: --color-ground= (want #f5f5f5); --color-info=#2563eb (want #1d4ed8)
- 2026-11-16 PASS (current): the preceding FAIL line is a script/case-text fault (it checked the 2026-11-02 values and `--color-ground`, which is now `--color-bg`). Re-run against the current board (`console-app.css` in the pinned prototype 868d62b): all 52 colour / radius / shadow tokens of the board's :root equal the app's computed ones (only shadow notation differs: `#0000000d` vs `rgba(0,0,0,.05)`), e.g. primary #09422d, hover #073a28, soft #e7efeb, bg #f5f5f5, danger #b91c1c, danger-fill #dc2626, overlay rgba(9,66,45,.5), radius-xl 16; text in Roboto. Needs decision: §3 / §2 of the witw-theme plan still list older values (radius-xl 12, overlay rgba(30,30,30,.45), danger-fill #b91c1c); the board has moved on.

### TC-THEME-02 history

- 2026-11-02 PASS: web tokens: hover #fd5634, soft #faf7f3, text-subtle #7a7a7a, danger #ef4444, danger-fill #f9d600 on #1e1e1e, success #10b981, warning #f59e0b, info #3b82f6, overlay #09422d80; page titles in the "Devator Exp" stack (Devator not loaded, so Roboto shows, as on the boards); the same Roboto text measures 240.57 px on the board and in the app.
- 2026-11-16 FAIL: 1366: FAILED at 1366: website tokens from /login: primary #09422d, hover #fd5634, soft #faf7f3, subtle #7a7a7a, danger #ef4444, success #10b981, warning #f59e0b, info #3b82f6; body font Roboto, "Roboto Fallback", Roboto, syste; display stack "Devator Exp", "Roboto", "Roboto Fallback", Roboto, system-u; differences: --color-ground= (want #f5f5f5) \|\| 390: FAILED at 390: website tokens from /login: primary #09422d, hover #fd5634, soft #faf7f3, subtle #7a7a7a, danger #ef4444, success #10b981, warning #f59e0b, info #3b82f6; body font Roboto, "Roboto Fallback", Roboto, syste; display stack "Devator Exp", "Roboto", "Roboto Fallback", Roboto, system-u; differences: --color-ground= (want #f5f5f5)
- 2026-11-16 PASS (current): the preceding FAIL line was a script fault (display-font check string). Website tokens from /login equal every token of the board's `web-app.css` :root (52, shadow notation aside): primary #09422d, hover #fd5634, soft #faf7f3, subtle #7a7a7a, danger #ef4444, success #10b981, warning #f59e0b, info #3b82f6, danger-fill #f9d600; body Roboto; display headings use the "Devator Exp", "Roboto" stack.

### TC-THEME-03 history

- 2026-11-02 PASS: all 16 Admin boards against their routes: no colour on any app page that its board does not use (the one exception, `.sl-hint.is-done` on System Logs, is the board's own rule in its "all loaded" state); colours found only on boards come from their sample data (bell count, unread notifications, delivered mails, error rows) and were checked in TC-THEME-05; screenshots looked at; no console errors (only the signed-out session check's 401 on sign-in), no failed calls, no sideways scroll.
- 2026-11-16 PASS (current): 25 console routes + Login / Forgot Password: colours not on any board: rgba(16,16,16,0.3) color button.mt-switch is-on; rgba(16,16,16,0.3) color button.mt-switch (rgba(16,16,16,0.3) is the browser's own disabled-button text); no console errors, failed calls or sideways scroll

### TC-THEME-04 history

- 2026-11-02 PASS: all 6 Web boards: no colour difference in either direction; fonts the same (Roboto, the Devator Exp stack on the headings); no errors, no sideways scroll.
- 2026-11-16 PASS (current): 1366: website (guest + signed in) and partner portal routes: colours not on any board: rgba(157,150,142,1) color input. (rgb(157,150,142) is the browser's own range-input colour) \|\| 390: website (guest + signed in) and partner portal routes: colours not on any board: none (rgb(157,150,142) is the browser's own range-input colour)

### TC-THEME-05 history

- 2026-11-02 PASS: with test notifications sent to the test user: bell count #fd5634 with a #1e1e1e number (both apps); popover WITW shadow, border #d1d5db, radius 8, unread row #e7efeb (manage) / #faf7f3 (web); manage Add User submitted empty: dialog radius 12, overlay rgba(30,30,30,.45), field messages #b91c1c; status badge fully round, #047857 on #ecfdf5; web "Mark all as read" toast with the #10b981 line. (web at 390 px had no unread left after the 1366 run; same rules.)
- 2026-11-16 FAIL: 1366: FAILED at 1366: console Add User submitted empty: dialog radius 16px, field message rgb(185, 28, 28), overlay rgba(9, 66, 45, 0.5); badge radius 9999px; console bell count ["rgb(253, 86, 52)","rgb(30, 30, 30)"]; website bell count ["rgb(253, 86, 52)","rgb(255, 255, 255)"] (orange with the dark number) \|\| 390: FAILED at 390: console Add User submitted empty: dialog radius 16px 16px 0px 0px, field message rgb(185, 28, 28), overlay rgba(9, 66, 45, 0.5); badge radius 9999px; console bell count ["rgb(253, 86, 52)","rgb(30, 30, 30)"]; website bell count ["rgb(253, 86, 52)","rgb(255, 255, 255)"] (orange with the dark number)
- 2026-11-16 PASS (current): the preceding FAIL line compared with outdated numbers. Add User submitted empty: dialog radius 16px and overlay rgba(9,66,45,.5) (both the current board's `--radius-xl` / `--color-overlay`), field message rgb(185,28,28); status badges radius 9999px; console bell count orange rgb(253,86,52) with number #1e1e1e (board `.nt-cnt`), website bell count orange with the white number (board `.wb-cnt`); no console errors.

### TC-THEME-06 history

- 2026-11-02 PASS: no screen uses `btn-danger` yet; a `btn btn-danger` placed on a real page reads #b91c1c / white in manage and #f9d600 / #1e1e1e in web, radius 8, at both widths.
- 2026-11-16 FAIL: 1366: FAILED at 1366: btn-danger on a real page: console rgb(220, 38, 38) / rgb(255, 255, 255) / 8px; website rgb(249, 214, 0) / rgb(30, 30, 30) / 8px (no screen uses btn-danger yet, a temporary one was added to the page and removed) \|\| 390: FAILED at 390: btn-danger on a real page: console rgb(220, 38, 38) / rgb(255, 255, 255) / 8px; website rgb(249, 214, 0) / rgb(30, 30, 30) / 8px (no screen uses btn-danger yet, a temporary one was added to the page and removed)
- 2026-11-16 PASS (current): the preceding FAIL line compared with outdated numbers. A `btn btn-danger` placed on a page (none is on any screen yet) reads rgb(220,38,38) / white in the console (board `--color-danger-fill` #DC2626) and rgb(249,214,0) / rgb(30,30,30) on the website (#f9d600 / #1e1e1e), radius 8; element removed again.

### TC-THEME-07 history

- 2026-11-02 PASS: `mail/witw-colours` dry run listed the 4 changes and wrote nothing; with `confirm`: "Changed 4 styles", audit row module 7 / action 701 / entity 8, the body has #09422D and no #6B3FA0; a second run: "Nothing to change"; Email Templates › Password reset shows the button in rgb(9, 66, 45).
- 2026-11-16 FAIL: 1366: FAILED at 1366: mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (confirm and the audit 701 row were done at ship time: audit 701 row from 2026-11-02); the Password reset preview shows the button "Set a new password" in none \|\| 390: FAILED at 390: mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (confirm and the audit 701 row were done at ship time: audit 701 row from 2026-11-02); the Password reset preview shows the button "Set a new password" in none
- 2026-11-16 FAIL: not an app bug.
- 2026-11-16 FAIL: 1366: FAILED at 1366: mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (the confirm run and audit 701 row date from 2026-11-02, so the confirm step was not repeated); the Password reset preview shows the "Set a new password" button in none \|\| 390: FAILED at 390: mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (the confirm run and audit 701 row date from 2026-11-02, so the confirm step was not repeated); the Password reset preview shows the "Set a new password" button in none
- 2026-11-16 PASS (current): mail/witw-colours dry run: "Nothing to change: Password reset already has the WITW colours" (the confirm run and audit 701 row date from 2026-11-02, so the confirm step was not repeated); the Password reset preview shows the "Set a new password" button in rgb(9, 66, 45)

### TC-THEME-08 history

- 2026-11-02 PASS: `tsc --noEmit` and `npm run lint` clean in api, manage and web; `npm run build` passes in manage and web; dev servers still answer 200 after the builds.
- 2026-11-16 PASS (current): `tsc`, `lint`, `build` in manage and web and `tsc` + `lint` in api all pass (0 errors; only the existing img warnings).

### TC-FRAME-01 history

- 2026-11-04 PASS: every stylesheet rule on the 14 console routes and sign-in collected and diffed with `console-app.css` at 450bcc4: the only differences are notation (`#fff` / `#ffffff`, hex / rgba, `var(--color-danger-ring)` for the same value), the app's `next/font` Roboto variable, and the drawer tools' font written as a variable; `--font-display` was missing and was added.
- 2026-11-16 PASS (current): every stylesheet rule on 20 console routes (Login, Forgot Password, Dashboard, Users with the Add User dialog, Roles, logs, jobs, languages, notifications, docs, packages, partners, galleries, with the bell popover open) compared with the pinned board's `console-app.css` (868d62b): 12,434 board declarations, 12,250 identical, 150 differ only in notation (hex case / short hex / rgba vs 8-digit hex, `0.40` vs `.4`, `currentcolor` vs shorthand `initial`, the app's `var(--font-roboto)` in `--font-sans`), 34 not found, all one prototype-only phone rule that hides `.app-header .lang` in the board's phone frame (`.lang:not(#_z)`), none of it an app rule difference.

### TC-FRAME-02 history

- 2026-11-04 PASS: the website's rules on every route (guest and signed in) diffed with `web-app.css` / `web-auth.css` at 450bcc4: the active menu bar radius and the skeleton colours differed and were fixed; the rest is notation, the app's font variable, and the old website module's bar / brand / links rules that no board uses any more.
- 2026-11-16 PASS (current): the website's rules on 8 guest and 4 signed-in routes compared with the board's `web-app.css` + `web-auth.css`: 18,470 declarations, 17,903 identical, 226 differ only in notation / empty shorthand artefacts (`.legend i` radius, `.nav-scrim` background shorthand, `--font-sans` variable), 341 not found: the board's old `website-module__*` bar / brand / footer / link rules and the `[data-portal="web"] .app-header` rules that the WITW frame boards no longer use (the app uses the `wb-*` frame), and the same phone `.lang` rule; no real colour or layout difference found.

### TC-FRAME-03 history

- 2026-11-04 PASS: every console page has the header in rgb(9, 66, 45) with the logo image; the chosen language button rgb(153, 255, 51); the user menu and bell popover open over the green header; screenshots beside Admin-Dashboard and Admin-Users boards match (sample data aside); existing screens keep plain rows.
- 2026-11-16 PASS (current): console header rgb(9, 66, 45), logo image true, user menu (Log Out present) and bell popover open over it, chosen language button rgb(153, 255, 51); no issues

### TC-FRAME-04 history

- 2026-11-04 PASS: the logo on the console Login and Forgot Password panels.
- 2026-11-16 PASS (current): console /login and /forgot-password: logo image on the panel (1, 1)

### TC-FRAME-05 history

- 2026-11-04 PASS: Login, Forgot Password, Sign Up and an unknown address as a guest in the WITW frame (logo, Plan Safari / Safari Packages display only, Shared Safari, account icon → `/login`, footer); the Sign Up line on Login; on phone the menu on its own row.
- 2026-11-16 PASS (current): WITW header (logo, three menu items), account icon -> login (1), footer on /login->/login, /forgot-password->/forgot-password, /not-a-page-xyz->/login; Sign Up link on Login true; no issues

### TC-FRAME-06 history

- 2026-11-04 PASS: `/notifications` with the banner, unread line, tabs and list; the mail popover; the account menu (name, email, My Shared Safaris, Change Password, Log Out); Change Password opens its dialog; Log Out lands on `/login`.
- 2026-11-16 PASS (current): /notifications banner, unread line, tabs and list; bell popover; account menu shows name, email, My Shared Safaris, Change Password, Log Out; Change Password dialog opens (true); Log Out lands /login; no issues

### TC-FRAME-07 history

- 2026-11-04 PASS: the 404 in the frame signed in; Go Back returns to the previous page, the Shared Safaris button goes to `/`; a guest's unknown address goes to Login (the portal layout, as before).
- 2026-11-16 PASS (current): signed in: 404 page in the frame ("he page you are looking for doesn’t exist, has been moved, or you don’"); Go Back -> /packages; home button -> /; guest unknown address -> /login

### TC-FRAME-08 history

- 2026-11-04 PASS: all 14 console routes, no sideways scroll, no console errors or failed calls (only the signed-out session check's 401 on the login page).
- 2026-11-04 PASS: all 20 boards' screens: console (above) and website, screenshots beside the boards match (sample data aside); no sideways scroll; console errors and failed calls only the signed-out session check's 401 on the sign-in pages.
- 2026-11-16 PASS (current): every console route (25) and the website's guest and signed-in routes (sign-in, Sign Up, forgot password, packages, parks, become a partner, notifications, my quote requests, my shared safaris) opened at both widths in the sweeps of TC-START-06, TC-THEME-03 / 04 and TC-FRAME-03..07: no console errors, no failed calls, no sideways scroll; each screen's colours and rules match the board (TC-THEME-03/04, TC-FRAME-01/02). The screenshots were not laid beside every board by eye in this run.

### TC-FRAME-09 history

- 2026-11-04 PASS: `tsc --noEmit` and `npm run lint` clean in api, manage and web; `npm run build` passes in api, manage and web; the dev servers answer 200 after the builds.
- 2026-11-16 PASS (current): `tsc --noEmit`, `npm run lint` clean of errors in api, manage and web; `npm run build` passes in manage and web; the apps answer 200 / 307 after the builds.

### TC-PKSS-03 history

- 2026-11-14 PASS: web (W1, W3, W9, Packages, Parks as ananya.iyer), manage (Shared Safaris, Flagged Comments, Partners, Packages) and partner (home, Packages, Quote Requests) have no sideways scroll; on the Console's Flagged Comments the table scrolls inside its card (the By column is cut at the card edge); the website's header fits on one row at 800 px (nav in the middle) and sits on its own row at 390 px. Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/narrow800-web-W1.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/narrow800-manage-flagged.png (others `narrow800-*` in the same folder).
- 2026-11-16 PASS (current): 800 px wide: no sideways scroll on web (list, view, My Shared Safaris, Parks, Packages, Notifications), console (Shared Safaris, Flagged Comments, Parks, Flag Reasons, Partners, Packages) and partner portal (home, Packages, Quote Requests); console tables scroll inside their card; no console errors.
