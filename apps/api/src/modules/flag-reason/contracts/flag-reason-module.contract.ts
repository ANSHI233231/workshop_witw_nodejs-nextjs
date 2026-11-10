import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type FlagReasonModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
};
