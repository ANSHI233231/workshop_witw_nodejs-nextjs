# Shared Safari sample data for local development

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-11-13 |
| Shipped | 2026-11-13 |
| Apps | api / docs |
| Test cases | TC-SEED-01..12 |
| How it works | [modules/shared-safari](../../how-it-works/modules/shared-safari/README.md) |

## 1. Requirement (as given)

> Shared Safari: local par cards nahi dikh rahe. Prototype jaisa banana hai. … Seed data: ek seed script banao jo prototype ke same shared safaris (same titles, parks, dates, seats, prices, hosts, statuses) local DB mein daale, saath mein jo parks, users aur hosts chahiye wo bhi. Seed idempotent ho … Sirf local/dev ke liye ho … Dates aaj se aage rakho … README ya docs mein seed chalane ki command likho.

Root cause (found 2026-11-13, nothing changed): the local database had no shared safaris (`shared_safari`, `shared_safari_member` and `shared_safari_comment` were empty, and the only user was the Super Admin). The API answered `GET /api/shared-safari/safaris` with 200 and an empty page, and the website called it correctly, so no query or sign-in bug was involved.

## 2. Plan

The data is the prototype's `SEED` at 450bcc4. It is unchanged at the current pin.
- **People:** 14 accounts, `name@example.test`, with no mobile and no role.
- **Safaris:** 14, with their members, left members, comments, replies and flags.
- **Admin state:** the pins, the admin delete (Commercial or Spam), and the host delete.
- **Covers:** the three cover pictures (safaris 1–13 in turn; Dudhwa keeps the default).
- **Notifications:** the 4 in-app notifications.

Prototype times are India time and are stored in UTC.

**Dates.** The prototype's "today" is 2026-11-03.
- A safari that had not ended on that day but has ended by the day the seed runs is moved forward by the days between the two. This keeps its place, started but not over.
- On 2026-11-13 that moves only Gir and Ranthambore, by 10 days, so the website shows 10 active safaris as on the board.
- Kanha (ended in August in the prototype) stays ended.

**Seed write paths, one per owning module, never built by the server:**
- `users`:
  - `createUsersSeedModule` → `IUsersSeedService`: `seedAccounts` creates an account only when its email is free and returns the ids; `removeAccounts` deletes the accounts with their roles, refresh tokens and reset links.
  - `removeAccounts` refuses an account that has a system role.
- `notification`: `createNotificationSeedModule` → `INotificationSeedService`. `seed` writes in-app rows with their own created and read times. Nothing is delivered and no email is sent. `remove` deletes by user or by entity.
- `shared-safari`: `createSharedSafariSeedModule` → `ISharedSafariSeedService`.
  - `seed`: one transaction per safari; skips a slug already taken; writes the given dates and times; saves the cover after the transaction.
  - `remove`: deletes the given slugs hosted by the given users, with their members, comments and flags, the rows those users wrote elsewhere, the notifications and the cover files.
  - The normal services and their rules are not touched.
- **Production guard:** every seed service takes `isProduction` and throws `SEED_NOT_ALLOWED` on any call when it is true. The CLI also refuses.
- **Removal:** seeded rows are removed physically, not soft-deleted, so the seed can run again on the same emails and slugs.
- **Audit:**
  - New action codes: `USER_SEEDED` 109 / `USER_SEED_FAILED` 110 / `USER_SEED_REMOVED` 111 / `USER_SEED_REMOVE_FAILED` 112.
  - Also `SHARED_SAFARI_SEEDED` 837 / `SHARED_SAFARI_SEED_FAILED` 838 / `SHARED_SAFARI_SEED_REMOVED` 839 / `SHARED_SAFARI_SEED_REMOVE_FAILED` 840.

**CLI** `apps/api/src/cli/controllers/seed/`:
- Files: `SeedController.ts`, the prototype data (`shared-safari-seed.data.ts`) and the date rules (`shared-safari-seed.plan.ts`).
- The cover pictures live in `apps/api/seed/shared-safari/covers/`.
- Commands:
  - `npm run cli seed/shared-safari [password] [confirm]`
  - `npm run cli seed/shared-safari-remove [confirm]`
- Both are dry runs without `confirm`, and both refuse when `NODE_ENV=production`.
- The password comes only from the argument (at least 8 characters). It is never written in code, docs or git.

