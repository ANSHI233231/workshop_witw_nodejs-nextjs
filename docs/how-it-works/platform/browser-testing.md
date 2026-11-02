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
7. **Don't read too early.** After a click that changes the page, wait for the new address or text (`page.waitForURL`, a locator) before checking: the apps navigate on the client, and a check made at once still sees the old page. On the sign-in page, one `401` from `/api/auth/refresh` before signing in is the signed-out session check, not a failure.
8. **Clean up:** the test's own rows (by the `ct_` marker, never by id ranges), the test user, uploaded files, and the scratch folder.

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
