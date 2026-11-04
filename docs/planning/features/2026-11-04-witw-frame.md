# WITW theme and frames from the prototype at 450bcc4

| Field | Value |
|---|---|
| Status | in-progress |
| Started | 2026-11-04 |
| Shipped | |
| Apps | manage / web / docs |
| Test cases | TC-FRAME-01..09 |
| How it works | [docs/PROTOTYPE-SYNC.md](../../PROTOTYPE-SYNC.md), [platform/frontend-apps](../../how-it-works/platform/frontend-apps.md), [platform/manage-console](../../how-it-works/platform/manage-console.md) |

## 1. Requirement (as given)

> "Update my @docs/PROTOTYPE-SYNC.md according to my prototype. Use theme as like prototype"

This is the first step of the [Shared Safari plan](2026-11-04-shared-safari.md) §2.1: workflow #61 says the apps are re-themed to the prototype's design system, existing screens included, before any new screen is built. It is open item B2 in PROTOTYPE-SYNC.

## 2. Plan

The prototype is `docs/prototype` at **450bcc4**. Its boards embed the apps' stylesheets (`console-app.css` for manage, `web-app.css` and `web-auth.css` for web) and, on the web boards, the WITW site frame as inline styles. Each one was compared rule by rule with what the running apps serve: the stylesheets collected from every route with Playwright, normalised and diffed.

**Only the 20 existing boards change here.** Web-Sign-Up, W1–W9 and C1–C7 stay not ready. Where an existing board links to one of those screens, the link is shown and inert, as on the boards' own display-only items: Sign Up on Sign-In, Shared Safari in the website menu, and My Shared Safaris in the account menu.

### 2.1 Both apps: tokens and rules

| Token | Before | Now |
|---|---|---|
| `--radius-lg` / `--radius-xl` | 8 / 12 px | 12 / 16 px; new `--radius-2xl` 24 px |
| `--shadow-xl` | – | new, used by the notification popover |
| `--color-danger-ring` | – | new (manage rgba(185,28,28,.12), web rgba(239,68,68,.12)), the error ring of inputs |
| `--color-count-bg` / `--color-count-text` | – | new, #FD5634 / #1E1E1E |
| web accents | accent-1 #F9D600, accent-3 #99FF33 | swapped: accent-1 #99FF33, accent-3 #F9D600 |
| web `--text-page-title` | display font | `--font-sans` |
| `[data-portal="admin"]` primary-soft-border | #B5C6C0 | #D1D5DB |
| manage overlay | rgba(30,30,30,.45) | rgba(9,66,45,.5) |
| manage danger fill / hover | #B91C1C / #991B1B | #DC2626 / #B91C1C |
| manage info | #1D4ED8 | #2563EB (badges, account notification kind, tags) |

Rules that change colour as the boards show:
- **Banners:** solid borders in the status colour.
- **Skeleton:** shimmer on #F5F5F5 and white.
- **Portal pills:** grey "alt" pill.
- **Switch knob:** its shadow.
- **Error log:** the colour of the pre block.
- **Notification avatars:** primary on soft.
- **Notification channels:** email blue, in-app amber border.
- **Notifications tab count:** primary.
- **Active menu bar:** radius 4 px.

### 2.2 Console frame (manage)

