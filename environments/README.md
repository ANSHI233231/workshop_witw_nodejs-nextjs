# Environments

pm2 files, one per copy of the project: `stag` and `prod` (the server: Ubuntu with nginx, pm2, Node.js, npm and MySQL) and `local` (a developer machine, dev servers). Each lists the processes and their ports; pm2 is started from the copy's own folder.

**The local file is each developer's own.** `ecosystem.local.config.example.js` is committed; copy it to `ecosystem.local.config.js` (ignored by git) and change its ports and pm2 names to whatever is free on your machine. Never commit the copy; change the example only when the list of apps changes.

```bash
cp environments/ecosystem.local.config.example.js environments/ecosystem.local.config.js
pm2 start environments/ecosystem.local.config.js && pm2 save
cd ~/stag_<project> && pm2 start environments/ecosystem.stag.config.js && pm2 save
cd ~/prod_<project> && pm2 start environments/ecosystem.prod.config.js && pm2 save
```

On the server the API runs its compiled build (`dist/server.js`, after `npm run build`) and the Next.js apps run `next start`; locally every process runs `npm run dev`. The background-job worker is not listed: the API starts it.

## Ports

On the server every process listens on `127.0.0.1` only; nginx sends each name to its port.

| | Local (example's defaults) | Staging | Production |
|---|---|---|---|
| Folder | the repo | `~/stag_<project>` | `~/prod_<project>` |
| Branch | any | `staging` | `main` |
| web | 3040 `web.workshop-witw` | 4100 `stag-web` | 4200 `prod-web` |
| manage | 3041 `manage.workshop-witw` | 4101 `stag-manage` | 4201 `prod-manage` |
| api | 8030 `api.workshop-witw` | 4110 `stag-api` | 4210 `prod-api` |

Locally the ports are your own (the defaults are the example's). On the server, the Next.js apps' ports are in the pm2 file, and the API's is `PORT` in `apps/api/.env` (4110 staging, 4210 production). A new app gets the next free number in each column (e.g. 3042 / 4102 / 4202), added to the example and the two server files together.

**A new project renames** `starter` in the local process names, and picks port ranges that stay clear of the other projects on the same machines.
