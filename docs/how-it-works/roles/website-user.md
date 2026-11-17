# Website user

**What it is.** Anyone with an account on the website and no role. It is not a `meta_role` row: an account with no role is a website user.

**Who uses it.** Travellers, on the website (`apps/web`).

## What they can do

- Everything a [guest](guest.md) can.
- Organise shared safaris, join and leave them, comment and reply, flag a comment, and see My Shared Safaris ([WITW Shared Safari workflow](../workflows/WITW-Shared-Safari-Workflow.md), [shared-safari](../modules/shared-safari/README.md)).
- Request a quote on a package and see My Quote Requests ([quote request](../modules/quote-request/README.md)).
- Send a partner request (Become a Partner) and follow it in the Partner portal ([partner](partner.md)).
- Read their notifications, change their password.

## What they cannot do

- Open the console: signing in there shows the 403 page.
- Use the Partner portal beyond the partner request page until their request is approved.

## How someone becomes one

- Sign Up on the website (`/sign-up`), or Become a Partner as a guest (the account is made with the request).
- A Super Admin can add an account on the console's Users page.

Local test account: `user@example.in` ([local-development.md](../platform/local-development.md#local-test-accounts)).

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md), [2026-11-04-shared-safari](../../planning/features/2026-11-04-shared-safari.md), [2026-11-12-safari-packages](../../planning/features/2026-11-12-safari-packages.md)
