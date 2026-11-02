import path from 'node:path';

import express from 'express';

import { config } from '../../config';
import type { RouteEntry } from '../../core/http';
import { createEmailSender } from '../../infrastructure/email';
import { createCommandRunner } from '../../infrastructure/process';
import { createFileStorage } from '../../infrastructure/storage';
import { MetaRole } from '../../modules/users';
import { registerRoutes } from '../../routes';
import { ConsoleController } from '../lib/ConsoleController';

const roleNames = new Map<number, string>(
    Object.entries(MetaRole).map(([key, id]) => [
        id,
        key
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
    ]),
);

const accessLabel = (route: RouteEntry): string =>
    route.access.kind === 'roles'
        ? `roles: ${route.access.roleIds.map((id) => roleNames.get(id) ?? String(id)).join(', ')}`
        : route.access.kind;

export class RouteController extends ConsoleController {
    public override defaultAction = 'list';

    /**
     * Lists every API route with who may call it (public, session, signed-in, roles, key), as the server builds them, e.g. "npm run cli route/list". Reads nothing from the database.
     */
    public actionList(): void {
        const fromSource = __filename.endsWith('.ts');
        const routes = registerRoutes(express(), {
            db: this.db,
            auth: config.auth,
            emailSender: createEmailSender({ driver: config.mail.driver }),
            fileStorage: createFileStorage(config.storage),
            commandRunner: createCommandRunner({
                apiRoot: path.resolve(__dirname, '..', '..', '..'),
                fromSource,
                environment: config.childProcessEnvironment,
            }),
            mailFrom: config.mail.from,
            appUrls: config.appUrls,
            logDirectories: config.logViewerDirs,
            translationDirectories: config.translationDirs,
            logIngestKey: config.logIngestKey,
        });

        const methodWidth = Math.max(...routes.map((route) => route.method.length));
        const pathWidth = Math.max(...routes.map((route) => route.path.length));
        for (const route of routes) {
            const line = `${route.method.toUpperCase().padEnd(methodWidth)}  ${route.path.padEnd(pathWidth)}  ${accessLabel(route)}`;
            this.stdout(`${route.access.kind === 'public' ? this.ansiFormat(line, 'yellow') : line}\n`);
        }

        const counts = new Map<string, number>();
        for (const route of routes) counts.set(route.access.kind, (counts.get(route.access.kind) ?? 0) + 1);
        const summary = [...counts.entries()].map(([kind, count]) => `${kind} ${count}`).join(', ');
        this.stdout(`\n${routes.length} routes: ${summary}\n`);
    }
}

export default RouteController;