**Console:** no Add/Create. It is not on the C1–C3 boards; a safari is organised only on the website (W5).

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-SEED-01 | Dry run writes nothing | empty seed | `seed/shared-safari` without confirm | lists 14 accounts and 14 safaris to create; table counts unchanged | H | CLI |
| TC-SEED-02 | Seed | empty seed | `seed/shared-safari <password> confirm` | 14 accounts, 14 safaris, 37 current and 4 left members, 14 comments and replies, 3 flags, 4 notifications, 13 covers; summary printed | H | CLI / DB |
| TC-SEED-03 | No delivery while seeding | before and after TC-SEED-02 | count `mail_log` and `notification` rows | `mail_log` unchanged; `notification` grows by exactly 4 | H | DB |
| TC-SEED-04 | Run twice | after TC-SEED-02 | run the seed again with confirm | everything "already there"; no table count changes | H | CLI / DB |
| TC-SEED-05 | Production refused | – | run both commands with `NODE_ENV=production`; call each seed service with `isProduction: true` | CLI refuses; each service throws `SEED_NOT_ALLOWED`; nothing written | H | CLI |
| TC-SEED-06 | Remove | after TC-SEED-04 | `seed/shared-safari-remove` (dry run), then with confirm | the dry run lists what it would delete; then all seeded rows, files and accounts are gone; Super Admin, parks, flag reasons and other data unchanged | H | CLI / DB |
| TC-SEED-07 | Seed again after remove | after TC-SEED-06 | seed with confirm | same result as TC-SEED-02 | H | CLI / DB |
| TC-SEED-08 | Website list like W1 | seeded | open `/` as a guest and signed in as a seed account, 1366 + 390 px | "There are currently 10 active shared safaris"; cards as the board (date, safaris, seats, title, host, park, faces, joined count, button); filters and every sort work | H | browser |
| TC-SEED-09 | Safari page | seeded | open Tigers of Bandhavgarh as Riya and as a guest | plan with masked contacts, 7 joined, the comments and replies as the board | M | browser |
| TC-SEED-10 | Console list like C1 | seeded, Super Admin signed in | open Shared Safaris; filter by title or park, status, host | Total Items 14; the rows, joined / left counts and statuses as the board; filters narrow the list | H | browser |
| TC-SEED-11 | Console actions | seeded | View, Pin / Unpin, Delete with reason, Make Active on a safari; Flagged Comments shows Raj's comment with 3 flags | each action works and shows in the list; changes put back afterwards | H | browser |
| TC-SEED-12 | Prototype beside local | seeded | screenshots of W1, W3, W9, C1, C3, C4 boards and their local screens at 1366 and 390 px | same look, sample data aside | M | browser |

## 4. Decisions

- 2026-11-13 (user): plan approved with **Option A**: a dev-only seed service and repository method in the shared-safari module, writing the given dates and times. The normal services keep their rules (a past start date is still refused); only the seed path writes past dates, and only outside production. `NODE_ENV=production` is refused at the service level, not only in the CLI.
- 2026-11-13 (user): only the prototype's 4 notifications are seeded; seeding triggers no email and no other notification, and this is tested.
- 2026-11-13 (user): a remove command `seed/shared-safari-remove` removes only the seeded data: the `@example.test` accounts and the seed slugs, with their members, comments, flags, pins, notifications and cover images. It does not touch the Super Admin, the parks or other real data. It is a dry run without `confirm` and refuses in production.
- 2026-11-13 (user): the accounts' password is taken from the argument and is never written in code, docs or git. The user enters the Super Admin password locally for the console checks.
- 2026-11-13 (user): dates as planned: Gir and Ranthambore +10 days, the rest as the prototype; the website count must be 10.
- 2026-11-13 (user): the prototype pin (moved in ca06e4a) is not touched; no console Add/Create (not in the prototype).
- 2026-11-13 (user): the local Super Admin password is not known. If no default or reset command is written down, reset it through the console's Forgot Password using the captured mail. The new strong password goes only in `scratchpad/admin-password.txt` (mode 600). Local database only.
- 2026-11-13 (user): the website list keeps 12 cards per page (the board shows 6), the same as TC-SS-01 and the Packages and Parks lists.

## 5. Execution log

- 2026-11-13 — Built:
  - Seed paths in `users` (`users-seed.*`), `notification` (`notification-seed.*`) and `shared-safari` (`shared-safari-seed.*`).
  - Audit codes 109–112 and 837–840.
  - The CLI `cli/controllers/seed/` (`SeedController.ts`, the prototype data generated from the 450bcc4 `SEED`, and the date and value rules), plus `apps/api/seed/shared-safari/covers/cover-1..3.jpg` from the board's `COVERS`.
  - Docs: `modules/shared-safari` (Sample data), `modules/users`, `modules/notification`.
  - `tsc --noEmit` and `npm run lint` are clean.
  - The removal leaves auth's `user_refresh_token` rows of removed accounts in place; they no longer work (auth's table, not ours to delete).
