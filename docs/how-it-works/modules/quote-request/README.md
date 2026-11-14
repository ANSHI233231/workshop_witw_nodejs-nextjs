# Quote request

**What it is.** The quote requests website users send on a package, and what the partner and the Super Admin do with them (`quote_request`). The API module `apps/api/src/modules/quote-request/`, mounted at `/api/quote-request`. The process is in [WITW-Packages-Workflow](../../workflows/WITW-Packages-Workflow.md) §9, §11 and §12.8.

**Who uses it.** A **signed-in website user who is not a partner** sends a request from the package page (the quote form, P2) and sees their active requests in **My Quote Requests** (P3). An **active partner** sees the active requests for their packages in the Partner portal's **Quote Requests** (PP8, with the count on the Dashboard, PP3) and marks each Hot or Cold. The **Super Admin** sees every request in Console › Partners › **Quote Requests** (PC9), views one with the user's email and mobile, makes it inactive or active, and sends the partner a notification about it.

## Statuses and marks

- `quote_request.status` (`QuoteRequestStatus`): 1 Active (set by sending), 2 Inactive (set by the Super Admin). A request is never deleted.
- `quote_request.mark` (`QuoteMark`): 1 Hot, 2 Cold; empty until the partner marks it, `marked_at` when. The partner switches between Hot and Cold but never back to no mark (the board PP8 has only the two buttons; plan §2.9 D-b).

| Status | Seen by |
|---|---|
| Active | the user (My Quote Requests), the partner (Quote Requests), the Super Admin |
| Inactive | the Super Admin only; hidden from the partner and the user |

## Rules

