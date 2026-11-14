import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { IGalleryService } from '../../gallery';
import type { INotificationService } from '../../notification';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';

export type PackageModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly partnerService: IPartnerService;
    readonly galleryService: IGalleryService;
    readonly usersService: IUsersService;
    readonly notificationService: INotificationService;
    readonly fileStorage: IFileStorage;
};

export type PackageDemoModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};

export type PackageTestDataModuleDependencies = PackageDemoModuleDependencies;