- Counts before: user 1, shared_safari 0, members 0, comments 0, flags 0, notification 2, mail_log 0, master_park 55, master_flag_reason 8, audit_log 20, job_run 0.
- TC-SEED-01 PASS (CLI): the dry run listed 14 accounts and 14 safaris to create, and Gir and Ranthambore "moved 10 days". Every table count was unchanged afterwards.
- TC-SEED-05 PASS (CLI): with `NODE_ENV=production` both commands print "Sample data is never written in production". Each of the 9 seed service methods (users ×3, notification ×3, shared-safari ×3), called with `isProduction: true`, threw `SEED_NOT_ALLOWED`. Counts (audit_log included) were unchanged.
- TC-SEED-02 PASS (CLI + DB): "14 accounts and 14 safaris created". It wrote:
  - user 15, shared_safari 14, members 41 (37 joined + 4 left), comments 14, flags 3, notifications 4, 13 cover files under `storage/shared_safari/<id>/cover_image/`;
  - audit +15 (1 accounts + 14 safaris).
  
  Row by row:
  - Statuses: 1/3/2/4/−1 as the prototype. Bandhavgarh and Dudhwa are pinned.
  - Satpura: Commercial or Spam, deleted by the Super Admin. Dudhwa: deleted by its host.
  - Dates: Gir 11–14 Nov and Ranthambore 12–15 Nov 2026; the rest as the prototype; Kanha 2–4 Aug.
  - Times are stored in UTC (Bandhavgarh created 2026-11-02 04:45 = 10:15 IST).
- TC-SEED-03 PASS (DB): `mail_log` stayed 0 and `job_run` 0. `notification` grew by exactly 4: Riya 3 (joined, commented, commented-read) and Ananya 1, with the prototype's times.
- TC-SEED-04 PASS (CLI + DB): the second run printed "0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there". Every count was unchanged.
- TC-SEED-08 PASS (browser 1366 + 390):
  - `/` as a guest shows "There are currently 10 active shared safaris". The cards match the board: date badge, Safaris / Seats bar, title, host line, park, faces with +N, joined count, Join Safari / Seat Full, covers.
  - Each of the 6 sorts gives the board's order: the board's first 6 cards equal local's first 6, and local shows all 10.
  - The filters match the board: park Corbett 1, December 3, November 2, Photography 5, Premium 3, Home Stay + Safari Experience 2.
  - No failed calls, no console errors, no sideways scroll.
  - Signed in as Riya with the website's `web_access_token` / `web_refresh_token` cookies.
  - The board loads 6 cards first and local loads 12 (the page size set and tested in TC-SS-01); with 10 safaris local shows them all at once. The user has been told.
- TC-SEED-09 PASS (browser 1366 + 390):
  - Tigers of Bandhavgarh as a guest: the plan shows `••••` for the phone and email, and comments are not masked (as the board). "Discussion (7)" with the comments and replies, and "Interested - 7".
  - As Riya: Update Safari and Change Status show.
  - Notifications as Riya: "You have 2 unread notifications" with 3 rows about Bandhavgarh.
  - My Shared Safaris as Riya lists Bandhavgarh.
  - The only error is the signed-out session check's 401 on `/login`.
- TC-SEED-06 PASS (CLI + DB):
  - The dry run printed "Would remove: 14 safaris, 41 members, 14 comments, 3 flags, 4 notifications, 13 cover pictures" and the 14 accounts. Counts were unchanged.
  - With confirm it removed the same numbers and "14 accounts". Left behind: user 1 (the Super Admin), notification 2 (the two that were there before), master_park 55, master_flag_reason 8, no cover files.
  - The storage contract deletes files only, so the empty `shared_safari/<id>/cover_image/` folders stay, as with the website's own deletes.
