import type {
    ProfileModuleDependencies,
    ProfileTestDataModuleDependencies,
} from './contracts/profile-module.contract';
import type { IPartnerProfileService } from './contracts/partner-profile-service.contract';
import type { IProfileService } from './contracts/profile-service.contract';
import type { IProfileTestDataService } from './contracts/profile-test-data-service.contract';
import { ProfileController } from './controllers/profile.controller';
import { ProfileTestDataRepository } from './repositories/profile-test-data.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { createProfileRouter, type ProfileAccess } from './routes/profile.routes';
import { PartnerProfileService } from './services/partner-profile.service';
import { ProfileFiles } from './services/profile-files';
import { ProfileTestDataService } from './services/profile-test-data.service';
import { ProfileService } from './services/profile.service';

export type { ProfileModuleDependencies } from './contracts/profile-module.contract';
export type { IProfileService } from './contracts/profile-service.contract';
export type { ProfileAccess } from './routes/profile.routes';

export const createProfileModule = (dependencies: ProfileModuleDependencies) => {
    const profileService: IProfileService = new ProfileService(
        dependencies.db,
        new ProfileRepository(),
        dependencies.auditService,
        dependencies.usersService,
        dependencies.partnerService,
        dependencies.sharedSafariService,
        new ProfileFiles(dependencies.fileStorage),
    );
    const partnerProfileService: IPartnerProfileService = new PartnerProfileService(
        dependencies.partnerService,
        dependencies.packageService,
        dependencies.parkService,
    );
    const controller = new ProfileController(profileService, partnerProfileService);
    return {
        profileService,
        createRouter: (access: ProfileAccess) => createProfileRouter(controller, access),
    };
};

export type { IProfileTestDataService } from './contracts/profile-test-data-service.contract';
export type { ProfileTestData } from './dto/profile-test-data.dto';

export const createProfileTestDataModule = (dependencies: ProfileTestDataModuleDependencies) => {
    const profileTestDataService: IProfileTestDataService = new ProfileTestDataService(
        dependencies.db,
        new ProfileTestDataRepository(),
        dependencies.auditService,
        new ProfileFiles(dependencies.fileStorage),
        dependencies.isProduction,
    );
    return { profileTestDataService };
};
