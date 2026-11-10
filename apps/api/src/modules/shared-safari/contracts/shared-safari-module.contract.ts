import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';

export type ParkLookup = {
    findById(id: number): Promise<{ readonly id: number; readonly name: string; readonly status: number } | null>;
};

export type FlagReasonLookup = {
    findActiveById(id: number): Promise<{ readonly id: number; readonly name: string } | null>;
};

export type SharedSafariModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly notificationService: INotificationService;
    readonly fileStorage: IFileStorage;
    readonly parkService: ParkLookup;
    readonly flagReasonService: FlagReasonLookup;
};
