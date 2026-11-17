# Test document: Partner

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-12-safari-packages.md`, `docs/planning/features/2026-11-16-local-accounts-and-logo-field.md`, `docs/planning/features/2026-11-16-review-fixes.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §1, §2.1 to §2.5, §12.1, §12.2 |
| How it works | `docs/how-it-works/modules/partner/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 21 | 21 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-PTR-01 | Become a Partner as a guest | Guest | PASS | 2026-11-16 |
| TC-PTR-02 | Become a Partner signed in | User | PASS | 2026-11-16 |
| TC-PTR-03 | Business form errors | Guest, User, Super Admin | PASS | 2026-11-16 |
| TC-PTR-04 | Approve | Super Admin, Partner | PASS | 2026-11-16 |
| TC-PTR-05 | Reject and send again | Super Admin, User | PASS | 2026-11-16 |
| TC-PTR-08 | Partners: edit, parks | Super Admin | PASS | 2026-11-16 |
| TC-PTR-09 | Deactivate / activate | Super Admin, Guest, Partner | PASS | 2026-11-16 |
| TC-PTR-10 | Show phone numbers | Super Admin, Partner | PASS | 2026-11-16 |
| TC-PKSS-01 | Partner in the website frame | Partner (partner@example.in) | PASS | 2026-11-16 |
| TC-LOCAL-11 | Guest Become a Partner form | Guest | PASS | 2026-11-16 |
| TC-LOGO-01 | Default logo and button | Guest | PASS | 2026-11-16 |
| TC-LOGO-02 | Choose a valid file | Guest | PASS | 2026-11-16 |
| TC-LOGO-03 | Remove the chosen file | Guest | PASS | 2026-11-16 |
| TC-LOGO-04 | Wrong type | Guest | PASS | 2026-11-16 |
| TC-LOGO-05 | Too large | Guest | PASS | 2026-11-16 |
| TC-LOGO-06 | Console › Partners › Edit | Super Admin | PASS | 2026-11-16 |
| TC-LOGO-07 | Partner portal request form | User | PASS | 2026-11-16 |
| TC-FIX-05 | A partner without a logo shows the WITW default logo on the website (account button) | partner Tara Nambiar, no logo | PASS | 2026-11-16 |
| TC-FIX-06 | A partner without a logo shows the default logo in Shared Safari comments | partner | PASS | 2026-11-16 |
| TC-FIX-07 | Console partner list and detail show the default logo when there is no logo | Super Admin | PASS | 2026-11-16 |
| TC-FIX-08 | Portal header and Business Profile show the default logo | Partner Tara Nambiar | PASS | 2026-11-16 |

## Cases

### TC-PTR-01 Become a Partner as a guest

| | |
|---|---|
| Title | Become a Partner as a guest |
| Role | Guest |
| Pre-condition | web, guest |
| Steps | P4: account + business details; send |
| Expected result | account created and signed in; "Your account is created and your partner request is sent."; Pending card; no notification |
| Actual result | account ct_ptr_5@ct-test.example created and signed in, toast "Your account is created and your partner request is sent.", Pending card "Your partner request is waiting for approval", no notification row; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-01-1366.png, tc-ptr-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-02 Become a Partner signed in

| | |
|---|---|
| Title | Become a Partner signed in |
| Role | User |
| Pre-condition | user, no request |
| Steps | P4: business details; send |
| Expected result | "Your partner request is sent."; card "Your partner request is waiting for approval" |
| Actual result | signed in as ct_ptr_6: no account fields, toast "Your partner request is sent.", card "Your partner request is waiting for approval"; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-02-1366.png, tc-ptr-02-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-03 Business form errors

| | |
|---|---|
| Title | Business form errors |
| Role | Guest, User, Super Admin |
| Pre-condition | P4, PP2, PC2 Edit |
| Steps | empty; bad phone; bad email; no park; logo GIF; logo over 1 MB; taken email / mobile (guest); 7-char and 73-char password |
| Expected result | the board's message under each field |
| Actual result | P4 at 1366: ok empty: 9 messages; ok bad email / mobile / phone, 7-char password, no park; ok taken email; ok taken mobile \| P4 at 390: ok empty: 9 messages; ok bad email / mobile / phone, 7-char password, no park; ok taken email; ok taken mobile \| 73-char password via API: [{"field":"password","message":"Password can be at most 72 characters."}] \| PP2 at 1366: ok empty fields + no park, ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PP2 at 390: ok empty fields + no park, ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PC2 at 1366: ok empty + every park removed "Choose at least one park.", ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PC2 at 390: ok empty + every park removed "Choose at least one park.", ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-03-1366.png, tc-ptr-03-390.png, tc-ptr-03-taken-1366.png, tc-ptr-03-pp2-1366.png, tc-ptr-03-pc2-1366.png (and -390) |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-04 Approve

| | |
|---|---|
| Title | Approve |
| Role | Super Admin, Partner |
| Pre-condition | Pending request |
| Steps | PC1 Approve |
| Expected result | "{business} is now a partner."; Partner role, request's parks; portal opens to the Dashboard |
| Actual result | ok toast "ct_ptr_Safaris Nine is now a partner."; ok Partner role (101) added, 2 request parks kept; ok portal opens on the Dashboard; no console errors, no failed calls \| 390: ok toast "ct_ptr_Safaris Seven is now a partner."; ok Partner role (101) added, 2 request parks kept; ok portal opens on the Dashboard; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-04-1366.png, tc-ptr-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-05 Reject and send again

| | |
|---|---|
| Title | Reject and send again |
| Role | Super Admin, User |
| Pre-condition | Pending request |
| Steps | Reject empty, 513 characters, valid; user edits on PP2 and sends again |
| Expected result | "Enter the reason." / "Use up to 512 characters."; Rejected with the reason on P4 and PP2; Send again → Pending |
| Actual result | ok empty reason "Enter the reason."; ok 513 chars (API, the box stops typing at 512) "Use up to 512 characters."; ok valid reason: Rejected; ok Rejected on P4 (card, reason is read on PP2) and on PP2 with the reason and Send again; ok Send again: Pending, reason cleared; no console errors, no failed calls \| 390: ok empty reason "Enter the reason."; ok 513 chars (API, the box stops typing at 512) "Use up to 512 characters."; ok valid reason: Rejected; ok Rejected on P4 (card, reason is read on PP2) and on PP2 with the reason and Send again; ok Send again: Pending, reason cleared; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-05-1366.png, tc-ptr-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-08 Partners: edit, parks

| | |
|---|---|
| Title | Partners: edit, parks |
| Role | Super Admin |
| Pre-condition | Active partner |
| Steps | PC2 Edit: details, logo, parks; remove every park |
| Expected result | saved and shown; "Choose at least one park." |
| Actual result | Edit saved business phone 9111600221, logo, parks (+Pench Tiger Reserve - Madhya Pradesh) and the list/reopened dialog show them; "Choose at least one park." when every park is removed (PTR-03 PC2); no console errors, no failed calls \| 390: Edit saved business phone 9111600222, logo, parks (+Corbett Tiger Reserve) and the list/reopened dialog show them; "Choose at least one park." when every park is removed (PTR-03 PC2); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-08-1366.png, tc-ptr-08-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-09 Deactivate / activate

| | |
|---|---|
| Title | Deactivate / activate |
| Role | Super Admin, Guest, Partner |
| Pre-condition | Active partner with shown packages |
| Steps | PC2 Deactivate (confirm); check website and portal; Activate |
| Expected result | packages hidden, portal only the deactivated message; back on activate |
| Actual result | ok confirm dialog shown; ok partner Inactive; ok website hides the partner's packages; ok portal shows only the deactivated message; ok Activate: Active again; ok packages back on the website; ok portal back (partner reactivated); no console errors, no failed calls \| 390: ok confirm dialog shown; ok partner Inactive; ok website hides the partner's packages; ok portal shows only the deactivated message; ok Activate: Active again; ok packages back on the website; ok portal back (partner reactivated); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-09-1366.png, tc-ptr-09-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PTR-10 Show phone numbers

| | |
|---|---|
| Title | Show phone numbers |
| Role | Super Admin, Partner |
| Pre-condition | partner with quote requests |
| Steps | switch on, check PP8; switch off |
| Expected result | phone shown only while on; email never |
| Actual result | ok switch on: phone shown, email never; ok switch off: phone hidden (restored); no console errors, no failed calls \| 390: ok switch on: phone shown, email never; ok switch off: phone hidden (restored); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-ptr-10-1366.png, tc-ptr-10-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-PKSS-01 Partner in the website frame

| | |
|---|---|
| Title | Partner in the website frame |
| Role | Partner (partner@example.in) |
| Pre-condition | approved partner |
| Steps | sign in on the website |
| Expected result | header and account menu show the business; Partner portal link in place of My Quote Requests; Plan Safari and Safari Packages links work; footer links |
| Actual result | header shows the business (Account: Tiger Song Safaris, with its logo); account menu: business name / partner@example.in, My Shared Safaris, Partner portal (-> :3042) in place of My Quote Requests, Change Password, Log Out; Plan Safari -> /parks and Safari Packages -> /packages open; footer Parks and Become a Partner links; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-pkss-01-1366.png, tc-pkss-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-12-safari-packages.md |

### TC-LOCAL-11 Guest Become a Partner form

| | |
|---|---|
| Title | Guest Become a Partner form |
| Role | Guest |
| Pre-condition | signed out |
| Steps | `/become-a-partner` |
| Expected result | guest form with account and business fields |
| Actual result | guest /become-a-partner shows account fields (full name, password) and business fields (business name); no issues |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-local-11-1366.png, tc-local-11-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-01 Default logo and button

| | |
|---|---|
| Title | Default logo and button |
| Role | Guest |
| Pre-condition | `/become-a-partner` |
| Steps | look at the Logo field |
| Expected result | WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line |
| Actual result | WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-01-1366.png, tc-logo-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-02 Choose a valid file

| | |
|---|---|
| Title | Choose a valid file |
| Role | Guest |
| Pre-condition | as 01 |
| Steps | Upload logo, pick a PNG under 1 MB |
| Expected result | preview in the square, file name shown, Remove shown |
| Actual result | preview in the square, name "logo.png", Remove shown; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-02-1366.png, tc-logo-02-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-03 Remove the chosen file

| | |
|---|---|
| Title | Remove the chosen file |
| Role | Guest |
| Pre-condition | after 02 |
| Steps | Remove |
| Expected result | back to the WITW logo, no file name |
| Actual result | back to the WITW logo, no file name; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-03-1366.png, tc-logo-03-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-04 Wrong type

| | |
|---|---|
| Title | Wrong type |
| Role | Guest |
| Pre-condition | as 01 |
| Steps | pick a .gif / .txt |
| Expected result | error under the field, no preview |
| Actual result | error "Choose a JPG, JPEG, PNG or WEBP file." under the field, no preview; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-04-1366.png, tc-logo-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-05 Too large

| | |
|---|---|
| Title | Too large |
| Role | Guest |
| Pre-condition | as 01 |
| Steps | pick a 2 MB JPG |
| Expected result | "up to 1 MB" error under the field |
| Actual result | error "Choose a file up to 1 MB." under the field; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-05-1366.png, tc-logo-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-06 Console › Partners › Edit

| | |
|---|---|
| Title | Console › Partners › Edit |
| Role | Super Admin |
| Pre-condition | Super Admin, partner with logo |
| Steps | open Edit |
| Expected result | current logo in the square; Upload logo, Remove; a new file previews and saves |
| Actual result | Edit on ct_ptr_Safaris One: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls \| 390: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-06-1366.png, tc-logo-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-LOGO-07 Partner portal request form

| | |
|---|---|
| Title | Partner portal request form |
| Role | User |
| Pre-condition | signed in, no request |
| Steps | `/partner-request` |
| Expected result | same field as 01 |
| Actual result | portal /partner-request (user@example.in, no request): WITW logo, Upload logo, no "No file chosen", chosen file "logo.png" previews (nothing sent); no console errors, no failed calls |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-logo-07-1366.png, tc-logo-07-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-local-accounts-and-logo-field.md |

### TC-FIX-05 A partner without a logo shows the WITW default logo on the website (account button)

| | |
|---|---|
| Title | A partner without a logo shows the WITW default logo on the website (account button) |
| Role | partner Tara Nambiar, no logo |
| Pre-condition | Signed in on the website as an active partner with no logo (tara.nambiar@packages-demo.test) |
| Steps | 1. Open /. 2. Look at the account button in the header. |
| Expected result | The WITW default logo, not initials |
| Actual result | the website account button shows /witw/logo.png (alt "No logo yet"), no initials; only console message is the 401 of the pre-sign-in session check (same on every sign-in page). |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-05-1366.png, tc-fix-05-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §1, §2.1 to §2.5, §12.1, §12.2 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-06 A partner without a logo shows the default logo in Shared Safari comments

| | |
|---|---|
| Title | A partner without a logo shows the default logo in Shared Safari comments |
| Role | partner |
| Pre-condition | A safari with a comment by that partner, or the partner viewing a safari |
| Steps | 1. Open a safari page; read the comment avatar. |
| Expected result | The default logo in the avatar, the person's own commenting name unchanged; people keep initials |
| Actual result | on /shared-safaris/ct-ss-started the partner's avatar is the default logo; people's avatars keep initials. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-06-1366.png, tc-fix-06-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-07 Console partner list and detail show the default logo when there is no logo

| | |
|---|---|
| Title | Console partner list and detail show the default logo when there is no logo |
| Role | Super Admin |
| Pre-condition | Partner without logo in Console › Partners |
| Steps | 1. Open Console › Partners. 2. Look at the Business cell and the logo box. |
| Expected result | The default logo, no initials |
| Actual result | Console Partners Business cell shows the default logo for Tiger Trail Tours; the partner-request view dialog (Wild Routes India) logo box shows the default logo. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-07-1366.png, tc-fix-07-390.png, tc-fix-07b-1366.png, tc-fix-07b-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

### TC-FIX-08 Portal header and Business Profile show the default logo

| | |
|---|---|
| Title | Portal header and Business Profile show the default logo |
| Role | Partner Tara Nambiar |
| Pre-condition | Signed in to the portal as the partner without a logo |
| Steps | 1. Look at the header user button. 2. Open Business Profile. |
| Expected result | Default logo in both; a partner with a logo shows the logo |
| Actual result | portal header avatar and Business Profile logo box show the default logo. (A partner with a logo now shows it in the header too; not run for partner@example.in.) |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-fix-08-1366.png, tc-fix-08-390.png, tc-fix-08b-1366.png, tc-fix-08b-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow §2.5 |
| Planning file | docs/planning/features/2026-11-16-review-fixes.md |

## Bugs found / fixed / blocked

None recorded.

## History

### TC-PTR-01 history

- 2026-11-13 PASS: guest filled account + business details, picked two parks and a PNG logo; toast "Your account is created and your partner request is sent."; signed in (account menu shows the new name); Pending card ("Your partner request is waiting for approval", badge Pending, Open Partner portal); logo stored (`logoVersion` set, parks Gir + Kanha); no bell badge; survives reload.
- 2026-11-16 PASS (current): account ct_ptr_5@ct-test.example created and signed in, toast "Your account is created and your partner request is sent.", Pending card "Your partner request is waiting for approval", no notification row; no console errors, no failed calls

### TC-PTR-02 history

- 2026-11-13 PASS: signed-in user without a request: no Account details section; empty send shows the five business messages; valid send → toast "Your partner request is sent." and the Pending card.
- 2026-11-16 PASS (current): signed in as ct_ptr_6: no account fields, toast "Your partner request is sent.", card "Your partner request is waiting for approval"; no console errors, no failed calls

### TC-PTR-03 history

- 2026-11-13 PASS: empty guest form shows every board message under its field; phone "1234567890" → "Enter a 10-digit number starting with 6, 7, 8 or 9."; email "bad" → "Enter a valid email address."; no park → "Choose at least one park."; GIF → "Choose a JPG, JPEG, PNG or WEBP file."; 1.4 MB PNG → "Choose a file up to 1 MB."; 7-character password → "Use at least 8 characters."; taken email → "An account with this email already exists."; taken mobile → "An account with this mobile number already exists."; PC2 Edit shows the same business messages and removing every park gives "Choose at least one park.". The 73-character password can't be typed (maxlength 72): checked by `curl` → 422 "Password can be at most 72 characters.". The PP2 part waits for Phase 3.
- 2026-11-13 PASS: ananya.iyer's empty form shows the five messages; phone 1234567890 "Enter a 10-digit number starting with 6, 7, 8 or 9."; "bad" email "Enter a valid email address."; GIF "Choose a JPG, JPEG, PNG or WEBP file."; 1.3 MB PNG "Choose a file up to 1 MB."; isha.kapoor's form with the name cleared "Enter the business name.". Not sent for ananya (no data removal allowed in this run).
- 2026-11-16 PASS (current): P4 at 1366: ok empty: 9 messages; ok bad email / mobile / phone, 7-char password, no park; ok taken email; ok taken mobile \| P4 at 390: ok empty: 9 messages; ok bad email / mobile / phone, 7-char password, no park; ok taken email; ok taken mobile \| 73-char password via API: [{"field":"password","message":"Password can be at most 72 characters."}] \| PP2 at 1366: ok empty fields + no park, ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PP2 at 390: ok empty fields + no park, ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PC2 at 1366: ok empty + every park removed "Choose at least one park.", ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg \| PC2 at 390: ok empty + every park removed "Choose at least one park.", ok bad phone / email, ok logo gal.gif, ok logo logo_big.jpg

### TC-PTR-04 history

- 2026-11-13 PASS: PC1 lists Pending first; Approve from the row ("ct_P2 Guest Two Tours is now a partner.") and from the View dialog at 390 px ("ct_P2 Fourth Tours is now a partner."); rows leave the list; query: Partner role 101 on each account, parks kept; P4 shows the Active card ("You are a partner"). "Portal opens to the Dashboard" waits for Phase 3.
- 2026-11-16 PASS (current): ok toast "ct_ptr_Safaris Nine is now a partner."; ok Partner role (101) added, 2 request parks kept; ok portal opens on the Dashboard; no console errors, no failed calls \| 390: ok toast "ct_ptr_Safaris Seven is now a partner."; ok Partner role (101) added, 2 request parks kept; ok portal opens on the Dashboard; no console errors, no failed calls

### TC-PTR-05 history

- 2026-11-13 PASS: Reject with an empty reason → "Enter the reason."; 513 characters can't be typed (box stops at 512), `curl` → 422 "Use up to 512 characters."; valid reason from the row ("Request rejected. ct_P2 Third Owner sees the reason.") and from the View dialog (the view closes as the reject box opens); row becomes Rejected with only View; the View dialog shows "Reject reason"; P4 as that user shows the Rejected card. Send again and the reason on PP2 wait for Phase 3.
- 2026-11-13 PASS: isha.kapoor's PP2 shows the red banner "Your request was not approved." with the reason and the form prefilled (name, owner, phone, email, park Periyar, no logo); Send again (with a changed About at 1366) → toast "Your partner request is sent." and the Pending card with her details. Her row was then put back with an UPDATE (status 2, reason, dates, about NULL) after each run.
- 2026-11-16 PASS (current): ok empty reason "Enter the reason."; ok 513 chars (API, the box stops typing at 512) "Use up to 512 characters."; ok valid reason: Rejected; ok Rejected on P4 (card, reason is read on PP2) and on PP2 with the reason and Send again; ok Send again: Pending, reason cleared; no console errors, no failed calls \| 390: ok empty reason "Enter the reason."; ok 513 chars (API, the box stops typing at 512) "Use up to 512 characters."; ok valid reason: Rejected; ok Rejected on P4 (card, reason is read on PP2) and on PP2 with the reason and Send again; ok Send again: Pending, reason cleared; no console errors, no failed calls

### TC-PTR-08 history

- 2026-11-13 PASS: Edit prefilled with the logo; changed name, owner, phone, email, about, logo (a new `logoVersion`) and parks in one Save → "Partner details saved."; list and API show the new values; Remove logo + Save → `logoVersion` null, initials shown; every park removed → "Choose at least one park.".
- 2026-11-16 PASS (current): Edit saved business phone 9111600221, logo, parks (+Pench Tiger Reserve - Madhya Pradesh) and the list/reopened dialog show them; "Choose at least one park." when every park is removed (PTR-03 PC2); no console errors, no failed calls \| 390: Edit saved business phone 9111600222, logo, parks (+Corbett Tiger Reserve) and the list/reopened dialog show them; "Choose at least one park." when every park is removed (PTR-03 PC2); no console errors, no failed calls

### TC-PTR-09 history

- 2026-11-13 PASS: Deactivate dialog text as the board, Cancel changes nothing, Deactivate → "… is deactivated." and status Inactive; P4 as that partner shows "Your partner account is deactivated"; Activate dialog → "… is active again." and Active.
- 2026-11-16 PASS (current): ok confirm dialog shown; ok partner Inactive; ok website hides the partner's packages; ok portal shows only the deactivated message; ok Activate: Active again; ok packages back on the website; ok portal back (partner reactivated); no console errors, no failed calls \| 390: ok confirm dialog shown; ok partner Inactive; ok website hides the partner's packages; ok portal shows only the deactivated message; ok Activate: Active again; ok packages back on the website; ok portal back (partner reactivated); no console errors, no failed calls

### TC-PTR-10 history

- 2026-11-13 PASS: switch on → "… now sees phone numbers in quote requests.", switch off → "… no longer sees phone numbers."; the switch state follows. The PP8 part waits for Phase 7.
- 2026-11-14 PASS: the Show phone numbers switch of Jungle Trails Safaris off in PC2: toast "Jungle Trails Safaris no longer sees phone numbers."; Vivek's PP8 then shows the hidden note and no phone; switch on: "Jungle Trails Safaris now sees phone numbers in quote requests." and the phones are back. Email never shown. Screenshots: `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-1366.png`, `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase7/PP8-vivek-hidden-390.png`.
- 2026-11-16 PASS (current): ok switch on: phone shown, email never; ok switch off: phone hidden (restored); no console errors, no failed calls \| 390: ok switch on: phone shown, email never; ok switch off: phone hidden (restored); no console errors, no failed calls

### TC-PKSS-01 history

- 2026-11-14 PASS: vivek.rao: header "Account: Jungle Trails Safaris" with initials JT (no logo); ct_pkss_a (partner with a logo): header shows the logo picture (loaded, natural width > 0), label "Account: ct_ PKSS Wild Tours"; comments on safari 114 (`ct-pkss-j1`) written as "ct_ PKSS Wild Tours" with the logo, also the one written before the approval; the new comment posted as the partner shows the business and logo; no console errors or failed calls (only the expected 401 on sign-in). Screenshots: /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W1-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W3-ctpartner-1366.png, /tmp/claude-1000/-home-triline-Documents-Workshop-my-project/221fff66-a113-435b-a149-7876593d3e5a/scratchpad/screens/phase8/W3-ctpartner-390.png.
- 2026-11-16 PASS (current): header shows the business (Account: Tiger Song Safaris, with its logo); account menu: business name / partner@example.in, My Shared Safaris, Partner portal (-> :3042) in place of My Quote Requests, Change Password, Log Out; Plan Safari -> /parks and Safari Packages -> /packages open; footer Parks and Become a Partner links; no console errors.

### TC-LOCAL-11 history

- 2026-11-16 PASS: signed out, `/become-a-partner` shows the guest form with account and business fields; no errors.
- 2026-11-16 PASS (current): guest /become-a-partner shows account fields (full name, password) and business fields (business name); no issues

### TC-LOGO-01 history

- 2026-11-16 FAIL: the field's `<label for>` named the Upload logo button "Logo" (screen readers would not hear "Upload logo"). Fixed: the field title is a label span and the button is labelled by both ("Logo Upload logo").
- 2026-11-16 PASS: WITW logo image loaded in the square, Upload logo button, native input hidden (1 px), no "Choose File / No file chosen", helper "JPG, JPEG, PNG or WEBP, up to 1 MB".
- 2026-11-16 PASS (current): WITW logo in the square, Upload logo button, no "Choose File / No file chosen", helper line; no console errors, no failed calls

### TC-LOGO-02 history

- 2026-11-16 PASS: Upload logo opens the file chooser; a PNG previews in the square, "ct_logo.png" shown, Remove shown.
- 2026-11-16 PASS (current): preview in the square, name "logo.png", Remove shown; no console errors, no failed calls

### TC-LOGO-03 history

- 2026-11-16 PASS: Remove → WITW logo back, file name and Remove gone.
- 2026-11-16 PASS (current): back to the WITW logo, no file name; no console errors, no failed calls

### TC-LOGO-04 history

- 2026-11-16 PASS: a GIF → "Choose a JPG, JPEG, PNG or WEBP file." under the helper, no preview.
- 2026-11-16 PASS (current): error "Choose a JPG, JPEG, PNG or WEBP file." under the field, no preview; no console errors, no failed calls

### TC-LOGO-05 history

- 2026-11-16 PASS: a 2.2 MB JPG → "Choose a file up to 1 MB."; no errors, no sideways scroll.
- 2026-11-16 PASS (current): error "Choose a file up to 1 MB." under the field; no console errors, no failed calls

### TC-LOGO-06 history

- 2026-11-16 PASS: console › Partners › Edit (table row on desktop, card on phone) shows the partner's current logo; Upload logo previews a JPG with its name; Save (1366) → logo `PUT` 200. The partner's own logo was put back the same way afterwards.
- 2026-11-16 PASS (current): Edit on ct_ptr_Safaris One: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls \| 390: ok current logo in the square, Upload logo and Remove; ok new file previews; ok saved: public logo 200 image/jpeg; no console errors, no failed calls

### TC-LOGO-07 history

- 2026-11-16 PASS: partner portal `/partner-request` (user@example.in, no request) shows the same field; a chosen PNG shows its name; nothing sent.
- 2026-11-16 PASS (current): portal /partner-request (user@example.in, no request): WITW logo, Upload logo, no "No file chosen", chosen file "logo.png" previews (nothing sent); no console errors, no failed calls
