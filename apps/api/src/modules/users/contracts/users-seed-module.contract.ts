import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type UsersSeedModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly isProduction: boolean;
};
