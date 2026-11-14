import type {
    SharedSafariModuleDependencies,
    SharedSafariTestDataModuleDependencies,
} from './contracts/shared-safari-module.contract';
import type { SharedSafariSeedModuleDependencies } from './contracts/shared-safari-seed-module.contract';
import type { ISharedSafariSeedService } from './contracts/shared-safari-seed-service.contract';
import type { ISharedSafariTestDataService } from './contracts/shared-safari-test-data-service.contract';
import { SharedSafariSeedRepository } from './repositories/shared-safari-seed.repository';
import { SharedSafariTestDataRepository } from './repositories/shared-safari-test-data.repository';
import { SharedSafariSeedService } from './services/shared-safari-seed.service';
import { SharedSafariTestDataService } from './services/shared-safari-test-data.service';
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

export type { ISharedSafariSeedService } from './contracts/shared-safari-seed-service.contract';
export type {
    SeedComment,
    SeedFlag,
    SeedOutcome,
    SeedRemovalCounts,
    SeedSafari,
} from './dto/shared-safari-seed.dto';
export type { SeedNote } from './contracts/shared-safari-seed-module.contract';
export { AdminDeleteReason, SharedSafariTheme, StayCategory } from './types/shared-safari.types';

export const createSharedSafariSeedModule = (dependencies: SharedSafariSeedModuleDependencies) => {
    const sharedSafariSeedService: ISharedSafariSeedService = new SharedSafariSeedService(
        dependencies.db,
        new SharedSafariSeedRepository(),
        dependencies.auditService,
        dependencies.notificationSeedService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { sharedSafariSeedService };
};

export type { ISharedSafariTestDataService } from './contracts/shared-safari-test-data-service.contract';
export type { SharedSafariTestData, SharedSafariTestDataScope } from './dto/shared-safari-test-data.dto';

export const createSharedSafariTestDataModule = (dependencies: SharedSafariTestDataModuleDependencies) => {
    const sharedSafariTestDataService: ISharedSafariTestDataService = new SharedSafariTestDataService(
        dependencies.db,
        new SharedSafariTestDataRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { sharedSafariTestDataService };
};

export const createSharedSafariModule = (dependencies: SharedSafariModuleDependencies) => {
    const repository = new SharedSafariRepository();
    const websiteService = new WebsiteSafariService(
        dependencies.db,
        repository,
        dependencies.auditService,
        dependencies.notificationService,
        dependencies.fileStorage,
        dependencies.parkService,
        dependencies.partnerService,
    );
    const discussionService = new DiscussionService(
        dependencies.db,
        repository,
        dependencies.auditService,
        dependencies.notificationService,
        dependencies.flagReasonService,
        dependencies.partnerService,
    );
    const consoleService = new ConsoleSafariService(
        dependencies.db,
        repository,
        dependencies.auditService,
        websiteService,
        dependencies.partnerService,
    );
    const controllers = {
        website: new WebsiteSafariController(websiteService, discussionService),
        console: new ConsoleSafariController(consoleService),
    };
    return {
        createRouter: (access: SharedSafariAccess) => createSharedSafariRouter(controllers, access),
    };
};
