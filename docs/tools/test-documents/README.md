# Test documents generator

Writes one read-only test document per area from the planning files. The planning files (§3 test cases, §5 result lines) stay the only place cases and results are written; the documents in [docs/testing/](../../testing/README.md) are a report built from them. Never edit them by hand.

```bash
node docs/tools/test-documents/generate.js           # write docs/testing/<slug>.md and docs/testing/README.md
node docs/tools/test-documents/generate.js --check   # exit 1, listing the files, if any is out of date; writes nothing
cd docs/tools/docx-generator && npm run build        # then the .docx copies, and npm run check
```

Plain Node, no packages. Run it from anywhere; paths come from the script's own location.

## Files

| File | What it holds |
|---|---|
| `generate.js` | reads every `docs/planning/features/*.md`, writes the documents |
| `areas.json` | the 14 areas: title, slug, the test IDs each covers, its requirement / workflow references, its how-it-works docs |

An `areas.json` ID entry is a prefix (`SS`: every `TC-SS-nn`), a range (`LOCAL-01..05`) or one ID (`START-03`). A range or single ID wins over a prefix, so `START-03` is in Users and Auth while the rest of `START` is in Console platform. The script exits 1, listing them, when a case ID is in no area or in two.

## What it reads

- §3 table rows: `| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | (Checked in) |`; columns are found by header name, so the older tables without `Checked in` work. A title ending `(role: …; ref: …)` gives the case's Role and Ref. A row marked Retired is listed as retired.
- §5 result lines: `TC-XX-NN PASS|FAIL|NOT RUN|BLOCKED (details) date: text`, with or without a leading `- date (context):`, bold markers, one line listing several IDs or ranges (`TC-SS-01..05`, `TC-LOCAL-01–04`, `TC-GAL-01–05, 07`), or a result written inside a longer line. `(details)` may hold `role: …` and `screenshots: a.png, b.png`.
- Date of a line: the date written on it, else the latest dated `- YYYY-MM-DD` note above it in §5, else the planning file's Started date.

## Which line is the result

The line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line (a NOT RUN written the same day is a placeholder from before the run), otherwise the later line in the file wins. Every other line is kept in the case's History.

## Layout of a document

Title, a "generated, do not edit" line, the source planning files, the references and how-it-works docs, a Summary (counts and latest run), a compact "Results at a glance" table, then one small two-column block per case (title, role, pre-condition, steps, expected, actual, result, method, date, screenshot, ref, planning file), "Bugs found / fixed / blocked" (result lines containing `Bug found`, `Bug fixed` or `BLOCKED`) and History. One block per case instead of one wide table because the Word page is portrait A4: an eleven-column table leaves the Steps and Actual result columns a few characters wide, while the two-column block gives long text the full width.
