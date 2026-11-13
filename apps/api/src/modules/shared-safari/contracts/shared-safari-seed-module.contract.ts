import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { INotificationSeedService, NotificationKindCode } from '../../notification';

export type SharedSafariSeedModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly notificationSeedService: INotificationSeedService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};

export type SeedNote = {
    readonly userId: number;
    readonly kind: NotificationKindCode;
    readonly actorId: number;
    readonly at: Date;
    readonly read: boolean;
};