- **Header:** dark green (#09422D) with white text. The role chip, icon buttons and user menu are white on translucent white, and the language switch is outlined white with the chosen language in #99FF33.
- **Logo:** the WITW logo image (from the boards) replaces the shield mark, 36 px high, in the header and on the sign-in and forgot-password panels.

### 2.3 Website frame (web)

The four existing web boards (Web-Sign-In, Web-Forgot-Password, Web-Notifications, Web-Not-Found) now sit in the **WITW site frame**:
- **Header:** dark green, with the WITW logo (home link).
- **Menu:** Plan Safari, Safari Packages and Shared Safari, each with its icon. The first two are display-only (#3), and Shared Safari is inert until W1 is built.
- **Right side:** signed in, the bell (with its popover) and the account button (first name), whose menu holds the user's name and email, My Shared Safaris (inert until W9), Change Password and Log Out. A guest sees an account icon that opens Login.
- **Banner:** a green banner with the page title (Notifications).
- **Footer:** grass picture, About Us, Policy, Useful Links and Contact Info columns, with the logo, developer and copyright line.
- **Phone width:** the menu moves to a second row under the logo.

The images come from the boards and are saved as files in `apps/web/public/witw/` (and the logo in `apps/manage/public/witw/`).

- **Sign-In:** the subtitle reads "Sign in to Walk Into The Wild.", and the line "Don't have an account? Sign Up" is added (Sign Up inert until Web-Sign-Up is ready).
- **Notifications:** "You have N unread notifications" with Mark all as read above a card with All / Unread / Account tabs and the list. The Shared Safari tab belongs to the Shared Safari kinds and comes with that feature.
- **Not-Found:** 404, the title and text, Go Back, and a primary button to the website's home.
- **No language switch** in the website frame, as on the boards (#29). Pages keep their published translations; the language stays the one chosen before (cookie).
- **Portal menu bar and footer gone:** the portal's old menu bar (Dashboard, Notifications) and footer are replaced by the frame. The pages that are ours with no board (Welcome `/`, Dashboard `/dashboard`) sit in the same frame until Shared Safari replaces them.

### 2.4 Files

- **manage:** `src/app/globals.css`, `console-extras.css` (tokens, rules, header block); `components/console/console-header.tsx`, `components/sign-in/auth-screen.tsx`, `components/layout/status-page.tsx` (logo); `public/witw/logo.png`.
- **web:** `src/app/globals.css`, `console-extras.css`; `components/website/` (the frame: header, account menu, footer, banner, CSS module); `(public)` and `(portal)` layouts; the sign-in form, forgot-password screen, notifications page and not-found page in the frame; `public/witw/*`.
- **docs:** PROTOTYPE-SYNC (pin, Ready at 450bcc4 for the 20 boards, B2 closed, rows), `platform/frontend-apps.md`, `platform/manage-console.md`.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-FRAME-01 | Console tokens and rules | manage | collect every stylesheet rule from every console route and diff with `console-app.css` of 450bcc4 | no difference other than notation, the app's own font loading and prototype-only rules | H | browser |
| TC-FRAME-02 | Website tokens and rules | web | the same against `web-app.css` / `web-auth.css` and the frame styles of the four web boards | no difference other than notation and prototype-only rules | H | browser |
| TC-FRAME-03 | Console header | manage signed in | open Dashboard at 1366 and 390 px; open the user menu, the bell, switch language | dark green header, logo image, white controls, chosen language in #99FF33; screenshots match the board | H | browser |
| TC-FRAME-04 | Console sign-in panels | manage signed out | open `/login`, `/forgot-password` | the logo on the panel | M | browser |
| TC-FRAME-05 | Website frame, guest | web signed out | open `/login`, `/forgot-password`, an unknown address at 1366 and 390 px | WITW header with logo and the three menu items (inert), account icon → Login, footer; Sign Up line on Login; phone: menu on its own row | H | browser |
| TC-FRAME-06 | Website frame, signed in | web signed in | open `/notifications`; open the bell and the account menu; Change Password; Log Out | banner "Notifications"; unread line, tabs and list; the menu with name, email, My Shared Safaris (inert), Change Password, Log Out working | H | browser |
| TC-FRAME-07 | Not-Found | web | an unknown address, signed in and out | 404 page in the frame; Go Back and the home button work | M | browser |
| TC-FRAME-08 | Every board, screen by screen | both apps | each of the 20 boards and its route at 1366 and 390 px, screenshot beside the board | same look; no console errors, no failed calls, no sideways scroll | H | browser |
| TC-FRAME-09 | Build and checks | – | `tsc`, `lint`, `build` in manage and web | all pass | H | CLI |

## 4. Decisions

- 2026-11-04 (user): "Update my PROTOTYPE-SYNC according to my prototype. Use theme as like prototype": the apps follow the prototype at 450bcc4, theme and frames; the 20 existing boards are recorded ready at 450bcc4 (the user declared the updated prototype the one to follow, as on 2026-11-02). The Shared Safari boards and Web-Sign-Up stay not ready.
- 2026-11-04 (workflow #3, #29): links on existing boards to screens not built yet are shown and inert; the website frame has no language switch, as its boards.

## 5. Execution log

- 2026-11-04 — Compared: `console-app.css`, `web-app.css`, `web-auth.css` and the boards' inline styles at 450bcc4 against the stylesheets the running apps serve on every route (collected with Playwright, diffed per selector and property). Differences found as in §2.

## 6. Post-deploy
