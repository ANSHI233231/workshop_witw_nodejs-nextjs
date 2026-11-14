import type {
    GalleryDemoModuleDependencies,
    GalleryModuleDependencies,
    GalleryTestDataModuleDependencies,
} from './contracts/gallery-module.contract';
import type { IGalleryConsoleService } from './contracts/gallery-console-service.contract';
import type { IGalleryDemoService } from './contracts/gallery-demo-service.contract';
import type { IGalleryPortalService } from './contracts/gallery-portal-service.contract';
import type { IGalleryService } from './contracts/gallery-service.contract';
import type { IGalleryTestDataService } from './contracts/gallery-test-data-service.contract';
import { GalleryConsoleController } from './controllers/gallery-console.controller';
import { GalleryPortalController } from './controllers/gallery-portal.controller';
import { GalleryTestDataRepository } from './repositories/gallery-test-data.repository';
import { GalleryRepository } from './repositories/gallery.repository';
import { createGalleryRouter, type GalleryAccess } from './routes/gallery.routes';
import { GalleryConsoleService } from './services/gallery-console.service';
import { GalleryDemoService } from './services/gallery-demo.service';
import { GalleryPortalService } from './services/gallery-portal.service';
import { GalleryRecords } from './services/gallery-records';
import { GalleryTestDataService } from './services/gallery-test-data.service';
import { GalleryService } from './services/gallery.service';

export type { GalleryDemoModuleDependencies, GalleryModuleDependencies } from './contracts/gallery-module.contract';
export type { IGalleryService } from './contracts/gallery-service.contract';
export type { IGalleryDemoService } from './contracts/gallery-demo-service.contract';
export type { ApprovedGalleryOption, GalleryCopy, GalleryCopyPhoto } from './dto/gallery.dto';
export type { DemoGallery, DemoGalleryOutcome, DemoGalleryPhoto, DemoGalleryRef } from './dto/gallery-demo.dto';
export { GalleryStatus, type GalleryStatusCode } from './types/gallery.types';

export type { IGalleryTestDataService } from './contracts/gallery-test-data-service.contract';
export type { GalleryTestData, GalleryTestDataScope } from './dto/gallery-test-data.dto';

export const createGalleryTestDataModule = (dependencies: GalleryTestDataModuleDependencies) => {
    const galleryTestDataService: IGalleryTestDataService = new GalleryTestDataService(
        dependencies.db,
        new GalleryTestDataRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { galleryTestDataService };
};

export const createGalleryModule = (dependencies: GalleryModuleDependencies) => {
    const repository = new GalleryRepository();
    const records = new GalleryRecords(dependencies.db, repository, dependencies.auditService, dependencies.fileStorage);
    const galleryService: IGalleryService = new GalleryService(dependencies.db, repository, records);
    const portalService: IGalleryPortalService = new GalleryPortalService(
        dependencies.db,
        repository,
        records,
        dependencies.partnerService,
        dependencies.usersService,
        dependencies.notificationService,
    );
    const consoleService: IGalleryConsoleService = new GalleryConsoleService(dependencies.db, repository, records);
    const controllers = {
        portal: new GalleryPortalController(portalService),
        console: new GalleryConsoleController(consoleService),
    };
    return {
        galleryService,
        createRouter: (access: GalleryAccess) => createGalleryRouter(controllers, access),
    };
};

export const createGalleryDemoModule = (dependencies: GalleryDemoModuleDependencies) => {
    const galleryDemoService: IGalleryDemoService = new GalleryDemoService(
        dependencies.db,
        new GalleryRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { galleryDemoService };
};
