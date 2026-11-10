import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type ParkModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
};
