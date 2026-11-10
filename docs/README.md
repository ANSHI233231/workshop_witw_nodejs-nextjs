# Documentation

```
docs/
├── how-it-works/   How things work TODAY, in plain language: module and feature flows, workflows,
│                   roles, and how we do things. The source of truth after the code
├── planning/       features/: one dated planning file per feature: how it was decided and built
│                   (requirement, plan, test cases, decisions, log)
├── tools/          docx-generator/: builds the Word (.docx) copies of the workflow documents, reproducibly
└── prototype/      Git submodule (set up by init.js; starts as a copy of the starter prototype): the design
                    prototype and design system. Only the parts declared ready are built from
```

[PROTOTYPE-SYNC.md](PROTOTYPE-SYNC.md) lists every prototype board against our build: built or not, our route, each difference with its reason, our screens with no board, and what is still to build or decide.

## Prototype submodule

`docs/prototype/` is its own repository, pinned here to one commit.

```bash
git clone --recurse-submodules <this repo>        # new clone, prototype included
git submodule update --init                       # existing clone without the prototype
git submodule update --remote docs/prototype      # move the pin to the prototype's latest main
git submodule sync && git submodule update --init # after the prototype's address changed (.gitmodules)
```

Set it up with `node init.js` (or later: `node init.js --prototype=<url>`): [how-it-works/platform/prototype.md](how-it-works/platform/prototype.md). Change the prototype in its own repository, not through this one. After `update --remote`, commit the new pin here (`git add docs/prototype`) so everyone gets the same version.
