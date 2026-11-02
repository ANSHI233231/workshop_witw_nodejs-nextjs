# Prototype sync

Every prototype board against what we built: whether it is ready to build from, status, our route, and how ours differs (with the planning file that records why). Kept short on purpose: the full story of each decision is in its planning file in [planning/features/](planning/features/).

| | |
|---|---|
| Prototype | `docs/prototype` at 6231393 (git@github.com:ANSHI233231/workshop_witw_prototype.git) |
| Boards | 22 in `prototype/starter-prototype.html` (Console 16, Portal 6), each Desktop and Mobile; design system in `design-system/` (WITW Design System: Console and Portal themes) |

| Mark | Meaning |
|---|---|
| ✅ | Built; any difference has a recorded reason |
| ✅ | Built, with an open item (D decision, R to record, B to build) or parts shown but inert |
| ⬜ | Not built (not ready, or on hold) |
| ➖ | Superseded, out of scope, or not a screen |
| ➕ | Ours, no board |

**Ready:** a board is built only once the user declares it ready; its Ready cell then gets the prototype commit and the date (`af2106d · 30 Oct 2026`). Empty = not ready. This column is the only ready list (AGENTS.md points here).

**Keeping it current:** update a board's row in the same change as its screen. When the pin moves, diff the changed boards' content (not only new names) and update the rows; don't add a history of pin moves here.

---

## 1. Open items

### Decisions needed

| # | Item |
|---|---|

### To record (a difference with no written reason)

| # | Item | Record in |
|---|---|---|

### To build (on a ready board, inert today)

| # | Item | Board |
|---|---|---|
| B1 | Devator Exp (Portal display headings): its font files are not in the design system yet, so the boards and web both show Roboto. When WITW supplies them, add them to web with `next/font/local` behind `--font-display` | every Web board |

### Prototype to update (the app is right)

| # | Item | Board |
|---|---|---|

## 2. Boards

Every board was compared with the app at 1366 px and 390 px (text and screenshot) on 2026-10-30 / 31, and the prototype updated to match at c5b636f: layout, frames, tables, dialogs, colours and text match. At 6231393 the prototype took the WITW theme (colours, fonts, corners, shadows only); the app followed on 2026-11-02 ([WITW theme](planning/features/2026-11-02-witw-theme.md)): manage in the Console values, web in the Portal values, Roboto in both. Every board was compared again at 1366 and 390 px, by the colours each page paints and a screenshot: the app uses no colour the board does not. Everywhere: the prototype's sample data (names, dates, log lines), its bar (Console / Portal, board list, Reset data, Desktop / Mobile) and its built-in failure examples are prototype-only.

