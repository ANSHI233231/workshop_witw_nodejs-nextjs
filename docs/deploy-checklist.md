# Deploy checklist: WITW theme

For the release with the WITW theme ([planning file](planning/features/2026-11-02-witw-theme.md)). Do it on **staging first**, check it, then on **production**. The full deploy steps are in [staging](how-it-works/workflows/staging-deployment.md) and [production](how-it-works/workflows/production-deployment.md) deployment.

The email command runs **after** the code deploy: the command and the audit codes it records only exist in the new code. There is no migration in this release.

## On each server (staging, then production)

1. Pull the release and update the prototype pin: `git pull && git submodule update --init`.
2. Build and restart every app: `for a in api manage web; do (cd apps/$a && npm ci && npm run build); done`, then `pm2 restart` the three apps of this copy.
3. Check the apps are up: the API health URL answers 200; manage and web show the green theme in Roboto.
4. Back up the database (as in the deployment guide, before any data command).
5. Dry run the email command, which writes nothing and lists the 4 style changes: `cd apps/api && npm run cli:dist mail/witw-colours`.
6. Run it once: `npm run cli:dist mail/witw-colours confirm` (from source: `npm run cli mail/witw-colours confirm`). Expect `Changed 4 styles in "Password reset".`
7. Check: manage › Notification Templates › Email › Password reset shows the green "Set a new password" button, and Audit Log has one Mail row (action 701).

Running step 6 again is safe: it prints "Nothing to change" and writes nothing. If the dry run lists fewer than 4 changes, the template was edited on that server: check it before confirming.

## Done

| Copy | Code deployed | Email command run | By / date |
|---|---|---|---|
| local | 134bb1a | yes, 2026-11-02 20:22 IST (audit 701) | |
| staging | | | |
| production | | | |
