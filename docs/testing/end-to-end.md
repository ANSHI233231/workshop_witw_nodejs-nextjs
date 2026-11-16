# Test document: End-to-end

Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.

| | |
|---|---|
| Source planning files | `docs/planning/features/2026-11-16-full-test-and-docs.md` |
| Requirement and workflow references | `docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md` §1 to §13; `docs/how-it-works/workflows/WITW-Packages-Workflow.md` §1 to §13 |
| How it works | `docs/how-it-works/README.md` |
| Latest run | 2026-11-16 |

## Summary

| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |
|---|---|---|---|---|---|---|
| 10 | 10 | 0 | 0 | 0 | 0 | 0 |

The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.

## Results at a glance

| ID | Title | Role | Result | Date |
|---|---|---|---|---|
| TC-E2E-01 | A guest sends Become a Partner as a new account | Guest | PASS | 2026-11-16 |
| TC-E2E-02 | Super Admin approves the partner request in the console | Super Admin | PASS | 2026-11-16 |
| TC-E2E-03 | The partner signs in to the partner portal, creates a gallery with photos and sends it | Partner | PASS | 2026-11-16 |
| TC-E2E-04 | Super Admin approves the gallery | Super Admin | PASS | 2026-11-16 |
| TC-E2E-05 | The partner creates a package using that gallery and sends the version | Partner | PASS | 2026-11-16 |
| TC-E2E-06 | Super Admin approves the package and it is shown on the website | Super Admin | PASS | 2026-11-16 |
| TC-E2E-07 | A guest finds the package on the website packages list and on the park page | Guest | PASS | 2026-11-16 |
| TC-E2E-08 | A user sends a quote request for the package | User | PASS | 2026-11-16 |
| TC-E2E-09 | The partner sees the request in the portal Quote Requests and marks it Hot, then Cold | Partner | PASS | 2026-11-16 |
| TC-E2E-10 | Super Admin sees the request in console Quote Requests with the mark | Super Admin | PASS | 2026-11-16 |

## Cases

### TC-E2E-01 A guest sends Become a Partner as a new account

| | |
|---|---|
| Title | A guest sends Become a Partner as a new account |
| Role | Guest |
| Pre-condition | Signed out; no account `ct_e2e_1@ct-test.example` |
| Steps | 1. Open website `/become-a-partner`. 2. Fill Account details (name, email `ct_e2e_1@ct-test.example`, mobile, password) and Business details (business `ct_E2E Safaris`, owner, phone, email, about, one park). 3. Send request. |
| Expected result | Toast "Your account is created and your partner request is sent."; page shows the Pending status card; the account exists and a Pending partner request exists in the DB; no notification to anyone (WITW-Packages-Workflow.md §11) |
| Actual result | guest filled Account details and Business details (ct_E2E Safaris, Kanha), toast "Your account is created and your partner request is sent.", Pending status card; DB: user ct_e2e_1@ct-test.example, partner status 1 (Pending), no notification to anyone. At 390 px signed in as the new account and saw the same Pending card; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-01-form-1366.png, tc-e2e-01-1366.png, tc-e2e-01-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §2.1-§2.4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-02 Super Admin approves the partner request in the console

| | |
|---|---|
| Title | Super Admin approves the partner request in the console |
| Role | Super Admin |
| Pre-condition | TC-E2E-01 done |
| Steps | 1. Sign in to the console as anshika@example.in. 2. Partner Requests: find `ct_E2E Safaris` (Pending). 3. Approve. |
| Expected result | Request becomes Active, appears in Partners with the Partner role; no notification is sent to the partner |
| Actual result | Partner Requests showed ct_E2E Safaris Pending; Approve (icon, no confirm dialog) made it Active (DB status 3), Partner role (meta_role 101) given, listed in Partners as Active with Kanha; no notification sent to the partner; no console errors. 390 px: Partners and Partner Requests lists fit. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-02-list-1366.png, tc-e2e-02-1366.png, tc-e2e-02-390.png, tc-e2e-02-requests-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §12.1, §2.4 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-03 The partner signs in to the partner portal, creates a gallery with photos and sends it

