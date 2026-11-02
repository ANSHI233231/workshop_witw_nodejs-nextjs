# Manage console (Super Admin)

**What it is.** The Super Admin console in the manage app: the login page, the console frame (header, sidebar menu, footer), the dashboard and the platform's own pages. Every later admin page is added inside the same frame.

**Who uses it.** Only people with the **Super Admin** role (100); anyone else signs in and gets the 403 page. Developers adding an admin page in `apps/manage`.

## Pages

| Route | Page |
|---|---|
| `/login`, `/forgot-password` | Sign in, forgot / reset password (public) |
| `/` | Dashboard: the Users count and links to the platform pages |
| `/users` | User & Role › Users: list, Add / Edit (with the system roles), Set password, Active / Inactive, Export ([modules/users](../modules/users/README.md)) |
| `/roles` | User & Role › Roles: the `meta_role` list (read only) |
| `/notifications/templates` | System › Notification › Notification Templates: Email and In-app tabs ([modules/notification](../modules/notification/README.md), [modules/mail](../modules/mail/README.md)) |
| `/notifications/delivery-log` | System › Notification › Delivery Log: mails and in-app notifications in one list |
| `/notifications` | The header bell's full page: your own notifications in the console (tabs All, Unread, Account, Jobs) |
| `/audit-log` | System › Logs › Audit Log ([modules/audit](../modules/audit/README.md)) |
| `/system-logs` | System › Logs › System Logs: the log files of the API and the apps ([modules/system-log](../modules/system-log/README.md)) |
| `/error-logs` | System › Logs › Error Logs: the `app_log` rows |
| `/background-jobs` (`?tab=scheduled` / `one-time` / `logs`) | System › Background Jobs ([background jobs](background-jobs.md)) |
| `/languages/master`, `/languages/translations` | System › Languages ([modules/language](../modules/language/README.md)) |
| `/docs`, `/docs/<path>.md` | System › Tech Documentation (below) |

## How a page is put together

1. The root layout loads `app/globals.css` (the console stylesheet) and `app/console-extras.css`, and wraps every page in `<div class="root" data-portal="admin">`.
2. `/login` renders `SignInScreen` on its own, with no frame; its card is the `SignInForm`.
3. **Sign-in guard:** the `(dashboard)` layout reads the `access_token` cookie (the session shared by every app) and asks the API who it belongs to (`GET /api/auth/me`, then `GET /api/auth/console-roles`); no valid token → redirect to `/login`; signed in without Super Admin → the 403 page inside the frame.
4. Pages in the `(dashboard)` route group get `ConsoleShell`: the header (`ConsoleHeader`: the wordmark, the role chip, the language switch, the user menu with Change Password and Log Out), the sidebar (`ConsoleSidebar`), `<main class="app-content">` with the page, and the footer. A page renders its own `<div class="page">`.
5. Each page calls `requireConsoleArea('platform')` before loading its data; console areas (`lib/console-access.ts`) decide which roles open which pages, so a project's own console roles are added there.

## The sidebar menu

- **The menu is data:** `components/console/console-menu.ts` lists the sections, top items, groups, sub-groups and links in order. A new page is one link there with its `href`.
- **Opening:** clicking a group opens it and closes any other; the same among sub-groups.
- **Active item:** the link whose route best matches the current page is marked (`is-active` / `is-current`, `aria-current="page"`); its group and sub-group start open.
- **Menu groups are only how the menu is drawn.** A page's route and API follow its own area (`/users`, `GET /api/users`), never the menu's group.
- **A link without a route** (`href: undefined`) is shown like the others but goes nowhere, for a page not built yet.

## Tech Documentation

`/docs`: every `*.md` of the repository's `docs/` folder except `tools/`, `translations/` and `prototype/`, read from disk by the console's server (`lib/docs/`), no package. Super Admin only.

- The URL is the file's path (`/docs/how-it-works/README.md`); `/docs` is `docs/README.md`. Only listed files open; anything else (`..`, other folders, other extensions) is the 404 page.
- **Left, the tree:** folders first (by their README's `# ` heading), then files, newest first (a dated file name by its date, any other file by the date git first added it). The current file's folders are open.
- **Search** above the tree: the typed words in a file's title, text or git author names; at most 30 files, each with the line around the match.
- **Right, the file:** its title with **Download .md** (the file byte for byte, `GET /docs-source/<path>.md`, Super Admin only) and **Download PDF** (the browser's print, A4, "Tech Documentation · Page n of N"); the repo path, who added it and who last changed it (from git).
- **Links:** another doc opens in the viewer; `http(s)` opens a new tab; code files show as plain text with their path.
- **Diagrams:** a mermaid block shows the picture the Word generator drew for it (`how-it-works/workflows/documents/diagrams/<hash>.png`, served by `/docs-diagram/<name>`); without a picture it shows as code.

## Rules

- **Guarded:** every page in the `(dashboard)` route group needs a signed-in Super Admin; every API call a page makes is checked by the API as well. Hiding a menu item is not access control.
- **Lists page by 20**, with the shared pager (`components/ui/table-pager.tsx`).
- **Form errors go under their field**, never in a toast; Save takes the person to the first error.
- **Styles:** `globals.css` holds the console's design and its colours (`[data-portal="admin"]`: the WITW Console theme, green #09422D); a rule that is not in it goes in `console-extras.css`. `console-extras.css` and `console-mobile.css` hold only rules the console's pages use: when a page is removed, its rules go too.

## Where it lives

- **Routes:** `apps/manage/src/app/(public)/`, `apps/manage/src/app/(dashboard)/`
- **Components:** `apps/manage/src/components/console/` (frame, menu), `components/dashboard/`, `components/sign-in/`, `components/users/`, `components/roles/`, `components/mail/`, `components/audit/`, `components/app-log/`, `components/system-log/`, `components/background-jobs/`, `components/languages/`, `components/docs/`, `components/ui/`
- **Docs viewer:** `apps/manage/src/lib/docs/`, `app/(dashboard)/docs/`, `docs-source/`, `docs-diagram/`
- **Styles:** `apps/manage/src/app/globals.css`, `console-extras.css`, `console-mobile.css`

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