- 2026-11-13 — Local Super Admin sign-in:
  - No default password or reset command is written anywhere (`user/create-super-admin` prints a new admin's password once).
  - At the user's request the local password was reset through the console's Forgot Password: the mail was captured in `mail_log`, and the link set a new generated password.
  - The password is kept only in the session scratchpad (`admin-password.txt`, mode 600), never in code, docs or git. The reset link file was deleted after use.
  - Only the local database was touched.
  - On the way, a second API watcher started by this session (its first start had failed with EADDRINUSE) was found racing the user's dev server for port 8030 after file changes. It was stopped.
- TC-SEED-10 PASS (browser 1366 + 390):
  - Signed in as the Super Admin with the console's `manage_access_token` / `manage_refresh_token` cookies.
  - Shared Safaris shows "Total Items: 14". The rows, order (pinned first, then newest), hosts, seats, joined / left counts and statuses equal the C1 board (Gir and Ranthambore dates moved, as planned).
  - Filters: search "Corbett" → 1, status Deleted by admin → 1, host Ananya → 4.
  - Only the signed-out session check's 401 on `/login`.
- TC-SEED-11 PASS (browser 1366; DB):
  - On Nagarhole elephant days: Pin, then Unpin, from the list; View opened the detail; Delete with reason (Commercial or Spam) showed "Deleted by admin" and Make active; Make active brought it back to Active.
  - The audit log has one row each for 813, 814, 809 and 811. The row is back to its seeded state (status 1, not pinned, no delete columns).
  - Flagged Comments lists Raj's comment with its flags (Total Items 1) at 1366 and 390.
- TC-SEED-12 PASS (browser 1366 + 390): side-by-side screenshots of W1, W3, W9, C1, C3 and C4, prototype beside local. Same layout and data, except:
  - the board's clock is 3 Nov, so local shows "12 days ago" where the board shows "2 days ago";
  - Gir and Ranthambore dates are moved;
  - W1 loads 12 cards first instead of the board's 6 (raised with the user);
  - the console menu also lists Partners and Packages, from the Safari Packages work going on in parallel.
- 2026-11-13 — W1 page size: Board 6 dikhata hai, build 12 rakhta hai (TC-SS-01, Packages aur Parks lists ke saath same). Decided by the user; no change.
- 2026-11-13 — The session scratchpad was emptied when the session restarted. That lost the Super Admin password file, the sample accounts' password and the screenshots.
  - The local Super Admin password was reset again the same way (Forgot Password, captured mail), and the new one saved only in the scratchpad's `admin-password.txt` (mode 600). Console sign-in checked.
  - The sample data was removed and seeded again with a new sample password (`seed-password.txt`, same place): "14 accounts and 14 safaris created", the website count is 10, and Riya signs in and sees her safari.
- TC-SEED-07 PASS (CLI + DB): seeding again after the remove gave "14 accounts and 14 safaris created" and the same counts as TC-SEED-02 (13 cover files).
- 2026-11-16: Full re-run ([2026-11-16-full-test-and-docs](2026-11-16-full-test-and-docs.md)), group safari-parks, after the machine restart; screenshots in `.work/screenshots/2026-11-16-full-test/` (local, git-ignored).
- TC-SEED-01 PASS (CLI; role: none) 2026-11-16: seed/shared-safari without confirm on the already seeded database: "Accounts: 0 to create, 14 already there. Safaris: 0 to create, 14 already there.", per-safari list, "Dry run: nothing written"; seed-scoped table counts unchanged (an empty-seed dry run, which lists 14 + 14 to create, cannot be shown without deleting the data).
- TC-SEED-02 PASS (CLI + DB; role: none) 2026-11-16: seed/shared-safari <password> confirm (idempotent re-run, a throwaway password as nothing is created): "Done: 0 accounts and 0 safaris created; 14 accounts and 14 safaris were already there."; the sample set in the DB is 14 safaris, 41 member rows (37 current, 4 left), 14 comments and replies, 3 flags, 4 notifications, 13 covers (remove dry run lists 13 cover pictures). The first seed on an empty database was not repeated (no data delete).
- TC-SEED-03 PASS (DB; role: none) 2026-11-16: before and after the add run: mail_log 20 -> 20 and the 4 sample notifications (entity 99..112, created before 4 Nov) stay 4; the seed writes no mail. The "notification grows by exactly 4" part belongs to a first seed and was not repeated.
- TC-SEED-04 PASS (CLI + DB; role: none) 2026-11-16: the add command run again with confirm: everything "already there"; users @example.test 15 -> 15, seed safaris 14 -> 14, members 41 -> 41, comments 14 -> 14, flags 3 -> 3, notifications 4 -> 4.
- TC-SEED-05 PASS (CLI; role: none) 2026-11-16: NODE_ENV=production: seed/shared-safari (dry), seed/shared-safari <pw> confirm and seed/shared-safari-remove (dry) all print "Sample data is never written in production (NODE_ENV=production)." with exit 1; calling the users, notification and shared-safari seed services with isProduction true: seedAccounts, removeAccounts, seed and remove all throw SEED_NOT_ALLOWED; nothing written (counts unchanged).
- TC-SEED-06 NOT RUN (CLI; role: none) 2026-11-16: user rule: no data delete. Only the dry run was run: "Would remove: 14 safaris, 41 members, 14 comments, 3 flags, 4 notifications, 13 cover pictures." and the 14 sample accounts; "Dry run: nothing removed."; the remove with confirm was not run.
- TC-SEED-07 NOT RUN (none; role: none) 2026-11-16: user rule: no data delete; it follows a remove with confirm (TC-SEED-06), so seed-after-remove was not run. The add command itself works on the existing data (TC-SEED-02 / 04).
- TC-SEED-08 PASS (browser, 1366 + 390 px; role: Guest, User; screenshots: tc-seed-08-guest-1366.png, tc-seed-08-guest-390.png, tc-seed-08-user-1366.png, tc-seed-08-user-390.png, tc-seed-12-board-w1-1366.png) 2026-11-16: W1 as the board: banner, filters, sorts (TC-SS-03 / 04), cards with date badge, Safaris / Seats strip, host, park, faces, N joined and the button for the 8 sample safaris that have not ended (Tigers of Bandhavgarh 4 / 3 of 5 / 7 joined, Corbett birding trail Seat Full, Periyar 0 joined, …); the count reads "There are currently 80 active shared safaris" because the tests added ct safaris (the board says 10: Gir and Ranthambore have ended since); no console errors.
- TC-SEED-09 PASS (browser, 1366 + 390 px; role: Guest, User; screenshots: tc-seed-09-guest-1366.png, tc-seed-09-guest-390.png, tc-seed-09-user-1366.png, tc-seed-09-user-390.png) 2026-11-16: Tigers of Bandhavgarh: plan with phone and email masked (••••), Interested - 7, Discussion (7) with 7 comments / replies in order; same for a guest and a signed-in user (the sample accounts' own passwords are not available, so Riya was not signed in); no console errors.
- TC-SEED-10 PASS (browser + API, 1366 + 390 px; role: Super Admin; screenshots: tc-seed-10-1366.png, tc-seed-10-390.png) 2026-11-16: console list: the 14 sample safaris (API) with joined / left counts (Tigers 7 / 2, Dudhwa 1 / 1, Corbett 6 / 0 …) and statuses (Active, Seat full, Inactive, Deleted by admin, Deleted by host, pinned Tigers and Dudhwa); search Bandhavgarh gives 1 row 7 / 2 Active 3/5; Status filter Deleted by host lists Dudhwa; total reads higher than 14 because of ct data; no console errors.
- TC-SEED-11 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-seed-11-view-1366.png, tc-seed-11-view-390.png, tc-seed-11-deleted-1366.png, tc-seed-11-deleted-390.png, tc-seed-11-flagged-1366.png, tc-seed-11-flagged-390.png) 2026-11-16: on Pench by jeep: View, Pin then Unpin, Delete with reason Off Topic (status 4, banner), Make active - all worked and the safari is back exactly as before (status 1, not pinned, no delete reason; only audit rows and updated_at differ); Flagged Comments shows Raj Patel's comment ("Call me on 98201 45678 …") with 3 flags, Reasons Commercial or Spam, Other; no console errors. Sample data changed and restored.
- TC-SEED-12 PASS (browser, 1366 + 390 px; role: Guest, Super Admin; screenshots: tc-seed-12-board-w1-1366.png, tc-seed-12-board-w3-1366.png, tc-seed-12-board-w9-1366.png, tc-seed-12-board-c1-1366.png, tc-seed-12-board-c3-1366.png, tc-seed-12-board-c4-1366.png, tc-seed-12-board-w1-390.png, tc-seed-12-board-c4-390.png, tc-seed-08-guest-1366.png, tc-seed-09-guest-1366.png, tc-ss-32-organised-1366.png, tc-seed-10-1366.png, tc-ss-37-comments-1366.png, tc-seed-11-flagged-1366.png) 2026-11-16: board screenshots of W1, W3, W9, C1, C3, C4 (desktop and .mobile) taken from the prototype file beside the local screens at 1366 and 390 px: same frame, cards, tables and dialogs; only the sample data, the prototype bar and the prototype aids (View as, Accounts, State) differ. Compared by eye on W1 card grid; the others as in the PROTOTYPE-SYNC rows.

## 6. Post-deploy
