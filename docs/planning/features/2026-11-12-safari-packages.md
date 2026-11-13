# Safari Packages

| Field | Value |
|---|---|
| Status | proposed |
| Started | 2026-11-12 |
| Shipped | |
| Apps | api / manage / web / partner (new) |
| Test cases | TC-PTR-01..12, TC-PKG-01..22, TC-GAL-01..08, TC-QR-01..07, TC-PARK-07..12, TC-PKSS-01..03 |
| How it works | [workflows/WITW-Packages-Workflow.md](../../how-it-works/workflows/WITW-Packages-Workflow.md) (the process); to write: `modules/partner/`, `modules/package/`, `modules/gallery/`, `modules/quote-request/`, `platform/partner-portal.md`; to update: `modules/park/`, `modules/shared-safari/`, `modules/auth/`, `platform/file-storage.md`, `platform/manage-console.md`, `platform/frontend-apps.md`, `environments/README.md` |

## 1. Requirement (as given)

> "i will update @docs/how-it-works/workflows/WITW-Packages-Workflow.md @docs/prototype/prototype/Starter-Prototype.html please first delete my packages md previous planning file then sync my @docs/PROTOTYPE-SYNC.md and create my new planning file"

The feature is defined by two sources, read together on 2026-11-12:

| Source | Version |
|---|---|
| Workflow | [WITW-Packages-Workflow.md](../../how-it-works/workflows/WITW-Packages-Workflow.md) as committed in ca06e4a ("in sync with the requirements" `WITW-Packages-Requirements.docx`): §1–§15, open points #1–#17 in §16, each *(proposed)* until signed off |
| Prototype | `docs/prototype` at **320b24c** plus the checkout's uncommitted canvas **version 21** (to be committed and pushed: PROTOTYPE-SYNC D1): website P1–P6, Partner portal PP1–PP10, console PC1–PC9, each desktop and mobile, all in `prototype/Starter-Prototype.html`; plus the frame changes on every built board (PROTOTYPE-SYNC B2–B5) |
| Schema | none yet: `2026-11-12-safari-packages.sql`, written in this feature (§2.6) |

In short: safari operators (**partners**) apply on the website. The Super Admin approves them, and they build packages and photo galleries in a new **Partner portal**. Every package version and every gallery is approved by the Super Admin before it is used. On the website, users browse packages and parks and send a **quote request** to the package's partner. Nothing is paid in the app.

## 2. Plan

### 2.1 Before any code (gates)

