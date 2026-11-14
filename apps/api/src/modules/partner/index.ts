import type { AccessGuard } from '../../core/http';

import type {
    PartnerDemoModuleDependencies,
    PartnerModuleDependencies,
    PartnerTestDataModuleDependencies,
} from './contracts/partner-module.contract';
import type { IPartnerConsoleService } from './contracts/partner-console-service.contract';
import type { IPartnerDemoService } from './contracts/partner-demo-service.contract';
import type { IPartnerRequestService } from './contracts/partner-request-service.contract';
import type { IPartnerService } from './contracts/partner-service.contract';
import type { IPartnerTestDataService } from './contracts/partner-test-data-service.contract';
import { PartnerConsoleController } from './controllers/partner-console.controller';
import { PartnerRequestController } from './controllers/partner-request.controller';
import { PartnerTestDataRepository } from './repositories/partner-test-data.repository';
import { PartnerRepository } from './repositories/partner.repository';
import { createPartnerRouter } from './routes/partner.routes';
import { PartnerConsoleService } from './services/partner-console.service';
import { PartnerDemoService } from './services/partner-demo.service';
import { PartnerRecords } from './services/partner-records';
import { PartnerRequestService } from './services/partner-request.service';
import { PartnerTestDataService } from './services/partner-test-data.service';
import { PartnerService } from './services/partner.service';

export type { PartnerDemoModuleDependencies, PartnerModuleDependencies } from './contracts/partner-module.contract';
export type { IPartnerService } from './contracts/partner-service.contract';
export type { IPartnerDemoService } from './contracts/partner-demo-service.contract';
export type { PartnerParkDto, PartnerRef } from './dto/partner.dto';
export type { DemoPartner, DemoPartnerOutcome, DemoPartnerState } from './dto/partner-demo.dto';
export { PartnerStatus, type PartnerStatusCode } from './types/partner.types';

export const createPartnerModule = (dependencies: PartnerModuleDependencies) => {
    const repository = new PartnerRepository();
    const records = new PartnerRecords(
        dependencies.db,
        repository,
        dependencies.parkService,
        dependencies.auditService,
        dependencies.fileStorage,
    );
    const partnerService: IPartnerService = new PartnerService(dependencies.db, repository);
    const requestService: IPartnerRequestService = new PartnerRequestService(
        dependencies.db,
        repository,
        records,
        dependencies.accountSignUp,
    );
    const consoleService: IPartnerConsoleService = new PartnerConsoleService(
        dependencies.db,
        repository,
        records,
        dependencies.usersService,
    );
    const controllers = {
        request: new PartnerRequestController(requestService, dependencies.sessionCookies),
        console: new PartnerConsoleController(consoleService),
    };
    return {
        partnerService,
        createRouter: (access: { readonly signedIn: AccessGuard; readonly superAdmin: AccessGuard }) =>
            createPartnerRouter(controllers, access),
    };
};

export type { IPartnerTestDataService } from './contracts/partner-test-data-service.contract';
export type { PartnerTestData } from './dto/partner-test-data.dto';

export const createPartnerTestDataModule = (dependencies: PartnerTestDataModuleDependencies) => {
    const partnerTestDataService: IPartnerTestDataService = new PartnerTestDataService(
        dependencies.db,
        new PartnerTestDataRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { partnerTestDataService };
};

export const createPartnerDemoModule = (dependencies: PartnerDemoModuleDependencies) => {
    const partnerDemoService: IPartnerDemoService = new PartnerDemoService(
        dependencies.db,
        new PartnerRepository(),
        dependencies.usersService,
        dependencies.usersDemoService,
        dependencies.parkService,
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { partnerDemoService };
};
