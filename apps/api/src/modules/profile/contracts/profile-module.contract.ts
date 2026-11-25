import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { IPackageService } from '../../package';
import type { IParkService } from '../../park';
import type { IPartnerService } from '../../partner';
import type { ISharedSafariService } from '../../shared-safari';
import type { IUsersService } from '../../users';

export type ProfileModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly usersService: IUsersService;
    readonly partnerService: IPartnerService;
    readonly sharedSafariService: ISharedSafariService;
    readonly packageService: IPackageService;
    readonly parkService: IParkService;
    readonly fileStorage: IFileStorage;
};

export type ProfileTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};