1. **Prototype committed and pushed (PROTOTYPE-SYNC D1).** The version 21 changes are committed in the prototype repository, pushed with 320b24c, and that commit is the pin.
2. ~~**Boards ready.**~~ Done 2026-11-12: every board ready at 320b24c, the 25 Packages boards and B2–B5 included (§4).
3. ~~**Questions settled.**~~ Done 2026-11-13: every §2.9 question is answered (§4). The workflow `.md` updates (#1, #17, §10, Shared Safari #62) are the user's, before the feature ships.
4. **Migration written and applied.** `2026-11-12-safari-packages.sql` (§2.6) is written and applied to the local database by the agent at step 2 of §2.7, and checked.

### 2.2 API modules

| Module | Owns (writes) | Mount | Audit module |
|---|---|---|---|
| `partner` (new) | `partner`, `partner_park` | `/api/partner` | 10 (actions 1001…) |
| `gallery` (new) | `gallery`, `gallery_photo` | `/api/gallery` | 11 (actions 1101…) |
| `package` (new) | `package`, `package_version` and its children (§2.6), `master_package_delete_reason` | `/api/package` | 12 (actions 1201…) |
| `quote-request` (new) | `quote_request` | `/api/quote-request` | 13 (actions 1301…) |
| `users` + `auth` | the Partner role on the account; Become a Partner as a guest = Sign Up + request in one operation | existing | 1 / 2 |
| `park` | the park form changes (B5): description, location, feature image; the average price, calculated from shown packages (Q2) | `/api/park` | 9 |
| `shared-safari` | none new; reads "is this user a partner" (§2.3, Shared Safari impact) | existing | 8 |
| `notification` | sends the four new kinds (§2.3) | existing | 6 |

- **Dependencies, all through `createXModule(deps)`:**
  - `partner` gets `usersService` (to add the Partner role), `parkService`, `fileStorage` (the logo) and `auditService`.
  - `gallery` gets `partnerService` ("active partner, and their own active parks"), `fileStorage`, `notificationService` and `auditService`.
  - `package` gets `partnerService`, `galleryService` (an approved gallery's copy), `parkService`, `fileStorage`, `notificationService` and `auditService`.
  - `quote-request` gets `packageService` ("is this package shown, which is its live version"), `partnerService`, `notificationService` and `auditService`.
- **Code lists** as `as const` objects in each module's `types/`:
  - `partner`: `PartnerStatus` (1 pending, 2 rejected, 3 active, 4 inactive).
  - `gallery`: `GalleryStatus` (1 draft, 2 waiting, 3 approved, 4 deleted by admin; −1 discarded).
  - `package`: `PackageWebsiteStatus` (1 not live yet, 2 active, 3 inactive, 4 deleted by admin), `PackageVersionStatus` (1 draft, 2 waiting, 3 rejected, 4 approved, 5 replaced; −1 discarded), `SafariType`, `Vehicle`, `PackageTheme`, `Stay`, `PackageFeature`, `Inclusion`, `Meal` (workflow §13; small fixed sets live in code, AGENTS.md 11).
  - `quote-request`: `QuoteRequestStatus` (1 active, 2 inactive) and `QuoteMark` (1 hot, 2 cold; null = no mark).
- **Role:** a new `meta_role` row **Partner** (id 101) from the migration; `MetaRole.PARTNER` beside `SUPER_ADMIN`.
- **Audit (#11):** every write records an event and its failure code. Partner: request sent, approved, rejected, edited, deactivated, activated, phone numbers shown / hidden. Gallery: created, saved, sent, moved back, approved, rejected, draft deleted, deleted by admin. Package: created, section saved, version sent, draft deleted, approved, rejected, waiting or live version edited by admin, made active / inactive, deleted by admin, Popular on / off, Best deal on / off. Delete reason: added, edited, made active / inactive. Quote request: sent, marked, made active / inactive, notification sent to the partner. Park: the new fields in the existing park update event.
- **Dates:** "today" (quote start date) and every displayed date come from one IST helper, as in Shared Safari.

### 2.3 Rules the services enforce (workflow and boards)

Messages are the boards' wording (workflow #2: "the prototype decides").

- **Partner request (P4, PP2, PC1, PC2):**
  - One request per account. Business name and owner name required, up to 255. Business phone 10 digits starting 6–9 ("Enter a 10-digit number starting with 6, 7, 8 or 9."). Business email valid. At least one **active** park ("Choose at least one park."). About optional. Logo JPG, JPEG, PNG or WEBP up to 1 MB ("Choose a JPG, JPEG, PNG or WEBP file." · "Choose a file up to 1 MB."), checked from the bytes.
  - A guest also gives Sign Up's account details (name up to 100, unique email, unique mobile, password 8–72). Account, sign-in and request happen in one operation: "Your account is created and your partner request is sent."
  - Rejected → the user edits and sends again ("Send again"; back to Pending, reason cleared). Reject reason required, up to 512. No notification on a new request.
  - Approve (no confirm dialog, PC1) → Active, the **Partner** role is added, the parks are the request's: "{business} is now a partner."
  - PC2 Edit changes business details, logo **and parks** in one dialog. Deactivate / Activate asks for confirmation; deactivating hides every package and the portal shows only the deactivated message. Show phone numbers is a switch on the list. A partner is never deleted.
- **Portal access (PP1, PP2):** sign in with **email and password** (the board has no mobile sign-in; Forgot password as on the website). No Sign Up; a link to Become a Partner. Each page shows a guard for the state: not signed in, no request ("Send a partner request first"), Pending ("…waiting for approval"), Rejected ("…was not approved", with the reason and Send again on PP2), Inactive (only the deactivated message), Active (the portal). Every portal API call checks "active partner, and the item is their own".
- **Package (PP5):**
  - Basic is saved first ("Save the Basic section first."): it creates the package with **v1 Draft**, "Basic saved. Version 1 is a draft; the other sections are open now." Sections 2–5 are saved one at a time.
  - Slug from the name at creation, shown as `/packages/<slug>`, never changes.
  - Basic: name up to 215; own active parks (the first is the main park); days 1–15 (nights = days − 1, shown "N Nights, M Days"); safaris 1–99; safari type, vehicle, theme, stay required; features optional; start / end place letters, spaces and hyphens, up to 215; price per person and total required, whole rupees 1,000–99,99,999; total ≥ price per person; price before discount optional, > price per person (#6); activity message, price message and tag up to 255 (tag colours default `#C0392B` / white); package and banner image JPG, JPEG or PNG up to 250 KB; one approved gallery; overview up to 2,000.
  - Itinerary: one block per day; title and description required (255 / 2,000); start, end, hotel up to 255; activity, accommodation, note up to 500; meals; day image JPG, JPEG or PNG of any size; one approved gallery.
  - Lowering days asks "Remove days X–Y?" and removes them on confirm (#5).
  - Inclusions: each Included / Not included; Meals → Included ticks every day's meals ("Breakfast, lunch and dinner are ticked on every day."); more inclusions and exclusions up to 512.
  - Getting there up to 2,000. FAQs: question (up to 512) and answer required, added, edited and deleted in the section.
- **Versions (PP4, PP5, PC3, PC5):**
  - At most one live and one working version. **Edit** on a live package makes the next version as a Draft copy ("A new draft is made from the live version."); the live one stays until approved.
  - Send (Draft or Rejected; with a confirm dialog) → Waiting, read-only for the partner; every Super Admin is notified. Editing a Rejected version turns it back into a Draft.
  - Delete: "This draft will be discarded." The live version stays, or a package never live leaves the list.
  - Approve (PC3 list or PC5, no confirm) → live at once: the old live version becomes Replaced, the website status becomes Active, Popular is cleared. Reject: reason up to 512, shown on the package. The partner is not notified of either.
  - Versions list on PP5 with dates (made, sent, approved / rejected / deleted, "edited by Super Admin"); a Replaced version opens read-only (#14).
- **Website status (PP4, PC4):** the partner makes a live package inactive / active at once. The Super Admin deletes with an active reason ("Choose a reason.") and details ("Enter the details."); final, Popular cleared. Popular and Best deal are switches on PC4. PC4 lists live and deleted packages, filtered by name, website status and partner.
- **Super Admin edit (PC5):** the waiting version (from PC3) or the live package (from PC4) in the same editor as PP5, **all five sections** (Q3); a live edit shows on the website at once ("Saved. The website shows the change now."); the version is marked "edited by Super Admin".
- **Shown on the website** only when the package has a live version, is Active, and its partner is Active. Never approved → the link goes to the home page; otherwise not shown → "Package Not In Use!".
- **Gallery (PP6, PP7, PC7, PC8):**
  - Title up to 255 ("Enter the gallery title.") and one of the partner's own active parks ("Choose the park.") required. Photos JPG, JPEG or PNG up to 8 MB each; title and caption; replace, remove, reorder; thumbnail = first by default, can be changed, can't be removed.
  - Save → "Gallery saved as a draft." Send needs a photo ("Add at least one photo first.") and notifies the Super Admins. Waiting can be moved back to draft.
  - Edit on an approved gallery makes a separate draft; the approved photos stay in use (Approved tab "Approved (live)", In Draft tab "Draft of approved gallery", Waiting tab "Changes to approved gallery"). Delete on that draft restores the approved photos and title exactly; a gallery never approved is discarded.
  - PC7 approves or rejects (reason up to 512 → back to draft with the reason). PC8 lists approved galleries and deletes with a reason up to 512.
  - A package and each day keep a **copy** of the gallery when saved (§7.2).
- **Website lists (P1, P5, P6):**
  - Package list: search, park (every active park), price per person ₹0–₹50,000+, nights 0–10+, safaris 1–10+, stay, features, inclusions (any match); chips; sorts Popular (popular, then newest), Newest, Fewest safaris, Most safaris, Price low to high; 12 per page, more on scroll; "No packages match your filters." / "No packages here yet."
  - Card: image (or main park's), tag, Best deal, name, main park, nights / days, activity line, price per person, struck-out price, price message (default "Include taxes and fees"), "Total Price ₹…".
  - Parks list (Plan Safari): active parks, search, region, A–Z / Z–A, 12 per page; card image, name, region, average safari price ("Price not set" without one).
  - Park page: Overview (description, map, location, official website, average price), Packages (the list's filters except park and search), Shared Safaris (the Shared Safari list's set for the park, with Join / Leave as on W1).
- **Package page and quote (P2, P3, PP8, PC9):**
  - Top details, price box, the quote form on the page (`#pk-quote`), five tabs, gallery slider (3 s, loops), disclaimer.
  - Quote: travellers 1–100, start date today or later (IST; "Choose today or a later date."), notes required up to 1,000. Saved with the live version; the partner is notified; "Your quote request is sent to {business}."
  - A guest sees a sign-in prompt; a partner sees the partner note with the Partner portal link.
  - My Quote Requests (P3): the user's active requests (package, partner, travellers, start date, notes, sent on).
  - PP8: the partner's active requests (user, phone only with Show phone numbers, package and version, travellers, start date, notes, received, Hot / Cold). The email is never shown.
  - PC9: every request, filter by status; View (with email and mobile); Make inactive / active (hidden from the partner and the user); Send a notification (required, up to 500) → the partner's bell: "From the Super Admin about {user}'s request: …".
- **Notifications (§11), in-app only:** package version sent → Super Admins; gallery sent → Super Admins; new quote request → the partner; Super Admin message → the partner. The portal reaches Notifications (PP10) from the sidebar and from the bell's "Show all notifications".
- **Park (B5, C5 / C6):** description up to 1,000; latitude −90…90 and longitude −180…180, both or neither ("Enter both latitude and longitude, or leave both empty."); feature image JPG, JPEG or PNG up to 250 KB ("Use a JPG, JPEG or PNG image." · "Use an image up to 250 KB."); the average safari price shown, not entered: the lowest and highest price per person of the park's packages shown on the website, "Price not set" with none (Q2). It changes whenever a package of the park is approved, made active or inactive, or deleted, or its partner is deactivated or activated, so it is read from the packages, not stored.
- **Shared Safari impact (workflow §2.5, B3):**
  - A partner (Active or Inactive) shows as the business name and logo initials in the website header and account menu, which gets **Partner portal** in place of My Quote Requests.
  - The workflow also says a partner can't organise or join a new shared safari, and shows as the business in comments. The boards don't draw these (W1–W9 are unchanged); they are built from the workflow (TC-PKSS).

### 2.4 Routes and access

| Route (group) | Access | Board |
|---|---|---|
| `GET /api/package/packages` (filters, sort, cursor), `GET /api/package/packages/:slug` | **publicAccess** | P1, P2, P6 |
| package, day and gallery-copy images, partner logos (only for shown packages) | **publicAccess** | P1, P2, P6 |
| `GET /api/park/parks` (website list), `GET /api/park/parks/:slug`, park feature image | **publicAccess** | P5, P6 |
| `POST /api/partner/requests/with-account` (guest: account + request) | **publicAccess** | P4 |
| own request (send, edit, send again), quote request send, My Quote Requests | signedIn | P2, P3, P4, PP2 |
| portal: dashboard, packages, versions, galleries, quote requests, business profile, notifications | signedIn + active partner (service) | PP3–PP10 |
| console: partner requests, partners, package approvals, packages, package preview / edit, delete reasons, gallery approvals, galleries, quote requests | roles([Super Admin]) | PC1–PC9 |

The **publicAccess** routes are deliberate new choices, named here as AGENTS.md requires.

### 2.5 Screens

**web** (WITW site frame with B3 and B4):

| Board | Route |
|---|---|
| P1 | `/packages` |
| P2 | `/packages/<slug>` (quote form on the page; "Package Not In Use!"; never live → `/`) |
| P3 | `/my-quote-requests` |
| P4 | `/become-a-partner` (guest: account + business; signed in: business; request status card) |
| P5 | `/parks` (Plan Safari) |
| P6 | `/parks/<slug>` (Overview · Packages · Shared Safaris) |

**partner** (new app `apps/partner`, the console frame of the boards; sidebar Dashboard, Packages, Gallery, Quote Requests, Notifications, Business Profile; Partner request when not an active partner):

| Board | Route |
|---|---|
| PP1 | `/login`, `/forgot-password` |
| PP2 | `/partner-request` |
| PP3 | `/` |
| PP4, PP5 | `/packages`, `/packages/new`, `/packages/<id>` |
| PP6, PP7 | `/gallery`, `/gallery/new`, `/gallery/<id>` |
| PP8 | `/quote-requests` |
| PP9 | `/business-profile` |
| PP10 | `/notifications` |

**manage** (sidebar groups Partners and Packages, B2; park form B5):

| Board | Route |
|---|---|
| PC1, PC2, PC9 | `/partner-requests`, `/partners`, `/quote-requests` |
| PC3, PC4 | `/package-approvals`, `/packages` |
| PC5 | `/packages/<id>?version=waiting|live&tab=preview|edit` |
| PC6 | `/package-delete-reasons` |
| PC7, PC8 | `/gallery-approvals`, `/galleries` |
| C5, C6 | `/parks`, `/parks/<id>` (existing; B5) |

Each screen is copied whole from its board and its PROTOTYPE-SYNC row updated in the same change. Prototype aids are not built: the "View as", "Package", "Gallery" and "Park" pickers, the "Login as" cards on PP1 and Admin-Sign-In, Reset data, and the sample data.

### 2.6 Schema (`2026-11-12-safari-packages.sql`)

All tables carry the audit columns and follow the repo's conventions:

| Table | Holds |
|---|---|
| `partner` | `user_id` (unique), business name, owner name, business phone, business email, about, logo file name, `status`, reject reason, `is_phone_shown`, requested at, decided at / by |
| `partner_park` | `partner_id`, `master_park_id` |
| `master_package_delete_reason` | name (up to 100, unique), `status`; starting rows: Misleading information, Duplicate package, Wrong prices, Partner asked to delete, Other |
| `package` | `partner_id`, `slug` (unique), `website_status`, `is_popular`, `is_best_deal`, `first_live_at`, `master_package_delete_reason_id`, delete details, deleted at / by |
| `package_version` | `package_id`, `version_number`, `status`, the Basic fields, more inclusions, exclusions, getting there, the saved sections, reject reason, sent at, decided at / by, edited by admin at. Unique (`package_id`, `version_number`) |
| `package_version_park` | `package_version_id`, `master_park_id`, `sort_order` (0 = main park) |
| `package_version_feature`, `package_version_inclusion` | chosen codes (inclusion with `is_included`) |
| `package_version_day` | day number, title, description, start / end / hotel, `has_breakfast` / `has_lunch` / `has_dinner`, activity, accommodation, note, image file name |
| `package_version_faq` | question, answer, `sort_order` |
| `package_version_photo` | the gallery copy: `package_version_id`, `package_version_day_id` (null = the package's), source `gallery_id`, gallery title, photo file, title, caption, `sort_order` |
| `gallery` | `partner_id`, `master_park_id`, title, approved title, `status`, `has_approved_set`, reject reason, delete reason, sent at, decided at / by |
| `gallery_photo` | `gallery_id`, `photo_set` (1 approved, 2 draft), file name, title, caption, `sort_order`, `is_thumbnail` |
| `quote_request` | `user_id`, `package_id`, `package_version_id`, travellers, start date, notes, the user's name / email / mobile as sent, `mark`, `status` |

Also: `meta_role` row 101 Partner; notification template rows for the four kinds. `master_park` already has `short_description`, `latitude`, `longitude` and `feature_image`. Its `avg_safari_price_min / max` are no longer entered (Q2): the migration drops them, and the Shared Safari reads and screens that show them read the calculated range. Images go at the #12 paths (`package/<id>/<version>/…`, `partner/<id>/logo/…`, `gallery/<id>/…`, the park's existing folder), file names only in the rows.

### 2.7 Order of work

1. The gates in §2.1.
2. Migration applied; `partner` module; Partner role; P4, PC1, PC2; console sidebar groups (B2).
3. The **partner** app: frame, PP1, PP2, PP9, PP10; ports, pm2 files and `init.js`.
4. `gallery` module: PP6, PP7, PC7, PC8.
5. `package` module: PP5, PP4, PP3, PC3, PC4, PC5, PC6.
6. Park changes (B5, Q2) in C5 / C6; website P1, P2 (without the quote form), P5, P6; the website frame (B3).
7. `quote-request` module: the P2 quote form, P3, PP8, PC9; the four notifications.
8. Shared Safari impact (§2.3); responsive rules under 900 px (B4) across every app.
9. Docs, PROTOTYPE-SYNC rows, every §3 case run, cleanup.

### 2.8 Not in this feature

Payments and bookings; email for any new notification; a Wishlist (#13); image resizing; OTP or email checks on Become a Partner; partner self-editing of the business profile. The technical document is not changed unless the user asks.

### 2.9 Questions

The workflow's §16 proposals #1–#16 were all taken by the user on 2026-11-12 (§4). Where a board at 320b24c differs from a proposal, the board is taken (workflow #2: the prototype decides), and the difference is listed here to be written into the workflow:

| # | Point | Workflow | Board (320b24c) | Plan |
|---|---|---|---|---|
| D-a | Starting delete reasons (#1) | Duplicate package · Wrong or misleading details · Partner request · Violates guidelines · Other | Misleading information · Duplicate package · Wrong prices · Partner asked to delete · Other; name up to 100 | Board (decided 2026-11-13) |
| D-b | Hot / Cold back to no mark (#8) | yes | no: Hot or Cold only | Board |
| D-c | Super Admin notification (#10) | up to 255 | up to 500, prefixed "From the Super Admin about {user}'s request:" | Board |
| D-d | Portal sign-in | same details as the website (email or mobile) | email and password | Board |
| ~~D-e~~ | Notifications menu (§3) | a menu item | a sidebar item from version 21 | Same (no difference) |
| D-f | Quote form | – | on the page, not a dialog | Board |
| D-g | Partner on Shared Safari (§2.5) | can't organise / join; business name in comments | not drawn | Workflow (TC-PKSS) |

Open, for the user:

| # | Question | Why |
|---|---|---|
| ~~Q1~~ | Starting list of Package Delete Reasons | **Decided 2026-11-13:** the board's list (§4) |
| ~~Q2~~ | How the park's average safari price is calculated | **Decided 2026-11-12:** from the park's shown packages (§4) |
| ~~Q3~~ | Which fields the Super Admin edits in PC5 | **Decided 2026-11-12:** all five sections, as the board (§4) |

## 3. Test cases

Every screen case runs at 1366 and 390 px (and the 900 px rules of B4 at 800 px), with no console errors, no failed calls and no sideways scroll. Test data is marked `ct_*` and removed afterwards.

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-PTR-01 | Become a Partner as a guest | web, guest | P4: account + business details; send | account created and signed in; "Your account is created and your partner request is sent."; Pending card; no notification | H | browser |
| TC-PTR-02 | Become a Partner signed in | user, no request | P4: business details; send | "Your partner request is sent."; card "Your partner request is waiting for approval" | H | browser |
| TC-PTR-03 | Business form errors | P4, PP2, PC2 Edit | empty; bad phone; bad email; no park; logo GIF; logo over 1 MB; taken email / mobile (guest); 7-char and 73-char password | the board's message under each field | H | browser |
| TC-PTR-04 | Approve | Pending request | PC1 Approve | "{business} is now a partner."; Partner role, request's parks; portal opens to the Dashboard | H | browser |
| TC-PTR-05 | Reject and send again | Pending request | Reject empty, 513 characters, valid; user edits on PP2 and sends again | "Enter the reason." / "Use up to 512 characters."; Rejected with the reason on P4 and PP2; Send again → Pending | H | browser |
| TC-PTR-06 | Portal guards | accounts: none, Pending, Rejected, Inactive, Active | sign in to the portal and open Packages with each | the guard for each state; Inactive shows only the deactivated message | H | browser |
| TC-PTR-07 | Portal sign-in | portal | wrong password; empty fields; Forgot password; Become a Partner link | the board's messages; reset email sent; no Sign Up | H | browser |
| TC-PTR-08 | Partners: edit, parks | Active partner | PC2 Edit: details, logo, parks; remove every park | saved and shown; "Choose at least one park." | H | browser |
| TC-PTR-09 | Deactivate / activate | Active partner with shown packages | PC2 Deactivate (confirm); check website and portal; Activate | packages hidden, portal only the deactivated message; back on activate | H | browser |
| TC-PTR-10 | Show phone numbers | partner with quote requests | switch on, check PP8; switch off | phone shown only while on; email never | H | browser |
| TC-PTR-11 | Business Profile | Active partner | PP9 | details, logo, parks, partner since; view only | M | browser |
| TC-PTR-12 | Portal API guards | non-partner, partner A | call partner B's package, gallery, quote; call portal routes as non-partner | 403 / 404 each time | H | API |
| TC-PKG-01 | Create package | Active partner | PP5: save Basic | "Basic saved. Version 1 is a draft; the other sections are open now."; `/packages/<slug>`; other tabs open | H | browser |
| TC-PKG-02 | Basic errors | PP5 | every §2.3 Basic rule, including total below price per person and price before discount not above it, images over 250 KB / wrong type | the board's message under each field; "Check the highlighted fields." | H | browser |
| TC-PKG-03 | Other sections closed before Basic | new package | click Itinerary | "Save the Basic section first." | M | browser |
| TC-PKG-04 | Itinerary | v1 | fill days; save with an empty title / description; 501-character note | saved; the three messages | H | browser |
| TC-PKG-05 | Fewer days | itinerary saved, 5 days | set 3; confirm; also cancel | "Remove days 4–5?"; removed on confirm; unchanged on cancel | M | browser |
| TC-PKG-06 | Inclusions and Meals | itinerary saved | Meals → Included; change a day's meals; save | every day ticked, toast says so; the change kept | M | browser |
| TC-PKG-07 | Getting there and FAQs | v1 | save Getting there; add, edit, delete FAQs; empty question / answer | saved; "Enter the question." / "Enter the answer." | M | browser |
| TC-PKG-08 | Send | v1 Draft | PP4 or PP5 Send, confirm | "Version 1 sent for approval."; read-only; the console bell shows it | H | browser |
| TC-PKG-09 | Approve first version | v1 Waiting | PC3 Preview (PC5), Approve | "{name} v1 is live on the website."; Active; on P1 | H | browser |
| TC-PKG-10 | Reject | a Waiting version | Reject empty, then with a reason; partner edits it | "Enter the reason."; reason on PP4 / PP5; editing makes it a Draft | H | browser |
| TC-PKG-11 | Edit a live package | v1 live | PP5 Edit → v2; change the price; send; check P2; approve | P2 shows v1 until approval; then v2 live, v1 Replaced, Popular cleared | H | browser |
| TC-PKG-12 | Delete a draft | v2 draft of a live package; a never-live package | Delete draft; Delete | "This draft will be discarded."; v1 stays live; the never-live one leaves the list | H | browser |
| TC-PKG-13 | Make inactive / active | live package | PP4 switch | at once; P2 "Package Not In Use!" while inactive | H | browser |
| TC-PKG-14 | Versions | package with a Replaced version | PP5 Versions; View the Replaced one | dates and reasons listed; "You are viewing version N (Replaced). It can't be changed." | M | browser |
| TC-PKG-15 | Super Admin edit | a waiting and a live version | PC5 Edit from PC3 and from PC4 | every section editable; live edit "Saved. The website shows the change now."; version shows "edited by Super Admin" | H | browser |
| TC-PKG-16 | Delete with reason | live package | PC4 Delete: no reason, no details, then both | "Choose a reason." / "Enter the details."; Deleted by Super Admin; P2 "Package Not In Use!"; partner sees the reason, View only | H | browser |
| TC-PKG-17 | Popular and Best deal | live packages | PC4 switches; approve a new version | Popular first in the Popular sort; Best deal badge; Popular cleared by the approval | M | browser |
| TC-PKG-18 | Delete reasons | console | PC6 add; duplicate; empty; 101 characters; edit with status; make inactive | the board's messages; inactive one not offered in Delete; "Used" count | M | browser |
| TC-PKG-19 | Package list | shown and hidden packages | P1 as a guest | only live + Active + partner Active; card as §2.3; 12, more on scroll | H | browser |
| TC-PKG-20 | Filters, chips, sorts | P1 | each filter and its 10+ / ₹50,000+ end, chip ✕, Clear all, each sort; Filters on mobile | the list matches; "No packages match your filters." | H | browser |
| TC-PKG-21 | Package page | shown package with galleries | P2: each tab, slider arrows and auto-move, FAQs | §2.3 parts; slider every 3 s, looping, titles and captions; disclaimer | H | browser |
| TC-PKG-22 | Not live / not in use | never approved, inactive, deleted, partner-inactive | open each link | never approved → home page; others "Package Not In Use!" | H | browser |
| TC-GAL-01 | Create gallery | Active partner | PP7: title, park, photos; save | "Gallery saved as a draft."; In Draft; first photo is the thumbnail | H | browser |
| TC-GAL-02 | Gallery errors | PP7 | empty title; no park; GIF; photo over 8 MB; Send with no photos | "Enter the gallery title." / "Choose the park." / "Choose JPG, JPEG or PNG files." / "{file} is bigger than 8 MB." / "Add at least one photo first." | H | browser |
| TC-GAL-03 | Photo actions | draft with photos | reorder, replace, set thumbnail, remove; remove the thumbnail | applied; thumbnail can't be removed | M | browser |
| TC-GAL-04 | Send, move back, approve, reject | draft | Send; Move back to draft; Send; PC7 reject with reason; Send; approve | tabs follow; Super Admins notified; reason shown; Approved | H | browser |
| TC-GAL-05 | Edit an approved gallery | approved gallery used by a live package | Edit; change photos; check P2; Delete draft | approved photos stay in use; "Draft discarded. The approved photos are back." | H | browser |
| TC-GAL-06 | Gallery copy in a package | approved gallery attached to a package and a day | change the gallery and get it approved | the package keeps its copy until saved and approved again | H | browser |
| TC-GAL-07 | Super Admin delete | approved gallery | PC8 Delete empty, 513, valid | the messages; gone from the partner's Gallery | M | browser |
| TC-GAL-08 | Only approved galleries offered | partner with draft and approved galleries | PP5 gallery pickers | approved ones only, any park | M | browser |
| TC-QR-01 | Request a quote | user, shown package | P2 form | "Your quote request is sent to {business}."; partner notified; on P3 | H | browser |
| TC-QR-02 | Quote errors | P2 | travellers empty / 0 / 101; no date; yesterday; empty notes; 1,001 characters | the board's messages | H | browser |
| TC-QR-03 | Who can request | guest; partner | open P2 | guest: sign-in prompt; partner: note with Partner portal link | H | browser |
| TC-QR-04 | Partner's list and marks | quotes for a partner | PP8 Hot, Cold | "Marked Hot." / "Marked Cold."; name always, phone per TC-PTR-10, version shown | H | browser |
| TC-QR-05 | Console quote requests | console | PC9 list, status filter, View, make inactive, make active | inactive hidden from partner (PP8) and user (P3); View shows email and mobile | H | browser |
| TC-QR-06 | Send a notification | console | PC9 empty, 501 characters, valid | "Enter the message." / "Use up to 500 characters."; partner's bell and PP10 | M | browser |
| TC-QR-07 | Quote after the package goes inactive | active quote | partner makes the package inactive | still on PP8 (#7) | M | browser |
| TC-PARK-07 | Park form | console | C5 Add / C6 Edit: description 1,001; lat 91; one coordinate only; image WebP / over 250 KB; valid | the board's messages; saved; image shown on C6 and P5 | H | browser |
| TC-PARK-08 | Average price | parks with and without packages | open C6, P5, P6 | lowest – highest price per person of the park's shown packages; changes when a package is approved, made inactive or deleted; "Price not set" with none | H | browser |
| TC-PARK-09 | Parks list | website | P5 (also via Plan Safari): search, region, Z–A, scroll | active parks only; 12, then more | H | browser |
| TC-PARK-10 | Park page Overview | park with location | P6 Overview | description, map with pin, location, official website | M | browser |
| TC-PARK-11 | Park page Packages | park with packages | P6 Packages: filters, sort | that park's shown packages; no park or search filter | H | browser |
| TC-PARK-12 | Park page Shared Safaris | park with shared safaris | P6 Shared Safaris; Join / Leave | the Shared Safari list's set for the park; Join / Leave as W1 | M | browser |
| TC-PKSS-01 | Partner in the website frame | approved partner | sign in on the website | header and account menu show the business; Partner portal link in place of My Quote Requests; Plan Safari and Safari Packages links work; footer links | H | browser |
| TC-PKSS-02 | Partner and shared safaris | approved partner with an earlier safari | list, view, comment | no new Organise or Join; earlier safaris kept and commentable; comments as the business | H | browser |
| TC-PKSS-03 | Narrow windows | every app | 800 px wide | header menu on its own row, tabs scroll, tables scroll inside their card (B4) | M | browser |

## 4. Decisions

- 2026-11-12: The user's answers for the first plan (`2026-11-12-packages.md`, ca06e4a), kept:
  - Prototype repository `ANSHI233231/workshop_witw_prototype`.
  - The Partner portal is a new app, `apps/partner`.
  - Package pages at `/packages` and `/packages/<slug>`.
  - Price checks: yes, both.
  - Every other §16 proposal as written (password 8–72; gallery Send needs a photo; guests sign in for a quote; inactive parks as #3; image paths as #12; reference lists in code; no Wishlist).
- 2026-11-12: Superseded:
  - ~~Park page: the board's "Open the map" link, no embedded map.~~ The workflow now follows the requirements: a Leaflet map.
  - ~~The Super Admin edits only the board's fields.~~ The board changed at 320b24c (all five sections editable): asked again as Q3.
  - ~~25 PK-* boards ready at 0799439.~~ Those boards were replaced at 320b24c: D2.
- 2026-11-12, the user's answers on this plan:
  - Every board is ready at 320b24c: the 25 Packages boards and the changes to the built boards (B2–B5).
  - The park's average safari price is calculated from the park's packages shown on the website (lowest and highest price per person), no longer entered. This replaces the Shared Safari workflow's entered min and max (§3, #62).
  - The Super Admin edits all five sections in PC5, as the board. This replaces workflow #17's proposal and the earlier "board's fields only" answer.
  - ~~Starting delete reasons (Q1): not confirmed.~~ Superseded 2026-11-13: the board's list.
- 2026-11-13: Starting Package Delete Reasons: the board's list (Misleading information · Duplicate package · Wrong prices · Partner asked to delete · Other), not workflow #1's.
- 2026-11-12: The user asked to delete the first planning file and write this one from the updated workflow and prototype. Its case IDs are reused here; none of them had been run.

## 5. Execution log

- 2026-11-12: Prototype at 320b24c (local). Every board unpacked from `Starter-Prototype.html` and the 37 built boards diffed with 450bcc4: frame changes B2–B4 on every board, park form B5 on C5 / C6, nothing else; the nine stylesheets byte-identical. The 25 Packages boards' logic read board by board against the workflow: §2.3 and §2.9. PROTOTYPE-SYNC updated (D1–D4, B2–B5, the new rows, unready).
- 2026-11-13: The checkout's uncommitted canvas version 21 diffed with 320b24c: park feature image JPG, JPEG or PNG up to 250 KB (§2.3, TC-PARK-07); portal sidebar Notifications (§2.3, §2.5, D-e no longer a difference); PP6 label "Changes to approved gallery"; "Login as" cards (prototype aids); the rest sample data. PROTOTYPE-SYNC D1 and B5 updated.

## 6. Post-deploy
