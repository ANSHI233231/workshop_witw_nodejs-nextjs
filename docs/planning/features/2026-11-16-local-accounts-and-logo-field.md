# Local test accounts, sign-in check and the logo field

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-11-16 |
| Shipped | 2026-11-16 |
| Apps | api / web / manage / partner / docs |
| Test cases | TC-LOCAL-01..12, TC-LOGO-01..07 |
| How it works | [platform/local-development.md](../../how-it-works/platform/local-development.md), [modules/partner](../../how-it-works/modules/partner/README.md) |

## 1. Requirement (as given)

> Local par teen problems hain. Order mein fix karo.
>
> 1. CONSOLE AUR PARTNER PORTAL MEIN LOGIN NAHI HO RAHA. Pehle root cause dhoondo: cookies (manage_ / partner_), CORS, API URL ya port, .env, account ka role ya status. Browser network aur console errors ke saath evidence do. Fix karo, phir dono apps mein sign-in browser mein test karo.
> 2. LOCAL TEST ACCOUNTS (sirf local DB, demo/seed command se, production mein band). Saare accounts ka ek hi password; ye password code, docs ya git mein kahin mat likhna. Command mein argument se do.
>    Super Admin `anshika@example.in` (Console); Partner `partner@example.in`: active partner, business name, logo, 2-3 parks, kam se kam 2 live packages aur 1 approved gallery (Partner portal + website); User `user@example.in`: normal user, 1 quote request bheji hui (Website).
>    Guest ke liye account nahi banta. Bina sign-in ke check karo: package aur park browse, Request a quote dabane par Login, aur Become a Partner (guest wala form). Accounts idempotent hon; remove command bhi ho. Shared Safari ke sample users aur anshika@triline.co.in ko mat chhuna. End mein ek table: account, email, kahan login hota hai, test result.
> 3. BECOME A PARTNER: LOGO FIELD. Jahan abhi "Logo" likha box hai, wahan portal ka default logo (WITW placeholder image) dikhe; file chunne ke baad us file ka preview. Browser ka default "Choose File / No file chosen" hatao: design system jaisa button ("Upload logo") aur chuni hui file ka naam, saath mein Remove. Validation waisi hi: JPG, JPEG, PNG, WEBP, max 1 MB, error field ke neeche. Console › Partners › Edit mein bhi same fix. Prototype board (P4) mein jaisa hai, waisa hi banao.
>
> CHECK: teeno login, guest flow aur logo upload ko browser mein 1366 aur 390 px par test karo, screenshots `docs/screenshots/2026-11-14-packages/` mein rakho. Commit mere kehne par.

### Root cause of problem 1 (found 2026-11-16)

Nothing was wrong with cookies, CORS, ports or `.env`. With a fresh `ct_` Super Admin, both apps signed in in the browser: `POST /api/auth/sign-in` 200, cookies `manage_access_token` / `manage_refresh_token` and `partner_access_token` / `partner_refresh_token` on `localhost`, redirect to `/` (console) and `/partner-request` (partner portal); the only console error was the expected signed-out `401` from `/api/auth/refresh`. The audit log shows the two failed attempts of 2026-11-16 04:40 UTC (console and partner portal) were `anshika@triline.co.in` → 401 `INVALID_CREDENTIALS`: the account exists, is active and Super Admin, but the password typed was not its password (the one `init.js` printed once). Fix: local test accounts with a password the developer chooses (problem 2). `anshika@triline.co.in` is left as it is.

## 2. Plan

**Local accounts** (`apps/api/src/cli/controllers/local-accounts/`):
- `npm run cli local-accounts/add <password> confirm` creates, on a non-production database only:
  - `anshika@example.in`: Super Admin.
  - `partner@example.in`: an Active partner (business, logo, Kanha, Bandhavgarh and Tadoba-Andhari), one approved gallery and two live packages.
  - `user@example.in`: a website user with no role and one quote request to one of those packages.
- The password is only an argument. It is never written in code, docs or git. Dry run without `confirm`. Safe to run again: whatever is there is kept, never duplicated, and its password is not changed. Refused in production.
- `npm run cli local-accounts/remove confirm` removes only these three accounts and their own rows. The Shared Safari sample users (`@example.test`), the Packages demo (`@packages-demo.test`) and `anshika@triline.co.in` are never selected.
- Reuses each module's demo service (users, partner, gallery, package, quote-request). Two additions:
  - `PartnerDemoService.setLogo` stores a logo for a partner that has none.
  - `UsersDemoService.removeAccounts` takes the Super Admin emails it may remove, so only `anshika@example.in` can go, and only when named.
