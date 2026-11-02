# Prototype

**What it is.** Every project has a design prototype in its own git repository, added to the project as the submodule `docs/prototype` and pinned to one commit. Screens are designed there first (in Claude Design) and built only from boards declared ready. A new project's prototype starts as a copy of the **starter prototype** (`git@github.com:aayush-cmd/starter_prototype.git`): the starter's design system and screens, so the design starts exactly like the app.

**Who uses it.** The prototype team designs in it; developers read it (never change it from the project); `init.js` sets it up.

## The flow

1. **New project.** `node init.js` asks, after your git repository URL, for **your prototype repository URL**:
   - **an empty repository:** `init.js` copies the starter prototype into it (one commit, "Start from the starter prototype", pushed to it), then adds it as `docs/prototype`;
   - **a repository with content** (for example a client's prototype): added as it is, nothing pushed to it;
   - **empty answer:** no prototype yet; `init.js` prints the command to add it later.

   Either way, the starter's own link to the starter prototype is removed first: the project never points at the template.
2. **Add it later.** `node init.js --prototype=<your prototype repository URL>` does only this step, on a copy that is already set up. It keeps the starter prototype's address, so it works after the project steps are gone.
3. **New developer machine.** `node init.js` on a fresh clone checks `docs/prototype` out at the pinned commit (`git submodule update --init`). Staging and production don't get it: the servers don't need it.
4. **The pin.** `docs/PROTOTYPE-SYNC.md` records the pinned commit when the prototype is added. Moving the pin later is a deliberate commit: `git submodule update --remote docs/prototype`, then commit `docs/prototype`.
5. **Commit it.** After `init.js` adds the prototype: `git add .gitmodules docs/prototype docs/PROTOTYPE-SYNC.md` with the project's first commit.

## Rules

- The prototype is changed only in its own repository, never from the project.
- Developers build only from boards marked ready in `docs/PROTOTYPE-SYNC.md` (its Ready column: the prototype commit and the date the user declared it); every board's state is there too.
- `init.js` never pushes to a repository that already has commits, and refuses the starter prototype's own address as a project's prototype.
- `--dry-run` shows every prototype step and writes or pushes nothing. `--prototype-template=<url>` copies another prototype instead of the starter's.
- In the starter itself, `docs/prototype` is the starter prototype. A change to a starter screen updates its board in the starter prototype in the same piece of work.

## Where it lives

- **Script:** `init.js` (the prototype steps; the template's address is `PROTOTYPE_TEMPLATE`)
- **Submodule:** `.gitmodules`, `docs/prototype`
- **Pin and board states:** `docs/PROTOTYPE-SYNC.md`
- **Commands:** [docs/README.md](../../README.md) (clone with the prototype, move the pin)

## History

- Planning files: [2026-10-30-prototype-repo-in-init](../../planning/features/2026-10-30-prototype-repo-in-init.md)
