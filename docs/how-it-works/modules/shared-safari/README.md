# Shared Safari

**What it is.** Safaris that signed-in website users organise in a park and offer seats in; others show interest by joining, talk in the safari's discussion and flag comments. Nothing is paid or approved in the app. The Super Admin moderates in the console. The full process, with every decision, is the workflow [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md); this page is how the module does it.

**Who uses it.** Website: guests (browse, view), signed-in users (organise, join, comment, flag), the host (the user who organised a safari). Console: the Super Admin (Shared Safaris, Flagged Comments).

**Tables (written only by this module):** `shared_safari`, `shared_safari_member`, `shared_safari_comment`, `shared_safari_comment_flag` (migration `2026-11-04-shared-safari.sql`). It reads `master_park` (the [park](../park/README.md) module) and `master_flag_reason` (the [flag-reason](../flag-reason/README.md) module) through their services, and joins `user` for names and whether an account is active.

## Who sees what

- **A safari is visible** when its host's account is active and its status is Active (1) or Seat full (3). The host also sees their own Inactive (2) safari. Deleted by admin (4) and deleted by host (−1) are hidden everywhere on the website; anything not visible answers `SHARED_SAFARI_NOT_AVAILABLE` ("This safari is not available.").
- **The public list** (`GET /api/shared-safari/safaris`) shows visible Active and Seat full safaris whose end date is today or later, 12 at a time. "N active shared safaris" counts the same set without filters. Filters: park, month of the start date, price range (overlapping the safari's from–to), number of safaris, themes, stay categories; sorts by newest, safaris, price or start date.
- **Dates** (today, started, the start-date limits) are counted in Indian time (`Asia/Kolkata`), in the service; a safari is *started* once its start date has passed. Started safaris stay listed and open to join, leave and comment until their end date passes; after that they leave the list but their page still opens.
- **Members:** one row per safari and user. Joining shows interest (no seat is taken); leaving keeps the row with `left_at`; joining again reuses the row. The host is notified (kind 801) only on the first join. Interested and every joined count show only current members whose accounts are active.
- **The plan** is shown with emails and phone numbers replaced by `••••`; the host's Edit form and the console get it in full.

## Writing

- **Organise / Edit** (`POST /safaris`, `PUT /safaris/:id`, host only): the checks of workflow §4 in the zod schema and the service (an active park; start date from today up to a year ahead, checked on Edit only when it changes; end after start). The slug is made from the title once and never changes (never only digits, so `/shared-safaris/<id>` and `/shared-safaris/<slug>` can't clash).
- **Display image** (`PUT /safaris/:id/cover-image`, multipart `image`): PNG or JPEG by its own bytes, up to 5 MB, kept as uploaded at `shared_safari/<id>/cover_image/<file>`; the row keeps the file name. The file is saved first and removed again if the row can't be updated. `GET /safaris/:id/cover-image` serves it to anyone who may see the safari, with `Cache-Control: public` (the one public file route; the console reads it through its own admin route).
- **Status** (host): Active, Seat full, Inactive; **Delete** by the host is final. Seat full stops new joins (`SHARED_SAFARI_NOT_OPEN`).
- **Discussion:** the host, current members and members who left can post while the safari is visible and Active or Seat full (others get `SHARED_SAFARI_JOIN_TO_COMMENT`). One level of replies. The writer can edit or delete their own comment unless they have left (`SHARED_SAFARI_LEFT`); deleting a comment deletes its replies. Comments under 200 words, plans under 1,000 (words = the text split at spaces). The host is notified (kind 802) of every comment or reply but their own.
- **Flags:** any signed-in user but the writer, with an active reason and details (up to 500), any number of times; the flag keeps the reason's name.
- **Console** (`/api/shared-safari/admin/…`, Super Admin): list (pinned first, then newest; search, status, host), detail (everything, plan in full, joined and left lists, comments with flag counts), Delete with one of the fixed 8 reasons and details (status 4), Make active (back to 1, delete columns cleared), Pin / Unpin (kept when a safari is deleted), delete a comment with its replies or a single reply (their open flags closed), Flagged Comments (comments with open flags by active users), View flags, Ignore. A host-deleted safari is read-only (`SHARED_SAFARI_DELETED_BY_HOST`).
- Every write and every refused write is in the audit log (module 8; actions 801–830; entities 9 safari, 10 comment), in the same transaction as the write.

## Access

| Route | Access |
|---|---|
| list, view (`/safaris/:ref`, slug or id), cover image | public, with the viewer recognised when signed in (`auth.access.viewer`) |
| organise, edit, image upload, status, delete, join, leave, My Shared Safaris (`/mine`), comment, edit / delete own comment, flag | signed in |
| `/admin/…` | Super Admin |

## Screens

Website: `/` (list), `/shared-safaris/<slug>` (view), `/my-shared-safaris`; console: `/shared-safaris`, `/shared-safaris/<id>`, `/flagged-comments`. Rows in [PROTOTYPE-SYNC](../../../PROTOTYPE-SYNC.md).

## History

- Planning file: [2026-11-04-shared-safari](../../../planning/features/2026-11-04-shared-safari.md)
