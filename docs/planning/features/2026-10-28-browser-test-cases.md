# Test cases run in the browser and recorded

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-28 |
| Shipped | 2026-10-28 |
| Apps | docs |
| Test cases | TC-BTEST-01..02 |
| How it works | [docs/how-it-works/platform/browser-testing.md](../../how-it-works/platform/browser-testing.md) |

## 1. Requirement (as given)

> "the test cases should be test by agents on the browser using the playwright and mark the pass fail on the plannign file and this should be writtin in the plannign file temapltes so this dosent' missed never"

## 2. Plan

Test cases were already written in §3 and their results in §5, but how a case is checked was left open: often `curl` and database queries, with a throwaway browser script only sometimes, and nothing stopped a plan from shipping with cases unchecked.

- **Planning template:** §3 gets a "Checked in" column (`browser`, `API`, `CLI`, `DB`) and the rule that a case a user does on a screen is checked in the browser with Playwright; §5 says one line per case with its method and what was seen, a re-run adds a line, and the status can't be `shipped` while a case is FAIL or has no line.
- **`AGENTS.md`:** the test-case rule says the same, linking the doc, and a one-line rule after "Plan before code".
- **New doc** `docs/how-it-works/platform/browser-testing.md`: how a case is run (test user with the `ct_` marker, Playwright in a scratch folder outside the repo, desktop 1366 and phone 390 px, console errors, failed calls, sideways scroll, screenshots looked at and not committed) and how a result is written, with examples.
- Not in this change: Playwright tests committed in the repo and run by CI (suggested separately).

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-BTEST-01 | Template says it | the change applied, manage running, signed in as a `ct_` Super Admin | open Tech Documentation in the console, open the planning template | §3 shows the "Checked in" column and the browser rule, §5 the one-line-per-case format and the shipped condition; its link to browser-testing opens the doc | H | browser |
| TC-BTEST-02 | Docs agree | the change applied | read `AGENTS.md`, `browser-testing.md`, the platform README | the same rule in all three; the doc is listed in the platform README; Tech Documentation shows it | M | browser |

## 4. Decisions

- 2026-10-28 (user): test cases are tested by agents in the browser with Playwright and marked PASS / FAIL in the planning file; written into the planning template so it is never missed.
- 2026-10-28 (user: "also add this into the agents.md file a one line rule after the plannign file detailing"): a one-line rule in `AGENTS.md` right after "Plan before code".

## 5. Execution log

- 2026-10-28 — `docs/planning/TEMPLATE.md` (§3 "Checked in" column and rule, §5 result format, the shipped condition), `AGENTS.md` (one-line rule after "Plan before code", the test-case rule, the verify rule), new `docs/how-it-works/platform/browser-testing.md`, listed in the platform README.
- TC-BTEST-01 PASS (browser, 1366 + 390 px): signed in to the console through the sign-in form as `ct_btest@example.test`; Tech Documentation › the planning template shows the "Checked in" column and rule, the result-line examples and the shipped condition; its browser-testing link opens the doc; no sideways scroll; screenshots taken (the checks read the page text; the screenshots were not opened this time).
- TC-BTEST-02 PASS (browser, 1366 + 390 px): the browser-testing doc and the platform README (listing it) open in Tech Documentation with every section; `AGENTS.md` (outside `docs/`, so read in the editor) has the same rule in its three places. Only network error: `401 /api/auth/refresh` on the sign-in page before signing in (the signed-out session check, expected).
- First run reported the link click as not moving: the script read the address before the client-side navigation finished. Fixed by waiting for the new address; noted in the doc.
- Test data: `ct_btest@example.test` (user 3) made with the CLI; removed with its role, 5 refresh tokens and audit rows 28–33; the scratch folder with Playwright and the screenshots deleted.

## 6. Post-deploy
