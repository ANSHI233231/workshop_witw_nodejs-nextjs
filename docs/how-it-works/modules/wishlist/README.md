# Wishlist

**What it is.** The packages and shared safaris a website user saves to come back to later (`wishlist_item`). The API module `apps/api/src/modules/wishlist/`, mounted at `/api/wishlist`. The process is in [WITW-Profiles-Wishlist-Chat-Workflow](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md) §1.

**Who uses it.** A **signed-in website user who is not a partner**: the ♥ on package cards, the package page and the shared safari page, and the **Wishlist** page (U1). A partner (an Active or Inactive partner row) has no wishlist: every route answers 403 `WISHLIST_PARTNER` ("Partners don't have a wishlist."); their old rows are kept. A guest gets 401 (the website sends them to Login and back; nothing is added until they tap again).

**Workflows:** [WITW Profiles, Wishlist and Chat](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md).

## Items and statuses

- One row per user and item: a package (`item_type` 1, `package_id`) or a shared safari (`item_type` 2, `shared_safari_id`); the two unique keys stop a second row. Saving again after a remove reuses the row.
- `status` (`WishlistItemStatus`): 1 saved, 2 dropped for good (a package that came back at another price), -1 removed by the user.
- `saved_at` is the last save: the lists are newest saved first.

## Rules

- **What can be saved:** a package **shown on the website** (`packageService.shownPackage`; else 404 `WISHLIST_PACKAGE_NOT_AVAILABLE` "This package is not on the website now."); a shared safari that is **Active or Seat full and has not started** (start date today or later, India time) with an active host (`sharedSafariService.wishlistState`; else 404 `WISHLIST_SAFARI_NOT_AVAILABLE` "This shared safari can't be saved now."). A host can save their own safari. No limit on the number of items.
- **Removing** works whatever the item's state now (workflow #1); an item not in the caller's list gives 404 `WISHLIST_ITEM_NOT_FOUND` ("This item is not in your wishlist."). Items are addressed by the package or safari id inside the caller's own list, so another user's item can't be reached.
- **Messages:** "You added the Package to your wishlist!" / "You removed the Package from your wishlist!", and the same for "the Shared Safari". Saving an item already saved answers the same success without a write.
- **A package that leaves the website** (inactive, deleted, its partner inactive) **drops out**: the row gets `is_hidden` 1 and is not listed. When it is **shown again**, the live version's **price per person** is compared with `saved_price_per_person` (the price when it was saved): the same price clears `is_hidden` (it comes back); another price sets status 2 (gone for good; the user can save it again). This is checked whenever the user's wishlist is read (`/ids`, `/packages`), so a package hidden and shown again between two reads is not noticed as having dropped out.
- **A saved shared safari stays whatever its status**, deleted by its host or by the Super Admin included. **Temporary, to confirm (workflow R206):** this follows the user's temporary instruction of 2026-11-25 (plan 2026-11-24 §4), not a confirmed decision.

## Routes

| Route | Access |
|---|---|
| `GET /api/wishlist/ids` → `{ packageIds, sharedSafariIds }`: what is saved now (for the hearts) | signed-in (not a partner) |
| `GET /api/wishlist/packages?page=` → `{ items, total, page, pageSize: 6, hasMore }`; each item is the website package card (as `/api/package/packages`) plus `savedAt` | signed-in (not a partner) |
| `GET /api/wishlist/shared-safaris?page=` → the same page shape; each item is the shared safari card (as `/api/shared-safari/safaris`) plus `savedAt` | signed-in (not a partner) |
| `PUT /api/wishlist/packages/:id` · `DELETE /api/wishlist/packages/:id` → `{ itemType: 1, itemId, isSaved }` with the message above | signed-in (not a partner) |
| `PUT /api/wishlist/shared-safaris/:id` · `DELETE /api/wishlist/shared-safaris/:id` → `{ itemType: 2, itemId, isSaved }` | signed-in (not a partner) |

## Audit

Module 14, entity 18 `WISHLIST_ITEM`: 1401 item added · 1403 item removed · 1405 items synced (the drop-outs, returns and drops found while reading, with the ids) · 1407 `ct_` test data removed (`test-data/remove-ct`); each failure is the next number.

## Where it lives

`apps/api/src/modules/wishlist/` (service `services/wishlist.service.ts`, SQL `sql/wishlist-item.sql.ts`); table in [2026-11-24-profiles-wishlist-chat.sql](../../../../apps/api/src/database/migrations/2026-11-24-profiles-wishlist-chat.sql).