- **Who may send:** any signed-in account that is **not a partner**: an account whose partner row is Active or Inactive gets 403 `QUOTE_REQUEST_PARTNER` ("Partners can't send quote requests. Your own packages and quote requests are in the Partner portal."), the text of the board's partner note. A Pending or Rejected applicant can still send. A guest gets 401 (the page shows the sign-in prompt).
- **On the website:** the quote form is in the package page's right column (`#pk-quote`); a guest sees "Log in to send a quote request to this operator." and Login returns to the package (`/login?next=/packages/<slug>`, only a path of the site is accepted); a partner sees the partner note with the Partner portal link; the price box's Request a quote button scrolls to the form. My Quote Requests is `/my-quote-requests` (signed in; a guest goes to the sign-in page).
- **Which package:** only a package **shown on the website** (`packageService.shownPackage`: live version, website status Active, partner Active); otherwise 404 `QUOTE_PACKAGE_NOT_AVAILABLE` ("This package is not on the website now."). The package's own partner account is refused as above.
- **Fields** (the boards' messages, checked by the route): `travellerCount` a whole number 1–100 ("Enter the number of travellers." / "Enter a number from 1 to 100."); `startDate` `YYYY-MM-DD`, today or later in India time ("Choose a start date." / "Choose today or a later date."); `notes` required, up to 1,000 ("Enter your notes." / "Use up to 1,000 characters."). Field errors come back under those names.
- **Saved with:** the package, its **live version** at that moment (`package_version_id`), its partner (`partner_id`, never changed), and the account's name, email and mobile **as sent** (`user_name`, `user_email`, `user_mobile`). No limit on the number of requests. Answer 201 "Your quote request is sent to {business}.".
- **The partner sees** only their own **active** requests, newest first: the user's **name** always, the **phone only while the Super Admin has Show phone numbers on** for that partner (`partner.is_phone_shown`), **never the email**; the package name and version as sent; travellers, start date, notes, received. A request stays on the list when the package later goes inactive or is deleted (workflow #7), because the list reads the request's own `partner_id`, not the package's state. A deactivated partner sees nothing (the portal is closed to them), and their requests are back as they were when the partner is activated (#16).
- **Relations are checked in the service** (no foreign keys): the package is shown (through the package module), the request belongs to the calling partner and is active (else 404 `QUOTE_REQUEST_NOT_FOUND`, also for another partner's request), the status change starts from the other status (else 409 `QUOTE_REQUEST_STATUS_UNCHANGED`). Every portal route needs an **active partner** (403 `QUOTE_REQUEST_PARTNER_NOT_ACTIVE`).
- **Super Admin:** lists every request (newest first), filtered by status and searched by the user's name (as sent), the package name (of the version sent) and the business name; Make inactive "Request is now hidden from the partner and the user." / Make active "Request is active again."; **Send a notification**: a message required, up to 255 ("Enter the message." / "Use up to 255 characters."), "Notification sent to {business}.". Allowed on any request, active or inactive.

## Notifications

Both go to the package's partner account, in the Partner portal (`client_app` 5), entity = the quote request (`AuditEntity.QUOTE_REQUEST` 17, the request id):

| Kind | When | Title (subject) | Excerpt | Actor | Shown as |
|---|---|---|---|---|---|
| 1301 `QUOTE_REQUEST_RECEIVED` | a user sends a request | the package name (live version) | – | the user | "Ananya Iyer sent a quote request for Wild Kanha Special - Kanha." |
| 1302 `QUOTE_REQUEST_ADMIN_MESSAGE` | the Super Admin uses Send a notification | the user's name as sent | the message | the Super Admin | "From the Super Admin about Ananya Iyer's request:" followed by the message |

Where they open in the portal (the boards PP3 / PP10 bell and list): 1301 opens **Quote Requests** (`/quote-requests`), avatar "Q"; 1302 opens the **Notifications** page (`/notifications`), avatar "SA". No email is sent.

## Routes

| Route | Access |
|---|---|
| `POST /api/quote-request/requests` `{ packageId, travellerCount, startDate, notes }` → 201 the request (as in My Quote Requests) | signed-in (not a partner: the service) |
| `GET /api/quote-request/requests/mine` → `{ isPartner, items }`: the caller's active requests, newest first (package id, slug, name and version as sent, partner, travellers, start date, notes, `sentAt`); `isPartner` true for an Active or Inactive partner (P3 then shows its "Quote requests are in the Partner portal" card) | signed-in |
| `GET /api/quote-request/portal/requests` → `{ isPhoneShown, total, items }` (each: `user { name, phone }`, package, travellers, start date, notes, `receivedAt`, `mark`, `markedAt`) · `GET /portal/summary` → `{ activeCount }` (the PP3 Dashboard's "Active quote requests") · `PUT /portal/requests/:id/mark` `{ mark: 1 | 2 }` → "Marked Hot." / "Marked Cold." | signed-in (an active partner and their own active request: the service) |
| `GET /api/quote-request/admin/requests?search=&status=1|2&page=&limit=` (paged) · `GET /admin/requests/:id` · `PATCH /admin/requests/:id/status` `{ status: 1 | 2 }` · `POST /admin/requests/:id/notify` `{ message }` | Super Admin |

Console items carry `user { id, name, email, mobile }`, `package`, `partner { id, businessName }`, travellers, start date, notes, `receivedAt`, `mark`, `markedAt`, `status`.

## Audit

Module 13, entity 17 `QUOTE_REQUEST`: 1301 sent · 1303 marked (from / to) · 1305 made inactive · 1307 made active · 1309 partner notified (the message) · 1311 / 1313 demo data added / removed · 1315 `ct_` test data removed (`test-data/remove-ct`); each failure is the next number (a refusal by the service, such as a partner sending, is recorded as the failure of its action).

## Demo data (local only)

`npm run cli packages-demo/add <password> confirm` also adds the prototype's five sample quote requests (`src/cli/controllers/packages-demo/packages-demo.quotes.ts`) from three demo website users, Ananya Iyer, Riya Sharma and Neha Singh (`@packages-demo.test`): to Jungle Trails Safaris on Wild Kanha Special (Hot), Corbett Elephant Trails (Cold), Wildlife Marathon (no mark) and one inactive request, and to Tiger Trail Tours on Mangrove Majesty (no mark), with the board's dates. It also writes the board's four partner notifications (three 1301 and one 1302 message, read) through the notification module's seed service. Requests already there (same user, package and sent time) are kept. `packages-demo/remove confirm` removes the requests sent to or by the demo accounts and their notifications first.

## Where it lives

- Module: `apps/api/src/modules/quote-request/` (`createQuoteRequestModule({ db, auditService, packageService, partnerService, usersService, notificationService })` in `routes/index.ts`; `createQuoteRequestDemoModule` for the CLI)
- Schema: `apps/api/src/database/migrations/2026-11-12-safari-packages.sql` (`quote_request`, notification templates 1301 / 1302)
- Planning file: [2026-11-12-safari-packages](../../../planning/features/2026-11-12-safari-packages.md)
