# Park

**What it is.** The parks shared safaris are organised in: master data (`master_park`, 55 Walk Into The Wild parks from the migration `2026-11-04-shared-safari.sql`) that the Super Admin keeps in the console.

**Who uses it.** The Super Admin (Console › Shared Safari › Parks, `/parks` and `/parks/<id>`); the website reads the active parks for its Safari Park filter and the Organise form.

## Rules

- A park has a name (unique, ignoring case), a slug made from the name when it is added (never changes), a region (North, Central, West, East, South, North East India), an average safari price min–max (whole rupees up to ₹10,00,000, both or neither, max not below min), and a status (Active 1, Inactive 2). The description, picture, location and website come from the starting data only.
- A new park is Active. Parks are never deleted. Making a park inactive hides it from the Organise form and the Safari Park filter; safaris already planned there stay as they are (a host editing one must pick an active park).
- **Upcoming safaris** of a park: its Active and Seat full safaris starting today or later (Indian time).
- `GET /api/park/active` (public) lists active parks A–Z; the other `/api/park` routes are Super Admin only. The shared-safari module asks `parkService.findById` whether a park is active.
- Every add, edit and status change is in the audit log (module 9, actions 901–906, entity 12).

## History

- Planning file: [2026-11-04-shared-safari](../../../planning/features/2026-11-04-shared-safari.md)
