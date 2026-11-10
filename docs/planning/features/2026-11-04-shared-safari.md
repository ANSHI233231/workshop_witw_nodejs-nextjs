# Shared Safari

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-11-04 |
| Shipped | 2026-11-10 |
| Apps | api / manage / web |
| Test cases | TC-AUTH-01..04, TC-PARK-01..06, TC-SS-01..44, TC-FR-01..03 |
| How it works | [workflows/WITW-Shared-Safari-Workflow.md](../../how-it-works/workflows/WITW-Shared-Safari-Workflow.md) (the process); to write: `modules/park/`, `modules/shared-safari/`; to update: `modules/auth/`, `platform/file-storage.md`, `platform/manage-console.md` |

## 1. Requirement (as given)

> "Remove the Old Planning file what we have added , now based on the workflow , prototype , and the migrations create a planning file for the shared safari again, so we can start working on, And Don't start building"

The feature is defined by three sources, read together on 2026-11-04:

| Source | Version |
|---|---|
| Workflow | [WITW-Shared-Safari-Workflow.md](../../how-it-works/workflows/WITW-Shared-Safari-Workflow.md): §1–§12 and decisions #1–#63 in §13 |
| Prototype | `docs/prototype` at **450bcc4** ("Apply the Shared Safari decisions to the boards"): Web-Sign-Up, W1–W9, C1–C7, Web-Notifications, Web-Not-Found |
| Schema | [2026-11-04-shared-safari.sql](../../../apps/api/src/database/migrations/2026-11-04-shared-safari.sql): `master_park` (55 parks), `shared_safari`, `shared_safari_member`, `shared_safari_comment`, `shared_safari_comment_flag`, `master_flag_reason` (8 reasons), notification templates 801 / 802 |

Prototype items still open are listed in [prototype-changes/2026-11-04-shared-safari](../prototype-changes/2026-11-04-shared-safari.md).

In short: a signed-in user organises a safari in a park and offers seats. Others join it (showing interest; no seat is taken, nothing is paid, nothing is approved), talk in its discussion and flag comments. The Super Admin moderates in the console and keeps the parks and the flag reasons. New users sign up on the website.

## 2. Plan

### 2.1 Before any code (gates)

