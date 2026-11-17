import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type FlagReasonModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
};

export type FlagReasonTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly isProduction: boolean;
};
