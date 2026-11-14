# Modules

One folder per API module, named exactly like its code folder in `apps/api/src/modules/<module>/`. Each folder has:

- `README.md`: what the module is for, who uses it, its main rules, the workflows it takes part in, and an index of its flow docs.
- One file per flow when a module grows, e.g. `approval.md`.

| Module | What it is |
|---|---|
| [auth](auth/README.md) | Signing in and out: username / email / mobile and password, JWT access and refresh tokens in HttpOnly cookies, change and forgot password |
| [users](users/README.md) | Users, the role list (`meta_role`) and each user's system roles; the first Super Admin from the CLI |
| [audit](audit/README.md) | The audit log: every write and key event, from every app |
| [system-log](system-log/README.md) | The log files of every app (System Logs) and the errors saved in the database (Error Logs) |
| [jobs](jobs/README.md) | Background jobs: the schedules and runs the worker runs; `IJobQueue` for other modules |
| [language](language/README.md) | The languages offered and the translations of screen text and data text; Publish to each app's JSON files |
| [mail](mail/README.md) | Mail templates and the mail log behind the email adapter |
| [notification](notification/README.md) | In-app notifications: the bell, popover and Notifications page in each app; Notification Templates and the Delivery Log in the console |
| [park](park/README.md) | The parks safaris are planned in (`master_park`): Console › Parks; the active list for the website |
| [flag-reason](flag-reason/README.md) | The reasons offered when flagging a comment (`master_flag_reason`): Console › Flag Reasons |
| [partner](partner/README.md) | Partner requests and partners (`partner`, `partner_park`): Become a Partner, Console › Partner Requests and Partners, the Partner role |
| [gallery](gallery/README.md) | Partners' photo galleries (`gallery`, `gallery_photo`): draft and approved photo sets, sending for approval, Console › Gallery Approvals and Galleries, the copy a package takes |
| [package](package/README.md) | Partners' safari packages as numbered versions (`package`, `package_version` and its children, `master_package_delete_reason`): the Partner portal's Packages, Console › Package Approvals, Packages and Package Delete Reasons, the website package list and page, the "shown on the website" rule |
| [quote-request](quote-request/README.md) | Quote requests users send on a package (`quote_request`): the package page's quote form, My Quote Requests, the Partner portal's Quote Requests with Hot / Cold, Console › Quote Requests with Send a notification |
| [shared-safari](shared-safari/README.md) | Shared safaris: organise, join, discuss and flag on the website; moderation in the console |

`health` is technical only and has no business doc.
