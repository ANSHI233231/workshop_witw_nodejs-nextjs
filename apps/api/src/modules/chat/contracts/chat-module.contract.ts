import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';

export type ChatModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly usersService: IUsersService;
    readonly partnerService: IPartnerService;
    readonly notificationService: INotificationService;
};

export type ChatTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly isProduction: boolean;
};