| Board | Ready | Status | Our route | Differences (why) |
|---|---|---|---|---|
| Admin-Sign-In | 6231393 · 2 Nov 2026 | ✅ | manage `/login` | "Login as" picker: a prototype aid that fills in a sample account; not built |
| Admin-Forgot-Password | 6231393 · 2 Nov 2026 | ✅ | manage `/forgot-password` | – |
| Admin-Dashboard | 6231393 · 2 Nov 2026 | ✅ | manage `/` | – |
| Admin-Users-Roles-Users | 6231393 · 2 Nov 2026 | ✅ | manage `/users` | Failure toasts red, as the prototype ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Users-Roles-Roles | 6231393 · 2 Nov 2026 | ✅ | manage `/roles` | – |
| Admin-Notifications | 6231393 · 2 Nov 2026 | ✅ | manage `/notifications` | "Mark all as read" failure toast red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Notification-Templates | 6231393 · 2 Nov 2026 | ✅ | manage `/notifications/templates` | The password-reset email is stored data: its WITW colours come from `npm run cli mail/witw-colours confirm`, run once per copy of the system ([WITW theme](planning/features/2026-11-02-witw-theme.md)) |
| Admin-Delivery-Log | 6231393 · 2 Nov 2026 | ✅ | manage `/notifications/delivery-log` | – |
| Admin-Audit-Log | 6231393 · 2 Nov 2026 | ✅ | manage `/audit-log` | "Could not be opened" toast red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-System-Logs | 6231393 · 2 Nov 2026 | ✅ | manage `/system-logs` | – |
| Admin-Error-Logs | 6231393 · 2 Nov 2026 | ✅ | manage `/error-logs` | "Could not be opened" and copy-failure toasts red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Background-Jobs | 6231393 · 2 Nov 2026 | ✅ | manage `/background-jobs` | – |
| Admin-Language-Master | 6231393 · 2 Nov 2026 | ✅ | manage `/languages/master` | "Already in use" wording for a taken name or code; English's switch shown, on and locked; ([prototype sync](planning/features/2026-10-30-prototype-sync.md), [language](how-it-works/modules/language/README.md)) |
| Admin-Language-Translation | 6231393 · 2 Nov 2026 | ✅ | manage `/languages/translations` | "This text is already in use."; length message "English text can be at most 500 characters." kept ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Tech-Documentation | 6231393 · 2 Nov 2026 | ✅ | manage `/docs` | The documents themselves are the repository's, newer than the prototype's copy |
| Admin-Not-Found | 6231393 · 2 Nov 2026 | ✅ | manage, any unknown address | – |
| Web-Welcome | 6231393 · 2 Nov 2026 | ✅ | web `/` | – |
| Web-Sign-In | 6231393 · 2 Nov 2026 | ✅ | web `/login` | "Login as" picker: a prototype aid; not built |
| Web-Forgot-Password | 6231393 · 2 Nov 2026 | ✅ | web `/forgot-password` | – |
| Web-Dashboard | 6231393 · 2 Nov 2026 | ✅ | web `/dashboard` | – |
| Web-Notifications | 6231393 · 2 Nov 2026 | ✅ | web `/notifications` | "Mark all as read" failure toast red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Web-Not-Found | 6231393 · 2 Nov 2026 | ✅ | web, any unknown address | – |

### States on the boards

Dialogs, open menus, tabs, details and messages: every one is built in the app (the prototype was made from the app's own pages) and drawn in the prototype.

| Board | States | Status |
|---|---|---|
| Console frame (every Admin board) | user menu, Change Password, sidebar groups open / closed, notification popover, phone menu | ✅ |
| Admin-Users-Roles-Users | Add User, field errors, Edit User, set password; toasts: added, updated, password changed, marked active / inactive; failures red | ✅ |
| Admin-Notifications | All / Unread / Account / Jobs tabs, Mark all as read | ✅ |
| Admin-Notification-Templates | Email / In-app tabs, in-app template dialog, email template dialog with the email preview | ✅ |
| Admin-Delivery-Log | Email Details, Notification Details | ✅ |
| Admin-Audit-Log | Event Details, date filter | ✅ |
| Admin-System-Logs | API / Manage / Web tabs, a log expanded | ✅ |
| Admin-Error-Logs | Error Details, Copy request ID | ✅ |
| Admin-Background-Jobs | Scheduled / One-time / Logs tabs, Job Run details, Add / Edit Scheduled Job, Run Command, Run now, status switch | ✅ |
| Admin-Language-Master | Add / Edit Language with Where it is shown, status switch | ✅ |
| Admin-Language-Translation | Add / Edit Translation, Missing filter, Download, Upload with its result, Publish translations, status switch | ✅ |
| Admin-Tech-Documentation | a document open from the file tree | ✅ |
| Portal frame (every Web board) | user menu, Change Password, notification popover, menu bar | ✅ |
| Web-Notifications | All / Unread / Account tabs, Mark all as read | ✅ |
| Every form | errors under each field; the save-failed box at the top of a dialog only when a save fails; toasts: green success, red failure, 5 seconds | ✅ |

Not on any board (prototype-only): the "Login as" picker on the sign-in boards, the prototype bar, Reset data, sample data. Not in the prototype yet: the two searchable dropdowns (design-system addition, not used by any screen yet).

## 3. Ours, no board

Screens the prototype doesn't draw. Every other screen is now a board in section 2.

| Screen | App | Route | Why |
|---|---|---|---|
| 403, 500, loading | manage, web | inside the frame | starter core |
