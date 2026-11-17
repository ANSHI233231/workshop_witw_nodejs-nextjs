# Partner portal

**What it is.** The app where safari operators (partners) work: `apps/partner`, a Next.js app on port 3042 locally (4102 staging, 4202 production). It is built and ruled like `manage` and `web` ([frontend-apps.md](frontend-apps.md)) and uses the console frame of the PP boards: a dark green header ("Partner Portal" and the role chip "Partner"), a sidebar, the page and the footer.

**Who uses it.** Anyone with a website account: a partner works here; someone with no request, or a request not yet approved, sees only the partner request page.

## Signing in

- **The website account, by mobile number, email or username and password, as the website's Login** (PP1, `/login`). There is no Sign Up here (the API refuses it from this app); the card links to the website's Become a Partner page (`NEXT_PUBLIC_WEBSITE_URL` + `/become-a-partner`). The one Login ID field (placeholder "Mobile no. or email") sends what is typed as the identifier; empty shows "Enter your mobile number, email or username.", and a wrong login or password shows the API's `INVALID_CREDENTIALS` message, as on the website.
- **Forgot password** (`/forgot-password`) is the website's flow: the reset mail says "Partner Portal" and its link opens this app (`APP_URL_PARTNER` in the API's `.env`).
- **Its own session.** The app sends `X-Client-App: partner` (the API's `ClientApp.PARTNER = 5`), so the API sets and reads its own cookie pair `partner_access_token` / `partner_refresh_token` (with `AUTH_COOKIE_PREFIX` in front). Signing in or out of the portal does not touch the website's or the console's session, and the other way round ([auth](../modules/auth/README.md)).

## Where a user lands (the guard)

The state comes from the user's partner request (`GET /api/partner/requests/mine`): none, Pending, Rejected, Active or Inactive. It is read on the server for every page (`lib/portal-session.ts`):

| State | What they get |
|---|---|
| not signed in | every page of `(portal)` sends them to `/login` (`requireSignedIn`) |
| no request, Pending, Rejected | every portal page sends them to `/partner-request` (PP2), which shows the request form, the waiting card or the reason with Send again; the sidebar has only **Partner request** |
| Inactive | sent to `/partner-request`, which shows only "Account deactivated" and the deactivated message |
| Active | the portal: Dashboard, Packages, Gallery, Quote Requests, Notifications, Business Profile; the bell in the header |

A page for Active partners starts with `await requireActivePartner()`. Hiding the menu is not the access control: every portal API call is signed in, and the owning module's service checks "an active partner, and the item is their own".

## The frame

- `components/portal/portal-shell.tsx` holds the header, the sidebar (`portal-menu.ts`: six items for Active, Partner request otherwise), the user menu and the footer.
- The user menu shows the business name for a partner (Active or Inactive) and the person's name otherwise, the email, "Partner" or "Partner request: Pending / Rejected / not sent", a **Website** link, **Change Password** (the console's dialog, copied: current / new / confirm password, `POST /api/auth/change-password`; "Password updated." on success) and **Log Out**.
- The bell is the shared notification feed for this app (`clientApp` 5); "Show all notifications" goes to `/notifications`.
- The boards' own styles (`pq-*`, `pk4`, `pk-*`) are in `app/partner-portal.css`; the rest is the console's stylesheets.
- **Language:** the header has the same language switch as the console (one button per language shown in Partner Portal; the boards draw none). The portal reads `translations/<code>.json` and `languages.json` from its own folder, written by Publish translations, so every text goes through `t()`; English shows until a language is published. The partner's choice is the `locale` cookie; a new visitor starts in the language set as Partner Portal's default. See [language](../modules/language/README.md).

## The pages

- **Partner request** (`/partner-request`, PP2): the business form for no request (Become a Partner) and for Rejected (with the reason; Send again), the Pending card, the approved card for Active, only the deactivated message for Inactive.
- **Dashboard** (`/`, PP3): the Active quote requests card (the count from `GET /api/quote-request/portal/summary`) and the partner's latest two Active packages (`GET /api/package/portal/dashboard`): picture, name, parks, nights / days, price per person, live version and Open; "No active packages yet." with Add Package when there are none.
- **Packages** (`/packages`, PP4): every package of the partner except discarded ones, newest change first: picture, name and parks of the working version (else the live one), the live and working version with its status, the website status, Updated and the actions the API allows (`actions`: edit, send, delete / delete draft, view, make active / inactive). Send and Delete ask in a dialog; Edit on a live-only package first makes the next version as a draft, then opens it.
- **Add / edit package** (`/packages/new`, `/packages/<id>`, PP5): the five-section editor (Basic, Itinerary, Inclusions, Getting there, FAQs). Basic is saved first and creates the package with v1 Draft; then each section is saved on its own and images are sent after the section. The side panel shows the version and website status, the package link, Send for approval, Edit (makes version N), Make active / inactive, Delete and the versions list (a Replaced version opens read only with `?version=<id>`). Send and Make active / inactive refuse with "Save or discard your changes first." while a section has unsaved edits. A waiting, deleted or Replaced version is read only.
- **Package pictures** in the Dashboard and Packages lists are the package image of the version shown in the row, else the main park's feature image (the public `GET /api/park/parks/<slug>/feature-image`), else `/witw/default-cover.jpg`; a picture that fails to load moves to the next one.
- **Gallery** (`/gallery`, `/gallery/new`, `/gallery/<id>`, PP6 and PP7): the partner's galleries by tab, and the add / edit / send screen ([gallery](../modules/gallery/README.md)).
- **Quote Requests** (`/quote-requests`, PP8): the partner's Active quote requests, newest first: user (the phone only while the Super Admin has Show phone numbers on, else "Phone numbers are hidden for your account."), package and version, travellers, start date, notes, received, and the Hot / Cold buttons ([quote request](../modules/quote-request/README.md)).
- **Business Profile** (`/business-profile`, PP9): the partner's details, logo, parks and partner since, view only.
- **Notifications** (`/notifications`, PP10): the partner's notification list; the bell's Show all notifications comes here. A new quote request (avatar Q) opens Quote Requests; the Super Admin's message (avatar SA) shows its text in the list and the bell.

## Logs

As every app ([frontend-logging.md](frontend-logging.md)): files in `apps/partner/logs/`, errors to the API as source **Partner Portal** (`AppLogSource.PARTNER = 4`), and the System Logs page reads the folder through `LOG_VIEWER_DIRS` (`partner=../partner/logs`).

## Where it lives

- **App:** `apps/partner/` (its README); config `src/lib/config.ts` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEBSITE_URL`, …) and `.env.example`
- **Guard:** `src/lib/portal-session.ts`, `src/types/portal.types.ts`
- **Frame:** `src/components/portal/`; sign-in `src/components/sign-in/`
- **API side:** `ClientApp.PARTNER` in `core/context/client-app.ts`, the cookie names in `modules/auth/types/auth.types.ts`, `APP_URL_PARTNER` in the API's config
- **Ports and processes:** [environments/README.md](../../../environments/README.md); `init.js` writes the app's `.env`

## History

- Planning file: [2026-11-12-safari-packages](../../planning/features/2026-11-12-safari-packages.md) (Phases 3 and 5)
