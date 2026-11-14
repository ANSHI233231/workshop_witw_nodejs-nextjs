import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { INotificationService } from '../../notification';
import type { PartnerIdentity, PartnersByUser } from '../types/shared-safari.types';

export type ParkLookup = {
    findById(id: number): Promise<{ readonly id: number; readonly name: string; readonly status: number } | null>;
};

export type FlagReasonLookup = {
    findActiveById(id: number): Promise<{ readonly id: number; readonly name: string } | null>;
};

export type PartnerLookup = {
    partnerOf(userId: number): Promise<PartnerIdentity | null>;
    partnersOf(userIds: readonly number[]): Promise<PartnersByUser>;
};

export type SharedSafariModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly notificationService: INotificationService;
    readonly fileStorage: IFileStorage;
    readonly parkService: ParkLookup;
    readonly flagReasonService: FlagReasonLookup;
    readonly partnerService: PartnerLookup;
};

export type SharedSafariTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};
