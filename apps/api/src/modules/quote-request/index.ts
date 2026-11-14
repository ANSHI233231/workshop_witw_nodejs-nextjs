import type {
    QuoteRequestDemoModuleDependencies,
    QuoteRequestModuleDependencies,
    QuoteRequestTestDataModuleDependencies,
} from './contracts/quote-request-module.contract';
import type { IQuoteRequestConsoleService } from './contracts/quote-request-console-service.contract';
import type { IQuoteRequestDemoService } from './contracts/quote-request-demo-service.contract';
import type { IQuoteRequestPortalService } from './contracts/quote-request-portal-service.contract';
import type { IQuoteRequestTestDataService } from './contracts/quote-request-test-data-service.contract';
import type { IQuoteRequestWebsiteService } from './contracts/quote-request-website-service.contract';
import { QuoteRequestConsoleController } from './controllers/quote-request-console.controller';
import { QuoteRequestPortalController } from './controllers/quote-request-portal.controller';
import { QuoteRequestWebsiteController } from './controllers/quote-request-website.controller';
import { QuoteRequestTestDataRepository } from './repositories/quote-request-test-data.repository';
import { QuoteRequestRepository } from './repositories/quote-request.repository';
import { createQuoteRequestRouter, type QuoteRequestAccess } from './routes/quote-request.routes';
import { QuoteRequestConsoleService } from './services/quote-request-console.service';
import { QuoteRequestDemoService } from './services/quote-request-demo.service';
import { QuoteRequestPortalService } from './services/quote-request-portal.service';
import { QuoteRequestRecords } from './services/quote-request-records';
import { QuoteRequestTestDataService } from './services/quote-request-test-data.service';
import { QuoteRequestWebsiteService } from './services/quote-request-website.service';

export type {
    QuoteRequestDemoModuleDependencies,
    QuoteRequestModuleDependencies,
} from './contracts/quote-request-module.contract';
export type { IQuoteRequestDemoService } from './contracts/quote-request-demo-service.contract';
export type { DemoPartnerNote, DemoQuoteRequest, DemoQuoteResult } from './dto/quote-request-demo.dto';
export {
    QuoteMark,
    type QuoteMarkCode,
    QuoteRequestStatus,
    type QuoteRequestStatusCode,
} from './types/quote-request.types';

export const createQuoteRequestModule = (dependencies: QuoteRequestModuleDependencies) => {
    const records = new QuoteRequestRecords(dependencies.db, new QuoteRequestRepository(), dependencies.auditService);
    const websiteService: IQuoteRequestWebsiteService = new QuoteRequestWebsiteService(
        records,
        dependencies.packageService,
        dependencies.partnerService,
        dependencies.usersService,
        dependencies.notificationService,
    );
    const portalService: IQuoteRequestPortalService = new QuoteRequestPortalService(records, dependencies.partnerService);
    const consoleService: IQuoteRequestConsoleService = new QuoteRequestConsoleService(
        records,
        dependencies.notificationService,
    );
    const controllers = {
        website: new QuoteRequestWebsiteController(websiteService),
        portal: new QuoteRequestPortalController(portalService),
        console: new QuoteRequestConsoleController(consoleService),
    };
    return {
        createRouter: (access: QuoteRequestAccess) => createQuoteRequestRouter(controllers, access),
    };
};

export type { IQuoteRequestTestDataService } from './contracts/quote-request-test-data-service.contract';
export type { QuoteRequestTestData, QuoteRequestTestDataScope } from './dto/quote-request-test-data.dto';

export const createQuoteRequestTestDataModule = (dependencies: QuoteRequestTestDataModuleDependencies) => {
    const quoteRequestTestDataService: IQuoteRequestTestDataService = new QuoteRequestTestDataService(
        dependencies.db,
        new QuoteRequestTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { quoteRequestTestDataService };
};

export const createQuoteRequestDemoModule = (dependencies: QuoteRequestDemoModuleDependencies) => {
    const quoteRequestDemoService: IQuoteRequestDemoService = new QuoteRequestDemoService(
        dependencies.db,
        new QuoteRequestRepository(),
        dependencies.auditService,
        dependencies.notificationSeedService,
        dependencies.isProduction,
    );
    return { quoteRequestDemoService };
};
