# Prototype repo in init

| Field | Value |
|---|---|
| Status | shipped |
| Started | 2026-10-30 |
| Shipped | 2026-10-30 |
| Apps | init.js / docs |
| Test cases | TC-PROTO-01..06 |
| How it works | [docs/how-it-works/platform/prototype.md](../../how-it-works/platform/prototype.md) (new) |

## 1. Requirement (as given)

> "we also need to follow the prototype creation step also … we will go with a seperate repo and build this repo and then add as a submodule and the current system will be same as the prototype and the prototpye sync with also be in the pinned we will use seperate repo and first create the design system and the prototype seperatly and use it here for this you also need to modify the init also beacuse we also need to clone the prototpye submodule or add a comand later after copying the prototpye but we need to do this in the init beacuse after it we lost the starter repo"

Earlier in the same discussion: "adding a new feature will must need the prototpye other wise we failed and for the prototpye we need few things design system and the html prototpye in starter so the exact same design will be start in the prototpye then we can cnage the design or the colors or other but that should be there."

## 2. Plan

The prototype template itself (a separate repo with the starter's design system and an HTML prototype of its screens) is built separately and is not part of this plan. This plan covers how the starter uses it.

**`init.js` sets up the project's own prototype repo**, because after `init.js` the project no longer knows the starter:

- A new question, "Your prototype repository URL" (empty: add it later), and a flag for it.
- If given and the repository is empty: copy the prototype template into it (first commit, push), then add it to the project as the submodule `docs/prototype`.
- If given and the repository already has content (a client's prototype): only add it as the submodule.
- If not given: print the command to add it later. That command stays available after the project steps are removed, so it keeps the template's address.
- On a development machine set up later (a new developer), `init.js` checks out the submodule. Not on staging or production: the servers don't need the prototype (staging-deployment.md).
- `--dry-run` shows these steps without doing them.

**Pin and sync:** `docs/PROTOTYPE-SYNC.md` records the pinned prototype commit once the submodule is added; moving the pin stays a deliberate commit.

**Rules:** the starter's `AGENTS.md` says a new feature goes through the prototype, and that a change to a starter screen updates its board in the prototype template in the same piece of work.

**Docs:** a new how-it-works doc for the prototype (where it lives, the submodule, the pin, adding it later); README "Install it" and "Make it your project"; `environments/README.md` or the deployment guides where a server needs the submodule.

**Open questions:**
1. ~~The prototype template's repository address.~~ Answered: `git@github.com:aayush-cmd/starter_prototype.git`.
2. ~~The exact form of the "add it later" command.~~ `node init.js --prototype=<url>` (see §4).

**After this ships (separate work):** the Build With AI guide's step 3 and the workshop deck.

## 3. Test cases

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-PROTO-01 | New project, empty prototype repo | an empty test repository | `node init.js`, answer with its URL | template pushed as its first commit; `docs/prototype` is a submodule at that commit | H | CLI |
| TC-PROTO-02 | New project, prototype with content | a test repository with a commit | `node init.js` with its URL | nothing pushed to it; added as the submodule | H | CLI |
| TC-PROTO-03 | No prototype URL | | `node init.js`, leave the question empty | no submodule; the command to add it later is printed | M | CLI |
| TC-PROTO-04 | Add later | a project made without a prototype | run the printed command with an empty test repository | same result as TC-PROTO-01 | H | CLI |
| TC-PROTO-05 | New machine | a project with the submodule, cloned fresh | `node init.js` (development) | `docs/prototype` checked out at the pinned commit | H | CLI |
| TC-PROTO-06 | Dry run | | `node init.js --dry-run` with a prototype URL | prints what it would do; nothing created or pushed | M | CLI |

## 4. Decisions

- 2026-10-30 (user): every new feature goes through the prototype step; the starter comes with a design system and an HTML prototype of its own screens, so a project's prototype starts with exactly the app's design (changed per project afterwards).
- 2026-10-30 (user): the prototype is a **separate repo**, added to the project as a **submodule**, with its commit pinned (PROTOTYPE-SYNC); the design system and the prototype are built first, separately.
- 2026-10-30: the prototype template repo is `git@github.com:aayush-cmd/starter_prototype.git` (created by the user, empty; cloned at `~/projects/starter_prototype`). The prototype itself is being built in Claude Design from a separate brief.
- 2026-10-30 (user): this planning file covers only `init.js` and the related details; building the prototype template is separate work with its own plan.
- 2026-10-30 (user): **`init.js` sets up the prototype repo** (or gives a command to do it later), because after `init.js` the starter's address is gone.

- 2026-10-30 (user): build it now; the prototype question comes **at the end, after the git repository URL**.
- 2026-10-30: "add it later" is `node init.js --prototype=<url>` (the form suggested; the user asked to build without choosing another). It works on a copy that is already set up, doing only the prototype step.
- 2026-10-30: the prototype is checked out only on development machines; servers don't need it.

## 5. Execution log

- 2026-10-30: the user committed the starter design system in the prototype template repo (`~/projects/starter_prototype`); pushed as `124c469` on the user's request, and added to the starter as the submodule `docs/prototype` (PROTOTYPE-SYNC pin updated).
- 2026-10-30: built in `init.js` (it stays after the project steps are removed, so "add it later" keeps the template's address): the prototype question after the git URL; `--prototype=<url>` (alone on a set-up copy: only this step) and `--prototype-template=<url>`; copy the template into an empty repository and push it; add the submodule and record the pin; check it out on a new development machine. A new project first drops the starter's own link (`.gitmodules` from the starter points at the template). Found in testing and fixed: the dry run said "already a submodule" after the (dry) drop, and printed the Prototype heading twice.
- Tests, on copies of the working tree laid out as `npx degit` leaves them (no `.git`, the starter's `.gitmodules`, an empty `docs/prototype`); the template is the real `starter_prototype` (read only); the project's own repositories are local bare test repositories, so no push left the machine:
- TC-PROTO-06 PASS (CLI): `--dry-run` with an empty prototype repository lists the three steps (drop the starter link, copy and push, submodule add); afterwards `.gitmodules` unchanged, no `.git`, the repository still has 0 refs.
- TC-PROTO-01 PASS (CLI): full new project as in the guide (name, database `ct_proto_one_db`, packages, first Super Admin "ct Proto Admin", git remote, empty prototype repository): the starter link removed, the repository got one commit "Start from the starter prototype" (33d923d, with `design-system/`), `docs/prototype` staged as a submodule at 33d923d, PROTOTYPE-SYNC row updated, `init-project.js` removed. (The first database attempt failed because the test passed the password with its quotes; re-run with `--force`: database created, Super Admin user 1 created, prototype checked out.)
- TC-PROTO-02 PASS (CLI): a repository with one commit ("client prototype") added as it is; its log unchanged (nothing pushed); `docs/prototype` shows its README.
- TC-PROTO-03 PASS (CLI): no prototype URL: starter link removed (`.gitmodules` gone, `docs/prototype` removed), PROTOTYPE-SYNC back to "not added yet", the later command printed.
- TC-PROTO-04 PASS (CLI): on that set-up project, `node init.js --prototype=<empty repository>` printed "Prototype setup", copied the template (d8cc474) and added the submodule.
- TC-PROTO-05 PASS (CLI): the TC-01 project committed and pushed to a local origin, cloned fresh (`docs/prototype` empty), `node init.js`: "checked out at the pinned commit", `design-system/` present at 33d923d.
- In the starter itself: `--dry-run --prototype=<the template's address>` refuses it; a plain run says the copy is already set up.
- Cleanup: the test database `ct_proto_one_db` dropped (no `ct_proto%` database left). The scratch test folder (`scratchpad/initproto`) was left for the user to delete (the safety check blocked its removal).
- Docs: new [prototype](../../how-it-works/platform/prototype.md) (platform index updated); README install table and steps; `docs/README.md`; `AGENTS.md` (set up by init.js; every feature goes through the prototype; starter screen changes update the starter prototype); the new project's README lists `docs/prototype`. The technical document is not changed (only on request): its line "`docs/prototype/` (a separate repository, once added)" is now slightly out of date (it is set up by `init.js`); the user was told.

## 6. Post-deploy
