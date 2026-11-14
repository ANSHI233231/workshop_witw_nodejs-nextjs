import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { INotificationSeedService, INotificationService } from '../../notification';
import type { IPackageService } from '../../package';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';

export type QuoteRequestModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly packageService: IPackageService;
    readonly partnerService: IPartnerService;
    readonly usersService: IUsersService;
    readonly notificationService: INotificationService;
};

export type QuoteRequestDemoModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly notificationSeedService: INotificationSeedService;
    readonly isProduction: boolean;
};

export type QuoteRequestTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly isProduction: boolean;
};
