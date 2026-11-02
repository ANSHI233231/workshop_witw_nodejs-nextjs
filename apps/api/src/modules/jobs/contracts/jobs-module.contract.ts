import type { Database } from '../../../database/connection';
import type { ICommandRunner } from '../../../infrastructure/process';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';
import type { IUsersService } from '../../users';

export type JobsModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly commandRunner: ICommandRunner;
    readonly notificationService: INotificationService;
    readonly usersService: IUsersService;
};
