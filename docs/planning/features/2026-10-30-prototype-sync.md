# App and prototype in sync

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-30 |
| Shipped | 2026-10-30 |
| Apps | api / manage / web / docs |
| Test cases | TC-SYNC-01..06 |
| How it works | [docs/PROTOTYPE-SYNC.md](../../PROTOTYPE-SYNC.md), [modules/language](../../how-it-works/modules/language/README.md) |

## 1. Requirement (as given)

> "now based on the prototpye update the app of starter if needed and update the prototpye sync doc so everything should be synnced with the prototpye and app both"

## 2. Plan

The prototype (`starter_prototype`: `design-system/` and `prototype/starter-prototype.html`, 22 boards) was compared with the running app, board by board: each board's text and a screenshot at 1366 px, the prototype against the app's page, plus the behaviour its README lists (what works, failure examples).

**Result.** All 22 boards match in layout, frames, tables, dialogs, colours and text. Differences:

| # | Difference | Decision |
|---|---|---|
| 1 | Six failure toasts show in the green success style (Users: status switch failed, user could not be opened; Audit Log event, Error Logs entry could not be opened; Mark all as read failed, in manage and web). The prototype shows every failure in red | App: red (`isError`) |
| 2 | "Already exists" wording: the app says "This name already exists.", "This code is already used by another language.", "This English text already exists."; the prototype "This name is already in use.", "This code is already in use.", "This text is already in use." | App: the prototype's wording (user) |
| 3 | Language Master's English row: the app hides its status switch; the prototype shows it (switching it off fails) | Both: shown, on and locked, tooltip "English is the base language" (user). The prototype is updated separately (STEPS addition) |
| 4 | Sign-in boards show a "Login as" picker | Prototype aid only (fills in a sample account); not built |
| 5 | Sample data (names, dates, log lines), the prototype's bar, its Reset data and its built-in failure examples | Prototype only |
| 6 | Max length of the English text: the prototype says "The English text can be at most 500 characters."; the app "English text can be at most 500 characters." | App kept (the prototype lists its wording as unconfirmed); recorded |

**Also:** `docs/PROTOTYPE-SYNC.md` gets a row per board (22, all built) with its route and these differences; the `docs/prototype` pin moves to the prototype's new commit once it is committed and pushed.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-SYNC-01 | Failure toasts are red | console signed in | make each of the six failures happen (request blocked in the browser) | each shows the toast with the red line (`toast is-error`) | H | browser |
| TC-SYNC-02 | Duplicate language name / code | Language Master | Add Language with the name "English", then code "en" | under Name: "This name is already in use."; under Code: "This code is already in use." | H | browser |
| TC-SYNC-03 | Duplicate English text | App Translations with one row | Add Translation with the same English text | under English Text: "This text is already in use." | H | browser |
| TC-SYNC-04 | English switch locked | Language Master | look at the English row; try to click its switch | the switch is shown, on, disabled; tooltip "English is the base language"; nothing changes | H | browser |
| TC-SYNC-05 | Other switches still work | Users list | switch a user off and on (the same `MasterSwitch`; a second language would change the translation table) | toasts "… marked inactive." / "… marked active." | M | browser |
| TC-SYNC-06 | Phone width | the screens above | 390 px | same results, no sideways scroll | M | browser |

## 4. Decisions

- 2026-10-30 (user): the app follows the prototype where needed, and PROTOTYPE-SYNC records every board.
- 2026-10-30 (user): "already in use" wording for a taken language name, code or English text (the prototype's).
- 2026-10-30 (user): English's status switch is shown, on and locked (disabled), in the app and the prototype.

- 2026-10-31 (user): which boards are ready is recorded in `docs/PROTOTYPE-SYNC.md` (a Ready column), not in `AGENTS.md`, so AGENTS.md doesn't grow; AGENTS.md points there. The 22 boards are marked ready at af2106d (they are copies of the built app).

## 5. Execution log

- 2026-10-30 — Compared all 22 boards (text and screenshot at 1366 px, prototype against the app) and the prototype README's behaviour; result in §2.
- Built: API messages "This name / code / text is already in use." (`language.service.ts`, `app-translation.service.ts`); six failure toasts red (`isError`): Users (status switch, user could not be opened), Audit Log, Error Logs (and its copy messages), Mark all as read in manage and web; `MasterSwitch` gets `lockedReason` (disabled, tooltip, label "English: English is the base language"), used for English on Language Master; `.mt-switch:disabled` style (the design system's disabled toggle: opacity .5, not-allowed).
- Checks: manage and web `tsc` and `lint` pass, `npm run build` passes in both; API `npm run verify` passes.
- TC-SYNC-01 PASS (browser, 1366 + 390 px): with the API blocked in the browser, all five console failures and the portal's Mark all as read show `toast is-error` with their messages.
- TC-SYNC-02 PASS (browser, 1366 + 390 px): Add Language with the name "English": "This name is already in use."; with the code "en": "This code is already in use." Nothing saved.
- TC-SYNC-03 PASS (browser, 1366 + 390 px): adding "ct sync test" twice: "Translation added.", then "This text is already in use." under the field.
- TC-SYNC-04 PASS (browser, 1366 + 390 px): the English row has one switch, on, disabled, tooltip "English is the base language"; a click changes nothing, no toast.
- TC-SYNC-05 PASS (browser, 1366 + 390 px): ct Notify Member switched off and on: "marked inactive." / "marked active."
- TC-SYNC-06 PASS (browser, 390 px): no sideways scroll on Language Master or App Translations; no page errors.
- (A first run blocked the API for the whole session by mistake, so its later saves failed; re-run with the block removed after each case. Nothing was saved by the first run.)
- Cleanup: the translation row "ct sync test" deleted (no rows left in `app_translation`); ct Notify Member active again.
- The prototype committed and pushed (af2106d, on the user's request); the pin moved to it; `docs/PROTOTYPE-SYNC.md` lists all 22 boards (built) with their differences and two "prototype to update" items (English switch, confirmed wording), sent to the prototype as a Claude Design prompt.
- Docs: the language doc (English's locked switch; the "already in use" messages).

## 6. Post-deploy
