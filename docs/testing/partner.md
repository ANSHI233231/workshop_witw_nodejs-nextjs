# Test document: Partner

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §1, §2.1 to §2.5, §12.1, §12.2 |
| How it works | `docs/how-it-works/modules/partner/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 17 | 17 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PTR-01 | Become a Partner as a guest | — | PASS | 2026-11-13 |
| TC-PTR-02 | Become a Partner signed in | — | PASS | 2026-11-13 |
| TC-PTR-03 | Business form errors | — | PASS | 2026-11-13 |
| TC-PTR-04 | Approve | — | PASS | 2026-11-13 |
| TC-PTR-05 | Reject and send again | — | PASS | 2026-11-13 |
| TC-PTR-08 | Partners: edit, parks | — | PASS | 2026-11-13 |
| TC-PTR-09 | Deactivate / activate | — | PASS | 2026-11-13 |
| TC-PTR-10 | Show phone numbers | — | PASS | 2026-11-14 |
| TC-PKSS-01 | Partner in the website frame | — | PASS | 2026-11-14 |
| TC-LOCAL-11 | Guest Become a Partner form | — | PASS | 2026-11-16 |
| TC-LOGO-01 | Default logo and button | — | PASS | 2026-11-16 |
| TC-LOGO-02 | Choose a valid file | — | PASS | 2026-11-16 |
| TC-LOGO-03 | Remove the chosen file | — | PASS | 2026-11-16 |
| TC-LOGO-04 | Wrong type | — | PASS | 2026-11-16 |
| TC-LOGO-05 | Too large | — | PASS | 2026-11-16 |
| TC-LOGO-06 | Console › Partners › Edit | — | PASS | 2026-11-16 |
| TC-LOGO-07 | Partner portal request form | — | PASS | 2026-11-16 |

## Cases

### TC-PTR-01 Become a Partner as a guest

| | |
|---|---|
| Title | Become a Partner as a guest |
| Role | — |
| Pre-condition | web, guest |
| Steps | P4: account + business details; send |
| Expected result | account created and signed in; "Your account is created and your partner request is sent."; Pending card; no notification |
| Actual result | guest filled account + business details, picked two parks and a PNG logo; toast "Your account is created and your partner request is sent."; signed in (account menu shows the new name); Pending card ("Your partner request is waiting for approval", badge Pending, Open Partner portal); logo stored (`logoVersion` set, parks Gir + Kanha); no bell badge; survives reload. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-02 Become a Partner signed in

| | |
|---|---|
| Title | Become a Partner signed in |
| Role | — |
| Pre-condition | user, no request |
| Steps | P4: business details; send |
| Expected result | "Your partner request is sent."; card "Your partner request is waiting for approval" |
| Actual result | signed-in user without a request: no Account details section; empty send shows the five business messages; valid send → toast "Your partner request is sent." and the Pending card. |
| Result | PASS |
| Method | browser, 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-03 Business form errors

| | |
|---|---|
| Title | Business form errors |
| Role | — |
| Pre-condition | P4, PP2, PC2 Edit |
| Steps | empty; bad phone; bad email; no park; logo GIF; logo over 1 MB; taken email / mobile (guest); 7-char and 73-char password |
| Expected result | the board's message under each field |
| Actual result | ananya.iyer's empty form shows the five messages; phone 1234567890 "Enter a 10-digit number starting with 6, 7, 8 or 9."; "bad" email "Enter a valid email address."; GIF "Choose a JPG, JPEG, PNG or WEBP file."; 1.3 MB PNG "Choose a file up to 1 MB."; isha.kapoor's form with the name cleared "Enter the business name.". Not sent for ananya (no data removal allowed in this run). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-04 Approve

| | |
|---|---|
| Title | Approve |
| Role | — |
| Pre-condition | Pending request |
| Steps | PC1 Approve |
| Expected result | "{business} is now a partner."; Partner role, request's parks; portal opens to the Dashboard |
| Actual result | PC1 lists Pending first; Approve from the row ("ct_P2 Guest Two Tours is now a partner.") and from the View dialog at 390 px ("ct_P2 Fourth Tours is now a partner."); rows leave the list; query: Partner role 101 on each account, parks kept; P4 shows the Active card ("You are a partner"). "Portal opens to the Dashboard" waits for Phase 3. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-05 Reject and send again

| | |
|---|---|
| Title | Reject and send again |
| Role | — |
| Pre-condition | Pending request |
| Steps | Reject empty, 513 characters, valid; user edits on PP2 and sends again |
| Expected result | "Enter the reason." / "Use up to 512 characters."; Rejected with the reason on P4 and PP2; Send again → Pending |
| Actual result | isha.kapoor's PP2 shows the red banner "Your request was not approved." with the reason and the form prefilled (name, owner, phone, email, park Periyar, no logo); Send again (with a changed About at 1366) → toast "Your partner request is sent." and the Pending card with her details. Her row was then put back with an UPDATE (status 2, reason, dates, about NULL) after each run. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-08 Partners: edit, parks

| | |
|---|---|
| Title | Partners: edit, parks |
| Role | — |
| Pre-condition | Active partner |
| Steps | PC2 Edit: details, logo, parks; remove every park |
| Expected result | saved and shown; "Choose at least one park." |
| Actual result | Edit prefilled with the logo; changed name, owner, phone, email, about, logo (a new `logoVersion`) and parks in one Save → "Partner details saved."; list and API show the new values; Remove logo + Save → `logoVersion` null, initials shown; every park removed → "Choose at least one park.". |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-09 Deactivate / activate

| | |
|---|---|
| Title | Deactivate / activate |
| Role | — |
| Pre-condition | Active partner with shown packages |
| Steps | PC2 Deactivate (confirm); check website and portal; Activate |
| Expected result | packages hidden, portal only the deactivated message; back on activate |
| Actual result | Deactivate dialog text as the board, Cancel changes nothing, Deactivate → "… is deactivated." and status Inactive; P4 as that partner shows "Your partner account is deactivated"; Activate dialog → "… is active again." and Active. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-13 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-10 Show phone numbers

| | |
|---|---|
| Title | Show phone numbers |
| Role | — |
| Pre-condition | partner with quote requests |
| Steps | switch on, check PP8; switch off |
| Expected result | phone shown only while on; email never |
| Actual result | the Show phone numbers switch of Jungle Trails Safaris off in PC2: toast "Jungle Trails Safaris no longer sees phone numbers."; Vivek's PP8 then shows the hidden note and no phone; switch on: "Jungle Trails Safaris now sees phone numbers in quote requests." and the phones are back. Email never shown. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-390.png`. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKSS-01 Partner in the website frame

