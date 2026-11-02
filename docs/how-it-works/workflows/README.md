# Workflows

End-to-end journeys that cross several modules or apps, the technical document, process documents and deployment guides. Each step links to the module doc that owns it instead of repeating it.

| Workflow | What it covers | Modules it uses |
|---|---|---|
| [Technical document](technical-document.md) | The whole system for reviewers and newcomers: architecture, stack, concepts, modules, database, how we build | all |
| [Staging deployment](staging-deployment.md) | Setting up and updating the staging server (branch `staging`): names, ports, nginx, HTTPS, database, `.env` files, pm2 | all apps |
| [Production deployment](production-deployment.md) | Setting up and updating production (branch `main`), and the order of going live on the real names | all apps |

## Workflows and modules stay in sync

- **A workflow links, it doesn't copy.** It tells the journey and links each step to the module doc that owns the rules.
- **A module lists its workflows.** Each module README has a **Workflows** line naming the workflows it takes part in.
- **One change, both docs.** When a module's behaviour changes, update its module doc in the same change, then check every workflow on its Workflows line.

## Word documents

The `.md` files here are the source. Their Word copies are generated into [documents/](documents/), with each Mermaid diagram drawn as a picture in `documents/diagrams/`. Never edit the `.docx` files: edit the `.md`, then in `docs/tools/docx-generator` run `npm run diagrams` (only when a diagram changed) and `npm run build`, and commit the `.md`, the `.docx` and the diagram images together. See [the generator's README](../../tools/docx-generator/README.md).
