# Browser testing

**What it is.** How every test case of a feature is checked before the feature is called done: the agent (or developer) runs it in a real browser with Playwright, the way a user would, and writes PASS or FAIL against it in the feature's planning file.

**Who uses it.** Agents and developers finishing a feature.

## The rule

- **Every test case is run, and its result written down.** No case of a planning file's §3 is left without a line in its §5, and a planning file does not move to `shipped` while a case is FAIL or not run (a case that can't be run yet is `NOT RUN` with the reason, and the user is told).
- **A case a user does on a screen is checked in the browser,** through the real screens: sign in through the sign-in form, click, type, save, read what the page shows. `curl` and database queries prove the API, not the screen: a page can fail in the browser while the API answers 200.
- **API-only or data-only cases** (a guard, a CLI command, a background job, a migration) are checked with `curl`, the CLI or a database query, and marked as such.

## How a case is run

1. **Start what it needs.** The API and the app, as in [local-development.md](local-development.md); the app is opened at its own address (its hostname once one is configured, never a raw port then).
2. **A test user.** Sign in as a user made for the test, with a `ct_` marker (`npm run cli user/create-super-admin "ct Test" ct_<feature>@example.test 9000000xxx confirm` prints its password), or an existing account the user names.
3. **Playwright, outside the repo.** In the agent's scratch folder: `npm i playwright-core` and a short script per case, driving the Chromium Playwright downloads (`npx playwright install chromium` once per machine) or the installed Chrome. Playwright is not a dependency of any app.
4. **The script follows the case's steps** and checks its expected result on the page: the text, the row in the list, the field error under the field, the redirect. For each page it also collects:
   - browser console errors and page errors,
   - failed API calls (status 4xx / 5xx not expected by the case),
   - sideways scroll (`document.documentElement.scrollWidth > innerWidth`).
5. **Two widths** for every screen case: desktop **1366 px** and phone **390 px**. A screenshot of each is taken and looked at (kept in the scratch folder, never committed).
6. **Write the result** in §5 of the planning file, one line per case (below), as soon as it is run.
7. **Don't read too early.** After a click that changes the page, wait for the new address or text (`page.waitForURL`, a locator) before checking: the apps navigate on the client, and a check made at once still sees the old page. On the sign-in page, one `401` from `/api/auth/refresh` before signing in is the signed-out session check, not a failure. Screenshot a page only once it has hydrated (`page.goto(url, { waitUntil: 'networkidle' })`, or wait for a locator): Playwright's screenshot hides the text cursor by writing `caret-color: transparent` into every input's `style`, and a dev build that hydrates after that logs React's "A tree hydrated but some attributes … didn't match" warning about that style; it is the test's doing, not the page's.
8. **Clean up:** the test's own rows (by the `ct_` marker, never by id ranges), the test user, uploaded files, and the scratch folder.
   `npm run cli test-data/remove-ct` lists every row and storage folder marked `ct_` on the local database and removes them with `confirm` (never in production): accounts whose email starts with `ct_` (except `ct_partner_admin@ct-packages.test`, which stays) with their roles, sessions and password resets; their partners, parks and logos; galleries, packages (every version and its rows), package delete reasons and parks named `ct_` (slugs `ct-`), or owned by those partners, with their files; quote requests from or to them or with notes starting `ct_`; their shared safaris, members, comments (and the replies to them) and flags; notifications to or from them, about any of these rows, or with a `ct_` title or text. Rows of an account under `@example.test` (Shared Safari sample data) or `@packages-demo.test` (Packages demo data) are never selected: a `ct_` row such a demo account created (a `ct_Pkg …` package of a demo partner, a `ct_` quote request a demo user sent) still goes. It stops, removing nothing, if an account to remove is a Super Admin or a sample / demo account, a gallery or delete reason to remove is used by a package that stays, or a park to remove is used by a row that stays. Each module removes its own rows in its own transaction with one audit row (actions 115, 209, 603, 841, 907, 1025, 1129, 1243, 1315); `audit_log`, `app_log` and `mail_log` are kept as the record of what was done. Safe to run again.

## How a result is written

In §5 of the planning file, one line per case, newest last; a re-run adds a line, it never rewrites the old one:

```
- TC-USER-01 PASS (browser, 1366 + 390 px): signed in as ct_users; Add User saved, toast "Saved", the row is first in the list; no console errors.
- TC-USER-02 FAIL (browser, 390 px): the Save button is under the phone menu. Fixed in user-form.tsx.
- TC-USER-02 PASS (browser, 1366 + 390 px): re-run after the fix.
- TC-USER-05 PASS (API): GET /api/users without a session → 401 UNAUTHENTICATED.
- TC-USER-06 NOT RUN: needs a live mail driver (none yet). User told.
```

The method in brackets is `browser`, `API`, `CLI` or `DB`. What was seen is written in a few words, so the line is proof, not only a word.

## Where it lives

- **Test cases and results:** each feature's planning file, §3 and §5 ([template](../../planning/TEMPLATE.md))
- **Rule:** `AGENTS.md`, Sync discipline

## History

- Planning files: [2026-10-28-browser-test-cases](../../planning/features/2026-10-28-browser-test-cases.md)
