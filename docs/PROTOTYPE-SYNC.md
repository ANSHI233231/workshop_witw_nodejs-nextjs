# Prototype sync

Every prototype board against what we built: whether it is ready to build from, status, our route, and how ours differs (with the planning file that records why). Kept short on purpose: the full story of each decision is in its planning file in [planning/features/](planning/features/).

| | |
|---|---|
| Prototype | `docs/prototype` at 0799439 (git@github.com:ANSHI233231/workshop_witw_prototype.git) |
| Boards | 62, one file per board in `prototype/screens/` (`<Board>.html`, `<Board>.mobile.html`; `prototype/Starter-Prototype.html` holds them all): Console 23 (Admin 16, Shared Safari C1–C7); Portal 14 (Web 5, Shared Safari W1–W9); Packages 25 (website PK-W1–W9, Partner portal PK-P1–P8, console PK-C1–C8), each Desktop and Mobile; design system in `design-system/` (WITW Design System: Console and Portal themes, plus the Packages parts) |

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

Every board was compared with the app at 1366 px and 390 px (text and screenshot) on 2026-10-30 / 31, and the prototype updated to match at c5b636f: layout, frames, tables, dialogs, colours and text match. At 6231393 the prototype took the WITW theme (colours, fonts, corners, shadows only); the app followed on 2026-11-02 ([WITW theme](planning/features/2026-11-02-witw-theme.md)): manage in the Console values, web in the Portal values, Roboto in both. Every board was compared again at 1366 and 390 px, by the colours each page paints and a screenshot: the app uses no colour the board does not. On 2026-11-04 the prototype moved to its own repository (git@github.com:umang-lgtm/workshop_witw_prototype.git, a new history: the old commits are not in it); the pin is its 02ae9a4. It keeps the 16 Admin boards and Web Sign-In, Forgot-Password, Notifications and Not-Found, with the newer WITW theme (B2); drops Web-Welcome and Web-Dashboard (section 3); and adds Web-Sign-Up and the Shared Safari boards W1–W9 and C1–C7 (designed from `how-it-works/workflows/WITW-Shared-Safari-*.md`; C7 Flag-Reasons has no wireframe). At 450bcc4 the boards take the Shared Safari decisions ([prototype changes](planning/prototype-changes/2026-11-04-shared-safari.md)); on 4 Nov 2026 the user declared every board ready at 450bcc4. The rows of the 20 built boards are re-checked against 450bcc4 as their screens are restyled (B2); the new boards are built with their features ([Shared Safari](planning/features/2026-11-04-shared-safari.md)). Everywhere: the prototype's sample data (names, dates, log lines), its bar (Console / Portal, board list, Reset data, Desktop / Mobile) and its built-in failure examples are prototype-only. On 2026-11-10 the apps took the 450bcc4 theme and frames ([WITW frame](planning/features/2026-11-04-witw-frame.md)): every stylesheet rule diffed with the boards' and every board's screen compared at 1366 and 390 px. At 0799439 (2026-11-12) the 37 boards above are unchanged: each board's markup and logic diffed with 450bcc4, and the only changes are file links (`.html` for `.dc.html`) and images moved from inline data to `screens/img/`. The nine board stylesheets are byte-identical, and the design system only adds tokens and components. The Packages boards are new (declared ready by the user on 12 Nov 2026, and the prototype moved to the ANSHI233231 repository the same day), designed from [WITW-Packages-Workflow](how-it-works/workflows/WITW-Packages-Workflow.md) ([Packages](planning/features/2026-11-12-packages.md)).

