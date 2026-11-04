# WITW theme from the prototype

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-11-02 |
| Shipped | 2026-11-02 |
| Apps | api / manage / web / docs |
| Test cases | TC-THEME-01..08 |
| How it works | [docs/PROTOTYPE-SYNC.md](../../PROTOTYPE-SYNC.md), [platform/frontend-apps](../../how-it-works/platform/frontend-apps.md), [platform/manage-console](../../how-it-works/platform/manage-console.md), [modules/mail](../../how-it-works/modules/mail/README.md) |

## 1. Requirement (as given)

> "we have update the desing system and the prototpye so make sure we update the prototype sync file and also update the appliction colors and them according to the prototype and then test the screenwise in browser then update it @docs/PROTOTYPE-SYNC.md accodingally"

## 2. Plan

The prototype moved from 79d8bfc to **6231393** ("Apply the Walk Into The Wild theme as WITW Design System"). It changes only colours, fonts, corners and shadows; components, sizes, spacing, layout and text stay. The boards embed the apps' own stylesheets (`console-app.css` = manage, `web-app.css` = web), so the change was read declaration by declaration from the old and new boards.

**Two themes, as in the prototype:**

| | manage (Console values) | web (Portal values, WITW website) |
|---|---|---|
| Primary / hover / active / soft | #09422D / #073A28 / #073A28 / #E7EFEB | #09422D / #FD5634 / #073A28 / #FAF7F3 |
| Ground, surface-alt / borders | #F5F5F5 / #D1D5DB | same |
| Text / muted / subtle | #1E1E1E / #4B4B4B / #6B6B6B | #1E1E1E / #4B4B4B / #7A7A7A |
| Danger, success, warning, info (text) | #B91C1C, #047857, #B45309, #1D4ED8 (AA) | #EF4444, #10B981, #F59E0B, #3B82F6 |
| Delete button (`danger-fill` / `on-danger`) | #B91C1C / white | #F9D600 / #1E1E1E (hover #ECCB00) |
| Overlay / tooltip | rgba(30,30,30,.45) / #1E1E1E | rgba(9,66,45,.5) / #262626 |
| Accents | yellow #F9D600, orange #FD5634 | same; accent-3 #99FF33 |
| Fonts | Roboto | Roboto; display headings (page title, sign-in headline, 404 code and title, welcome titles) in Devator Exp, falling back to Roboto |

Both: radius-md 8, radius-xl 12; status badges and portal pills fully round; WITW shadows; bell count WITW orange #FD5634 with dark number; skeleton, banners, switches, notification kinds/tags, popover and error-code block recoloured as the boards. `[data-portal="portal-b"]` unchanged (as in the prototype).

**Files:**
- manage and web: `globals.css` tokens and rules, `console-extras.css`, `console-drawer-tools.css`; web `welcome.module.css`; manage `console-menu.ts` (Platform section colour → the primary token).
- Roboto loaded with `next/font/google` in both root layouts (self-hosted at build), feeding `--font-sans`.
- API: the stored `password_reset` mail template gets the board's colours through a new CLI command `mail/witw-colours` (dry run unless `confirm`), calling a new `mailService.updateTemplateBody` (audited: module 7 Mail, 701 / 702).
- `docs/prototype` pin → 6231393; `docs/PROTOTYPE-SYNC.md` header, Ready column and rows; docs: frontend-apps, manage-console, mail.

**Not done here:** Devator Exp font files are not in the design system (the prototype also falls back to Roboto); the uncommitted work in the prototype checkout (README rewrite, `Starter-Prototype.html` rename) is the prototype repo's and is left alone.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-THEME-01 | Console tokens | manage signed in | read computed `--color-*`, font and radius on a page | every token equals the Console values in §2; text renders in Roboto | H | browser |
| TC-THEME-02 | Portal tokens | web | same on web pages | every token equals the Portal values; page titles use the display stack | H | browser |
| TC-THEME-03 | Console boards, screen by screen | manage signed in | open each of the 16 Admin boards and its app route at 1366 and 390 px; compare the colours used on the page and the screenshot | the app uses only the board's colours (sample data aside); no console errors, failed calls or sideways scroll | H | browser |
| TC-THEME-04 | Portal boards, screen by screen | web | same for the 6 Web boards | same | H | browser |
| TC-THEME-05 | States | both apps | open a dialog with field errors, a toast, the bell popover, the user menu, the phone menu; look at badges and the bell count | dialog radius 12, error ring red, badges round, bell count orange with dark number, overlay as the theme | M | browser |
| TC-THEME-06 | Delete / danger button | web and manage | find `btn-danger` | web: yellow with dark text; manage: red with white text | M | browser |
| TC-THEME-07 | Reset email colours | API running | `npm run cli mail/witw-colours`, then `… confirm`, then again; open the template on Email Templates | dry run lists the changes and writes nothing; confirm updates the body and records audit 701; a second run says nothing to change; the preview shows the green button | H | CLI + browser |
| TC-THEME-08 | Build and checks | — | `tsc`, `lint`, `build` in manage and web; `tsc` and `lint` in api | all pass | H | CLI |

## 4. Decisions