| | |
|---|---|
| Title | The partner signs in to the partner portal, creates a gallery with photos and sends it |
| Role | Partner |
| Pre-condition | TC-E2E-02 done |
| Steps | 1. Sign in at the partner portal with the ct_e2e_1 account. 2. Gallery > New gallery: name `ct_E2E Gallery`, a park, two photos. 3. Save, then Send for approval. |
| Expected result | Gallery is Waiting for approval, listed in the portal Gallery; the 1101 notification goes to Super Admins (see TC-NOTIF-13) |
| Actual result | ct_e2e_1 signs in to the portal; New gallery ct_E2E Gallery, Kanha, two JPG photos, "Gallery saved as a draft.", then "Gallery sent for approval." and status Waiting for Approval; 1101 rows created for the 3 Super Admins; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-03-dashboard-1366.png, tc-e2e-03-form-1366.png, tc-e2e-03-saved-1366.png, tc-e2e-03-send-1366.png, tc-e2e-03-1366.png, tc-e2e-03-390.png, tc-e2e-03-list-1366.png, tc-e2e-03-list-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §3, §7, §7.1 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-04 Super Admin approves the gallery

| | |
|---|---|
| Title | Super Admin approves the gallery |
| Role | Super Admin |
| Pre-condition | TC-E2E-03 done |
| Steps | 1. Console > Gallery Approvals: open `ct_E2E Gallery`. 2. Approve. |
| Expected result | Gallery is Approved; partner portal shows it Approved and usable in packages |
| Actual result | Gallery Approvals listed ct_E2E Gallery (New gallery, 2 photos), View photos opened, Approve showed "ct_E2E Gallery is approved." (no confirm dialog) and Galleries lists it Approved with 2 photos; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-04-list-1366.png, tc-e2e-04-view-1366.png, tc-e2e-04-confirm-1366.png, tc-e2e-04-1366.png, tc-e2e-04-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §12.6, §7.1 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-05 The partner creates a package using that gallery and sends the version

| | |
|---|---|
| Title | The partner creates a package using that gallery and sends the version |
| Role | Partner |
| Pre-condition | TC-E2E-04 done |
| Steps | 1. Portal > Packages > New package. 2. Fill the five sections (Basic with park, gallery `ct_E2E Gallery`, itinerary, inclusions, getting there, FAQs). 3. Save and Send for approval. |
| Expected result | Version v1 is Waiting; package listed in the portal; the 1201 notification goes to Super Admins (TC-NOTIF-14) |
| Actual result | package ct_E2E Safari Package created (Basic with Kanha, 2 days, Shared / Gypsy / Wildlife / Standard, Rs 12,000 per person, Rs 24,000 total, gallery ct_E2E Gallery), Itinerary 2 days, Inclusions, Getting there, 1 FAQ saved section by section (DB: 2 days, 1 FAQ, getting there text); "Send for approval?" dialog > Send, "Version 1 sent for approval." v1 Waiting; 1201 rows for the 3 Super Admins; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-05-basic-1366.png, tc-e2e-05-itinerary-1366.png, tc-e2e-05-faqs-1366.png, tc-e2e-05-send-1366.png, tc-e2e-05-1366.png, tc-e2e-05-390.png, tc-e2e-05-1-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §4.1-§4.5, §5 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-06 Super Admin approves the package and it is shown on the website

| | |
|---|---|
| Title | Super Admin approves the package and it is shown on the website |
| Role | Super Admin |
| Pre-condition | TC-E2E-05 done |
| Steps | 1. Console > Package Approvals: open the version. 2. Approve. 3. Console > Packages: check Website status Active. |
| Expected result | Version Approved (live at once), website status Active; partner is Active so it is shown on the website |
| Actual result | Package Approvals row (First version), Approve (no dialog) took it off the list; console Packages shows ct_E2E Safari Package v1 Active; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-06-list-1366.png, tc-e2e-06-1366.png, tc-e2e-06-390.png, tc-e2e-06-1-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §12.3, §6.1 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-07 A guest finds the package on the website packages list and on the park page

