# Users

**What it is.** The people who can sign in (`user`), the role list (`meta_role`) and each user's system roles (`user_role`).

**Who uses it.** The Super Admin, on the console's Users and Roles pages; the auth module (sign-in lookups); the CLI (the first Super Admin).

**Workflows:** [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md), [WITW Packages](../../workflows/WITW-Packages-Workflow.md).

## The flow

1. **First Super Admin:** `npm run cli user/create-super-admin "<name>" <email> <10-digit mobile> confirm` (dry run without `confirm`): creates the user with a random password, printed once, and gives them role 100. The audit row has no actor (the CLI).
2. **Users page** (manage `/users`): search (name, username, email, mobile), Role and Status filters, 20 per page, Export (CSV of every match). **Add User**: name, username (optional), email, mobile, the system roles, password and confirmation. **Edit**: the same without the password; **Set password**; **Active / Inactive** switch.
3. **Sign Up** (website, through [auth](../auth/README.md)): `signUp({ name, email, mobile, password })` creates an active user with no username and **no role**; the new user is the audit actor.
4. **Roles page** (manage `/roles`): the `meta_role` list with search (also in other languages, through `data_translation`); read only.

## Rules

- **Sign-in identifiers:** username, email and mobile are each optional and each unique (case-insensitive); at least one is set. Email stored lower case.
- **Field rules** (the same in the API and the form): name 2–150; username 3–100, letters, digits, `.`, `_`, `-`; email valid, ≤ 254; mobile 10 digits starting 6–9; password 8–72, both entries equal.
- **Taken:** a username, email or mobile another user holds → 409 `USERNAME_TAKEN` / `EMAIL_TAKEN` / `MOBILE_TAKEN`.
- **Not on yourself:** you cannot remove your own Super Admin role or make yourself inactive (422 `OWN_ACCESS_CHANGE`).
- **Roles:** `meta_role` rows come only from migrations (no screen). The starter has **100 Super Admin**; a project adds its own roles in the next hundreds (200–299 …) in its own migration, with a constant in `MetaRole` and, for console roles, an area in manage's `lib/console-access.ts`. Safari Packages added **101 Partner** (`MetaRole.PARTNER`): it is not a system role (not on the user form, so saving a user never removes it); the partner module adds it on approval through `usersService.grantRole(userId, roleId, actorId)`, which records a 103 event with the role added; `usersService.revokeRole(...)` takes it back (role row status 2, a 103 event with the role removed), used only when `packages-demo/remove` removes a demo partner whose account stays ([partner](../partner/README.md)).
- **System roles** are kept in `user_role` (one row per user and role; removing a role sets it inactive). The users list shows each user's active role names.
- A user is never deleted (`status`: 1 active, 2 inactive, -1 deleted). The one exception is local sample data: `createUsersSeedModule` (built only by the CLI, refused in production with `SEED_NOT_ALLOWED`) creates sample accounts by email and removes them for good with their role rows, refusing any account that holds a system role. See [shared-safari › Sample data](../shared-safari/README.md#sample-data-local-development-only).
- **Notifications** ([notification](../notification/README.md)): creating an account (Add User, the CLI; not Sign Up, whose template would read "created by") sends the new user 101 Account created (website); changing, resetting or setting a password sends 102 Password changed (in the app it was changed in; set by an administrator → the website), in the same transaction. `activeUserIdsWithRole(roleId)` lists the active users holding a role (the jobs worker uses it for Super Admins).
- **Audit** (module 1): 101 user created, 102 create failed, 103 user updated (with what changed and the roles added / removed), 104 update failed, 105 password changed, 106 password change failed, 107 user signed up, 108 sign-up failed (the email typed as the actor label), 109 sample accounts created, 110 failed, 111 sample accounts removed, 112 failed, 113 demo accounts removed (Safari Packages demo data, `createUsersDemoModule`), 114 failed, 115 `ct_` test accounts removed (`test-data/remove-ct`), 116 failed. Demo accounts are created as 101 events.

- **Name from Edit Profile:** `usersService.rename(userId, name, actorId)` changes only the name of an active account (a missing or inactive account is 404 `USER_NOT_FOUND`) and records a 103 event with the name's from / to (nothing when it is the same). The [profile](../profile/README.md) module calls it inside its own save, so both succeed or fail together.

## Where it lives

- **Module:** `apps/api/src/modules/users/`
- **Endpoints:** `GET /api/users`, `GET /api/users/export`, `GET /api/users/summary`, `GET /api/users/picker`, `GET /api/users/:id`, `POST /api/users`, `PATCH /api/users/:id`, `PATCH /api/users/:id/status`, `POST /api/users/:id/password`, `GET /api/users/roles` (all Super Admin)
- **Tables:** `user`, `meta_role`, `user_role` (migration `2026-10-28-users-and-auth.sql`)
- **CLI:** `user/create-super-admin`; the sample accounts of `seed/shared-safari` / `seed/shared-safari-remove`; the demo accounts of `packages-demo/add` / `packages-demo/remove` and `local-accounts/add` / `local-accounts/remove` (`createUsersDemoModule`); each command creates the accounts of its plan when missing and removes only its own (the local accounts `@example.in` only by `local-accounts/remove`, the `@example.test` ones only by `seed/shared-safari-remove`, the `@packages-demo.test` ones only by `packages-demo/remove`)
- **Screens:** manage `/users`, `/roles` (`components/users/`, `components/roles/`)

## History

- Planning files: [2026-10-28-starter-core](../../../planning/features/2026-10-28-starter-core.md), [2026-10-29-notifications](../../../planning/features/2026-10-29-notifications.md)
