# Profile

**What it is.** Each user's own profile details (`user_profile`): date of birth, gender, bio, about, social links, profile photo and cover photo; the public **User Profile** (U3), **Edit Profile** (U4) and the public **Partner Profile** (U2). The API module `apps/api/src/modules/profile/`, mounted at `/api/profile`. The process is in [WITW-Profiles-Wishlist-Chat-Workflow](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md) §2 and §3.

**Who uses it.** Every signed-in account edits its own profile (a partner too: My Profile in its website menu). Anyone, signed in or not, opens a user's or an active partner's public page.

**Workflows:** [WITW Profiles, Wishlist and Chat](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md).

## The profile row

- One row per user, made the first time something is saved: at **Sign Up** (date of birth and gender, in the same transaction as the account: see [auth](../auth/README.md)) or from Edit Profile. Accounts made before this feature have none until they save.
- The **name** stays on `user` and is changed through `usersService.rename` (users module), in the same transaction as the rest of General Information.
- `gender` (`Gender` in `core/validation`, shared with Sign Up): 1 Male, 2 Female, 3 Other.
- `photo` / `cover_photo` are stored file names, at `user_profile/<user id>/photo/…` and `…/cover_photo/…`; empty = the placeholder image. A new upload gets a new file name, so the name doubles as the picture's version (`photoVersion`, `coverPhotoVersion`) for browser caching.

## Edit Profile rules

Each tab is saved on its own.

| Field | Rule (message) |
|---|---|
| Name | required, up to 100 ("Enter your name." / "Use up to 100 characters.") |
| Date of birth | `YYYY-MM-DD`, not in the future, 18 or older on today's date in India ("Enter your date of birth." / "The date of birth can't be in the future." / "You must be 18 or older."). Empty is allowed only while the account has none stored (accounts from before this feature are not asked); once stored it can't be cleared |
| Gender | 1, 2 or 3 ("Select your gender."); empty allowed on the same terms as the date of birth |
| Bio, About | free text, no length limit (MEDIUMTEXT); empty = none |
| Facebook, X, Instagram, YouTube | any text up to 1,000 characters ("Use up to 1,000 characters."), no other check (workflow R242); saved as typed, spaces at either end removed; empty is saved as none. The User Profile shows it as a link only when it starts with `http://` or `https://`, otherwise as plain text |
| Profile photo | JPG, JPEG or PNG (checked from the file's bytes), up to 250 KB ("Choose a JPG, JPEG or PNG file." / "Choose a file up to 250 KB.") |
| Cover photo | the same, up to 500 KB ("…500 KB.") |

Saving answers "Your profile is saved.", "Your profile photo is saved." or "Your cover photo is saved." (removing a picture answers the same as saving it), with the whole profile.

## Public pages

- **User Profile** (`/users/[id]` on the website): an active user who is not a partner. The header (name, picture, cover) is public; the **Profile** tab content (bio, about, links) only for a signed-in viewer (`profile` is `null` for a guest); **Shared Safaris** only for a signed-in viewer: the safaris the user organised or joined that are **active on the website now** (Active or Seat full, not ended, host active), soonest start first, 12 at a time. Email, mobile, date of birth and gender are never shown. `isOwn` shows Edit Profile; `canMessage` (signed in, not own, viewer not a partner) shows Message. A deactivated or unknown user gives 404 `USER_PROFILE_NOT_FOUND` (the website goes home). The account of an **active partner** answers `{ kind: 'partner', partnerId }` (the website opens the Partner Profile); an inactive partner's account gives 404.
- **Partner Profile** (`/partners/[id]`): an **active** partner only (else 404 `PARTNER_PROFILE_NOT_FOUND`): logo (the partner module's `/api/partner/partners/:id/logo`), business name, about, the counts of shown packages and active parks; the **Packages** tab is the partner's packages shown on the website, newest live first, as website package cards; the **Parks** tab its active parks (partner park active and park active) as website park cards, by name; both 12 at a time. No phone or email.
- **Pictures** of an active user are served publicly (`Cache-Control: public, max-age=86400`); pass `?v=<photoVersion>` so a new picture is fetched at once. None, or an inactive user: 404 `PROFILE_IMAGE_NOT_FOUND`.

## Routes

| Route | Access |
|---|---|
| `GET /api/profile/me` → `{ userId, name, dateOfBirth, gender, bio, about, facebookUrl, xUrl, instagramUrl, youtubeUrl, photoVersion, coverPhotoVersion }` | signed-in |
| `PUT /api/profile/me` `{ name, dateOfBirth, gender, bio, about, facebookUrl, xUrl, instagramUrl, youtubeUrl }` → the same | signed-in |
| `PUT /api/profile/me/photo` (multipart, field `photo`) · `DELETE /api/profile/me/photo` · `PUT /api/profile/me/cover-photo` (field `coverPhoto`) · `DELETE /api/profile/me/cover-photo` → the same | signed-in |
| `GET /api/profile/users/:id` → `{ kind: 'user', user: { id, name, photoVersion, coverPhotoVersion }, profile: { bio, about, facebookUrl, xUrl, instagramUrl, youtubeUrl } \| null, isOwn, canMessage }` or `{ kind: 'partner', partnerId }` | public (the `viewer` guard: signed-in viewers are recognised) |
| `GET /api/profile/users/:id/safaris?page=` → `{ items (shared safari cards), total, page, pageSize: 12, hasMore }` | signed-in |
| `GET /api/profile/users/:id/photo?v=` · `GET /api/profile/users/:id/cover-photo?v=` → the image | public |
| `GET /api/profile/partners/:id` → `{ id, businessName, about, logoVersion, packageCount, parkCount }` | public |
| `GET /api/profile/partners/:id/packages?page=` → `{ items, total, page, pageSize: 12, hasMore }` (website package cards) · `GET /api/profile/partners/:id/parks?page=` → the same with website park cards | public |

## Audit

Module 15, entity 19 `USER_PROFILE`: 1501 profile saved (from Edit Profile, or the date of birth and gender at Sign Up; the changed fields) · 1503 / 1505 photo saved / removed · 1507 / 1509 cover photo saved / removed · 1511 `ct_` test data removed; each failure is the next number (a refused file type is recorded as the failure of its save). A name change is also recorded by the users module (103).

## Where it lives

`apps/api/src/modules/profile/` (`services/profile.service.ts`, `services/partner-profile.service.ts`, `services/profile-files.ts`, SQL `sql/user-profile.sql.ts`); table in [2026-11-24-profiles-wishlist-chat.sql](../../../../apps/api/src/database/migrations/2026-11-24-profiles-wishlist-chat.sql). It reads through `usersService`, `partnerService.activePartnerById`, `sharedSafariService.activeOfUser`, `packageService.listShownOfPartner` and `parkService.websiteCardsOf`.
