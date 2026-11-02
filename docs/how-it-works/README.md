# How it works

The source of truth for **how things work today**, in plain language: how a module or feature behaves, how a workflow runs from start to end, what a role can and cannot do, and how we do recurring tasks.

Planning files (`docs/planning/features/`) record how something was **decided and built**, as a dated history. The docs here describe only the **present**. When behaviour changes, rewrite the doc here and put the history in a planning file.

## Sections

Start with the [technical document](workflows/technical-document.md): the architecture, stack, domain concepts, modules, database, routes, API and how we build, with links to the docs below.

| Folder | What goes in it | Example |
|---|---|---|
| [platform/](platform/README.md) | How the system itself works, and how we do things as developers | `sql-transactions.md`, `adding-a-module.md` |
| [modules/](modules/README.md) | One folder per API module, **same name as `apps/api/src/modules/<module>/`**: what the module is and each of its flows | `modules/users/README.md`, `modules/auth/README.md` |
| [workflows/](workflows/README.md) | End-to-end journeys that cross several modules or apps | `order-to-payment.md` |
| [roles/](roles/README.md) | One file per role: who they are, which app they use, what they can and cannot do | `super-admin.md` |

Each folder has its own README with an index of its docs. This file lists only the sections, so it stays short however many docs there are.

## Where does a doc go?

1. It's about one module's behaviour → `modules/<module>/`.
2. It follows a journey through two or more modules or apps → `workflows/`, linking to the module docs for detail.
3. It's about a person's permissions → `roles/`.
4. It's about how the system or the team works, not a business feature → `platform/`.

A topic lives in **one** place. Elsewhere, link to it; never copy it.

## Rules

1. **Present only.** No "we used to" and no dated log: that belongs in the planning file.
2. **Updated in the same change as the code.** A feature isn't shipped until its doc here is current.
3. **Before or after the code.** For a complex flow, write the doc first as the agreed design; otherwise write it when shipping. Either way it must be correct when the feature ships.
4. **Code and doc disagree = bug.** Fix whichever is wrong; never leave the mismatch.
5. **Simple and short.** Plain words, about one page. Longer than that, split it by flow.
6. **One topic per file**, named in `kebab-case.md`, added to its folder's README index. Copy [TEMPLATE.md](TEMPLATE.md) to start.
7. **Workflows and modules link both ways.** A workflow links each step to the module doc that owns it; each module README lists its workflows. A behaviour change updates the module doc and every workflow it lists ([workflows/README.md](workflows/README.md)).
8. **Grow by folders, not by long files.** When a module has many flows, its folder may get sub-folders (e.g. `modules/payments/refunds/`), each with a README index.