- The gallery and package plan builders move out of `PackagesDemoController` into a shared file, used by both commands. `packages-demo` writes the same data as before.

**Logo field** (`components/partner/logo-picker.tsx`, the same copy in web, manage and partner):
- The board's 64 px square shows `/witw/logo.png` (the WITW logo) while there is no logo, the current logo when there is one, and the chosen file once picked.
- The native file input is hidden. An **Upload logo** secondary button opens it, the chosen file's name shows beside it, and **Remove** clears the choice (or removes the saved logo).
- Rules unchanged: JPG, JPEG, PNG or WEBP, up to 1 MB; the helper line and the error under the field.
- It is one component copied in three apps, so the partner portal's partner request form (PP2) changes too. The repo rule is that a UI pattern changes everywhere at once.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-LOCAL-01 | Dry run writes nothing | none of the three accounts | `local-accounts/add <password>` | lists what it would create; nothing written | H | CLI |
| TC-LOCAL-02 | Add creates the accounts and data | — | `local-accounts/add <password> confirm` | 3 accounts, 1 active partner with logo and 3 parks, 1 approved gallery, 2 live packages, 1 quote request | H | CLI / DB |
| TC-LOCAL-03 | Add again duplicates nothing | after 02 | run add again | everything "kept", row counts unchanged | H | CLI / DB |
| TC-LOCAL-04 | Refused in production | `NODE_ENV=production` | run add | refused, nothing written | H | CLI |
| TC-LOCAL-05 | Super Admin signs in to the console | after 02 | console `/login` with `anshika@example.in` | Dashboard, `manage_` cookies, no console errors | H | browser |
| TC-LOCAL-06 | Partner signs in to the partner portal | after 02 | partner `/login` with `partner@example.in` | Dashboard with business name and logo; Packages lists 2 live packages; Galleries 1 approved | H | browser |
| TC-LOCAL-07 | Partner signs in to the website | after 02 | web `/login` with `partner@example.in` | signed in; account menu shows the business and Partner portal | H | browser |
| TC-LOCAL-08 | User signs in to the website | after 02 | web `/login` with `user@example.in` | signed in; My Quote Requests lists 1 request | H | browser |
| TC-LOCAL-09 | Guest browses packages and parks | signed out | open `/packages`, a package, `/parks`, a park | pages show, the partner's packages are listed | H | browser |
| TC-LOCAL-10 | Guest Request a quote asks to sign in | signed out | package page › Request a quote, then Login in the quote box | the quote box shows "Log in to send a quote request to this operator." (as board P2); Login goes to `/login?next=/packages/<slug>` | H | browser |
| TC-LOCAL-11 | Guest Become a Partner form | signed out | `/become-a-partner` | guest form with account and business fields | H | browser |
| TC-LOCAL-12 | Remove takes only these accounts | after 02 | `local-accounts/remove` then `remove confirm` | dry run lists them; confirm removes the 3 accounts and their rows; `@example.test`, `@packages-demo.test`, `anshika@triline.co.in` untouched | H | CLI / DB |
| TC-LOGO-01 | Default logo and button | `/become-a-partner` | look at the Logo field | WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line | H | browser |
| TC-LOGO-02 | Choose a valid file | as 01 | Upload logo, pick a PNG under 1 MB | preview in the square, file name shown, Remove shown | H | browser |
| TC-LOGO-03 | Remove the chosen file | after 02 | Remove | back to the WITW logo, no file name | H | browser |
| TC-LOGO-04 | Wrong type | as 01 | pick a .gif / .txt | error under the field, no preview | H | browser |
| TC-LOGO-05 | Too large | as 01 | pick a 2 MB JPG | "up to 1 MB" error under the field | H | browser |
| TC-LOGO-06 | Console › Partners › Edit | Super Admin, partner with logo | open Edit | current logo in the square; Upload logo, Remove; a new file previews and saves | H | browser |
| TC-LOGO-07 | Partner portal request form | signed in, no request | `/partner-request` | same field as 01 | M | browser |

## 4. Decisions

