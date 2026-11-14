import type {
    PackageDemoModuleDependencies,
    PackageModuleDependencies,
    PackageTestDataModuleDependencies,
} from './contracts/package-module.contract';
import type { IPackageService } from './contracts/package-service.contract';
import type { IPackageTestDataService } from './contracts/package-test-data-service.contract';
import { PackageConsoleController } from './controllers/package-console.controller';
import { PackagePortalController } from './controllers/package-portal.controller';
import { PackageWebsiteController } from './controllers/package-website.controller';
import { DeleteReasonRepository } from './repositories/delete-reason.repository';
import { PackageTestDataRepository } from './repositories/package-test-data.repository';
import { PackageWebsiteRepository } from './repositories/package-website.repository';
import { PackageRepository } from './repositories/package.repository';
import { createPackageRouter, type PackageAccess } from './routes/package.routes';
import { DeleteReasonService } from './services/delete-reason.service';
import { PackageConsoleService } from './services/package-console.service';
import { PackageDemoService } from './services/package-demo.service';
import { PackageEditorService } from './services/package-editor';
import { PackagePortalService } from './services/package-portal.service';
import { PackageRecords } from './services/package-records';
import { PackageTestDataService } from './services/package-test-data.service';
import { PackageService } from './services/package.service';

export type { PackageDemoModuleDependencies, PackageModuleDependencies } from './contracts/package-module.contract';
export type { IPackageService } from './contracts/package-service.contract';
export type {
    ParkPriceRange,
    ShownPackageRef,
    WebsiteCardDto,
    WebsitePackageDto,
    WebsitePackageView,
    WebsitePageDto,
    WebsiteQuery,
} from './dto/package.dto';
export type {
    DemoPackage,
    DemoPackageDay,
    DemoPackageGallery,
    DemoPackageOutcome,
    DemoPackageVersion,
} from './dto/package-demo.dto';
export type { PackageDemoService } from './services/package-demo.service';
export {
    Inclusion,
    type InclusionCode,
    Meal,
    type MealCode,
    PackageFeature,
    type PackageFeatureCode,
    PackageTheme,
    type PackageThemeCode,
    PackageVersionStatus,
    type PackageVersionStatusCode,
    PackageWebsiteStatus,
    type PackageWebsiteStatusCode,
    SafariType,
    type SafariTypeCode,
    Stay,
    type StayCode,
    Vehicle,
    type VehicleCode,
} from './types/package.types';

export const createPackageModule = (dependencies: PackageModuleDependencies) => {
    const repository = new PackageRepository();
    const records = new PackageRecords(dependencies.db, repository, dependencies.auditService, dependencies.fileStorage);
    const editor = new PackageEditorService(records, dependencies.partnerService, dependencies.galleryService);
    const packageService: IPackageService = new PackageService(records, new PackageWebsiteRepository());
    const portalService = new PackagePortalService(
        records,
        editor,
        dependencies.partnerService,
        dependencies.galleryService,
        dependencies.usersService,
        dependencies.notificationService,
    );
    const deleteReasonService = new DeleteReasonService(records, new DeleteReasonRepository());
    const consoleService = new PackageConsoleService(records, editor, portalService, deleteReasonService);
    const controllers = {
        portal: new PackagePortalController(portalService),
        console: new PackageConsoleController(consoleService, deleteReasonService),
        website: new PackageWebsiteController(packageService),
    };
    return {
        packageService,
        createRouter: (access: PackageAccess) => createPackageRouter(controllers, access),
    };
};

export type { IPackageTestDataService } from './contracts/package-test-data-service.contract';
export type { PackageTestData, PackageTestDataScope } from './dto/package-test-data.dto';

export const createPackageTestDataModule = (dependencies: PackageTestDataModuleDependencies) => {
    const packageTestDataService: IPackageTestDataService = new PackageTestDataService(
        dependencies.db,
        new PackageTestDataRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { packageTestDataService };
};

export const createPackageDemoModule = (dependencies: PackageDemoModuleDependencies) => {
    const packageDemoService = new PackageDemoService(
        dependencies.db,
        new PackageRepository(),
        new DeleteReasonRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { packageDemoService };
};
