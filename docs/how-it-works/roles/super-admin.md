# Super Admin

**What it is.** The system role 100 (`meta_role`), held through `user_role`.

**Who uses it.** The people who run the platform, in the manage console.

## What they can do

- Open every page of the manage console ([manage-console.md](../platform/manage-console.md)): Shared Safari (shared safaris, flagged comments, parks, flag reasons), Partners (partner requests, partners, quote requests), Packages (package approvals, packages, gallery approvals, galleries, package delete reasons), users and roles, notification templates and the delivery log, the audit, error and system logs, background jobs, languages and translations, the technical documentation.
- Add users, give or take the Super Admin role, set passwords, make users active or inactive ([users](../modules/users/README.md)).
- Sign in to every other app as a signed-in user.

## What they cannot do

- Remove their own Super Admin role or make themselves inactive.
- Change roles themselves: `meta_role` rows come only from migrations.
- Give the Partner role on the Users page: it comes only with an approved partner request ([partner](partner.md)).

## How someone becomes one

- The first one: `npm run cli user/create-super-admin "<name>" <email> <mobile> confirm` on the server.
- Every later one: a Super Admin ticks the role on Add / Edit User.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md), [2026-11-04-shared-safari](../../planning/features/2026-11-04-shared-safari.md), [2026-11-12-safari-packages](../../planning/features/2026-11-12-safari-packages.md)