| Board | Ready | Status | Our route | Differences (why) |
|---|---|---|---|---|
| Admin-Sign-In | 450bcc4 · 4 Nov 2026 | ✅ | manage `/login` | "Login as" picker: a prototype aid that fills in a sample account; not built |
| Admin-Forgot-Password | 450bcc4 · 4 Nov 2026 | ✅ | manage `/forgot-password` | – |
| Admin-Dashboard | 450bcc4 · 4 Nov 2026 | ✅ | manage `/` | – |
| Admin-Users-Roles-Users | 450bcc4 · 4 Nov 2026 | ✅ | manage `/users` | Failure toasts red, as the prototype ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Users-Roles-Roles | 450bcc4 · 4 Nov 2026 | ✅ | manage `/roles` | – |
| Admin-Notifications | 450bcc4 · 4 Nov 2026 | ✅ | manage `/notifications` | "Mark all as read" failure toast red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Notification-Templates | 450bcc4 · 4 Nov 2026 | ✅ | manage `/notifications/templates` | The password-reset email is stored data: its WITW colours come from `npm run cli mail/witw-colours confirm`, run once per copy of the system ([WITW theme](planning/features/2026-11-02-witw-theme.md)) |
| Admin-Delivery-Log | 450bcc4 · 4 Nov 2026 | ✅ | manage `/notifications/delivery-log` | – |
| Admin-Audit-Log | 450bcc4 · 4 Nov 2026 | ✅ | manage `/audit-log` | "Could not be opened" toast red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-System-Logs | 450bcc4 · 4 Nov 2026 | ✅ | manage `/system-logs` | – |
| Admin-Error-Logs | 450bcc4 · 4 Nov 2026 | ✅ | manage `/error-logs` | "Could not be opened" and copy-failure toasts red ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Background-Jobs | 450bcc4 · 4 Nov 2026 | ✅ | manage `/background-jobs` | – |
| Admin-Language-Master | 450bcc4 · 4 Nov 2026 | ✅ | manage `/languages/master` | "Already in use" wording for a taken name or code; English's switch shown, on and locked; ([prototype sync](planning/features/2026-10-30-prototype-sync.md), [language](how-it-works/modules/language/README.md)) |
| Admin-Language-Translation | 450bcc4 · 4 Nov 2026 | ✅ | manage `/languages/translations` | "This text is already in use."; length message "English text can be at most 500 characters." kept ([prototype sync](planning/features/2026-10-30-prototype-sync.md)) |
| Admin-Tech-Documentation | 450bcc4 · 4 Nov 2026 | ✅ | manage `/docs` | The documents themselves are the repository's, newer than the prototype's copy |
| Admin-Not-Found | 450bcc4 · 4 Nov 2026 | ✅ | manage, any unknown address | – |
| Web-Sign-In | 450bcc4 · 4 Nov 2026 | ✅ | web `/login` | "Login as" picker: a prototype aid; not built |
| Web-Forgot-Password | 450bcc4 · 4 Nov 2026 | ✅ | web `/forgot-password` | – |
| Web-Notifications | 450bcc4 · 4 Nov 2026 | ✅ | web `/notifications` | Dates as the board ("1 day ago, 16:20"); a pager under the list when there are more than one page of notifications (the board has none); the account notifications keep their existing texts ("…created by {actor}"), workflow #14 ([WITW frame](planning/features/2026-11-04-witw-frame.md)) |
| Web-Not-Found | 450bcc4 · 4 Nov 2026 | ✅ | web, any unknown address (signed in; a guest is sent to Login, as before) | The 403 and 500 pages use the same layout |
| Web-Sign-Up | 450bcc4 · 4 Nov 2026 | ✅ | web `/sign-up` | Password up to 72 characters (the app's password rule; the board's field allows 200); the Mobile field accepts +91 / a leading 0 and keeps the 10 digits; "Login as" picker not built |
| W1-Shared-Safaris-list | 450bcc4 · 4 Nov 2026 | ✅ | web `/` | "View as", "Accounts" and "State" switches: prototype aids, not built. The count line stays blank until the first page has loaded (the board has no load state for it); filter changes ask the API after a 0.25 s pause; below 768 px the phone markup (Filters button and sheet) is used, chosen in the browser, so a phone first paints the desktop layout for a moment |
| W2-Safari-card | 450bcc4 · 4 Nov 2026 | ✅ | web `/` (each card) | – |
| W3-Shared-Safari-view | 450bcc4 · 4 Nov 2026 | ✅ | web `/shared-safaris/[slug or id]` | Share icon colours are classes in `witw-site.css`, not inline styles (no raw colours in components); the "not available" page answers a 404 from the API, which the browser console lists as a failed load |
| W4-Who-joined | 450bcc4 · 4 Nov 2026 | ✅ | web `/shared-safaris/[slug]`, Interested popup | – |
| W5-Organise-a-Safari-Edit | 450bcc4 · 4 Nov 2026 | ✅ | web dialog on `/`, `/shared-safaris/[slug]`, `/my-shared-safaris` | The display image is uploaded right after the safari is saved (a second call); if only the upload fails, the safari stays saved and a red toast says so. The park button carries no `aria-invalid` (not allowed on a button, lint) |
| W6-Change-status | 450bcc4 · 4 Nov 2026 | ✅ | web dialog on `/shared-safaris/[slug]`, `/my-shared-safaris` | – |
| W7-Delete-and-Leave | 450bcc4 · 4 Nov 2026 | ✅ | web dialogs on `/shared-safaris/[slug]`, `/my-shared-safaris` | – |
| W8-Flag-a-comment | 450bcc4 · 4 Nov 2026 | ✅ | web dialog on `/shared-safaris/[slug]` | – |
| W9-My-Shared-Safaris | 450bcc4 · 4 Nov 2026 | ✅ | web `/my-shared-safaris` | The tabs carry `#organised` / `#joined` links so they work from the keyboard; below 768 px the phone list is used, chosen in the browser |
| C1-Shared-Safaris-list | 450bcc4 · 4 Nov 2026 | ✅ | manage `/shared-safaris` | Filters, page and search live in the URL (`?search=&status=&hostId=&page=`), as on every console list, so a filtered view survives a reload and the back button; the board's "who is looking" and "deactivated account" switches are prototype aids, not built |
| C2-Joined-Left-list | 450bcc4 · 4 Nov 2026 | ✅ | manage `/shared-safaris` (Joined / left counts) | The list is fetched when the dialog opens (the safari's detail), so it shows the current members even if the page is older; the board's "Dialog: Joined / Left list" picker is a prototype aid |
| C3-Shared-Safari-detail | 450bcc4 · 4 Nov 2026 | ✅ | manage `/shared-safaris/{id}` (tab in `?tab=left` / `?tab=comments`) | A "Picture" row added to Details (the safari's cover, or the default cover), since the workflow asks for everything on the view page; Make active sits beside Pin for an admin-deleted safari (Delete hidden), as the board's logic; the board's current-safari picker is a prototype aid |
| C4-Flagged-Comments | 450bcc4 · 4 Nov 2026 | ✅ | manage `/flagged-comments` | "Reasons:" lists each reason once, without the board's per-reason counts (the API returns the distinct reasons); deleting a flagged reply asks "Delete this reply?" (as on C3) instead of "…and its replies?", and its toast says "Reply deleted."; search and page live in the URL |
| C5-Parks-list | 450bcc4 · 4 Nov 2026 | ✅ | manage `/parks` | Park name up to 150 characters (the board's field 100); Status filter Inactive is our code 2 (the board 0); "No parks match these filters." when nothing matches (the board has no empty state) |
| C6-Park-detail | 450bcc4 · 4 Nov 2026 | ✅ | manage `/parks/{id}` | Upcoming safaris link to the console detail `/shared-safaris/{id}` |
| C7-Flag-Reasons | 450bcc4 · 4 Nov 2026 | ✅ | manage `/flag-reasons` | Status filter values 1 / 2 (the board "" / 1 / 0); a failed save shows the red banner in the dialog as the app's other dialogs; toasts in the app's toast stack |
| PK-W1-Become-a-Partner | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W2-Package-list | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W3-Package-card | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W4-Package-page | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W5-Request-a-quote | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W6-My-Quote-Requests | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W7-Park-list | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W8-Park-page | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-W9-Package-Not-In-Use | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P1-Portal-Sign-In | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P2-Business-details | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P3-Dashboard | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P4-Packages-list | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P5-Package-builder | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P6-Gallery | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P7-Quote-Requests | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-P8-Business-Profile-Notifications | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C1-Partner-Requests | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C2-Partners | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C3-Package-Approvals | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C4-Packages | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C5-Package-Delete-Reasons | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C6-Gallery-Approvals | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C7-Galleries | 0799439 · 12 Nov 2026 | ⬜ | – | – |
| PK-C8-Quote-Requests | 0799439 · 12 Nov 2026 | ⬜ | – | – |

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
| Website frame (every Web board) | account menu (My Shared Safaris, Change Password, Log Out), mail popover, menu with Shared Safari, banner, footer; phone: menu on its own row | ✅ |
| Web-Notifications | All / Unread / Shared Safari / Account tabs, Mark all as read | ✅ |
| Every form | errors under each field; the save-failed box at the top of a dialog only when a save fails; toasts: green success, red failure, 5 seconds | ✅ |

Not on any board (prototype-only): the "Login as" picker on the sign-in boards, the prototype bar, Reset data, sample data. Not in the prototype yet: the two searchable dropdowns (design-system addition, not used by any screen yet).

## 3. Ours, no board

Screens the prototype doesn't draw. Every other screen is a board in section 2.

| Screen | App | Route | Why |
|---|---|---|---|
| 403, 500, loading | manage, web | inside the frame | starter core |
| ~~Welcome~~ | web | ~~`/`~~ | Removed 2026-11-10 with the Shared Safari website screens: `/` is W1 Shared Safaris ([Shared Safari](planning/features/2026-11-04-shared-safari.md)) |
| ~~Dashboard~~ | web | ~~`/dashboard`~~ | Removed 2026-11-10 with the Shared Safari website screens: signing in lands on `/` (W1); `/dashboard` is now Page not found ([Shared Safari](planning/features/2026-11-04-shared-safari.md)) |