| | |
|---|---|
| Title | Partner in the website frame |
| Role | — |
| Pre-condition | approved partner |
| Steps | sign in on the website |
| Expected result | header and account menu show the business; Partner portal link in place of My Quote Requests; Plan Safari and Safari Packages links work; footer links |
| Actual result | vivek.rao: header "Account: Jungle Trails Safaris" with initials JT (no logo); ct_pkss_a (partner with a logo): header shows the logo picture (loaded, natural width > 0), label "Account: ct_ PKSS Wild Tours"; comments on safari 114 (`ct-pkss-j1`) written as "ct_ PKSS Wild Tours" with the logo, also the one written before the approval; the new comment posted as the partner shows the business and logo; no console errors or failed calls (only the expected 401 on sign-in). Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W3-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W3-ctpartner-390.png. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-14 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-11 Guest Become a Partner form

| | |
|---|---|
| Title | Guest Become a Partner form |
| Role | — |
| Pre-condition | signed out |
| Steps | `/become-a-partner` |
| Expected result | guest form with account and business fields |
| Actual result | signed out, `/become-a-partner` shows the guest form with account and business fields; no errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-01 Default logo and button

| | |
|---|---|
| Title | Default logo and button |
| Role | — |
| Pre-condition | `/become-a-partner` |
| Steps | look at the Logo field |
| Expected result | WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line |
| Actual result | WITW logo image loaded in the square, Upload logo button, native input hidden (1 px), no "Choose File / No file chosen", helper "JPG, JPEG, PNG or WEBP, up to 1 MB". |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-02 Choose a valid file

| | |
|---|---|
| Title | Choose a valid file |
| Role | — |
| Pre-condition | as 01 |
| Steps | Upload logo, pick a PNG under 1 MB |
| Expected result | preview in the square, file name shown, Remove shown |
| Actual result | Upload logo opens the file chooser; a PNG previews in the square, "ct_logo.png" shown, Remove shown. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-03 Remove the chosen file

| | |
|---|---|
| Title | Remove the chosen file |
| Role | — |
| Pre-condition | after 02 |
| Steps | Remove |
| Expected result | back to the WITW logo, no file name |
| Actual result | Remove → WITW logo back, file name and Remove gone. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-04 Wrong type

