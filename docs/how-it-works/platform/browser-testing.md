# Browser testing

**What it is.** How every test case of a feature is checked before the feature is called done: the agent (or developer) runs it in a real browser with Playwright, the way a user would, and writes PASS or FAIL against it in the feature's planning file.

**Who uses it.** Agents and developers finishing a feature.

## The rule

- **Every test case is run, and its result written down.** No case of a planning file's §3 is left without a line in its §5, and a planning file does not move to `shipped` while a case is FAIL or not run (a case that can't be run yet is `NOT RUN` with the reason, and the user is told).
- **A case a user does on a screen is checked in the browser,** through the real screens: sign in through the sign-in form, click, type, save, read what the page shows. `curl` and database queries prove the API, not the screen: a page can fail in the browser while the API answers 200.
- **API-only or data-only cases** (a guard, a CLI command, a background job, a migration) are checked with `curl`, the CLI or a database query, and marked as such.

## How a case is run

1. **Start what it needs.** The API and the app, as in [local-development.md](local-development.md); the app is opened at its own address (its hostname once one is configured, never a raw port then).
2. **A test user.** Sign in as a user made for the test, with a `ct_` marker (`npm run cli user/create-super-admin "ct Test" ct_<feature>@ct-test.local 9000000xxx confirm` prints its password), or an existing account the user names. **Never give a test account an `@example.test` (or `@packages-demo.test`) email:** those domains are the sample and demo data, and `test-data/remove-ct` refuses to remove them, so the clean-up stops. Use `@ct-test.local`.
3. **Playwright, outside the repo.** In the agent's scratch folder: `npm i playwright-core` and a short script per case, driving the Chromium Playwright downloads (`npx playwright install chromium` once per machine) or the installed Chrome. Playwright is not a dependency of any app.
4. **The script follows the case's steps** and checks its expected result on the page: the text, the row in the list, the field error under the field, the redirect. For each page it also collects:
   - browser console errors and page errors,
   - failed API calls (status 4xx / 5xx not expected by the case),
   - sideways scroll (`document.documentElement.scrollWidth > innerWidth`).
5. **Two widths** for every screen case: desktop **1366 px** and phone **390 px**. A screenshot of each is taken and looked at (kept in the scratch folder, never committed).
6. **Write the result** in §5 of the planning file, one line per case (below), as soon as it is run.
7. **Don't read too early.** After a click that changes the page, wait for the new address or text (`page.waitForURL`, a locator) before checking: the apps navigate on the client, and a check made at once still sees the old page. On the sign-in page, one `401` from `/api/auth/refresh` before signing in is the signed-out session check, not a failure. Screenshot a page only once it has hydrated (`page.goto(url, { waitUntil: 'networkidle' })`, or wait for a locator): Playwright's screenshot hides the text cursor by writing `caret-color: transparent` into every input's `style`, and a dev build that hydrates after that logs React's "A tree hydrated but some attributes … didn't match" warning about that style; it is the test's doing, not the page's.
8. **Clean up:** the test's own rows (by the `ct_` marker, never by id ranges), the test user, uploaded files, and the scratch folder.
   `npm run cli test-data/remove-ct` lists every row and storage folder marked `ct_` on the local database and removes them with `confirm` (never in production): accounts whose email starts with `ct_` with their roles, sessions and password resets; their partners, parks and logos; galleries, packages (every version and its rows), package delete reasons and parks named `ct_` (slugs `ct-`), or owned by those partners, with their files; quote requests from or to them or with notes starting `ct_`; their shared safaris, members, comments (and the replies to them) and flags; flag reasons named `ct_` (shown as a blocker if a flag that stays still uses one); languages named `ct_` with their language rows, data translations, `<code>_text` column of `app_translation` and published `<code>.json` files, and screen texts (`app_translation`) whose English text starts with `ct_` (the translations are published again afterwards so the apps stop serving them); background job runs titled `ct_` and their retries (a running one is a blocker); notifications to or from them, about any of these rows, or with a `ct_` title or text; their wishlist items (and items saving the removed packages or safaris), their profiles with their photo folders, and their direct conversations with every message in them. Rows of an account under `@example.test` (Shared Safari sample data) or `@packages-demo.test` (Packages demo data) are never selected: a `ct_` row such a demo account created (a `ct_Pkg …` package of a demo partner, a `ct_` quote request a demo user sent) still goes. It stops, removing nothing, if an account to remove is a Super Admin or a sample / demo account, a gallery or delete reason to remove is used by a package that stays, a park or flag reason to remove is used by a row that stays, or a job run is running. Each module removes its own rows in its own transaction with one audit row (actions 115, 209, 421, 510, 603, 841, 843, 907, 1025, 1129, 1243, 1315); `audit_log`, `app_log` and `mail_log` are kept as the record of what was done. Safe to run again.
   **A `ct_` Super Admin** (made with `user/create-super-admin`, e.g. to approve a test partner request or package) stops the clean-up: `remove-ct` never removes a Super Admin, and the API refuses removing one's own Super Admin role. The tool stays so. Before the clean-up, end only that test account's Super Admin role with one SQL update, selected by its full `ct_` email and never by id:
   `UPDATE user_role ur JOIN user u ON u.id = ur.user_id SET ur.status = -1 WHERE u.email = 'ct_<feature>_admin@ct-test.local' AND ur.meta_role_id = 100;` (it must report 1 row), then run `remove-ct` and confirm afterwards that the Super Admin accounts are the same as before the test (`SELECT u.id, u.email FROM user_role ur JOIN user u ON u.id = ur.user_id WHERE ur.meta_role_id = 100 AND ur.status = 1;`). Write the update in the planning file's §5 line for the clean-up. **Local database only. Never on staging or production. Never edit updated_at or updated_by by hand.**

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

## Test documents

The planning files stay the only place a test case and its result are written. A test document per area (Users and Auth, Shared Safari, Packages and so on; 14 in all) is **generated** from them as a read-only report in [docs/testing/](../../testing/README.md), as `.md` and as `.docx`. Never edit one by hand: the next run overwrites it.

```bash
node docs/tools/test-documents/generate.js           # rewrites docs/testing/*.md from every planning file
node docs/tools/test-documents/generate.js --check   # exit 1, listing the files, when one is out of date; writes nothing
cd docs/tools/docx-generator && npm run build        # then the .docx copies
```

Run them after the §5 lines change, then `npm run check` in `docs/tools/docx-generator`, and commit the planning file, the `.md` and the `.docx` together. Which area a case belongs to is in `docs/tools/test-documents/areas.json`; the script fails when a case ID is in no area or in two. A case's result is its result line with the latest date (on the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line). See the [tool's README](../../tools/test-documents/README.md).

## Where it lives

- **Test cases and results:** each feature's planning file, §3 and §5 ([template](../../planning/TEMPLATE.md))
- **Test documents (generated, read-only):** [docs/testing/](../../testing/README.md)
- **Rule:** `AGENTS.md`, Sync discipline

## History

- Planning files: [2026-10-28-browser-test-cases](../../planning/features/2026-10-28-browser-test-cases.md)
