<!-- Copy this file to docs/planning/features/<YYYY-MM-DD>-<short-slug>.md before writing any code.
     Delete this comment in the copy. -->

# <Feature title>

| Field | Value |
|---|---|
| Status | proposed |
| Started | YYYY-MM-DD |
| Shipped | |
| Apps | api / manage / web |
| Test cases | TC-XX-NN..NN |
| How it works | [docs/how-it-works/<section>/<topic>.md](../../how-it-works/<section>/<topic>.md) |

Status moves `proposed` → `in-progress` → `shipped`:

- `proposed`: written, not started. `in-progress`: the moment work starts.
- **`shipped` + the `Shipped` date are set in the same change that completes the work**, before it is committed, and only when every §3 case has a PASS line in §5 (or `NOT RUN` with a reason the user has been told). A planning file never stays `in-progress` after its work is done.
- `shipped` is final. Later fixes or tweaks to the same feature are logged in §4 / §5 / §6 with their date; the status stays `shipped`. A new feature or a large change gets its own planning file.

## 1. Requirement (as given)

> The requirement exactly as the user or client said it.

## 2. Plan

Approach, files to touch, and open questions for the user.

## 3. Test cases

Written before coding. This table is the only place these cases live, and §5 records their results.

- **ID format:** `TC-<MODULE>-<NN>`, e.g. `TC-AUTH-01`. Find existing IDs for a module with `grep -rn "TC-AUTH-" docs/planning/`.
- **Never reuse a number.** Mark a removed case `Retired <date>, replaced by TC-…` instead of deleting it.
- **Priority:** `H` blocks release, `M` should fix soon, `L` edge case.
- **Checked in:** how the case is run. **`browser` for anything a user does on a screen**: run through the real screens with Playwright, at 1366 and 390 px, as in [browser-testing](../how-it-works/platform/browser-testing.md). `API`, `CLI` or `DB` only for a case with no screen (a guard, a command, a job, a migration). `curl` never stands in for a screen.

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-XX-01 | ... | ... | ... | ... | H/M/L | browser / API / CLI / DB |

## 4. Decisions

Questions and the user's answers, dated.

## 5. Execution log

Dated notes on progress and checks. **Every §3 case gets a result line here as soon as it is run**, by the agent or developer who built it:

```
- TC-XX-01 PASS (browser, 1366 + 390 px): what was seen, in a few words; no console errors.
- TC-XX-02 FAIL (browser, 390 px): what went wrong. Fixed in <file>.
- TC-XX-02 PASS (browser, 1366 + 390 px): re-run after the fix.
- TC-XX-03 PASS (API): GET /api/... → 401 UNAUTHENTICATED.
- TC-XX-04 NOT RUN: why. User told.
```

A re-run adds a line; an old line is never rewritten. Test data is removed afterwards and the cleanup noted here.

## 6. Post-deploy

Issues found after release, with the fix.
