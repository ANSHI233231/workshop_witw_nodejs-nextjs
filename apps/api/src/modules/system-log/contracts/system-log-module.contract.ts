import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type SystemLogModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly logDirectories: Readonly<Record<string, string>>;
    readonly ingestKey: string | null;
};
