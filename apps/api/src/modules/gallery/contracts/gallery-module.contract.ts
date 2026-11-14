import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';

export type GalleryModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly partnerService: IPartnerService;
    readonly usersService: IUsersService;
    readonly notificationService: INotificationService;
    readonly fileStorage: IFileStorage;
};

export type GalleryDemoModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};

export type GalleryTestDataModuleDependencies = GalleryDemoModuleDependencies;
