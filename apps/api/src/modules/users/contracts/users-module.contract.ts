import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';

export type UsersModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly notificationService: INotificationService;
};
