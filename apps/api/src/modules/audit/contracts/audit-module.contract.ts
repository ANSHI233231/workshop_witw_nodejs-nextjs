import type { Database } from '../../../database/connection';

export type AuditModuleDependencies = {
    readonly db: Database;
};
