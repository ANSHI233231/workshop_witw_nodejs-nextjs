# Shared Safari

**What it is.** Safaris that signed-in website users organise in a park and offer seats in; others show interest by joining, talk in the safari's discussion and flag comments. Nothing is paid or approved in the app. The Super Admin moderates in the console. The full process, with every decision, is the workflow [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md); this page is how the module does it.

**Who uses it.** Website: guests (browse, view), signed-in users (organise, join, comment, flag), the host (the user who organised a safari). Console: the Super Admin (Shared Safaris, Flagged Comments).

**Workflows:** [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md).

**Tables (written only by this module):** `shared_safari`, `shared_safari_member`, `shared_safari_comment`, `shared_safari_comment_flag` (migration `2026-11-04-shared-safari.sql`). It reads `master_park` (the [park](../park/README.md) module), `master_flag_reason` (the [flag-reason](../flag-reason/README.md) module) and partners (the [partner](../partner/README.md) module: `partnerOf`, `partnersOf`) through their services, and joins `user` for names and whether an account is active. The module is built after the partner module in `src/routes/index.ts`.

## Who sees what

- **A safari is visible** when its host's account is active and its status is Active (1) or Seat full (3). The host also sees their own Inactive (2) safari. Deleted by admin (4) and deleted by host (−1) are hidden everywhere on the website; anything not visible answers `SHARED_SAFARI_NOT_AVAILABLE` ("This safari is not available.").
- **The public list** (`GET /api/shared-safari/safaris`) shows visible Active and Seat full safaris whose end date is today or later, 12 at a time. "N active shared safaris" counts the same set without filters. Filters: park, month of the start date, price range (overlapping the safari's from–to), number of safaris, themes, stay categories; sorts by newest, safaris, price or start date.
- **Dates** (today, started, the start-date limits) are counted in Indian time (`Asia/Kolkata`), in the service; a safari is *started* once its start date has passed. Started safaris stay listed and open to join, leave and comment until their end date passes; after that they leave the list but their page still opens.
- **Members:** one row per safari and user. Joining shows interest (no seat is taken); leaving keeps the row with `left_at`; joining again reuses the row. The host is notified (kind 801) only on the first join. Interested and every joined count show only current members whose accounts are active.
- **Partners** (an account whose partner is Active or Inactive, [Packages workflow](../../workflows/WITW-Packages-Workflow.md) §2.5):
  - **Can't organise or join.** Organise, a first join and a join again after leaving answer 403 `SHARED_SAFARI_PARTNER` ("Partners can't organise a shared safari." / "Partners can't join a shared safari."), recorded as failures (audit 802 / 817). Joining a safari they are still a member of stays a no-op.
  - **Earlier safaris stay as they are.** Safaris they host keep every host action (edit, picture, status, delete); safaris they joined keep Leave; they comment, reply, edit and delete their comments and flag by the usual rules, also as a member who left before.
  - **Shown as the business.** On the website every person the API returns (the host on cards and the view page, the card faces, the Interested list, comment and reply writers) is the business name, its initials and `partner: { id, businessName, logoVersion }`; the picture is `GET /api/partner/partners/<partner.id>/logo?v=<logoVersion>` (public), and with no logo the WITW default logo (`/witw/logo.png`) in the avatars; people who are not partners keep their initials. The ids stay the account's. The 802 notification to the host carries the business name (`actor_name`).
  - **Console** keeps the account's name (the Super Admin moderates accounts) and adds the same `partner` object on the host, joined, left and comment writers, and `writerBusinessName` / `flaggerBusinessName` on Flagged Comments and View flags.
  - Each viewer state has `isPartner`; `canJoin` is false for a partner.
- **The plan** is shown with emails and phone numbers replaced by `••••`; the host's Edit form and the console get it in full.

## Writing

- **Organise / Edit** (`POST /safaris`, `PUT /safaris/:id`, host only; Organise refused for partners): the checks of workflow §4 in the zod schema and the service (an active park; start date from today up to a year ahead, checked on Edit only when it changes; end after start). The slug is made from the title once and never changes (never only digits, so `/shared-safaris/<id>` and `/shared-safaris/<slug>` can't clash).
- **Display image** (`PUT /safaris/:id/cover-image`, multipart `image`): PNG or JPEG by its own bytes, up to 5 MB, kept as uploaded at `shared_safari/<id>/cover_image/<file>`; the row keeps the file name. The file is saved first and removed again if the row can't be updated; when it replaces an earlier picture, the old file is deleted from storage once the row is updated. `GET /safaris/:id/cover-image` serves it to anyone who may see the safari, with `Cache-Control: public` (the module's one public file route; the console reads it through its own admin route); a safari with no picture, or whose file is missing from storage, answers 404 `SHARED_SAFARI_NOT_AVAILABLE`.
- **Status** (host): Active, Seat full, Inactive; **Delete** by the host is final. Seat full stops new joins (`SHARED_SAFARI_NOT_OPEN`).
- **Discussion:** the host, current members and members who left can post while the safari is visible and Active or Seat full (others get `SHARED_SAFARI_JOIN_TO_COMMENT`). One level of replies. The writer can edit or delete their own comment unless they have left (`SHARED_SAFARI_LEFT`); deleting a comment deletes its replies. Comments under 200 words, plans under 1,000 (words = the text split at spaces). The host is notified (kind 802) of every comment or reply but their own.
- **Flags:** any signed-in user but the writer, with an active reason and details (up to 500), any number of times; the flag keeps the reason's name.
- **Console** (`/api/shared-safari/admin/…`, Super Admin): list (pinned first, then newest; search, status, host), detail (everything, plan in full, joined and left lists, comments with flag counts), Delete with one of the fixed 8 reasons and details (status 4), Make active (back to 1, delete columns cleared), Pin / Unpin (kept when a safari is deleted), delete a comment with its replies or a single reply (their open flags closed), Flagged Comments (comments with open flags by active users), View flags, Ignore. A host-deleted safari is read-only (`SHARED_SAFARI_DELETED_BY_HOST`).
- Every write and every refused write is in the audit log (module 8; actions 801–830; entities 9 safari, 10 comment), in the same transaction as the write.

## Access

| Route | Access |
|---|---|
| list, view (`/safaris/:ref`, slug or id), cover image | public, with the viewer recognised when signed in (`auth.access.viewer`) |
| organise, the edit form (`/safaris/:id/edit`), edit, image upload, status, delete, join, leave, My Shared Safaris (`/mine`), comment, edit / delete own comment, flag | signed in |
| `/admin/…` | Super Admin |

## Sample data (local development only)

The prototype's sample Shared Safari data can be written to a local database, so that the screens look like the boards:

```
cd apps/api
npm run cli seed/shared-safari                         # dry run: what it would write
npm run cli seed/shared-safari <password> confirm      # write it
npm run cli seed/shared-safari-remove                  # dry run: what it would remove
npm run cli seed/shared-safari-remove confirm          # remove it
```

**What the seed writes.** The data is the prototype's (`SEED` at 450bcc4):
- 13 accounts `<name>@example.test` with the password you give (8–72 characters, never stored anywhere but as the accounts' hash); the prototype's signed-in user Ananya Iyer is the local account `user@example.in` (created by the seed when missing, else used as it is; see [local development](../../platform/local-development.md#local-test-accounts)).
- 14 safaris with their statuses, pins and the admin delete. One difference: the Tigers of Bandhavgarh plan has no email address (the prototype's says "or write to riya.sharma@example.test").
- Members and members who left, comments, replies and flags.
- A cover for every safari, including #14 (the prototype shows the default cover there): the 3 pictures from `apps/api/seed/shared-safari/covers/` in turn.
- The prototype's 4 notifications, and for `user@example.in` a "joined your safari" row for each member of her safaris and a "commented on your safari" row for each comment or reply by someone else (read, with the prototype's times), so her feed is full. In-app rows only.

**What it does not do.**
- It sends no email and creates no other notification.
- Existing accounts (by email) and safaris (by slug) are left as they are, so running it again creates nothing; the one thing a re-run adds is a missing cover of a sample safari (audited as a seed row).
- The normal services and their rules are not used, so past dates can be written. The prototype's times are India time.

**Dates.** The prototype's "today" is 2026-11-03. A safari that was still open then, but whose end date has passed on the day the seed runs, is moved forward by the days between the two, so it keeps its place (started, not over). Kanha stays ended, as in the prototype.

**Remove.** It deletes only the sample data:
- the 14 sample safaris (by slug, hosted by a sample account or `user@example.in`) with every member, comment, flag, notification and cover file (the `shared_safari/<id>/` folders themselves stay);
- the `@example.test` sample accounts with their members, comments, flags and notifications elsewhere.

It never removes the local accounts (`user@example.in` and the others) or their own rows outside the sample safaris. Riya Sharma and Neha Singh also send the packages demo's quote requests: while that demo is there they are kept (the dry run lists them); run `packages-demo/remove` first. It refuses when a sample account hosts any other safari, and when an account has a system role. Refresh tokens of removed accounts stay in `user_refresh_token` (the auth module's table) and no longer work.

**Production.** Both commands refuse when `NODE_ENV=production`. The seed services refuse too (`SEED_NOT_ALLOWED`):
- `createUsersSeedModule`, `createNotificationSeedModule` and `createSharedSafariSeedModule` are built only by the CLI;
- each takes `isProduction` and checks it on every call.

**Audit.** Writes are recorded in the audit log with users 109–112 and shared safari 837–840; `test-data/remove-ct` removing `ct_` test safaris, members, comments and flags is 841 (842 failed).

## Screens

Website: `/` (list), `/shared-safaris/<slug>` (view), `/my-shared-safaris`; console: `/shared-safaris`, `/shared-safaris/<id>`, `/flagged-comments`. Rows in [PROTOTYPE-SYNC](../../../PROTOTYPE-SYNC.md).

**Partners on the screens** (workflow §2.5; the boards don't draw them). When `viewer.isPartner` (an Active or Inactive partner; the website pages also read the partner from the signed-in user's request): W1 and W9 show no Organise button (also not in their empty states), cards and the view page show no Join (a partner who is still joined keeps Leave; the host keeps Update Safari / Change Status / delete on earlier safaris); a refused call (403 `SHARED_SAFARI_PARTNER`) shows its message. A person on the website (host on cards and the view page, card faces, Interested list, comment and reply writers, the signed-in user's own avatar in the comment box) shows the `name` the API gives (the business for a partner) and, when `partner.logoVersion` is set, the logo picture (`GET /api/partner/partners/<id>/logo?v=<logoVersion>`), otherwise the WITW default logo (`/witw/logo.png`, a partner never shows initials). The frame's account button shows the partner's logo or the default logo. The console keeps the account name and adds the business in brackets: "Name (Business)" for the C1 host, the C3 host, joined, left and comment writers, and the C4 writer and flaggers.

## History

- Planning file: [2026-11-04-shared-safari](../../../planning/features/2026-11-04-shared-safari.md)
- Partners on Shared Safari: [2026-11-12-safari-packages](../../../planning/features/2026-11-12-safari-packages.md) (Phase 8)
- Sample data: [2026-11-13-shared-safari-seed](../../../planning/features/2026-11-13-shared-safari-seed.md)
