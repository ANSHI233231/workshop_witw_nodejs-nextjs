import type { SharedSafariModuleDependencies } from './contracts/shared-safari-module.contract';
import { ConsoleSafariController } from './controllers/console-safari.controller';
import { WebsiteSafariController } from './controllers/website-safari.controller';
import { SharedSafariRepository } from './repositories/shared-safari.repository';
import { createSharedSafariRouter, type SharedSafariAccess } from './routes/shared-safari.routes';
import { ConsoleSafariService } from './services/console-safari.service';
import { DiscussionService } from './services/discussion.service';
import { WebsiteSafariService } from './services/website-safari.service';

export type { SharedSafariModuleDependencies } from './contracts/shared-safari-module.contract';
export type { SharedSafariAccess } from './routes/shared-safari.routes';
export { SharedSafariStatus } from './types/shared-safari.types';

export const createSharedSafariModule = (dependencies: SharedSafariModuleDependencies) => {
    const repository = new SharedSafariRepository();
    const websiteService = new WebsiteSafariService(
        dependencies.db,
        repository,
        dependencies.auditService,
        dependencies.notificationService,
        dependencies.fileStorage,
        dependencies.parkService,
    );
    const discussionService = new DiscussionService(
        dependencies.db,
        repository,
        dependencies.auditService,
        dependencies.notificationService,
        dependencies.flagReasonService,
    );
    const consoleService = new ConsoleSafariService(dependencies.db, repository, dependencies.auditService, websiteService);
    const controllers = {
        website: new WebsiteSafariController(websiteService, discussionService),
        console: new ConsoleSafariController(consoleService),
    };
    return {
        createRouter: (access: SharedSafariAccess) => createSharedSafariRouter(controllers, access),
    };
};
