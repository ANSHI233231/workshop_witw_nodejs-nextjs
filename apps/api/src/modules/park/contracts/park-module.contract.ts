import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';

export type ParkModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
};

export type ParkTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};