- 2026-11-16: All three local accounts share one password, given only as the command's argument (user).
- 2026-11-16: Logo field: the WITW placeholder image in the square, an **Upload logo** button, the chosen file's name and **Remove**, in place of the board's "Logo" text and native file input (user). This differs from the board P4, which shows the text "Logo" and the browser's file input; recorded in PROTOTYPE-SYNC.
- 2026-11-16: TC-LOCAL-10 steps follow board P2 as built: a guest's Request a quote scrolls to the quote box, whose Login button opens `/login?next=…` (no direct redirect). Not a change, the case was written too loosely.
- 2026-11-16: Screenshots of the checks go in `docs/screenshots/2026-11-14-packages/` (user). This replaces, for this work, browser-testing's "kept in the scratch folder, never committed".
- 2026-11-16: Screenshots stay out of git; `.gitignore` keeps `/docs/screenshots/` (user).
- 2026-11-16: `ct_login@example.test` (user 98) is deactivated from the console, not deleted (user).
- 2026-11-16: Fix both file leftovers: removing demo packages deletes their image files, and replacing a partner's logo in console Edit deletes the old logo file; only the files of that record (user).

## 5. Execution log

- 2026-11-16: Root cause of problem 1 found (§1). A temporary `ct_login@example.test` Super Admin was used to show sign-in works.
- 2026-11-16: Built: `local-accounts` CLI command, `PartnerDemoService.setLogo`, `UsersDemoService.removeAccounts(emails, superAdminEmails)`, the gallery / package plan builders moved to `packages-demo/packages-demo.build.ts`; the logo picker in web, manage and partner. Checks: `npx tsc --noEmit` in api, web, manage, partner; `npm run lint` in all four (0 errors; the `<img>` warnings are in existing package files); `npm run build` in web, manage, partner.
- TC-LOCAL-01 PASS (CLI): dry run listed the three emails "to create"; row counts of user, partner, gallery, package, quote_request unchanged (25 / 5 / 6 / 12 / 5).
- TC-LOCAL-02 PASS (CLI + DB): Super Admin, partner (Active, logo `partner/<id>/logo/…png`, 3 parks) with 1 approved gallery, 2 packages website Active with a Live version, 1 active quote request from user@example.in to Kanha Escape.
- TC-LOCAL-03 PASS (CLI + DB): second run printed "kept" for everything; counts unchanged.
- TC-LOCAL-04 PASS (CLI): `NODE_ENV=production` add and remove → "Local test accounts are never written in production", nothing written.
- TC-LOCAL-05 PASS (browser, 1366 + 390 px): console sign-in as anshika@example.in → Dashboard, `manage_access_token` / `manage_refresh_token`; no console errors, no failed calls, no sideways scroll.
- TC-LOCAL-06 PASS (browser, 1366 + 390 px): partner portal sign-in as partner@example.in; business name and logo shown; Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail, both Live; Gallery shows Tiger Song Kanha Camp, Approved; no errors.
- TC-LOCAL-07 FAIL (browser, 1366 + 390 px): the script opened the notifications popover, not the account menu (test script fault). Fixed the script.
- TC-LOCAL-07 PASS (browser, 1366 + 390 px): website sign-in as partner@example.in; account button "Account: Tiger Song Safaris", menu has Partner portal; no errors.
- TC-LOCAL-08 PASS (browser, 1366 + 390 px): website sign-in as user@example.in; My Quote Requests lists the request to Kanha Escape; no errors.
- TC-LOCAL-09 FAIL (browser, 1366 + 390 px): script checks too strict (Kanha is not on page 1 of the A–Z parks list; the package title is upper-cased by CSS). Fixed the script.
- TC-LOCAL-09 PASS (browser, 1366 + 390 px): signed out, `/packages` lists Kanha Escape, its page opens, `/parks` lists parks, `/parks/kanha-tiger-reserve` shows its packages; no errors.
- TC-LOCAL-10 FAIL (browser, 1366 + 390 px): expected a direct redirect; the page shows the quote box's Login prompt instead (board P2). Case steps corrected (§4).
- TC-LOCAL-10 PASS (browser, 1366 + 390 px): Request a quote shows "Log in to send a quote request to this operator."; Login → `/login?next=%2Fpackages%2Ftiger-song-kanha-escape`; no errors.
- TC-LOCAL-11 PASS (browser, 1366 + 390 px): signed out, `/become-a-partner` shows the guest form with account and business fields; no errors.
- TC-LOGO-01 FAIL (browser, 1366 px): the field's `<label for>` named the Upload logo button "Logo" (screen readers would not hear "Upload logo"). Fixed: the field title is a label span and the button is labelled by both ("Logo Upload logo").
- TC-LOGO-01 PASS (browser, 1366 + 390 px): WITW logo image loaded in the square, Upload logo button, native input hidden (1 px), no "Choose File / No file chosen", helper "JPG, JPEG, PNG or WEBP, up to 1 MB".
- TC-LOGO-02 PASS (browser, 1366 + 390 px): Upload logo opens the file chooser; a PNG previews in the square, "ct_logo.png" shown, Remove shown.
- TC-LOGO-03 PASS (browser, 1366 + 390 px): Remove → WITW logo back, file name and Remove gone.
- TC-LOGO-04 PASS (browser, 1366 + 390 px): a GIF → "Choose a JPG, JPEG, PNG or WEBP file." under the helper, no preview.
- TC-LOGO-05 PASS (browser, 1366 + 390 px): a 2.2 MB JPG → "Choose a file up to 1 MB."; no errors, no sideways scroll.
- TC-LOGO-06 PASS (browser, 1366 + 390 px): console › Partners › Edit (table row on desktop, card on phone) shows the partner's current logo; Upload logo previews a JPG with its name; Save (1366) → logo `PUT` 200. The partner's own logo was put back the same way afterwards.
- TC-LOGO-07 PASS (browser, 1366 + 390 px): partner portal `/partner-request` (user@example.in, no request) shows the same field; a chosen PNG shows its name; nothing sent.
- TC-LOCAL-12 PASS (CLI + DB): dry run listed 1 quote request, 2 packages, 1 gallery, 1 partner, 3 accounts and removed nothing; `confirm` removed exactly those; `@example.test` (15), `@packages-demo.test` (8) and `anshika@triline.co.in` unchanged. Seen: package image files stay in `storage/package/<id>/` (the package demo service removes rows only, as for `packages-demo/remove`), and logos replaced in console Edit stay in `storage/partner/<id>/logo/` (existing behaviour); the folders of the removed test rows were deleted by hand. The accounts were then added again for use.
- Screenshots: `docs/screenshots/2026-11-14-packages/` (`local-*` and `logo-*`, each `-1366` / `-390`).
- Cleanup: test uploads removed with their storage folders. `ct_login@example.test` (user 98) is still there: `test-data/remove-ct` refuses it (Super Admin, and `@example.test` is the protected sample domain). Left for the user to decide.
- 2026-11-16 (open points, user decisions §4): `packages-demo/remove` and `local-accounts/remove` now delete each removed package's folder `package/<id>/`, and the gallery and partner demo removes delete `gallery/<id>/` and `partner/<id>/` (they left empty folders); `GalleryRepository.photoFilesOf` dropped (no longer used). A replaced or removed logo (console Edit and the applicant's own request, both call the same `PartnerRecords.discardReplacedLogo`) deletes its old file after the change is saved. Checks: `npx tsc --noEmit` and `npm run lint` in api.
- 2026-11-16 PASS (CLI + storage): `local-accounts/remove confirm` → folders `package/45`, `package/46` gone (and, after the folder fix, no empty `partner/` or `gallery/` folder from a remove); the earlier empty `partner/17`, `gallery/41` deleted by hand; accounts added again (users 105 / 106 / 107, partner 18, gallery 42, packages 47 / 48, quote request 12).
- 2026-11-16 PASS (API): `PUT /api/partner/admin/partners/18/logo` as anshika@example.in, twice (a test PNG, then the partner's own logo back) → each time `storage/partner/18/logo/` held only the new file.
- 2026-11-16 PASS (browser, console 1366 px): Users › search `ct_login` → status switch → "User "ct Login" marked inactive."; `ct_login@example.test` (user 98) is Inactive, not deleted.
- 2026-11-16: Full re-run ([2026-11-16-full-test-and-docs](2026-11-16-full-test-and-docs.md)), group partner-packages, after the machine restart; screenshots in `.work/screenshots/2026-11-16-full-test/` (local, git-ignored).
- TC-LOGO-01 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-logo-01-1366.png, tc-logo-01-390.png) 2026-11-16: WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line; no console errors, no failed calls
- TC-LOGO-02 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-logo-02-1366.png, tc-logo-02-390.png) 2026-11-16: preview in the square, name "logo.png", Remove shown; no console errors, no failed calls
- TC-LOGO-03 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-logo-03-1366.png, tc-logo-03-390.png) 2026-11-16: back to the WITW logo, no file name; no console errors, no failed calls
- TC-LOGO-04 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-logo-04-1366.png, tc-logo-04-390.png) 2026-11-16: error "Choose a JPG, JPEG, PNG or WEBP file." under the field, no preview; no console errors, no failed calls
- TC-LOGO-05 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-logo-05-1366.png, tc-logo-05-390.png) 2026-11-16: error "Choose a file up to 1 MB." under the field; no console errors, no failed calls
- TC-LOGO-06 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-logo-06-1366.png, tc-logo-06-390.png) 2026-11-16: Edit on ct_ptr_Safaris One: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls | 390: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls
- TC-LOGO-07 PASS (browser, 1366 + 390 px; role: User; screenshots: tc-logo-07-1366.png, tc-logo-07-390.png) 2026-11-16: portal /partner-request (user@example.in, no request): WITW logo, Upload logo, no "No file chosen", chosen file "logo.png" previews (nothing sent); no console errors, no failed calls
- 2026-11-16: Full re-run ([2026-11-16-full-test-and-docs](2026-11-16-full-test-and-docs.md)), group auth-platform, after the machine restart; screenshots in `.work/screenshots/2026-11-16-full-test/` (local, git-ignored).
- TC-LOCAL-01 PASS (CLI; role: none; screenshots: none) 2026-11-16: `local-accounts/add` without confirm lists anshika@, partner@ and user@example.in ("there" because they already exist on this machine) and prints "Dry run: nothing written"; row counts unchanged. The "none of the accounts yet" pre-condition cannot be met under the no-data-delete rule, so the "to create" wording was not seen.
- TC-LOCAL-02 PASS (DB, CLI; role: none; screenshots: none) 2026-11-16: the accounts created earlier are all present: 3 users (Super Admin role 100, Partner role 101, plain user), 1 Active partner "Tiger Song Safaris" with a logo and 3 parks, 1 approved gallery, 2 live packages, quote requests to it; the create run itself was not repeated (data exists; a fresh create would need a remove, which the no-data-delete rule forbids).
- TC-LOCAL-03 PASS (CLI + DB; role: none; screenshots: none) 2026-11-16: `local-accounts/add <password> confirm` again: every line "kept" (3 accounts, partner 18, logo, gallery 42, packages 47 and 48, quote request 12); counts before and after identical (3 users, 1 partner, 3 parks, 1 gallery, 2 packages, 2 quote requests); the accounts' passwords unchanged.
- TC-LOCAL-04 PASS (CLI; role: none; screenshots: none) 2026-11-16: `NODE_ENV=production ... local-accounts/add <password> confirm` printed "Local test accounts are never written in production (NODE_ENV=production)."; counts unchanged.
- TC-LOCAL-12 NOT RUN (confirm part: user rule: no data delete) 2026-11-16: dry run `local-accounts/remove` printed "Would remove: 2 quote requests, 2 packages, 1 galleries, 1 partners and 3 accounts (anshika@example.in, partner@example.in, user@example.in)" and "Dry run: nothing removed"; counts unchanged. The `remove confirm` step and the check that other accounts stay untouched were not run.
- TC-LOCAL-05 PASS (browser, 1366 + 390 px; role: Super Admin; screenshots: tc-local-05-1366.png, tc-local-05-390.png) 2026-11-16: console Login with anshika@example.in -> http://localhost:3041/, Dashboard shown, cookies manage_refresh_token,manage_access_token; no issues
- TC-LOCAL-06 PASS (browser, 1366 + 390 px; role: Partner; screenshots: tc-local-06-1366.png, tc-local-06-390.png) 2026-11-16: partner portal Login lands / with business name Tiger Song Safaris and 1 logo image(s); Packages lists Kanha Escape and Tadoba and Bandhavgarh Trail (2 Live); Gallery lists Tiger Song Kanha Camp, Approved; no issues
- TC-LOCAL-07 PASS (browser, 1366 + 390 px; role: Partner; screenshots: tc-local-07-1366.png, tc-local-07-390.png) 2026-11-16: website Login lands /; account button "Account: Tiger Song Safaris", menu shows Partner portal; no issues
- TC-LOCAL-08 PASS (browser, 1366 + 390 px; role: User; screenshots: tc-local-08-1366.png, tc-local-08-390.png) 2026-11-16: signed in, My Quote Requests lists the Kanha Escape request(s) (1 mention(s)); no issues
- TC-LOCAL-09 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-local-09-1366.png, tc-local-09-390.png) 2026-11-16: guest: /packages lists the partner's Kanha Escape, its package page opens, /parks and the Kanha park page show; no issues
- TC-LOCAL-10 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-local-10-1366.png, tc-local-10-390.png) 2026-11-16: quote box says "Log in to send a quote request to this operator."; Login goes to /login?next=%2Fpackages%2Ftiger-song-kanha-escape; no issues
- TC-LOCAL-11 PASS (browser, 1366 + 390 px; role: Guest; screenshots: tc-local-11-1366.png, tc-local-11-390.png) 2026-11-16: guest /become-a-partner shows account fields (full name, password) and business fields (business name); no issues

## 6. Post-deploy