| | |
|---|---|
| Title | Wrong type |
| Role | — |
| Pre-condition | as 01 |
| Steps | pick a .gif / .txt |
| Expected result | error under the field, no preview |
| Actual result | a GIF → "Choose a JPG, JPEG, PNG or WEBP file." under the helper, no preview. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-05 Too large

| | |
|---|---|
| Title | Too large |
| Role | — |
| Pre-condition | as 01 |
| Steps | pick a 2 MB JPG |
| Expected result | "up to 1 MB" error under the field |
| Actual result | a 2.2 MB JPG → "Choose a file up to 1 MB."; no errors, no sideways scroll. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-06 Console › Partners › Edit

| | |
|---|---|
| Title | Console › Partners › Edit |
| Role | — |
| Pre-condition | Super Admin, partner with logo |
| Steps | open Edit |
| Expected result | current logo in the square; Upload logo, Remove; a new file previews and saves |
| Actual result | console › Partners › Edit (table row on desktop, card on phone) shows the partner's current logo; Upload logo previews a JPG with its name; Save (1366) → logo `PUT` 200. The partner's own logo was put back the same way afterwards. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-07 Partner portal request form

| | |
|---|---|
| Title | Partner portal request form |
| Role | — |
| Pre-condition | signed in, no request |
| Steps | `/partner-request` |
| Expected result | same field as 01 |
| Actual result | partner portal `/partner-request` (user@example.in, no request) shows the same field; a chosen PNG shows its name; nothing sent. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | — |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PTR-03 history

- 2026-11-13 PASS: empty guest form shows every board message under its field; phone "1234567890" → "Enter a 10-digit number starting with 6, 7, 8 or 9."; email "bad" → "Enter a valid email address."; no park → "Choose at least one park."; GIF → "Choose a JPG, JPEG, PNG or WEBP file."; 1.4 MB PNG → "Choose a file up to 1 MB."; 7-character password → "Use at least 8 characters."; taken email → "An account with this email already exists."; taken mobile → "An account with this mobile number already exists."; PC2 Edit shows the same business messages and removing every park gives "Choose at least one park.". The 73-character password can't be typed (maxlength 72): checked by `curl` → 422 "Password can be at most 72 characters.". The PP2 part waits for Phase 3.
- 2026-11-13 PASS (current): ananya.iyer's empty form shows the five messages; phone 1234567890 "Enter a 10-digit number starting with 6, 7, 8 or 9."; "bad" email "Enter a valid email address."; GIF "Choose a JPG, JPEG, PNG or WEBP file."; 1.3 MB PNG "Choose a file up to 1 MB."; isha.kapoor's form with the name cleared "Enter the business name.". Not sent for ananya (no data removal allowed in this run).

### TC-PTR-05 history

- 2026-11-13 PASS: Reject with an empty reason → "Enter the reason."; 513 characters can't be typed (box stops at 512), `curl` → 422 "Use up to 512 characters."; valid reason from the row ("Request rejected. ct_P2 Third Owner sees the reason.") and from the View dialog (the view closes as the reject box opens); row becomes Rejected with only View; the View dialog shows "Reject reason"; P4 as that user shows the Rejected card. Send again and the reason on PP2 wait for Phase 3.
- 2026-11-13 PASS (current): isha.kapoor's PP2 shows the red banner "Your request was not approved." with the reason and the form prefilled (name, owner, phone, email, park Periyar, no logo); Send again (with a changed About at 1366) → toast "Your partner request is sent." and the Pending card with her details. Her row was then put back with an UPDATE (status 2, reason, dates, about NULL) after each run.

### TC-PTR-10 history

- 2026-11-13 PASS: switch on → "… now sees phone numbers in quote requests.", switch off → "… no longer sees phone numbers."; the switch state follows. The PP8 part waits for Phase 7.
- 2026-11-14 PASS (current): the Show phone numbers switch of Jungle Trails Safaris off in PC2: toast "Jungle Trails Safaris no longer sees phone numbers."; Vivek's PP8 then shows the hidden note and no phone; switch on: "Jungle Trails Safaris now sees phone numbers in quote requests." and the phones are back. Email never shown. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-390.png`.

### TC-LOGO-01 history

- 2026-11-16 FAIL: the field's `<label for>` named the Upload logo button "Logo" (screen readers would not hear "Upload logo"). Fixed: the field title is a label span and the button is labelled by both ("Logo Upload logo").
- 2026-11-16 PASS (current): WITW logo image loaded in the square, Upload logo button, native input hidden (1 px), no "Choose File / No file chosen", helper "JPG, JPEG, PNG or WEBP, up to 1 MB".