| | |
|---|---|
| Title | A guest finds the package on the website packages list and on the park page |
| Role | Guest |
| Pre-condition | TC-E2E-06 done |
| Steps | 1. Signed out, open `/packages`; search `ct_E2E`. 2. Open the package page. 3. Open the park's page from Parks. |
| Expected result | The card shows in the list, its package page opens with the partner name, and the park page lists it |
| Actual result | /packages search "ct_E2E" shows the card (1 Night, 2 Days, 2 Shared Safaris, Rs 12,000/Person, total Rs 24,000), /packages/ct-e2e-safari-package opens with its overview, gallery 1 / 2 and "Log in to send a quote request"; /parks/kanha-tiger-reserve Packages tab lists it; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-07-list-1366.png, tc-e2e-07-package-1366.png, tc-e2e-07-park-1366.png, tc-e2e-07-list-390.png, tc-e2e-07-package-390.png, tc-e2e-07-park-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §8.1, §8.2, §10 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-08 A user sends a quote request for the package

| | |
|---|---|
| Title | A user sends a quote request for the package |
| Role | User |
| Pre-condition | TC-E2E-07 done; user@example.in signed in on the website |
| Steps | 1. Open the package page. 2. Request a quote with dates, travellers and a `ct_` message. 3. Send. |
| Expected result | Success message; the request is in My Quote Requests; the partner gets a 1301 notification |
| Actual result | user@example.in sent travellers 3, a start date 10 days ahead and a ct_ note; toasts "Your quote request is sent." and "...sent to ct_E2E Safaris."; My Quote Requests shows it (2 active); DB: 1301 row to the partner (client app 5); no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-08-form-1366.png, tc-e2e-08-1366.png, tc-e2e-08-my-1366.png, tc-e2e-08-1-390.png, tc-e2e-08-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §9.1, §11 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-09 The partner sees the request in the portal Quote Requests and marks it Hot, then Cold

| | |
|---|---|
| Title | The partner sees the request in the portal Quote Requests and marks it Hot, then Cold |
| Role | Partner |
| Pre-condition | TC-E2E-08 done |
| Steps | 1. Portal bell shows the notification; open Quote Requests. 2. Mark the request Hot, then Cold. |
| Expected result | Row shows the user and package; mark changes to Hot then Cold without error |
| Actual result | bell showed "1 new" "Meher Kapoor sent a quote request for ct_E2E Safari Package."; clicking it opened Quote Requests; Hot gave "Marked Hot.", Cold gave "Marked Cold."; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-09-before-1366.png, tc-e2e-09-hot-1366.png, tc-e2e-09-1366.png, tc-e2e-09-before-390.png, tc-e2e-09-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §9.2, §9.3 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

### TC-E2E-10 Super Admin sees the request in console Quote Requests with the mark

| | |
|---|---|
| Title | Super Admin sees the request in console Quote Requests with the mark |
| Role | Super Admin |
| Pre-condition | TC-E2E-09 done (left on Cold) |
| Steps | 1. Console > Quote Requests, search `ct_E2E`. 2. Open the row. |
| Expected result | The request shows with the partner, package and the Cold mark |
| Actual result | console Quote Requests shows the ct_E2E request (ct_E2E Safari Package (v1), ct_E2E Safaris, 3 travellers, Mark Cold, Active) beside the others; no console errors. |
| Result | PASS |
| Method | browser, 1366 + 390 px |
| Date | 2026-11-16 |
| Screenshot | tc-e2e-10-1366.png, tc-e2e-10-390.png |
| Ref (requirement / workflow) | WITW-Packages-Workflow.md §12.8 |
| Planning file | docs/planning/features/2026-11-16-full-test-and-docs.md |

## Bugs found / fixed / blocked

None recorded.

## History

No case has more than one result line.
