# Park

**What it is.** The parks shared safaris are organised in and packages are sold for: master data (`master_park`, 55 Walk Into The Wild parks from the migration `2026-11-04-shared-safari.sql`) that the Super Admin keeps in the console, and the website's park list and park pages.

**Who uses it.** The Super Admin (Console › Shared Safari › Parks, `/parks` and `/parks/<id>`); the website (the Safari Park filter and the Organise form read the active parks; Plan Safari lists the parks and opens each park's page); other modules through `parkService`.

## Rules

- A park has a name (unique, ignoring case), a slug made from the name when it is added (never changes), a region (North, Central, West, East, South, North East India), a description (up to 1,000 characters, optional), a location (latitude −90…90 and longitude −180…180, both or neither), a feature image, and a status (Active 1, Inactive 2). The official website comes from the starting data only.
- Messages (board C5 / C6): "Use up to 1,000 characters." · "Enter a latitude from -90 to 90." · "Enter a longitude from -180 to 180." · "Enter both latitude and longitude, or leave both empty." (under the empty one) · "Use a JPG, JPEG or PNG image." · "Use an image up to 250 KB.".
- **Add / Edit** (`POST /api/park`, `PUT /api/park/:id`) take `name`, `region`, `shortDescription`, `latitude`, `longitude` (and `status` on edit). Every key is sent; `null` (or an empty text) leaves it empty. Coordinates may be numbers or decimal texts.
- **Feature image** (`PUT /api/park/:id/feature-image`, multipart field `image`): JPG, JPEG or PNG (checked from the bytes) up to 250 KB, stored at `park/<id>/feature_image/<file>` (file name only in `feature_image`). The form saves the park first, then sends the image. Each upload gets a new file name; the old file stays. There is no remove (the board has none).
- **Average safari price** is calculated, never entered: the lowest and highest **price per person** of the park's packages **shown on the website** (any of a live version's parks), with how many (`avgSafariPriceMin`, `avgSafariPriceMax`, `packageCount`; both null with none: "Price not set" / "Not calculated yet"). It comes from `packageService.priceRangesOfParks` (the package module's one shown rule), so it changes by itself when a package is approved, made active or inactive, or deleted, or its partner is deactivated or activated. The park module reads it at every answer; nothing is stored. `master_park` has no price columns (the entered min / max were dropped by `2026-11-14-drop-park-average-price.sql`).
- A new park is Active. Parks are never deleted. Making a park inactive hides it from the Organise form, the Safari Park filter and the website's park list and page; safaris already planned there stay as they are (a host editing one must pick an active park).
- **Upcoming safaris** of a park: its Active and Seat full safaris starting today or later (Indian time).
- Every add, edit (fields, location, description, feature image) and status change is in the audit log (module 9, actions 901–906, entity 12; 907 / 908 when `test-data/remove-ct` removes a `ct_` test park); an edit or image change is 903 with what changed.

## How the price is wired

The park module is built before the partner and package modules (the partner module needs `parkService`), so it can't take `packageService` in `createParkModule`. It defines its own contract `IParkPriceSource` (`priceRangesOfParks(ids)`), and `routes/index.ts` connects the package service once it is built: `park.connectPriceSource(packages.packageService)`. A park answer before that (which can't happen in the server) fails loudly. `parkService.listActive` and `findById` don't use prices, so the CLI builds the park module without connecting it.

## Website

- **Park list** (`GET /api/park/parks?search=&region=&sort=az|za&page=`): active parks, search by name, region, A–Z (default) or Z–A, 12 per page (`meta.total` for "Showing N of M"). Each card: `id`, `name`, `slug`, `region`, `featureImage`, the average price and `packageCount`.
- **Park page** (`GET /api/park/parks/:slug`): an active park's card fields plus `shortDescription`, `latitude`, `longitude`, `officialWebsite`. An inactive or unknown park: 404 `PARK_NOT_FOUND`.
- **Feature image** (`GET /api/park/parks/:slug/feature-image?v=<file name>`): an active park's image, `Cache-Control: public` (also the package cards' fallback picture through the main park's slug); 404 `PARK_IMAGE_NOT_FOUND` without one.
- The page's tabs read other modules' lists: **Packages** `GET /api/package/packages?masterParkId=<id>` (the list's filters except park and search), **Shared Safaris** `GET /api/shared-safari/safaris?parkId=<id>`.

## Routes

| Route | Access |
|---|---|
| `GET /api/park/active` (id and name, A–Z) | public |
| `GET /api/park/parks`, `/parks/:slug`, `/parks/:slug/feature-image` | public (active parks only; plan §2.4) |
| `GET /api/park`, `GET /api/park/:id`, `POST /api/park`, `PUT /api/park/:id`, `PATCH /api/park/:id/status`, `GET` / `PUT /api/park/:id/feature-image` | Super Admin |

The shared-safari module asks `parkService.findById` whether a park is active; the partner module checks parks the same way.

## History

- Planning files: [2026-11-04-shared-safari](../../../planning/features/2026-11-04-shared-safari.md), [2026-11-12-safari-packages](../../../planning/features/2026-11-12-safari-packages.md) (park form B5, calculated price Q2, website pages)