1. **Boards ready.** Web-Sign-Up, W1–W9 and C1–C7 have an empty Ready column in [PROTOTYPE-SYNC](../../PROTOTYPE-SYNC.md). Nothing is built from a board until the user declares it ready (AGENTS.md). The pin moved from 02ae9a4 to 450bcc4, so the 20 boards already marked ready are re-checked at 450bcc4 too.
2. **Prototype fixed first (#28).** The items in the [prototype changes](../prototype-changes/2026-11-04-shared-safari.md) list are done in the prototype repository and ticked there before their boards are declared ready. Most are already on the boards at 450bcc4 (§5); the list is not ticked yet.
3. **Re-theme first (#61).** The apps are re-themed to the 450bcc4 design system before any new screen. That is open item B2 in PROTOTYPE-SYNC, plus the new frames: the WITW header and logo in both apps, the WITW site frame on the website, and the console's Shared Safari sidebar group. B2 gets its own planning file and a browser test of every built board.
4. **Migration applied.** ~~The user applies~~ (superseded 2026-11-04, §4: the agent applies it to the local database at step 2). The user applies `2026-11-04-shared-safari.sql` to the local database (the schema questions are settled, §2.9; `2026-11-04-park.sql` is deleted).

### 2.2 API modules

| Module | Owns (writes) | Mount | Audit module |
|---|---|---|---|
| `shared-safari` (new) | `shared_safari`, `shared_safari_member`, `shared_safari_comment`, `shared_safari_comment_flag`, `master_flag_reason` | `/api/shared-safari` | 8 (actions 801…), matching notification kinds 801 / 802 |
| `park` (new) | `master_park` | `/api/park` | 9 (actions 901…) |
| `auth` + `users` | Sign Up: a user row (name, email, mobile, password hash), **no role** | `/api/auth/sign-up` | 2 / 1 |
| `notification` | sends kinds 801 / 802 (rows from the migration) | existing | 6 |

- **Dependencies:** `createSharedSafariModule(deps)` receives `parkService` (active parks, "is this park active"), `notificationService`, `auditService`, `fileStorage` and the users read it needs ("is this account active"). It JOINs `master_park` and `user` in its reads (reads are open) and never writes them. `createParkModule(deps)` reads upcoming-safari counts through a JOIN on `shared_safari`.
- **Code lists**, as `as const` objects:
  - `shared-safari/types/shared-safari.types.ts` holds `SharedSafariStatus` (1 active, 2 inactive, 3 seat full, 4 deleted by admin, −1 deleted by host), `SharedSafariTheme`, `StayCategory`, `AdminDeleteReason` (the fixed 8, #1), `SharedSafariMemberStatus`, `SharedSafariCommentStatus`, `CommentFlagStatus` and `FlagReasonStatus`.
  - `park/types/park.types.ts` holds `ParkRegion` and `ParkStatus`.
- **Audit:** every write records an event, plus its failure code.
  - Park: added, updated, status changed.
  - Safari: created, updated, status changed, deleted by host, deleted by admin, made active, pinned, unpinned.
  - Joined, left.
  - Comment or reply: posted, edited, deleted by its writer, deleted by the admin.
  - Comment flagged; flags ignored.
  - Flag reason: added, updated, status changed.
- **Dates:** "today", started / over / ended and every date limit are computed in IST (#40), from one helper in the module, never from the server's local time.

### 2.3 Rules the services enforce (summary of the workflow)

- **Visibility on the website:**
  - The public list shows Active and Seat full safaris whose `end_date` ≥ today (IST), started or not (#44, #47). "N active shared safaris" counts the same set (#31).
  - The view page opens for Active and Seat full safaris, including ended ones reached by their link. The host also sees their own Inactive safari (#22).
  - Everyone else gets "This safari is not available." (inactive, deleted, unknown slug). The same message appears for a safari whose host is deactivated (#18), on lists, views and in My Shared Safaris (#51).
- **Deactivated member (#52, #54):** their comments, replies and flags are not shown anywhere, and they are left out of Interested and every joined count. This is a JOIN on `user.status`; their rows keep their own status.
- **Organise and Edit (§4):**
  - Only active parks are offered. On Edit, a safari whose park is now inactive must have an active park picked (#32).
  - The start date must be from today up to one year ahead, checked on Edit only if the start date changed (#11). The end date must be after the start date.
  - 1–10 safaris; total seats 2–6; shared seats at least 1 and fewer than the total.
  - Price per person ₹0–₹10,00,000, with "to" ≥ "from" (#63).
  - The plan is under 1,000 words, counted by splitting on spaces. The title is up to 255 characters.
  - The host can edit at any time (#6). The slug is set at creation and never changes.
- **Display image (#21, #27, #58):** PNG, JPG or JPEG (checked from the bytes), up to 5 MB, kept as uploaded, at `shared_safari/<id>/cover_image/<file>` (the file name only in the row). With no image, the default WITW cover is shown.
- **Status:** the host sets Active, Seat full or Inactive, or deletes (final). Seat full is never automatic. The admin deletes with one of the fixed 8 reasons plus details, and Make active returns the safari to Active and clears the delete columns. A host-deleted safari is read-only in the console (#5, #15). Pins survive a delete (#42).
- **Join / leave (§7):**
  - Join needs sign-in, not being the host, and status Active; started or not (#33). Seat full blocks new joins only.
  - One member row per safari and user. A re-join reuses the row and updates `joined_at`. The host is notified only on the first join (`first_joined_at` set).
  - Leaving sets `left_at`. Joined On is the last join (#7); the console's Left list shows one line per member with the last leave (#10).
- **Discussion (§8):**
  - The host can post, as can members joined now or joined before and since left (#16), while the safari is Active or Seat full, started or not (#45).
  - A comment is under 200 words, shown oldest first, with one level of replies.
  - The writer can edit or delete their own comment or reply, even after the start (#25) but not after they have left (#43). There's no edited mark and no delete confirmation (#26).
  - Deleting a comment hides its replies everywhere, including the console (#53). Its flags (and its replies' flags) drop out of Flagged Comments (#49). An edited, flagged comment shows its new text (#50).
  - There is no masking in comments (#23).
  - The host is notified of every comment or reply except their own.
- **Flags (§8):** a signed-in user can flag someone else's comment or reply with an active reason and details (required, up to 500 characters). Any number of times is allowed (#9), including on a started safari (#34). The flag keeps `reason_name` as it was when flagged.
- **Safari plan masking:** phone numbers and emails are replaced with `••••` on the view page for everyone. The host sees the plan in full in Edit, and the console shows it in full.
- **Console Flagged Comments:** Ignore closes every open flag of the comment (status 2), and the comment stays. Delete removes the comment and its replies and closes their flags (status 3). Comments deleted by their writer, and those by deactivated users, are not listed.
- **Parks:**
  - The name is required and unique; the region is required.
  - The average price is either both values or neither, each up to ₹10,00,000, with max ≥ min (#62).
  - "Upcoming safaris" counts Active and Seat full safaris starting today or later (#41).
  - A new park is Active. The status switch appears only in Edit.
- **Flag reasons:** up to 60 characters, unique ignoring case. A new reason is Active and listed last; there's no reordering (#37). "Used in flags" counts every flag, open or closed (#36).

### 2.4 Routes and access

| Route (group) | Access | Board |
|---|---|---|
| `POST /api/auth/sign-up` | **publicAccess** | Web-Sign-Up |
| `GET /api/shared-safari/safaris` (filters, sort, cursor for infinite scroll) | **publicAccess** | W1, W2 |
| `GET /api/shared-safari/safaris/:slug` (view: details, masked plan, Interested, discussion; the viewer's own state if signed in) | **publicAccess** | W3, W4 |
| `GET /api/shared-safari/safaris/:id/cover-image` | **publicAccess** (only a safari the viewer may see) | W1–W3 for guests |
| `GET /api/park/active` (A–Z) | **publicAccess** | W1 Safari Park filter, W5 |
| `GET /api/shared-safari/flag-reasons/active` | signedIn | W8 |
| organise, edit, change status, delete, join, leave, comment, reply, edit / delete own comment, flag, My Shared Safaris | signedIn (host and member rules in the service) | W5–W9 |
| console safaris (list, detail, joined / left, pin, delete with reason, make active, delete comment / reply), flagged comments, parks, flag reasons | roles([Super Admin]) | C1–C7 |

The **publicAccess** routes are deliberate new choices, named here as AGENTS.md requires. No rate limit or verification on Sign Up (#39).

### 2.5 Screens

**web** (the WITW site frame of the boards: header with Plan Safari and Safari Packages as display-only items (#3), the mail-icon notifications popover, the account icon, the banner and the footer):

| Board | Route | Notes |
|---|---|---|
| Web-Sign-Up | `/sign-up` | Full Name, Email, Mobile Number, Password (show / hide). Signs the user in and lands on `/` with "Welcome, {first name}! Your account is created." |
| Web-Sign-In | `/login` | Adds the "Don't have an account? Sign Up" link |
| W1 / W2 | `/` | The portal opens here. Welcome (`(public)/page.tsx`) and `/dashboard` are removed (PROTOTYPE-SYNC section 3 → superseded) |
| W3 / W4 / W8 | `/shared-safaris/<slug>` | View, Interested popup, discussion, Flag dialog |
| W5 / W6 / W7 | dialogs | Organise / Edit (3 steps; a bottom sheet on mobile), Change status, Delete, Leave |
| W9 | `/my-shared-safaris` | Organised and Joined tabs |
| Web-Notifications, Web-Not-Found | existing | In the WITW frame; notifications show kinds 801 / 802 with a Shared Safari tag |

**manage** (WITW header; sidebar group **Shared Safari**):

| Board | Route |
|---|---|
| C1 / C2 / C3 | `/shared-safaris`, `/shared-safaris/[id]` (Joined / Left dialogs, Delete with reason, Make active, Pin, delete comment / reply) |
| C4 | `/shared-safaris/flagged-comments` |
| C5 / C6 | `/shared-safaris/parks`, `/shared-safaris/parks/[id]` |
| C7 | `/shared-safaris/flag-reasons` |

Each screen is copied whole from its board and its PROTOTYPE-SYNC row is updated in the same change. The Shared Safari console screens use their boards' patterns: S.No, alternate row colours, icon actions with tooltips, Clear filters, and the status switch inside Edit. The existing screens keep theirs (#24).

### 2.6 Files (by layer)

- **Migration:** `2026-11-04-shared-safari.sql` (the user's, with the §2.9 fixes); `2026-11-04-park.sql` deleted.
- **api:** `modules/park/`, `modules/shared-safari/` (routes, controllers, services, repositories, sql, validators, dto, mappers, contracts, types), `modules/auth` (sign-up), `modules/users` (create a self-registered user), `modules/audit/types/audit.types.ts` (modules 8 / 9 and their actions), `modules/notification/types/notification.types.ts` (801 / 802), `routes/index.ts` (mounts and deps).
- **web:** the services, types and hooks per feature; `components/shared-safari/…`; the routes above; the frame (header, footer, banner).
- **manage:** the services, types and hooks; `components/shared-safari/…`, `components/park/…`, `components/flag-reason/…`; the routes; `console-menu.ts` (the Shared Safari group).
- **Docs:** `how-it-works/modules/park/`, `modules/shared-safari/`, `modules/auth/` (Sign Up), `platform/file-storage.md` (the cover image row), `platform/manage-console.md`, PROTOTYPE-SYNC rows, and the prototype-changes ticks.

### 2.7 Order of work

1. The gates in §2.1 (ready boards, re-theme B2 and the new frames, migration applied).
2. `park` module + C5 / C6.
3. `shared-safari` core: organise / edit / status / delete, cover image, list (filters, sort, infinite scroll), view (masking, visibility) → W1, W2, W3, W5, W6, W7.
4. Join / leave, Interested popup, notifications 801 / 802 → W4, Web-Notifications.
5. Discussion: comment, reply, edit / delete own; Flag Reasons master (C7); flags (W8).
6. My Shared Safaris (W9).
7. Console: Shared Safaris list, detail, joined / left, pin, delete / make active, comment and reply delete (C1–C3); Flagged Comments (C4).
8. Sign Up and the portal entry change (Welcome and Dashboard removed, `/` = Shared Safaris).
9. Docs, PROTOTYPE-SYNC rows, every §3 case run, cleanup.

### 2.8 Not in this feature

Payments, approvals, seat booking, an automatic Seat full, email for the two notifications, a sample-photo set, image resizing, sign-up verification, masking in comments, the share icons and the Plan Safari / Safari Packages menu (display only), Devator Exp font files (#30, the prototype team's).

### 2.9 Questions settled (2026-11-04)

The user gave the [workflow](../../how-it-works/workflows/WITW-Shared-Safari-Workflow.md) and the [prototype changes](../prototype-changes/2026-11-04-shared-safari.md) as the answers to every question. Where they decide a point, they win; where they are silent (technical points only), the answer follows the repo's rules and stands unless the user says otherwise.

| # | Question | Answer | Source |
|---|---|---|---|
| 1 | `2026-11-04-park.sql` duplicated `master_park` | Deleted; the parks arrive with `2026-11-04-shared-safari.sql` | Workflow §3 |
| 2 | `comment_text` length vs "fewer than 200 words" | The word rule is the only limit (199 words at most; no character limit, no second message); the column is `TEXT` so any 199-word comment fits | Workflow §8, #8 |
| 3 | Cover image: path or file name | The file name only, at `shared_safari/<safari id>/cover_image/<file>`; replacing the image on Edit replaces the file | Workflow §4, #21; [file-storage](../../how-it-works/platform/file-storage.md) |
| 4 | Index for the public list | `idx_shared_safari_status_end_date` added (the list ends at the end date); the start-date index stays for sort and Month | Workflow §6.1, #47, #48 (index: repo rule) |
| 5 | Park starting data | The 55 parks as in the migration, with the obvious data fixes (Ripu-Chirang → North East, Palamau → East, Jhalana → West, Kangchenjunga website empty, Sundarbans' trailing newline); slugs kept as given, since a slug is set once | Workflow §3 (fixes: data correction, the workflow is silent) |
| 6 | Audit module numbers | shared-safari **8** (actions 801…), park **9** (actions 901…) | Migration (notification kinds 801 / 802); repo rule |
| 7 | Cover images for guests | A `publicAccess` picture route, limited to safaris the viewer may see: guests browse the list and open safaris, and every card and view shows the picture | Workflow §1, §6.1, §6.2, C (Guest) |
| 8 | "Console shows Login first" | **Always**: opening Console from the website shows the console Login page, whoever is signed in on the website. A website user has no role, so the console stays closed to them | Workflow §2, "What changed" (Console look) |
| 9 | Mobile on Sign Up | 10 digits starting 6–9, unique, the same rule as everywhere in the app (`INDIAN_MOBILE_PATTERN`), stored as the 10 digits; sign-in with the email or the mobile | Workflow §2, #12 |
| 10 | Frame of the web screens and the language switch | The boards decide (#29). Web-Notifications and Web-Not-Found move into the WITW frame (header, banner, footer); the Shared Safari screens and Sign Up use the WITW frame as on their boards; Sign In and Forgot Password, and the language switch, follow their boards when they are built | Workflow #29, §12; prototype changes (Web-Notifications, Web-Not-Found) |
| 11 | Board readiness | A screen is built from its board once the prototype is fixed and the board is declared ready by the user in PROTOTYPE-SYNC. The open items in the prototype-changes list are done in the prototype first (§2.1) | Workflow §12, #28; prototype changes; AGENTS.md |

## 3. Test cases

Every screen case runs at 1366 and 390 px, with no console errors, no failed calls and no sideways scroll.

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-AUTH-01 | Sign Up | web, guest | Login › Sign Up; fill Full Name, Email, Mobile, Password | signed in, on Shared Safaris, "Welcome, {first name}! Your account is created."; the user has no role; console refuses them | H | browser |
| TC-AUTH-02 | Sign Up errors | web | submit empty; bad email; taken email (other case); bad mobile; taken mobile; 7-char password | the six workflow messages under their fields | H | browser |
| TC-AUTH-03 | Sign in with email or mobile | a signed-up user | sign out; sign in with the email, then with the mobile | both sign in | H | browser |
| TC-AUTH-04 | Console from the website | signed in on the website as a member; then as a Super Admin | open Console from the website | the console Login page both times; the member's account cannot enter the console | H | browser |
| TC-PARK-01 | Parks list | console | open Parks; search, Region, Status, Clear filters; page 2 | 55 rows, S.No, alternate rows, 20 per page; Upcoming safaris = Active + Seat full starting today or later | H | browser |
| TC-PARK-02 | Add Park | console | add with name, region, prices | Active; shows at once in the Organise form and the W1 Safari Park filter | H | browser |
| TC-PARK-03 | Park errors | console | empty name; existing name; no region; max < min; one price only; over ₹10,00,000 | the six workflow messages | H | browser |
| TC-PARK-04 | Edit and status | console | edit name and prices; switch Inactive in Edit; Make active / inactive icon | saved; inactive gone from the Organise form and the filter; its safaris unchanged | H | browser |
| TC-PARK-05 | Park detail | console | open a park | all fields, upcoming shared safaris, Edit, Make active / inactive | M | browser |
| TC-PARK-06 | Edit a safari whose park is inactive | a safari in a park made inactive | host opens Edit, saves | the current park shown; "This park is no longer active. Select an active park."; saves after picking an active one | H | browser |
| TC-SS-01 | List as guest | safaris in every status and date state | open `/` | banner; "There are currently N active shared safaris" (Active + Seat full, end date not passed); started ones listed, ended ones not; no Organize button; infinite scroll; back-to-top | H | browser |
| TC-SS-02 | Card | list | look at cards as guest, member, joined member, host; a Seat full one | date badge, strip Safaris N · Seats X of Y (grey when full), host line, park, initials (+N), "N joined"; the button per viewer as §6.1 | H | browser |
| TC-SS-03 | Filters | list | each filter; chips ✕; Clear all; Filters button on mobile | the list matches; Month = start month; "No shared safaris match your filters." | H | browser |
| TC-SS-04 | Sort | list | each of the six sorts | ordered as named; started ones included by start date | M | browser |
| TC-SS-05 | Empty list | no safaris | open `/` | "No shared safaris yet." | L | browser |
| TC-SS-06 | Organise (3 steps) | signed in | Organize; steps 1–3; Back keeps values; Cancel | Active, on the list at once; lands on the view, "Your safari is live."; bottom sheet on mobile | H | browser |
| TC-SS-07 | Organise errors | signed in | each §4 rule: title, park, dates, safaris, theme, seats, prices (₹0 allowed), plan at 1,000 words | each message under its field; Next stays on the step | H | browser |
| TC-SS-08 | Display image | organising | PNG, JPG, JPEG; a GIF; a 6 MB file; none | shown on card and view (also to a guest); "Use a PNG, JPG or JPEG image."; "Use an image up to 5 MB."; default cover when none; file stored as uploaded | H | browser |
| TC-SS-09 | Edit | host, safari with members and comments | Edit; change fields and image; save | members and comments kept; slug unchanged; old image replaced | H | browser |
| TC-SS-10 | Edit dates of a started safari | host, start date passed | Edit; save without touching dates; then change the start to yesterday | first saves; second "Choose a start date from today up to one year ahead." | H | browser |
| TC-SS-11 | Change status | host | Active → Seat full → Inactive → Active | Seat full: grey strip, no Join; Inactive: off the list, others "This safari is not available.", the host still sees it from My Shared Safaris | H | browser |
| TC-SS-12 | Host delete | host | Delete this safari? → Delete | gone from the website and My Shared Safaris; final; console shows "Deleted by host" | H | browser |
| TC-SS-13 | View page | Active safari | open as guest | picture, title, dates, park, host, details, share row (no action), plan, Discussion (N), Interested – N | H | browser |
| TC-SS-14 | Plan masking | a plan with a phone number and an email | view as guest, member, host; host Edit; console detail | `••••` on the view for everyone; full in Edit and the console | H | browser |
| TC-SS-15 | Not available | inactive (not host), deleted, unknown slug | open each link | "This safari is not available." with Back to Shared Safaris | H | browser |
| TC-SS-16 | Ended safari | end date passed | list; open its link | not on the list; the view opens | H | browser |
| TC-SS-17 | Join | member | Join on the card; on the view of another | "You've joined this safari."; in Interested; host notified | H | browser |
| TC-SS-18 | Leave and join again | joined member | leave on the card (at once); join; leave on the view ("Leave this safari?") | "You've left this safari."; host not notified on the re-join; Joined On = last join | H | browser |
| TC-SS-19 | Join refused | — | join own safari; a Seat full; an inactive one (API) | "You can't join your own safari."; "This safari is not open to join." | H | API + browser |
| TC-SS-20 | Join a started safari | start date passed, Active | join, leave | both work | H | browser |
| TC-SS-21 | Interested | 9+ joined, 1 left | view; hover; open the popup as guest | 8 initials then "+N", names on hover, no click; popup "INTERESTED (N)", S.No / Name / Joined On, "Showing 1 - N of N interested users"; the one who left not shown | M | browser |
| TC-SS-22 | Guest actions | guest | Join Safari; account icon; discussion | Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icon | M | browser |
| TC-SS-23 | Comment and reply | joined member, host | post a comment; reply; 200 words | oldest first; reply under its comment; "Please provide content within 200 words."; "Enter a comment." | H | browser |
| TC-SS-24 | Who can comment | never joined; left member; started safari | open the discussion | never joined: "Join this safari to comment."; left member: box shown, can post; started: box shown | H | browser |
| TC-SS-25 | Edit own comment | writer | Edit icon; change; Save; Cancel | text changes, no "edited" mark; same rules | H | browser |
| TC-SS-26 | Delete own comment / reply | writer | delete a reply; delete a comment with replies | at once, no confirm; reply alone gone; comment and its replies gone, also from the console | H | browser |
| TC-SS-27 | Own comments after leaving | writer who left | look at their comment | no Edit / Delete icons; can still post | H | browser |
| TC-SS-28 | Flag | signed in | flag another's comment with reason and details; flag it again; own comment (API) | "Thanks, we'll review this comment."; both flags counted; "You can't flag your own comment."; only active reasons offered, in added order | H | browser |
| TC-SS-29 | Flag errors | signed in | no reason; no details; 501 characters | errors; "Use up to 500 characters." | M | browser |
| TC-SS-30 | Deactivated host | host with safaris, deactivated in Console › Users | list, view link, member's My Shared Safaris; reactivate | hidden everywhere, "This safari is not available."; console still lists them; back after reactivation | H | browser |
| TC-SS-31 | Deactivated member | member with comments, flags, a join | deactivate; view the safari, card, Flagged Comments | comments, replies and flags hidden; left out of Interested and counts | H | browser |
| TC-SS-32 | My Shared Safaris | host and member | both tabs; icon actions; a started one; mobile | Organised: Active / Seat full / Inactive, "Over" on started, View / Edit / Change status / Delete; Joined: not Inactive or deleted, View / Leave; icons in their own row on mobile | M | browser |
| TC-SS-33 | Notifications | host | someone joins; comments; replies; host comments | "{name} joined your safari {title}." / "{name} commented on your safari {title}." in the mail popover and Notifications; none for the host's own; each opens the safari | H | browser |
| TC-SS-34 | Portal entry | web | open `/`, `/dashboard`, the old Welcome | `/` is Shared Safaris; `/dashboard` 404; Organize only when signed in | H | browser |
| TC-SS-35 | Console list | console | default All; each status filter incl. Deleted by host; search; host; Clear filters | pinned first then newest; S.No; 20 per page; Joined / Left counts open their lists | H | browser |
| TC-SS-36 | Pin | console | pin, unpin; delete a pinned safari | filled / outline icon; pinned first; stays pinned after delete; audited | M | browser |
| TC-SS-37 | Console detail | console | open a safari | everything on the view with the plan in full; joined (last join) and left (last leave) lists; comments with reply and flag counts | H | browser |
| TC-SS-38 | Delete with reason and make active | console | delete with reason and details; check website; make active | hidden, reason shown in the console; back to Active with the delete columns cleared; both audited | H | browser |
| TC-SS-39 | Host-deleted in console | a host-deleted safari | open it | "Deleted by host" with when; read-only, no Make active, Pin or Delete | H | browser |
| TC-SS-40 | Admin deletes a comment / reply | console | delete one reply; delete a comment with replies | reply alone gone; comment and replies gone from the website; their open flags closed | H | browser |
| TC-SS-41 | Flagged Comments | flags exist; one comment edited after flagging; one deleted by its writer | open; View flags; Ignore; Delete | current text shown; the writer-deleted one not listed; Ignore keeps the comment; Delete removes it; rows leave | H | browser |
| TC-SS-42 | Access | — | each console route as a member; each signed-in route as a guest; edit someone else's safari or comment | 403 / 401 / refused; the public routes answer to a guest | H | API |
| TC-SS-43 | IST dates | server clock UTC near midnight | a safari starting "today" IST | started / list / date limits by IST | M | API |
| TC-SS-44 | Audit | — | each write, and a failed one | its audit row with what changed; failure codes recorded | M | DB |
| TC-FR-01 | Flag Reasons list | console | open; search; Status filter | 8 reasons in added order; S.No; Used in flags counts open and closed | M | browser |
| TC-FR-02 | Add / edit reason | console | add; add the same in another case; 61 characters; edit; switch Inactive | new one last and Active; "This reason already exists."; length refused; inactive hidden from the Flag dialog | H | browser |
| TC-FR-03 | Past flags keep their reason | a flag with reason X | rename X; make it inactive | the flag still shows the old name | M | browser |

## 4. Decisions

- 2026-11-04 (user): the earlier Shared Safari planning file (written against 02ae9a4 and the earlier schema) is removed; this file replaces it, built from the workflow (decisions #1–#63), the prototype at 450bcc4 and the migration `2026-11-04-shared-safari.sql`.
- 2026-11-04 (user): no building yet; this file is for review first.
- 2026-11-04 (user, via the workflow and migration): the flag-reason master is `master_flag_reason` (#13); parks and safaris are in one migration file, `2026-11-04-shared-safari.sql`; notification kinds are 801 / 802.
- ~~2026-11-04 (user): "please fix the all question according to your best understanding": the eleven questions are settled as in §2.9: park file deleted; `comment_text` TEXT; cover image file name only at `shared_safari/<id>/cover_image/<file>`; index `(status, end_date)`; park regions, `N/A` and the newline fixed, slugs kept; audit modules shared-safari 8, park 9; a public cover-image route limited to visible safaris; console Login unless a Super Admin is signed in; mobile as 10 digits; each web screen's frame and language switch as its board; boards declared ready by the user, board by board.~~ Superseded by the next line where the user's files decide.
- 2026-11-04 (user): "use this for all your question and update my planning file": the workflow and the prototype-changes list are the answers to every question (§2.9 with the source of each). Changed from the line above: **#8 the console always shows its Login first** when opened from the website, also for a signed-in Super Admin (workflow §2); #10 and #11 follow the boards and the prototype-changes list (the prototype is fixed first, #28). Unchanged, as the files agree or are silent on technical points: #1–#7, #9.
- 2026-11-04 (user): "all boards are ready, when you develop on features then work on it; same for migration when you develop work on it": every board (Web-Sign-Up, W1–W9, C1–C7 and the 20 existing ones) is declared ready at 450bcc4, recorded in PROTOTYPE-SYNC; each board is built, and its PROTOTYPE-SYNC row updated, in the step of §2.7 that develops its feature. The migration `2026-11-04-shared-safari.sql` is applied to the local database by the agent when the work reaches the step that needs it (step 2, the park module), and checked there; this supersedes, for this feature's local database, "the user applies" in §2.1 gate 4.
- 2026-11-04 (user): "Now Start Building The Features, Use Sub Agents for Independant Feature Work … for the common and complex work do it yourself … make sure the Browser Testing and Mark the testing pass fail into the planning file, and Re-do work if failed, untill all test pass": building started; independent parts (Parks, Flag Reasons, Sign Up, console screens, website screens) go to subagents; the shared codes, the website frame and the shared-safari API are built by the lead.
- 2026-11-04 (lead, within the plan): the flag reasons are their own module `flag-reason` (owns `master_flag_reason`, mounted `/api/flag-reason`) so it could be built apart; console routes are `/shared-safaris`, `/flagged-comments`, `/parks`, `/flag-reasons` (top level, not under `/shared-safaris/`). The website's public routes take an optional viewer (`auth.access.viewer`, listed as public): the list, the view and the cover image know a signed-in viewer without requiring one. The cover image is uploaded after the safari is saved (`PUT /safaris/:id/cover-image`), its file saved before the row is updated and removed again if the update fails.
- 2026-11-10 (user): TC-AUTH-04 failed because the website and the console share one session; the user chose **a separate sign-in per app**: each app keeps its own session cookies, so signing in on the website does not sign in to the console, and the reverse (keeps §2.9 #8 and workflow §2 as written).
- 2026-11-04 (workflow §13): every decision #1–#63 applies as written there; it is the single list, not copied here. Superseded inside it: #4 ("Live" filter) by #55.

## 5. Execution log

- 2026-11-04: prototype pulled to 450bcc4. Checked against the [prototype changes](../prototype-changes/2026-11-04-shared-safari.md) list:
  - **Done on the boards:** Sign Up mobile; start-date rule on Edit; inactive park; image types and size; own comment Edit and Delete; a member who left can post; flag on a started safari; 500-character details; end date leaves the list; host's own Inactive; deactivated-account switch; notification samples; C1 filter; pin kept; park upcoming count and price limit.
  - **Not done:** `prototype/README.md` (still 22 boards).
  - **Not checked:** the Web-Notifications and Not-Found frames; C3 single reply delete and hidden replies; C4 edited text; W9 "Over" on Joined.
- 2026-11-04: plan written. Nothing built; no migration applied.
- 2026-11-04: §2.9 settled. `2026-11-04-shared-safari.sql` edited (unapplied, so still editable): `comment_text` TEXT, index `idx_shared_safari_status_end_date`, cover-image header, audit module line, park rows (Ripu-Chirang 6, Palamau 4, Jhalana 3, Kangchenjunga website NULL, Sundarbans newline). `2026-11-04-park.sql` deleted. Workflow §4 and #21 reworded to the file-storage path. Checked by building a throwaway database (`ct_schema_check`) from every migration: no errors, 55 parks (no `N/A`, no trailing newline, the three regions as above), 8 reasons, templates 801 / 802, the new index; the database dropped. Not applied to the local database.
- 2026-11-04: §2.9 re-checked against the user's workflow and prototype-changes list: #8 changed (Console always opens on its Login); a gate added for the prototype-changes list (§2.1, step 2); TC-AUTH-04 added. No change to the migration or the workflow; nothing built.
- 2026-11-04: building. Migration `2026-11-04-shared-safari.sql` applied to the local database by the lead (55 parks, 8 flag reasons, templates 801/802, the four `shared_safari*` tables). Audit codes (modules 8 shared-safari, 9 park; actions 801–836, 901–906, 107/108 sign-up; entities 9–12) and notification kinds 801/802 (API and both apps' copies) added. Console menu group Shared Safari and `console-shared-safari.css` (the C boards' styles, global ones scoped under `.ssc-screen`) added.
- 2026-11-04: shared-safari API module built (`apps/api/src/modules/shared-safari`). Smoke test through the API with two `ct_smoke` users: create (validation messages), cover PNG upload and a GIF refused, public list/view as guest with the plan masked, host-only edit, own-join refused, comment before join refused, join, comment, reply, edit own, edit others refused, flag own refused, flag twice, admin list/detail/flagged/flags/pin/delete with reason (view then 404)/make active/ignore flags, leave, edit after leaving refused, comment after leaving allowed, seat full blocks join, inactive hidden from guests and shown to the host, admin comment delete, host delete, host-deleted read-only in the console; host notified once on join and on each comment by others (not on the own reply); audit rows for every write and failure. Test data deleted.
- TC-AUTH-01 PASS (browser 1366 + 390, mysql; subagent): sign up lands on `/` signed in, no `user_role`, audit 107; the console refuses the account; the welcome toast checked on its own until it is mounted on `/`.
- TC-AUTH-02 PASS (browser 1366 + 390; subagent): the six messages under their fields (empty, bad email, taken email in other case, bad mobile, taken mobile, 7-character password).
- TC-AUTH-03 PASS (browser; subagent): signed out, then signed in with the email and with the mobile.
- TC-PARK-01 PASS (browser 1366 + 390; subagent): 55 parks, 20 per page, S.No, alternate rows (cards on phone), upcoming count 3 from six test safaris, search / region / status filters, Clear filters, page 2 "Showing 21–40 of 55".
- TC-PARK-02 PASS (browser; subagent): Add park without status switch, toast, Active with the price range, at once in `/api/park/active`.
- TC-PARK-03 PASS (browser; subagent): the six park messages (duplicate name from the API, case-insensitive).
- TC-PARK-04 PASS (browser + DB; subagent): Edit prefilled, inactive leaves `/api/park/active`, icon actions with tooltips and toasts, a park's safaris unchanged when it is made inactive.
- TC-PARK-05 PASS (browser 1366 + 390; subagent): detail with all fields and "Upcoming shared safaris (3)", Edit, Make inactive / active.
- TC-FR-01 PASS (browser 1366 + 390; subagent): 8 reasons in added order with S.No, Used in flags counts open and closed flags, search and status filters, Clear filters, cards on phone.
- TC-FR-02 PASS (browser + API; subagent): "Enter the reason.", duplicate in other case "This reason already exists.", 61 characters refused "Use up to 60 characters.", new reason last and Active, edit with status switch, inactive leaves `/api/flag-reason/active`.
- TC-FR-03 PASS (API + DB + browser; subagent): a flag keeps `reason_name` after its reason is renamed and made inactive; Used in flags still counts it.
- TC-SS-42 PASS (API): a guest gets 401 UNAUTHENTICATED on every signed-in route (mine, create, join, comment, edit / flag a comment, active flag reasons) and 200 on the public ones (list, view, active parks); a signed-up member without a role is refused by the console sign-in (CONSOLE_ACCESS_DENIED) and gets 403 ACCESS_DENIED on every Super Admin route (shared-safari admin, parks, flag reasons); editing, changing the status of or deleting someone else's safari gives 403 SHARED_SAFARI_NOT_HOST, editing or deleting someone else's comment 403 SHARED_SAFARI_NOT_WRITER.
- TC-SS-43 PASS (API + CLI): `todayInIndia` turns from 2026-11-04 to 2026-11-05 between 18:29Z and 18:31Z; a safari starting today (IST) is not started; with its start yesterday it is started and still listed (activeTotal 1); with its end yesterday it leaves the list (activeTotal 0) and its view still opens (200).
- TC-SS-44 PASS (DB): every write wrote its audit row with what changed (sign-up 107, created 801 with title and slug, comment 820 with its text); every refused change wrote its failure row with the error code (804, 806, 808 SHARED_SAFARI_NOT_HOST; 823, 826 SHARED_SAFARI_NOT_WRITER); the earlier smoke test covered the rest (803–829). Test users `ct_api1/2` and their rows deleted.
- TC-SS-35 PASS (browser 1366 + 390; subagent): Status All by default, 20 per page (page 2 from S.No 21), each status filter shows only its badges, search by title and by park, Host picker, Clear filters; Joined / Left counts open their lists (bottom sheet on phone); Filters button on phone.
- TC-SS-36 PASS (browser + DB; subagent): Pin / Unpin with toast and tooltip, filled green / outline icon, pinned first; a deleted pinned safari stays pinned and first; audit 813 / 814.
- TC-SS-37 PASS (browser; subagent): details with the plan in full (phone and email shown), picture, Joined (2) with join times, Left (1) with "Left on", Comments (4) with reply and flag counts, replies marked.
- TC-SS-38 PASS (browser + API + DB; subagent): "Select a reason.", "Enter the details.", "Use up to 1000 characters."; after Delete the reason banner, the Deleted by admin filter, the website 404; Make active back to Active with the delete columns NULL and the website showing it; audit 809, 811.
- TC-SS-39 PASS (browser; subagent): "Deleted by host on … This safari is read-only.", no Pin, Delete, Make active or comment delete.
- TC-SS-40 PASS (browser + DB; subagent): a single reply deleted alone; a comment deleted with its replies, on the console and the website; their open flags closed; audit 825.
- TC-SS-41 PASS (browser + DB; subagent): Flagged Comments shows the edited text, leaves out the writer-deleted comment; View flags (reason, details, who, when); Ignore keeps the comment; Delete removes it and its reply; flags closed.
- 2026-11-10: console detail (C3) now shows the host as "Name (email)" and an Updated row, as the board (API detail returns `hostEmail` and `updatedAt`); checked in the browser on a test safari, then deleted.
- TC-SS-01 PASS (browser 1366 + 390 + SQL; subagent): banner, "There are currently N active shared safaris" equal to the API's activeTotal and the SQL count; started listed, ended and inactive not; no Organize for guests; 12 per page then more on scroll, no duplicates; back-to-top.
- TC-SS-02 PASS (browser; subagent): date badge, strip Safaris / Seats X of Y (grey when full), host line, park, initials with names, +N, "N joined"; buttons per viewer (guest Join → Login, Join, Leave, View Safari, Seat Full → view).
- TC-SS-03 PASS (browser + API; subagent): park, month, both sliders, theme and stay checkboxes match the API totals; chips ✕, Clear all, "No shared safaris match your filters."; phone Filters sheet with count.
- TC-SS-04 PASS (browser + API; subagent): the six sorts in the API's order, started safaris included.
- TC-SS-05 PASS (browser, empty answer mocked because other rows existed; subagent): "No shared safaris yet."
- TC-SS-06 PASS (browser; subagent): three steps with dots, Back keeps values, Cancel closes, bottom sheet on phone, create lands on the view with "Your safari is live." and is listed at once.
- TC-SS-07 PASS (browser; subagent): every §4 message under its field, Next stays; ₹0 allowed; 999 words saves, 1000 refused.
- TC-SS-08 PASS (browser + API; subagent): GIF and 6 MB refused with their messages; PNG / JPEG accepted with preview; the picture shown to a guest (`?app=web`, 200 image/png); default cover without one.
- TC-SS-09 PASS (browser + DB; subagent): "Edit your safari", "Safari updated.", slug unchanged, members and comments kept, image replaced.
- TC-SS-10 PASS (browser; subagent): a started safari saves with its dates untouched; its start moved to yesterday is refused.
- TC-SS-11 PASS (browser; subagent): Seat full (grey strip, no Join, members can leave), Inactive (off the list, others "not available", the host sees the page from My Shared Safaris), back to Active.
- TC-SS-12 PASS (browser + DB; subagent): "Delete this safari? / This can't be undone.", "Safari deleted.", status −1, others "not available".
- TC-SS-13 PASS (browser; subagent): picture, title, dates, park, "Organized by", the facts, the share row (no action), masked plan, Discussion (3), Interested - 11.
- TC-SS-14 PASS (browser + API; subagent): `••••` for guest, member and host on the view; full in Edit and the console.
- TC-SS-15 PASS (browser; subagent): unknown slug, inactive (not host) and deleted: "This safari is not available.", Back to Shared Safaris.
- TC-SS-16 PASS (browser; subagent): an ended safari is off the list and its view opens.
- TC-SS-17 PASS (browser; subagent): join from the card and the view, toast, in Interested.
- TC-SS-18 PASS (browser + SQL; subagent): leave at once on the card, with "Leave this safari?" on the view; one 801 per member after a re-join.
- TC-SS-19 PASS (API; subagent): own safari, Seat full and inactive refused with their messages.
- TC-SS-20 PASS (browser; subagent): "This safari has already started." note; join and leave work.
- TC-SS-21 PASS (browser; subagent): 8 initials then "+3", names on hover, not clickable; popup "INTERESTED (11)" with S.No / Name / Joined On and "Showing 1 - 11 of 11 interested users"; the one who left not shown.
- TC-SS-22 PASS (browser; subagent): guest Join and the account icon open Login; "Sign in and join this safari to comment."; no flag icons.
- TC-SS-23 PASS (browser; subagent): "Enter a comment.", 200 words refused, 199 accepted, oldest first, reply under its comment.
- TC-SS-24 PASS (browser; subagent): never joined "Join this safari to comment."; a member who left and a started safari get the box.
- TC-SS-25 PASS (browser; subagent): edit with the same rules, "Comment updated.", no edited mark.
- TC-SS-26 PASS (browser + API; subagent): deletes at once; a reply alone, a comment with its replies, also gone from the console.
- TC-SS-27 PASS (browser; subagent): after leaving no Edit / Delete icons; can still post.
- TC-SS-28 PASS (browser + SQL + API; subagent): active reasons in added order, "Thanks, we'll review this comment.", two flags = two rows, own comment refused.
- TC-SS-29 PASS (browser; subagent): "Select a reason.", "Enter the details.", 501 characters "Use up to 500 characters."
- TC-SS-30 PASS (browser + SQL; subagent): a deactivated host's safaris leave the list, the count, the view and members' Joined tab; the console still lists them; back after reactivation.
- TC-SS-31 PASS (browser + SQL + API; subagent): a deactivated member's comment, Interested entry, count and flag hidden; back after reactivation.
- TC-SS-32 PASS (browser; subagent): Organised (Active / Seat full / Inactive / Over; View, Edit, Change status, Delete) and Joined (no Inactive, Over, Hosted by; View, Leave); icons in their own row on phone.
- TC-SS-33 PASS (browser + SQL; subagent): the two texts in the mail popover and on Notifications, each opening `/shared-safaris/{id}`; none for the host's own comments.
- TC-SS-34 PASS (browser; subagent): `/` is Shared Safaris, Welcome gone, `/dashboard` is the site's "Page not found" (the dev server answers every unknown address with 200, as before), Organize only when signed in.
- TC-PARK-06 PASS (browser + API; subagent): Edit shows the inactive park; "This park is no longer active. Select an active park."; saves after picking an active one (`PARK_INACTIVE`).
- TC-AUTH-04 FAIL (browser, lead): signed in on the website as a Super Admin, opening the console (`localhost:3041/`) goes straight to the Dashboard, not the console Login: both apps share one session (one access cookie), so §2.9 #8 ("always Login first") needs the sessions split per app. Asked the user (2026-11-10).
- Cleanup: every `ct_` test user, safari, member, comment, flag, notification, audit row and cover file deleted by marker (subagents and lead); parks 55 active, flag reasons the 8, `shared_safari*` tables empty.
- 2026-11-10: sessions split per app (user's decision): the API names the cookie pair after the request's app (`SESSION_COOKIE_APP` in `modules/auth/types/auth.types.ts`: `web_` / `manage_` + `access_token` / `refresh_token`; `auth.controller.ts` reads and writes the request app's pair), and each app's `ACCESS_TOKEN_COOKIE` (`lib/config.ts`) names its own; docs `modules/auth`, `platform/frontend-apps`, `platform/manage-console` updated. Everyone signed in before signs in once more. The technical document (`workflows/technical-document.md`, "one session for all apps") is now out of date; it is changed only when the user asks.
- TC-AUTH-04 PASS (browser 1366 + 390, lead): signed in on the website (cookies `web_access_token`, `web_refresh_token`), opening the console shows its Login; signing in there adds `manage_*` cookies; the website stays signed in; Log Out in the console removes only the `manage_*` pair and the website stays signed in; with the website's access cookie removed it refreshes and stays signed in; no failed calls. Test user `ct_auth` deleted.
- TC-AUTH-01 PASS (browser, lead, re-run after the split): Sign Up still signs the user in on the website (the `web_*` pair).

## 6. Post-deploy