- 2026-11-02 (user): the prototype at 6231393 (WITW Design System) is the one to follow; the app takes its colours and theme.
- 2026-11-02 (user): Roboto is loaded with `next/font` (self-hosted at build), not a Google Fonts link and not by name only.
- 2026-11-02 (user): the stored password-reset email gets the new colours through a CLI command (dry run unless `confirm`); the applied migration is not edited.
- 2026-11-02: the 22 boards are recorded ready at 6231393 in `docs/PROTOTYPE-SYNC.md` (the user declared the updated prototype the one to follow).
- 2026-11-04 (user): the prototype submodule now maps git@github.com:umang-lgtm/workshop_witw_prototype.git (a new history), pinned at 02ae9a4. Ready at 02ae9a4: the 20 boards kept from before (Admin 16; Web Sign-In, Forgot-Password, Notifications, Not-Found); Web-Sign-Up and the Shared Safari boards (W1–W9, C1–C7) not ready until declared. Its newer theme is recorded as open item B2 in PROTOTYPE-SYNC, to be restyled in a separate change (supersedes, for the theme, the 6231393 values in §2). Web-Welcome and Web-Dashboard, dropped from the prototype, are recorded as ours, no board.

## 5. Execution log

- 2026-11-02 — Read the change: the boards at 79d8bfc and 6231393 were unpacked and their embedded stylesheets compared declaration by declaration (`console-app.css` = manage, `web-app.css` = web, `web-home.css` = the welcome page), plus the board HTML (font link, the sidebar section colour, the reset email preview).
- Built: tokens and rules in both apps' `globals.css`, `console-extras.css`, `console-drawer-tools.css`; web `welcome.module.css` (display font); manage `console-menu.ts` (Platform colour → `var(--color-primary)`); `src/lib/fonts.ts` with the root layout and `global-error.tsx` in both apps (Roboto, `--font-roboto`); API: `mailService.updateTemplateBody` (repository and SQL `updateBody`), `auditService` handed to the mail module, audit codes module 7 / actions 701, 702 / entity 8, CLI `MailController.actionWitwColours`.
- Token check after the edits: every `--*` value in each app's `:root` and `[data-portal]` blocks equals the board's (three differ only in notation: `#0009`, `.12s`, `.2s`).
- Prettier with its defaults reformatted the touched TS files (the repo has no Prettier config); they were restored from the starter repository (byte-identical for untouched files) and the edits re-applied by exact replacement. No formatter was run on the CSS.
- TC-THEME-08 PASS (CLI): `tsc --noEmit` and `npm run lint` clean in api, manage and web; `npm run build` passes in manage and web; dev servers still answer 200 after the builds.
- TC-THEME-01 PASS (browser, 1366 + 390 px): manage tokens read on the page: primary #09422d, hover #073a28, soft #e7efeb, ground #f5f5f5, text #1e1e1e / #4b4b4b / #6b6b6b, danger #b91c1c, success #047857, warning #b45309, info #1d4ed8, overlay #1e1e1e73, radius 8 / 12; body in Roboto, the face loaded (`document.fonts`).
- TC-THEME-02 PASS (browser, 1366 + 390 px): web tokens: hover #fd5634, soft #faf7f3, text-subtle #7a7a7a, danger #ef4444, danger-fill #f9d600 on #1e1e1e, success #10b981, warning #f59e0b, info #3b82f6, overlay #09422d80; page titles in the "Devator Exp" stack (Devator not loaded, so Roboto shows, as on the boards); the same Roboto text measures 240.57 px on the board and in the app.
- TC-THEME-03 PASS (browser, 1366 + 390 px): all 16 Admin boards against their routes: no colour on any app page that its board does not use (the one exception, `.sl-hint.is-done` on System Logs, is the board's own rule in its "all loaded" state); colours found only on boards come from their sample data (bell count, unread notifications, delivered mails, error rows) and were checked in TC-THEME-05; screenshots looked at; no console errors (only the signed-out session check's 401 on sign-in), no failed calls, no sideways scroll.
- TC-THEME-04 PASS (browser, 1366 + 390 px): all 6 Web boards: no colour difference in either direction; fonts the same (Roboto, the Devator Exp stack on the headings); no errors, no sideways scroll.
- TC-THEME-05 PASS (browser, 1366 + 390 px): with test notifications sent to the test user: bell count #fd5634 with a #1e1e1e number (both apps); popover WITW shadow, border #d1d5db, radius 8, unread row #e7efeb (manage) / #faf7f3 (web); manage Add User submitted empty: dialog radius 12, overlay rgba(30,30,30,.45), field messages #b91c1c; status badge fully round, #047857 on #ecfdf5; web "Mark all as read" toast with the #10b981 line. (web at 390 px had no unread left after the 1366 run; same rules.)
- TC-THEME-06 PASS (browser): no screen uses `btn-danger` yet; a `btn btn-danger` placed on a real page reads #b91c1c / white in manage and #f9d600 / #1e1e1e in web, radius 8, at both widths.
- TC-THEME-07 PASS (CLI + browser): `mail/witw-colours` dry run listed the 4 changes and wrote nothing; with `confirm`: "Changed 4 styles", audit row module 7 / action 701 / entity 8, the body has #09422D and no #6B3FA0; a second run: "Nothing to change"; Email Templates › Password reset shows the button in rgb(9, 66, 45).
- Cleanup: test user `ct_witw@example.test` (user 2) deleted with its role, 15 refresh tokens, 5 notifications and 20 audit rows (by the marker); no `ct_` user left. Kept: audit row 701 and the restyled template (the change itself, on this local copy). Scratch folder (Playwright, screenshots, scripts) deleted.

## 6. Post-deploy
