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

`health` is technical only and has no business doc.
