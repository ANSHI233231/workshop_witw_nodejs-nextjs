# Partner

**What it is.** A safari operator. Partner is the system role 101 (`meta_role`, `MetaRole.PARTNER`), added to a person's own website account when the Super Admin approves their partner request. The partner's business is a `partner` row tied to that account ([partner](../modules/partner/README.md)).

**Who uses it.** The operators, in the Partner portal ([partner-portal.md](../platform/partner-portal.md)); they keep using the website with the same account.

## What they can do

- While **Active**, in the Partner portal: create and edit their own packages and send each version for approval, make a live package active or inactive ([package](../modules/package/README.md)); create and edit their own galleries and send them for approval ([gallery](../modules/gallery/README.md)); see their own Active quote requests and mark them Hot or Cold ([quote request](../modules/quote-request/README.md)); see their Business Profile (view only) and their notifications.
- On the website: browse as anyone; comment on shared safaris they hosted or joined before, shown as the business (name and logo, or the WITW default logo when it has none).

## What they cannot do

- Organise or join a shared safari, or send a quote request (the website shows a note with the Partner portal link instead).
- Change their own business details, parks or logo once approved: only the Super Admin edits them (Partners).
- See or change another partner's packages, galleries or quote requests.
- Use the portal while **Inactive**: they see only the "Account deactivated" message; their packages leave the website.

## How someone becomes one

1. They send a partner request: on the website's Become a Partner (as a guest, with new account details, or signed in) or in the Partner portal.
2. The Super Admin approves it (Partners › Partner Requests): the request becomes Active and the account gets the role. A rejected request can be changed and sent again.
3. The Super Admin can deactivate and activate a partner (Partners). The role stays on the account; what the portal allows follows the partner's status (Active or Inactive).

Local test account: `partner@example.in` ([local-development.md](../platform/local-development.md#local-test-accounts)).

## History

- Planning files: [2026-11-12-safari-packages](../../planning/features/2026-11-12-safari-packages.md)
